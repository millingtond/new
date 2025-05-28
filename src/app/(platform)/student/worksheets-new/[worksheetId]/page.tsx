// src/app/(platform)/student/worksheets-new/[worksheetId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NewWorksheetPlayer from '@/components/worksheets-new/NewWorksheetPlayer';
import { NewWorksheet, NewWorksheetStudentProgress } from '@/types/worksheetNew';
import { cpuArchitectureLesson } from '@/data/sampleCpuLessonData';
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
  const { userProfile } = useAuthStore();

  useEffect(() => {
    if (!worksheetId || !userProfile?.uid) {
      // Wait for userProfile to be loaded by AuthProvider, or if explicitly null and not loading, redirect.
      // AuthProvider should handle the primary redirect if user is not logged in at all.
      // This check is more for cases where worksheetId is missing or user becomes null after initial auth check.
      if (!isLoading && !userProfile?.uid) {
          console.log("User not authenticated, redirecting to login.");
          router.push('/login');
      }
      // If worksheetId is missing but user is there, we might still be loading or it's an invalid path.
      // The later checks for lessonData will handle invalid worksheetId.
      return;
    }

    const fetchLessonAndProgress = async () => {
      setIsLoading(true);
      try {
        if (worksheetId === cpuArchitectureLesson.id) {
          setLessonData(cpuArchitectureLesson);
        } else {
          console.error("Lesson not found for ID:", worksheetId);
          setLessonData(null);
        }

        const progressDocRef = doc(db, "studentNewWorksheetProgress", `${userProfile.uid}_${worksheetId}`);
        const progressDocSnap = await getDoc(progressDocRef);
        if (progressDocSnap.exists()) {
          const data = progressDocSnap.data();
          const progressData = {
            ...data,
            lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : new Date(),
            // Ensure sectionStates and answers are properly initialized if they are missing from Firestore
            sectionStates: data.sectionStates || {},
          } as NewWorksheetStudentProgress;
           // Deep merge or ensure answers structure exists for each section
           cpuArchitectureLesson.sections.forEach(sec => {
             if (!progressData.sectionStates[sec.id]) {
               progressData.sectionStates[sec.id] = { isCompleted: false, isAttempted: false, answers: {} };
             } else if (!progressData.sectionStates[sec.id].answers) {
                progressData.sectionStates[sec.id].answers = {};
             }
           });
          setInitialProgress(progressData);
        } else {
          setInitialProgress(undefined); // No existing progress, NewWorksheetPlayer will initialize
        }
      } catch (error) {
        console.error("Error fetching lesson or progress:", error);
        setLessonData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonAndProgress();
  }, [worksheetId, userProfile?.uid, router, isLoading]);

  const handleSaveProgress = async (progress: NewWorksheetStudentProgress) => {
    if (!userProfile?.uid || !lessonData) return;
    try {
      const progressDocRef = doc(db, "studentNewWorksheetProgress", `${userProfile.uid}_${lessonData.id}`);
      const dataToSave = {
        ...progress,
        studentId: userProfile.uid,
        worksheetId: lessonData.id,
        lastUpdated: serverTimestamp()
      };
      await setDoc(progressDocRef, dataToSave, { merge: true });
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl animate-pulse">Loading Lesson...</p></div>;
  }

  if (!lessonData) {
    return <div className="flex flex-col justify-center items-center h-screen"><p className="text-xl text-red-500">Error: Lesson data could not be loaded for ID '{worksheetId}'.</p><button onClick={() => router.push('/student/assignments')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Back to Assignments</button></div>;
  }
  
  if (!userProfile?.uid) {
      return <div className="flex justify-center items-center h-screen"><p className="text-xl text-red-500">User not authenticated. Redirecting...</p></div>;
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
