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
