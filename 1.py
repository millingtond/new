import os

PROJECT_ROOT = "." # Assuming the script is run from the root of your project

# --- Helper function to write content to a file ---
def write_file_content(filepath, content):
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f: # Enforce LF line endings
            f.write(content)
        print(f"Successfully updated/created {filepath}")
    except Exception as e:
        print(f"Error writing to file {filepath}: {e}")

# --- Content for src/types/index.ts ---
types_index_ts_content = """\
// src/types/index.ts
import { Timestamp } from 'firebase/firestore'; 
import type { User as FirebaseUser } from 'firebase/auth'; 

export interface StudentMatchPair {
  itemAId: string;
  itemBId: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'teacher' | 'student' | 'admin' | null;
  classIds?: string[];
  passwordNeedsReset?: boolean | null; 
  systemEmail?: string; 
  createdAt?: Timestamp;
  
  photoURL?: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  metadata?: FirebaseUser['metadata']; 
  providerData?: FirebaseUser['providerData'];
  // Add other FirebaseUser fields if your store makes them available on userProfile
}

export interface ClassData {
  id: string;
  className: string;
  teacherId: string;
  studentIds: string[];
  createdAt: Timestamp;
}

export interface Assignment {
  id: string;
  worksheetId: string;
  worksheetTitle: string;
  classId: string;
  className: string;
  teacherId: string;
  assignedAt: Timestamp;
  dueDate?: Timestamp;
  // Add teacherId field here if it's part of the assignment document itself
  // teacherIdWhoAssigned?: string; 
}

export interface StudentProgressData {
  id?: string; 
  studentId: string;
  worksheetId: string;
  assignmentId: string; 
  teacherId?: string; // Recommended: ID of the teacher who created the assignment
  lastUpdated: Timestamp;
  status: 'not-started' | 'in-progress' | 'submitted' | 'graded';
  questionnaireAnswers?: Record<string, Record<string, string>>; 
  diagramLabelProgress?: Record<string, string[]>; 
  fillInTheBlanksProgress?: Record<string, Record<string, string>>; 
  quizProgress?: Record<string, Record<string, string | null>>; 
  orderSequenceProgress?: Record<string, string[]>; 
  matchingPairsProgress?: Record<string, StudentMatchPair[]>; 
  score?: string | number; 
  teacherFeedback?: string;
}

export type { 
    Worksheet, 
    Section, 
    Question, 
    MultipleChoiceOption, 
    Hotspot, 
    Blank, 
    FillInTheBlanksSegment,
    OrderSequenceItem,
    MatchItem
} from '../components/worksheets/worksheetTypes';
"""

# --- Content for src/components/worksheets/worksheetTypes.ts ---
worksheet_types_ts_content = """\
// src/components/worksheets/worksheetTypes.ts

export interface MultipleChoiceOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: "ShortAnswer" | "StaticContent" | "MultipleChoiceQuestion" | string;
  prompt?: string;
  placeholder?: string;
  htmlContent?: string;
  options?: MultipleChoiceOption[];
  correctAnswerId?: string;
  feedback?: {
    correct?: string;
    incorrect?: string;
    [optionId: string]: string;
  };
}

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  termKey?: string;
  defaultRevealed?: boolean;
}

export interface Blank {
  id: string;
  placeholder?: string;
  size?: number;
}
export type FillInTheBlanksSegment = string | Blank;

export interface OrderSequenceItem {
  id: string;
  content: string;
}

export interface MatchItem {
  id: string;
  content: string;
}

export interface Section {
  id: string;
  title: string;
  type: "Questionnaire" | "StaticContent" | "StaticContentWithKeywords" | "KeywordGlossary" | "DiagramLabelInteractive" | "FillInTheBlanksInteractive" | "Quiz" | "OrderSequenceInteractive" | "MatchingPairsInteractive" | string;
  
  questions?: Question[];
  htmlContent?: string;
  introductionContent?: string;
  termKeys?: string[];
  
  diagramImageUrl?: string;
  diagramAltText?: string;
  hotspots?: Hotspot[];
  
  segments?: FillInTheBlanksSegment[];
  
  orderItems?: OrderSequenceItem[];
  
  matchSetA?: MatchItem[];
  matchSetB?: MatchItem[];
}

export interface Worksheet {
  id: string;
  title: string;
  course?: string;
  unit?: string;
  specReference?: string;
  learningObjectives?: string[];
  keywords?: string[]; 
  keywordsData?: Record<string, string>; 
  sections: Section[];
  createdAt?: any; 
  courseSlug?: string;
  unitSlug?: string;
  courseDisplayName?: string;
  unitDisplayName?: string;
}
"""

# --- Content for src/app/(platform)/student/worksheets/[worksheetId]/page.tsx ---
# CORRECTED: Uses useCallback for handler functions
student_view_worksheet_page_tsx_content = """\
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
        // Ensure all essential fields are present before saving
        const dataToSave = {
            ...progressToSave,
            studentId: userProfile.uid,
            worksheetId: worksheetId,
            assignmentId: assignmentId,
            teacherId: progressToSave.teacherId || assignmentDetails?.teacherId || null, // Ensure teacherId
            lastUpdated: Timestamp.now(),
            status: progressToSave.status || 'in-progress',
        };
        await setDoc(progressDocRef, dataToSave, { merge: true }); 
        console.log('Progress saved for assignment:', assignmentId);
      } catch (err) {
        console.error('Error saving progress:', err);
      }
    }, 2000), 
    [assignmentId, userProfile?.uid, worksheetId, assignmentDetails?.teacherId] // Added worksheetId and assignmentDetails.teacherId
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
          return; // Stop if worksheet not found
        }

        if (assignmentSnap.exists()) {
          setAssignmentDetails({ id: assignmentSnap.id, ...assignmentSnap.data() } as Assignment);
        } else {
          console.warn(`Assignment details not found for assignmentId: ${assignmentId}`);
          // Proceed without assignmentDetails if necessary, or set an error
          setAssignmentDetails(null);
        }

      } catch (err) {
        console.error('Error fetching worksheet or assignment details:', err);
        setError('Failed to load worksheet or assignment data.');
        setIsLoadingPage(false);
        return; // Stop if critical data fails
      }

      // Now listen for progress, only if worksheet and assignmentId are valid
      const progressDocRef = doc(db, 'studentProgress', assignmentId);
      unsubscribeProgress = onSnapshot(progressDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const progressData = { id: docSnap.id, ...docSnap.data() } as StudentProgressData;
          setStudentProgress(progressData);
        } else {
          const currentAssignmentDetails = assignmentDetails || (assignmentId ? { teacherId: undefined } : { teacherId: undefined });
          // Try to get teacherId from fetched assignmentDetails if available
          const teacherIdForProgress = (currentAssignmentDetails as Assignment)?.teacherId;

          const initialProgress: StudentProgressData = {
            studentId: userProfile.uid, 
            worksheetId: worksheetId,
            assignmentId: assignmentId,
            teacherId: teacherIdForProgress, // Get from fetched assignment
            lastUpdated: Timestamp.now(),
            status: 'in-progress',
            questionnaireAnswers: {},
            diagramLabelProgress: {},
            fillInTheBlanksProgress: {},
            quizProgress: {},
            orderSequenceProgress: {},
            matchingPairsProgress: {},
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
    };

    if (!authIsLoading && userProfile?.uid && worksheetId && assignmentId) {
        fetchWorksheetAndAssignment();
    }

    return () => {
      if (unsubscribeProgress) unsubscribeProgress();
      debouncedSaveProgress.cancel(); 
    };
  }, [worksheetId, userProfile?.uid, assignmentId, debouncedSaveProgress, authIsLoading, assignmentDetails]); // Added assignmentDetails to dependencies

  // Wrapped all handlers in useCallback
  const handleQuestionnaireAnswerChange = useCallback((sectionId: string, questionId: string, answer: string) => {
    setStudentProgress(prev => {
      if (!prev) return null;
      const updatedProgress = { 
        ...prev, 
        questionnaireAnswers: {
          ...(prev.questionnaireAnswers || {}), // Ensure questionnaireAnswers itself exists
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
          ...(prev.diagramLabelProgress || {}), // Ensure diagramLabelProgress itself exists
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
          ...(prev.fillInTheBlanksProgress || {}), // Ensure fillInTheBlanksProgress itself exists
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
          ...(prev.quizProgress || {}), // Ensure quizProgress itself exists
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
          ...(prev.orderSequenceProgress || {}), // Ensure orderSequenceProgress itself exists
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
          ...(prev.matchingPairsProgress || {}), // Ensure matchingPairsProgress itself exists
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
"""

# --- Content for src/components/worksheets/Worksheet.tsx ---
worksheet_tsx_content = """\
// src/components/worksheets/Worksheet.tsx
'use client';

import React from 'react';
import type { Worksheet, Section } from './worksheetTypes'; 
import SectionComponent from './Section'; 
import type { StudentProgressData, StudentMatchPair } from '@/types'; 

interface WorksheetComponentProps {
  worksheet: Worksheet | null; 
  isLoading?: boolean;
  error?: string | null;
  isReadOnly?: boolean;
  keywordsData?: Record<string, string>;

  questionnaireAnswers?: StudentProgressData['questionnaireAnswers'];
  onQuestionnaireAnswerChange?: (sectionId: string, questionId: string, answer: string) => void;

  diagramLabelAnswers?: StudentProgressData['diagramLabelProgress']; 
  onDiagramLabelAnswerChange?: (sectionId: string, hotspotId: string, isRevealed: boolean) => void;

  fillInTheBlanksAnswers?: StudentProgressData['fillInTheBlanksProgress'];
  onFillInTheBlanksAnswerChange?: (sectionId: string, blankId: string, value: string) => void;
  
  quizAnswers?: StudentProgressData['quizProgress'];
  onQuizAnswerSelect?: (sectionId: string, questionId: string, selectedOptionId: string | null) => void;
  showQuizFeedback?: boolean;

  orderSequenceAnswers?: StudentProgressData['orderSequenceProgress'];
  onOrderSequenceAnswerChange?: (sectionId: string, newOrderIds: string[]) => void;

  matchingPairsAnswers?: StudentProgressData['matchingPairsProgress'];
  onMatchingPairsAnswerChange?: (sectionId: string, newPairs: StudentMatchPair[]) => void;
}

const WorksheetComponent: React.FC<WorksheetComponentProps> = ({ 
  worksheet, 
  isLoading, 
  error, 
  isReadOnly = true,
  keywordsData,
  questionnaireAnswers,
  onQuestionnaireAnswerChange,
  diagramLabelAnswers,
  onDiagramLabelAnswerChange,
  fillInTheBlanksAnswers,
  onFillInTheBlanksAnswerChange,
  quizAnswers,
  onQuizAnswerSelect,
  showQuizFeedback,
  orderSequenceAnswers,
  onOrderSequenceAnswerChange,
  matchingPairsAnswers,
  onMatchingPairsAnswerChange,
}) => {
  if (isLoading) {
    return <p className="text-center mt-10 p-4 text-gray-600">Loading worksheet content...</p>;
  }
  if (error) {
    return <p className="text-center mt-10 p-4 text-red-600 bg-red-50 rounded-md">Error loading worksheet content: {error}</p>;
  }
  if (!worksheet) {
    return <p className="text-center mt-10 p-4 text-gray-500">No worksheet data available to display.</p>;
  }

  return (
    <article className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-2xl my-8">
      <header className="mb-8 pb-6 border-b border-gray-300">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-800 mb-2">{worksheet.title}</h1>
        {worksheet.courseDisplayName && <p className="text-md text-gray-600">{worksheet.courseDisplayName}</p>}
        {worksheet.unitDisplayName && <p className="text-sm text-gray-500 mb-2">{worksheet.unitDisplayName}</p>}
        {worksheet.specReference && (
          <p className="text-xs text-gray-400 mt-1">
            <span className="font-semibold">Spec Ref:</span> {worksheet.specReference}
          </p>
        )}
      </header>

      {worksheet.learningObjectives && worksheet.learningObjectives.length > 0 && (
        <div className="mb-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h2 className="text-lg font-semibold text-indigo-700 mb-2">Learning Objectives</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {worksheet.learningObjectives.map((obj, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: obj }} />
            ))}
          </ul>
        </div>
      )}
      
      {worksheet.keywords && worksheet.keywords.length > 0 && ( 
        <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Keywords (Metadata)</h2>
            <div className="flex flex-wrap gap-2">
                {worksheet.keywords.map((keyword, index) => (
                    <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        {keyword}
                    </span>
                ))}
            </div>
        </div>
      )}

      {worksheet.sections && worksheet.sections.length > 0 ? (
        worksheet.sections.map((section: Section) => (
          <SectionComponent 
            key={section.id} 
            section={section} 
            isReadOnly={isReadOnly}
            keywordsData={keywordsData || worksheet.keywordsData}

            questionnaireAnswersForSection={questionnaireAnswers?.[section.id]}
            onQuestionnaireAnswerChange={onQuestionnaireAnswerChange}
            
            diagramLabelAnswersForSection={diagramLabelAnswers?.[section.id]}
            onDiagramLabelAnswerChange={onDiagramLabelAnswerChange}

            fillInTheBlanksAnswersForSection={fillInTheBlanksAnswers?.[section.id]}
            onFillInTheBlanksAnswerChange={onFillInTheBlanksAnswerChange}

            quizAnswersForSection={quizAnswers?.[section.id]}
            onQuizAnswerSelect={onQuizAnswerSelect}
            showQuizFeedback={showQuizFeedback}

            orderSequenceAnswersForSection={orderSequenceAnswers?.[section.id]}
            onOrderSequenceAnswerChange={onOrderSequenceAnswerChange}

            matchingPairsAnswersForSection={matchingPairsAnswers?.[section.id]}
            onMatchingPairsAnswerChange={onMatchingPairsAnswerChange}
          />
        ))
      ) : (
        <p className="text-gray-500">This worksheet has no sections defined.</p>
      )}

      <footer className="mt-12 pt-6 border-t border-gray-300 text-center">
        <p className="text-xs text-gray-400">
            Worksheet content.
            {worksheet.createdAt && typeof (worksheet.createdAt as any).toDate === 'function' && 
             ` Originally created: ${(worksheet.createdAt as any).toDate().toLocaleDateString()}`
            }
        </p>
      </footer>
    </article>
  );
};

export default WorksheetComponent;
"""

# --- Content for src/components/worksheets/Section.tsx ---
section_tsx_content = """\
// src/components/worksheets/Section.tsx
'use client';

import React from 'react';
import type { Section, Question } from './worksheetTypes';
import type { StudentMatchPair } from '@/types'; 
import StaticContentBlock from './StaticContentBlock';
import ShortAnswerQuestion from './ShortAnswerQuestion';
import StaticContentWithKeywords from './StaticContentWithKeywords';
import KeywordGlossary from './KeywordGlossary';
import DiagramLabelInteractive from './DiagramLabelInteractive';
import FillInTheBlanksInteractive from './FillInTheBlanksInteractive';
import MultipleChoiceQuestionInteractive from './MultipleChoiceQuestionInteractive';
import OrderSequenceInteractive from './OrderSequenceInteractive';
import MatchingPairsInteractive from './MatchingPairsInteractive'; 

interface SectionComponentProps {
  section: Section; 
  isReadOnly?: boolean;
  keywordsData?: Record<string, string>;

  questionnaireAnswersForSection?: Record<string, string>; 
  onQuestionnaireAnswerChange?: (sectionId: string, questionId: string, answer: string) => void;
  
  diagramLabelAnswersForSection?: string[]; 
  onDiagramLabelAnswerChange?: (sectionId: string, hotspotId: string, isRevealed: boolean) => void;

  fillInTheBlanksAnswersForSection?: Record<string, string>; 
  onFillInTheBlanksAnswerChange?: (sectionId: string, blankId: string, value: string) => void;

  quizAnswersForSection?: Record<string, string | null>; 
  onQuizAnswerSelect?: (sectionId: string, questionId: string, selectedOptionId: string | null) => void;
  showQuizFeedback?: boolean;

  orderSequenceAnswersForSection?: string[]; 
  onOrderSequenceAnswerChange?: (sectionId: string, newOrderIds: string[]) => void;
  
  matchingPairsAnswersForSection?: StudentMatchPair[];
  onMatchingPairsAnswerChange?: (sectionId: string, newPairs: StudentMatchPair[]) => void;
}

const SectionComponent: React.FC<SectionComponentProps> = ({ 
  section, 
  isReadOnly = true, 
  keywordsData,
  questionnaireAnswersForSection,
  onQuestionnaireAnswerChange,
  diagramLabelAnswersForSection,
  onDiagramLabelAnswerChange,
  fillInTheBlanksAnswersForSection,
  onFillInTheBlanksAnswerChange,
  quizAnswersForSection,
  onQuizAnswerSelect,
  showQuizFeedback,
  orderSequenceAnswersForSection,
  onOrderSequenceAnswerChange,
  matchingPairsAnswersForSection,
  onMatchingPairsAnswerChange,
}) => {
  return (
    <section id={section.id} className="mb-8 p-4 sm:p-6 bg-slate-50 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-indigo-700 mb-4 pb-2 border-b border-indigo-200">
        {section.title}
      </h3>

      {section.type === "StaticContent" && section.htmlContent && (
        <StaticContentBlock htmlContent={section.htmlContent} />
      )}

      {section.type === "StaticContentWithKeywords" && section.htmlContent && keywordsData && (
        <StaticContentWithKeywords 
          htmlContent={section.htmlContent} 
          keywordsData={keywordsData} 
        />
      )}

      {section.type === "KeywordGlossary" && section.termKeys && keywordsData && (
        <KeywordGlossary 
          introduction={section.introductionContent}
          displayTermKeys={section.termKeys}
          keywordsData={keywordsData}
        />
      )}
      
      {section.type === "Questionnaire" && section.questions && section.questions.length > 0 && (
        <div className="space-y-4">
          {section.questions.map((question) => {
            if (question.type === "ShortAnswer" && onQuestionnaireAnswerChange) {
              return (
                <ShortAnswerQuestion 
                  key={question.id} 
                  question={question} 
                  isReadOnly={isReadOnly}
                  value={questionnaireAnswersForSection?.[question.id] || ''}
                  onChange={(qId, val) => onQuestionnaireAnswerChange(section.id, qId, val)}
                />
              );
            } else if (question.type === "StaticContent" && question.htmlContent) {
              return (
                <div key={question.id} className="p-3 my-2 bg-indigo-50 rounded-md">
                     <StaticContentBlock htmlContent={question.htmlContent} />
                </div>
              );
            }
            return <p key={question.id} className="text-red-500 text-sm">Unsupported question type: '{question.type}' in Questionnaire section '{section.title}'</p>;
          })}
        </div>
      )}

      {section.type === "DiagramLabelInteractive" && section.diagramImageUrl && section.hotspots && onDiagramLabelAnswerChange && (
        <DiagramLabelInteractive
          sectionId={section.id}
          diagramImageUrl={section.diagramImageUrl}
          diagramAltText={section.diagramAltText}
          hotspots={section.hotspots}
          keywordsData={keywordsData}
          isReadOnly={isReadOnly}
          answers={{ [section.id]: new Set(diagramLabelAnswersForSection || []) }} 
          onAnswerChange={onDiagramLabelAnswerChange}
        />
      )}

      {section.type === "FillInTheBlanksInteractive" && section.segments && onFillInTheBlanksAnswerChange && (
        <FillInTheBlanksInteractive
          sectionId={section.id}
          segments={section.segments}
          isReadOnly={isReadOnly}
          sectionAnswers={fillInTheBlanksAnswersForSection}
          onAnswerChange={onFillInTheBlanksAnswerChange}
        />
      )}

      {section.type === "Quiz" && section.questions && section.questions.length > 0 && onQuizAnswerSelect && (
        <div className="space-y-3">
          {section.questions.map((question) => {
            if (question.type === "MultipleChoiceQuestion") {
              return (
                <MultipleChoiceQuestionInteractive
                  key={question.id}
                  questionData={question}
                  isReadOnly={isReadOnly}
                  selectedAnswer={quizAnswersForSection?.[question.id]}
                  onAnswerSelect={(qId, oId) => onQuizAnswerSelect(section.id, qId, oId)}
                  showFeedback={showQuizFeedback}
                />
              );
            } else if (question.type === "StaticContent" && question.htmlContent) {
              return (
                <div key={question.id} className="p-3 my-2 bg-indigo-50 rounded-md prose prose-sm sm:prose max-w-none">
                     <StaticContentBlock htmlContent={question.htmlContent} />
                </div>
              );
            }
            return <p key={question.id} className="text-red-500 text-sm">Unsupported question type: '{question.type}' in Quiz section '{section.title}'</p>;
          })}
        </div>
      )}

      {section.type === "OrderSequenceInteractive" && section.orderItems && onOrderSequenceAnswerChange && (
        <OrderSequenceInteractive
          sectionId={section.id}
          items={section.orderItems}
          isReadOnly={isReadOnly}
          studentOrder={orderSequenceAnswersForSection} 
          onOrderChange={onOrderSequenceAnswerChange}
        />
      )}

      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && onMatchingPairsAnswerChange && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswersForSection}
          onPairChange={onMatchingPairsAnswerChange}
        />
      )}

      {![
          "StaticContent", "StaticContentWithKeywords", "KeywordGlossary", 
          "Questionnaire", "DiagramLabelInteractive", "FillInTheBlanksInteractive", 
          "Quiz", "OrderSequenceInteractive", "MatchingPairsInteractive"
         ].includes(section.type) && (
         <p className="text-red-500 text-sm">Unsupported section type: '{section.type}' in section '{section.title}'</p>
      )}
    </section>
  );
};

export default SectionComponent;
"""

# --- Main Script Execution ---
def main():
    print("Starting to apply student progress saving updates (with useCallback and useAuthStore fix)...")

    paths = {
        "types_index": os.path.join(PROJECT_ROOT, "src", "types", "index.ts"),
        "worksheet_types": os.path.join(PROJECT_ROOT, "src", "components", "worksheets", "worksheetTypes.ts"),
        "student_view_page": os.path.join(PROJECT_ROOT, "src", "app", "(platform)", "student", "worksheets", "[worksheetId]", "page.tsx"),
        "worksheet_component": os.path.join(PROJECT_ROOT, "src", "components", "worksheets", "Worksheet.tsx"),
        "section_component": os.path.join(PROJECT_ROOT, "src", "components", "worksheets", "Section.tsx"),
    }

    write_file_content(paths["types_index"], types_index_ts_content)
    write_file_content(paths["worksheet_types"], worksheet_types_ts_content)
    write_file_content(paths["student_view_page"], student_view_worksheet_page_tsx_content)
    write_file_content(paths["worksheet_component"], worksheet_tsx_content)
    write_file_content(paths["section_component"], section_tsx_content)
    
    print("\nScript finished.")
    print("Please review the updated files. Key changes:")
    print(f" - {paths['student_view_page']}: Now uses 'useAuthStore', includes 'useCallback' for handlers, and attempts to fetch assignment details to include 'teacherId' in new progress docs.")
    print(f" - {paths['types_index']}: Added 'teacherId' to StudentProgressData and refined UserProfile.")
    print("\nNext steps:")
    print("1. Ensure your `src/store/authStore.ts` exports UserProfile that aligns with the definition in `src/types/index.ts` (especially regarding FirebaseUser fields).")
    print("2. Test the student worksheet view for both errors: 'Export useAuth' (should be fixed) and the 'Maximum update depth exceeded' (should be fixed by useCallback).")
    print("3. Verify Firestore security rules and test data saving/loading for all interactive types.")

if __name__ == "__main__":
    main()
