// src/app/(platform)/student/worksheets-new/[worksheetId]/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NewWorksheetPlayer from '@/components/worksheets-new/NewWorksheetPlayer';
import { NewWorksheet, NewWorksheetStudentProgress } from '@/types/worksheetNew';
import { cpuArchitectureLesson } from '@/data/sampleCpuLessonData'; // Assuming this is your lesson data
import { useAuthStore } from '@/store/authStore';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

const NewWorksheetPage = () => {
  const params = useParams();
  const router = useRouter();
  const worksheetId = params.worksheetId as string;

  const [lessonData, setLessonData] = useState<NewWorksheet | null>(null);
  const [initialProgress, setInitialProgress] = useState<NewWorksheetStudentProgress | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile, isLoading: isAuthLoading } = useAuthStore(); // Get auth loading state

  // Memoize fetchLessonAndProgress to prevent re-creation on every render
  const fetchLessonAndProgress = useCallback(async (studentUid: string, currentWorksheetId: string) => {
    setIsLoading(true);
    setError(null);
    console.log(`Fetching lesson and progress for worksheet: ${currentWorksheetId}, user: ${studentUid}`);

    try {
      // In a real scenario, you'd fetch lessonData from Firestore or an API
      // For now, we're hardcoding it to cpuArchitectureLesson if IDs match
      if (currentWorksheetId === cpuArchitectureLesson.id) {
        setLessonData(cpuArchitectureLesson);
      } else {
        console.error("Lesson not found for ID:", currentWorksheetId);
        setError(`Lesson data could not be loaded for ID '${currentWorksheetId}'.`);
        setLessonData(null);
        setIsLoading(false);
        return;
      }

      const progressDocRef = doc(db, "studentNewWorksheetProgress", `${studentUid}_${currentWorksheetId}`);
      const progressDocSnap = await getDoc(progressDocRef);

      if (progressDocSnap.exists()) {
        const data = progressDocSnap.data();
        const loadedProgress = {
          ...data,
          lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : new Date(),
          sectionStates: data.sectionStates || {}, // Ensure sectionStates exists
        } as NewWorksheetStudentProgress;

        // Ensure answers object exists for each section in the loaded progress
        // This helps prevent issues if progress was saved with missing answer structures
        cpuArchitectureLesson.sections.forEach(sec => {
          if (!loadedProgress.sectionStates[sec.id]) {
            loadedProgress.sectionStates[sec.id] = { isCompleted: false, isAttempted: false, answers: {} };
          } else if (!loadedProgress.sectionStates[sec.id].answers) {
            loadedProgress.sectionStates[sec.id].answers = {};
          }
        });
        setInitialProgress(loadedProgress);
        console.log("Loaded initial progress:", loadedProgress);
      } else {
        setInitialProgress(undefined); // No existing progress, NewWorksheetPlayer will initialize
        console.log("No existing progress found. Player will initialize.");
      }
    } catch (err) {
      console.error("Error fetching lesson or progress:", err);
      setError("An error occurred while loading the lesson. Please try again.");
      setLessonData(null);
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed for useCallback if all inputs are parameters

  useEffect(() => {
    // Wait for authentication to resolve and worksheetId to be available
    if (isAuthLoading || !worksheetId) {
      console.log("Auth loading or worksheetId missing, waiting...");
      setIsLoading(true); // Explicitly set loading if auth is still processing
      return;
    }

    if (!userProfile?.uid) {
      // If auth is done and still no user, redirect. AuthProvider might also do this.
      console.log("User not authenticated after auth check, redirecting to login.");
      router.push('/login');
      return;
    }
    
    // User is authenticated and worksheetId is present, fetch data
    fetchLessonAndProgress(userProfile.uid, worksheetId);

  }, [worksheetId, userProfile?.uid, isAuthLoading, router, fetchLessonAndProgress]);


  const handleSaveProgress = async (progress: NewWorksheetStudentProgress) => {
    if (!userProfile?.uid || !lessonData) {
      console.warn("Cannot save progress: User or lesson data missing.");
      return;
    }
    try {
      const progressDocRef = doc(db, "studentNewWorksheetProgress", `${userProfile.uid}_${lessonData.id}`);
      const dataToSave = {
        ...progress,
        studentId: userProfile.uid, // Ensure studentId is correctly set
        worksheetId: lessonData.id, // Ensure worksheetId is correctly set
        lastUpdated: serverTimestamp()
      };
      await setDoc(progressDocRef, dataToSave, { merge: true });
      console.log("Progress saved successfully for worksheet:", lessonData.id);
    } catch (err) {
      console.error("Failed to save progress:", err);
      // Optionally, notify the user of save failure
    }
  };

  if (isLoading || isAuthLoading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl animate-pulse">Loading Lesson...</p></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4 text-center">
        <p className="text-xl text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => router.push('/student/assignments')} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Assignments
        </button>
      </div>
    );
  }
  
  if (!lessonData) {
    // This case should ideally be covered by the error state if fetching failed
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4 text-center">
        <p className="text-xl text-red-500">Lesson data is not available.</p>
        <button 
          onClick={() => router.push('/student/assignments')} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Assignments
        </button>
      </div>
    );
  }
  
  // Ensure userProfile.uid is definitely available before rendering NewWorksheetPlayer
  // This check is somewhat redundant if the useEffect handles redirection, but good for safety
  if (!userProfile?.uid) {
      return <div className="flex justify-center items-center h-screen"><p className="text-xl text-red-500">User authentication issue. Redirecting...</p></div>;
  }

  return (
    <NewWorksheetPlayer
      worksheetData={lessonData}
      initialProgress={initialProgress}
      onSaveProgress={handleSaveProgress}
      studentId={userProfile.uid}
    />
  );
};

export default NewWorksheetPage;
