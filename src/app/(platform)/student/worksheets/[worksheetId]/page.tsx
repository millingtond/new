// src/app/(platform)/student/worksheets/[worksheetId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, Timestamp, setDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';

import WorksheetComponent from '@/components/worksheets/Worksheet'; 
import type { Worksheet as WorksheetType } from '@/components/worksheets/worksheetTypes';
import { ChevronLeft, BookOpen, Save, Send, Loader2, AlertTriangle } from 'lucide-react';

interface FetchedWorksheetStudentView extends Omit<WorksheetType, "createdAt"> {
  id: string;
  createdAt?: Date;
}

type AnswersState = Record<string, string>;

export default function StudentViewWorksheetPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const worksheetId = params.worksheetId as string;
  const assignmentId = searchParams.get("assignmentId"); 

  const { userProfile, isLoading: authIsLoading } = useAuthStore();
  const [worksheet, setWorksheet] = useState<FetchedWorksheetStudentView | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<AnswersState>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    console.log("StudentViewWorksheetPage: Initial state. AuthIsLoading:", authIsLoading, "UserProfile UID:", userProfile?.uid);
  }, [authIsLoading, userProfile]);


  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  };

  const saveProgress = useCallback(async (currentAnswers: AnswersState) => {
    if (!userProfile?.uid || !worksheetId || !assignmentId) {
      console.warn("StudentViewWorksheetPage - SaveProgress: Missing user, worksheet, or assignment ID. Cannot save.");
      setSaveError("Cannot save progress: missing required information.");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    console.log(`StudentViewWorksheetPage - SaveProgress: Saving for assignment ${assignmentId}, worksheet ${worksheetId}`);
    
    try {
      const progressDocRef = doc(db, "studentProgress", assignmentId);
      const progressData = {
        studentId: userProfile.uid,
        worksheetId: worksheetId,
        assignmentId: assignmentId,
        answers: currentAnswers,
        lastUpdated: Timestamp.now(),
        status: "in-progress",
      };
      await setDoc(progressDocRef, progressData, { merge: true });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      console.log("StudentViewWorksheetPage - SaveProgress: Progress saved successfully.");
    } catch (err: any) { // Explicitly type err as any or unknown then check type
      console.error("StudentViewWorksheetPage - SaveProgress: Error saving progress:", err);
      setSaveError(`Failed to save your progress: ${err.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  }, [userProfile?.uid, worksheetId, assignmentId]);

  const debouncedSaveProgress = useCallback(debounce(saveProgress, 2500), [saveProgress]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prevAnswers => {
      const newAnswers = { ...prevAnswers, [questionId]: answer };
      if (!isReadOnly) {
        setHasUnsavedChanges(true);
        debouncedSaveProgress(newAnswers);
      }
      return newAnswers;
    });
  };
  
  const fetchWorksheetAndProgress = useCallback(async () => {
    if (!userProfile?.uid) {
      console.log("StudentViewWorksheetPage - fetchWorksheetAndProgress: No userProfile.uid available. Aborting fetch.");
      setError("Authentication details are missing. Please log in again.");
      setIsLoadingPage(false);
      return;
    }
    if (!worksheetId) {
      console.log("StudentViewWorksheetPage - fetchWorksheetAndProgress: No worksheetId. Aborting fetch.");
      setError("Worksheet ID is missing from the request.");
      setIsLoadingPage(false);
      return;
    }

    setIsLoadingPage(true);
    setError(null);
    setSaveError(null);
    console.log(`StudentViewWorksheetPage - fetchWorksheetAndProgress: Fetching worksheet ${worksheetId}. Assignment ID (for progress): ${assignmentId}. User UID: ${userProfile.uid}`);
    
    let fetchedWorksheetData: FetchedWorksheetStudentView | null = null;

    // Step 1: Fetch worksheet content
    try {
      console.log("StudentViewWorksheetPage - fetchWorksheetAndProgress: Attempting to fetch worksheet document...");
      const worksheetDocRef = doc(db, "worksheets", worksheetId);
      const worksheetDocSnap = await getDoc(worksheetDocRef);

      if (worksheetDocSnap.exists()) {
        console.log("StudentViewWorksheetPage - fetchWorksheetAndProgress: Worksheet document found.");
        const data = worksheetDocSnap.data() as WorksheetType;
        fetchedWorksheetData = {
          ...data,
          id: worksheetDocSnap.id,
          createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : undefined,
        };
        setWorksheet(fetchedWorksheetData);
      } else {
        console.error("StudentViewWorksheetPage - fetchWorksheetAndProgress: Worksheet document NOT found.");
        setError(`Worksheet with ID '${worksheetId}' not found. It may have been removed or the ID is incorrect.`);
        setIsLoadingPage(false);
        return; 
      }
    } catch (err: any) {
      console.error(`StudentViewWorksheetPage - fetchWorksheetAndProgress: Error fetching worksheet document (worksheetId: ${worksheetId}):`, err);
      setError(`Failed to load worksheet content: ${err.message || "Unknown error"}. Check permissions for 'worksheets' collection.`);
      setIsLoadingPage(false);
      return; 
    }

    // Step 2: Fetch student's saved progress, only if worksheet was fetched and assignmentId exists
    if (assignmentId && fetchedWorksheetData) {
      try {
        console.log("StudentViewWorksheetPage - fetchWorksheetAndProgress: Attempting to fetch student progress for assignment:", assignmentId);
        const progressDocRef = doc(db, "studentProgress", assignmentId);
        const progressDocSnap = await getDoc(progressDocRef);

        if (progressDocSnap.exists()) {
          const progressData = progressDocSnap.data();
          if (progressData.studentId === userProfile.uid) {
            setAnswers(progressData.answers as AnswersState || {});
            setLastSaved(progressData.lastUpdated?.toDate() || null);
            console.log("StudentViewWorksheetPage - fetchWorksheetAndProgress: Loaded saved answers:", progressData.answers);
          } else {
            console.warn(`StudentViewWorksheetPage - fetchWorksheetAndProgress: Progress document ${assignmentId} found, but studentId mismatch. Current user: ${userProfile.uid}, Doc studentId: ${progressData.studentId}`);
            setAnswers({}); 
            // Optionally set an error or message if progress belongs to another user but assignment ID was accessed
            // setError("Could not load progress: data mismatch."); 
          }
        } else {
          console.log("StudentViewWorksheetPage - fetchWorksheetAndProgress: No saved progress found for this assignment. Starting fresh.");
          setAnswers({});
        }
      } catch (err: any) {
        console.error(`StudentViewWorksheetPage - fetchWorksheetAndProgress: Error fetching student progress (assignmentId: ${assignmentId}):`, err);
        // Don't overwrite worksheet fetch error if that already occurred.
        // This error is specific to loading progress.
        setSaveError(`Failed to load your saved progress: ${err.message || "Unknown error"}. Check permissions for 'studentProgress' collection.`);
        // Allow worksheet to still be displayed even if progress fails to load
        setAnswers({}); 
      }
    } else if (!assignmentId) {
        console.warn("StudentViewWorksheetPage - fetchWorksheetAndProgress: No assignmentId provided. Cannot load or save progress. Worksheet will be view-only without progress tracking.");
        setAnswers({});
    }
    
    setIsLoadingPage(false); // Set loading to false after all attempts
  }, [userProfile, worksheetId, assignmentId]);

  useEffect(() => {
    if (!authIsLoading && userProfile?.uid && worksheetId) {
        fetchWorksheetAndProgress();
    } else if (!authIsLoading && !userProfile) {
        setError("Please log in to view this worksheet.");
        setIsLoadingPage(false);
    }
  }, [authIsLoading, userProfile, worksheetId, fetchWorksheetAndProgress]);

  const isReadOnly = false; 

  if (authIsLoading || isLoadingPage) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600 mr-3" />
        <p className="text-lg text-gray-600">Loading worksheet...</p>
      </div>
    );
  }
  
  // Display general page error first if it exists
  if (error) {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
            <div className="my-4 p-4 bg-red-50 text-red-700 rounded-md shadow flex items-center justify-center max-w-lg mx-auto">
                <AlertTriangle size={24} className="mr-3 flex-shrink-0"/> 
                <p className="text-left">{error}</p>
            </div>
            <Link href="/student/assignments" className="mt-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
                &larr; Back to My Assignments
            </Link>
        </div>
    );
  }

  if (!userProfile) { // Should be caught by AuthProvider, but as a fallback
     return (
        <div className="text-center mt-10 p-4">
            <p className="text-gray-600 mb-4">Please log in to view this worksheet.</p>
            <Link href="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Go to Login
            </Link>
        </div>
    );
  }
  
  if (!worksheet) { // If no worksheet data after loading and no general error, this means worksheet wasn't found or set
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
        <p className="mt-10 p-4 text-gray-600 bg-gray-50 rounded-md">
            Worksheet data could not be loaded. It might not exist or is currently unavailable. (No specific error from fetch)
        </p>
        <Link href="/student/assignments" className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-800">
            &larr; Back to My Assignments
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-4 sm:py-6 lg:p-8">
      <div className="mb-6 px-4 sm:px-0 flex justify-between items-center">
        <Link href="/student/assignments" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center group">
          <ChevronLeft className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to My Assignments
        </Link>
        <div className="text-xs text-gray-500 flex items-center">
            {isSaving && <Loader2 className="animate-spin h-4 w-4 mr-1.5" />}
            {isSaving ? "Saving..." : 
             lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 
             hasUnsavedChanges ? "Unsaved changes" : (worksheet && Object.keys(answers).length > 0 ? "All changes saved" : "No changes yet")}
            {saveError && <span className="ml-2 text-red-500 font-semibold">(Save Error: {saveError})</span>}
        </div>
      </div>
      
      <WorksheetComponent 
        worksheet={worksheet} 
        isLoading={false} 
        error={null}    
        isReadOnly={isReadOnly} 
        answers={answers}
        onAnswerChange={handleAnswerChange}
      />

      {worksheet && !isReadOnly && (
        <div className="max-w-4xl mx-auto mt-8 p-4 text-center flex flex-col sm:flex-row justify-end gap-3">
            <button 
                onClick={() => saveProgress(answers)} 
                disabled={isSaving || !hasUnsavedChanges}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
                <Save size={18} className="mr-2" />
                {isSaving && !hasUnsavedChanges ? "Saving..." : "Save Progress"}
            </button>
        </div>
      )}
    </div>
  );
}
