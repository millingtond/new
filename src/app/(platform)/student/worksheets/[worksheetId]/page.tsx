// src/app/(platform)/student/worksheets/[worksheetId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { doc, getDoc, setDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase'; 
import { useAuthStore } from '@/store/authStore'; 
import WorksheetComponent from '@/components/worksheets/Worksheet';
import type { Worksheet } from '@/components/worksheets/worksheetTypes';
import type { StudentProgressData, StudentMatchPair, Assignment } from '@/types'; 
import { debounce } from 'lodash'; 

function LoadingFallback() {
  return <p className="text-center mt-20 text-xl font-semibold text-gray-700">Loading worksheet content and progress...</p>;
}

const StudentViewWorksheetPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { userProfile, isLoading: authIsLoading } = useAuthStore(); 

  const worksheetId = params.worksheetId as string;
  const assignmentId = searchParams.get('assignmentId'); 

  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [assignmentDetails, setAssignmentDetails] = useState<Assignment | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgressData | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSaveProgress = useCallback(
    debounce(async (progressToSave: StudentProgressData) => {
      if (!assignmentId || !userProfile?.uid) {
          console.warn("SaveProgress: Missing assignmentId or userProfile.uid");
          return;
      }
      const progressDocRef = doc(db, 'studentProgress', assignmentId); 
      try {
        const dataToSave = {
            ...progressToSave,
            studentId: userProfile.uid, 
            worksheetId: worksheetId,
            assignmentId: assignmentId,
            teacherId: progressToSave.teacherId || assignmentDetails?.teacherId || null,
            lastUpdated: Timestamp.now(),
            status: progressToSave.status || 'in-progress',
        };
        await setDoc(progressDocRef, dataToSave, { merge: true }); 
        console.log('Progress saved for assignment:', assignmentId);
      } catch (err) {
        console.error('Error saving progress:', err);
      }
    }, 2000), 
    [assignmentId, userProfile?.uid, worksheetId, assignmentDetails?.teacherId]
  );

  useEffect(() => {
    if (authIsLoading) { 
        setIsLoadingPage(true);
        return;
    }
    if (!userProfile?.uid) {
      setError("User not authenticated. Please log in.");
      setIsLoadingPage(false);
      return;
    }
    if (!worksheetId) {
        setError("Worksheet ID is missing.");
        setIsLoadingPage(false);
        return;
    }
    if (!assignmentId) {
      setError("Assignment ID is missing. Cannot load or save progress.");
      setIsLoadingPage(false);
      return;
    }
    
    setIsLoadingPage(true);
    setError(null);

    let unsubscribeProgress: (() => void) | null = null;

    const fetchWorksheetAndAssignment = async () => {
      try {
        const worksheetDocRef = doc(db, 'worksheets', worksheetId);
        const assignmentDocRef = doc(db, 'assignments', assignmentId);

        const [worksheetSnap, assignmentSnap] = await Promise.all([
          getDoc(worksheetDocRef),
          getDoc(assignmentDocRef)
        ]);

        if (worksheetSnap.exists()) {
          setWorksheet({ id: worksheetSnap.id, ...worksheetSnap.data() } as Worksheet);
        } else {
          setError('Worksheet not found.');
          setWorksheet(null);
          setIsLoadingPage(false);
          return; 
        }

        let fetchedAssignmentDetails: Assignment | null = null;
        if (assignmentSnap.exists()) {
          fetchedAssignmentDetails = { id: assignmentSnap.id, ...assignmentSnap.data() } as Assignment;
          setAssignmentDetails(fetchedAssignmentDetails);
        } else {
          console.warn(`Assignment details not found for assignmentId: ${assignmentId}`);
          setAssignmentDetails(null); 
        }
        
        const progressDocRef = doc(db, 'studentProgress', assignmentId);
        unsubscribeProgress = onSnapshot(progressDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const progressData = { id: docSnap.id, ...docSnap.data() } as StudentProgressData;
            setStudentProgress(progressData);
          } else {
            const teacherIdForProgress = fetchedAssignmentDetails?.teacherId;
            const initialProgress: StudentProgressData = {
              studentId: userProfile.uid, 
              worksheetId: worksheetId,
              assignmentId: assignmentId,
              teacherId: teacherIdForProgress, 
              lastUpdated: Timestamp.now(),
              status: 'in-progress',
              questionnaireAnswers: {}, diagramLabelProgress: {}, fillInTheBlanksProgress: {},
              quizProgress: {}, orderSequenceProgress: {}, matchingPairsProgress: {},
            };
            setStudentProgress(initialProgress);
            debouncedSaveProgress(initialProgress); 
          }
          setIsLoadingPage(false); 
        }, (err) => {
          console.error('Error listening to progress:', err);
          setError('Failed to load student progress.');
          setIsLoadingPage(false);
        });

      } catch (err) {
        console.error('Error fetching worksheet or assignment details:', err);
        setError('Failed to load initial worksheet or assignment data.');
        setIsLoadingPage(false);
      }
    };

    fetchWorksheetAndAssignment();

    return () => {
      if (unsubscribeProgress) unsubscribeProgress();
      debouncedSaveProgress.cancel(); 
    };
  }, [worksheetId, userProfile?.uid, assignmentId, debouncedSaveProgress, authIsLoading]);


  const handleQuestionnaireAnswerChange = useCallback((sectionId: string, questionId: string, answer: string) => {
    setStudentProgress(prev => {
      if (!prev) return null;
      const updatedProgress = { 
        ...prev, 
        questionnaireAnswers: {
          ...(prev.questionnaireAnswers || {}),
          [sectionId]: {
            ...(prev.questionnaireAnswers?.[sectionId] || {}),
            [questionId]: answer,
          },
        } 
      };
      debouncedSaveProgress(updatedProgress);
      return updatedProgress;
    });
  }, [debouncedSaveProgress]);

  const handleDiagramLabelAnswerChange = useCallback((sectionId: string, hotspotId: string, isRevealed: boolean) => {
    setStudentProgress(prev => {
      if (!prev) return null;
      const currentRevealedForSection = new Set(prev.diagramLabelProgress?.[sectionId] || []);
      if (isRevealed) currentRevealedForSection.add(hotspotId);
      else currentRevealedForSection.delete(hotspotId);
      
      const updatedProgress = { 
        ...prev, 
        diagramLabelProgress: {
          ...(prev.diagramLabelProgress || {}),
          [sectionId]: Array.from(currentRevealedForSection),
        }
      };
      debouncedSaveProgress(updatedProgress);
      return updatedProgress;
    });
  }, [debouncedSaveProgress]);
  
  const handleFillInTheBlanksAnswerChange = useCallback((sectionId: string, blankId: string, value: string) => {
    setStudentProgress(prev => {
      if (!prev) return null;
      const updatedProgress = { 
        ...prev, 
        fillInTheBlanksProgress: {
          ...(prev.fillInTheBlanksProgress || {}),
          [sectionId]: {
            ...(prev.fillInTheBlanksProgress?.[sectionId] || {}),
            [blankId]: value,
          },
        } 
      };
      debouncedSaveProgress(updatedProgress);
      return updatedProgress;
    });
  }, [debouncedSaveProgress]);

  const handleQuizAnswerSelect = useCallback((sectionId: string, questionId: string, selectedOptionId: string | null) => {
     setStudentProgress(prev => {
      if (!prev) return null;
      const updatedProgress = { 
        ...prev, 
        quizProgress: {
          ...(prev.quizProgress || {}),
          [sectionId]: {
            ...(prev.quizProgress?.[sectionId] || {}),
            [questionId]: selectedOptionId,
          },
        } 
      };
      debouncedSaveProgress(updatedProgress);
      return updatedProgress;
    });
  }, [debouncedSaveProgress]);

  const handleOrderSequenceAnswerChange = useCallback((sectionId: string, newOrderIds: string[]) => {
    setStudentProgress(prev => {
      if (!prev) return null;
      const updatedProgress = { 
        ...prev, 
        orderSequenceProgress: {
          ...(prev.orderSequenceProgress || {}),
          [sectionId]: newOrderIds,
        } 
      };
      debouncedSaveProgress(updatedProgress);
      return updatedProgress;
    });
  }, [debouncedSaveProgress]);
  
  const handleMatchingPairsAnswerChange = useCallback((sectionId: string, newPairs: StudentMatchPair[]) => {
     setStudentProgress(prev => {
      if (!prev) return null;
      const updatedProgress = { 
        ...prev, 
        matchingPairsProgress: {
          ...(prev.matchingPairsProgress || {}),
          [sectionId]: newPairs,
        } 
      };
      debouncedSaveProgress(updatedProgress);
      return updatedProgress;
    });
  }, [debouncedSaveProgress]);

  if (authIsLoading || isLoadingPage) { 
    return <LoadingFallback />;
  }
  if (!userProfile) { 
    return <p className="text-center mt-10 text-red-500">Authentication required. Please log in.</p>;
  }
  if (error) {
    return <p className="text-center mt-10 text-red-600 bg-red-100 p-4 rounded-md">Error: {error}</p>;
  }
  if (!worksheet || !studentProgress) { 
    return <LoadingFallback />; 
  }

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 md:px-6 lg:px-8">
      <WorksheetComponent
        worksheet={worksheet}
        isReadOnly={studentProgress.status === 'submitted' || studentProgress.status === 'graded'} 
        
        questionnaireAnswers={studentProgress.questionnaireAnswers}
        onQuestionnaireAnswerChange={handleQuestionnaireAnswerChange}

        diagramLabelAnswers={studentProgress.diagramLabelProgress}
        onDiagramLabelAnswerChange={handleDiagramLabelAnswerChange}

        fillInTheBlanksAnswers={studentProgress.fillInTheBlanksProgress}
        onFillInTheBlanksAnswerChange={handleFillInTheBlanksAnswerChange}
        
        quizAnswers={studentProgress.quizProgress}
        onQuizAnswerSelect={handleQuizAnswerSelect}
        showQuizFeedback={studentProgress.status === 'submitted' || studentProgress.status === 'graded'}

        orderSequenceAnswers={studentProgress.orderSequenceProgress}
        onOrderSequenceAnswerChange={handleOrderSequenceAnswerChange}

        matchingPairsAnswers={studentProgress.matchingPairsProgress}
        onMatchingPairsAnswerChange={handleMatchingPairsAnswerChange}

        keywordsData={worksheet.keywordsData}
      />
    </div>
  );
};

const SuspendedStudentViewWorksheetPage = () => (
  <Suspense fallback={<LoadingFallback />}>
    <StudentViewWorksheetPage />
  </Suspense>
);

export default SuspendedStudentViewWorksheetPage;
