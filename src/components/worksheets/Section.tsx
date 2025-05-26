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
