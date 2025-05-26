// src/components/worksheets/Section.tsx
'use client';

import React from 'react';
import type { Section, Question } from './worksheetTypes'; // Assuming worksheetTypes.ts is created
import StaticContentBlock from './StaticContentBlock';
import ShortAnswerQuestion from './ShortAnswerQuestion';
// Import the new components
import StaticContentWithKeywords from './StaticContentWithKeywords';
import KeywordGlossary from './KeywordGlossary';
import DiagramLabelInteractive from './DiagramLabelInteractive';
import FillInTheBlanksInteractive from './FillInTheBlanksInteractive';
import MultipleChoiceQuestionInteractive from './MultipleChoiceQuestionInteractive';
import OrderSequenceInteractive from './OrderSequenceInteractive';
import MatchingPairsInteractive, { StudentMatchPair } from './MatchingPairsInteractive';


interface SectionComponentProps {
  section: Section; 
  isReadOnly?: boolean;
  // Props for answer handling, to be passed down to question components
  answers?: Record<string, string>; // e.g., { questionId1: "answer1", questionId2: "answer2" }
  onAnswerChange?: (questionId: string, answer: string) => void;
    keywordsData?: Record<string, string>; // Add keywordsData to props
  sectionId: string; // Pass sectionId for answer handling - MOVED, ensure it's there
  // For DiagramLabelInteractive answers
  diagramAnswers?: Record<string, Set<string>>; 
    onDiagramAnswerChange?: (sectionId: string, hotspotId: string, isRevealed: boolean) => void;
  // For FillInTheBlanksInteractive answers for this specific section
  fillInTheBlanksAnswers?: Record<string, string>; 
    onFillInTheBlanksAnswerChange?: (sectionId: string, blankId: string, value: string) => void;
  // For Quiz answers (maps questionId to selectedOptionId)
  quizAnswers?: Record<string, string | null>; 
  onQuizAnswerSelect?: (questionId: string, selectedOptionId: string) => void;
    showQuizFeedback?: boolean;
  // For OrderSequenceInteractive answers for this specific section
  orderSequenceAnswers?: string[]; // Array of item IDs in student's order
    onOrderSequenceAnswerChange?: (sectionId: string, newOrderIds: string[]) => void;
  // For MatchingPairsInteractive answers for this specific section
  matchingPairsAnswers?: StudentMatchPair[]; 
  onMatchingPairsAnswerChange?: (sectionId: string, newPairs: StudentMatchPair[]) => void; // Add keywordsData to props
}

const SectionComponent: React.FC<SectionComponentProps> = ({
  // ... other props ... 
  keywordsData,
  diagramAnswers,
    onDiagramAnswerChange,
  fillInTheBlanksAnswers, 
    onFillInTheBlanksAnswerChange,
  quizAnswers, 
  onQuizAnswerSelect,
    showQuizFeedback,
  orderSequenceAnswers, 
    onOrderSequenceAnswerChange,
  matchingPairsAnswers, 
  onMatchingPairsAnswerChange, 
  section, 
  isReadOnly = true, 
  answers = {}, 
  onAnswerChange 
}) => {
  return (
    <section id={section.id} className="mb-8 p-4 sm:p-6 bg-slate-50 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-indigo-700 mb-4 pb-2 border-b border-indigo-200">
        {section.title}
      </h3>
      {section.type === "StaticContent" && section.htmlContent && (
        <StaticContentBlock htmlContent={section.htmlContent} />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      {/* New: Handle FillInTheBlanksInteractive section type */}
      {section.type === "FillInTheBlanksInteractive" && section.segments && (
        <FillInTheBlanksInteractive
          sectionId={section.id}
          segments={section.segments}
          isReadOnly={isReadOnly}
          sectionAnswers={fillInTheBlanksAnswers} 
          onAnswerChange={onFillInTheBlanksAnswerChange}
        />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      
      {/* New: Handle DiagramLabelInteractive section type */}
      {section.type === "DiagramLabelInteractive" && section.diagramImageUrl && section.hotspots && (
        <DiagramLabelInteractive
          sectionId={section.id} 
          diagramImageUrl={section.diagramImageUrl}
          diagramAltText={section.diagramAltText}
          hotspots={section.hotspots}
          keywordsData={keywordsData}
          isReadOnly={isReadOnly}
          answers={diagramAnswers} 
          onAnswerChange={onDiagramAnswerChange}
        />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      {/* New: Handle FillInTheBlanksInteractive section type */}
      {section.type === "FillInTheBlanksInteractive" && section.segments && (
        <FillInTheBlanksInteractive
          sectionId={section.id}
          segments={section.segments}
          isReadOnly={isReadOnly}
          sectionAnswers={fillInTheBlanksAnswers} 
          onAnswerChange={onFillInTheBlanksAnswerChange}
        />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      
      

      {/* New: Handle StaticContentWithKeywords section type */}
      {section.type === "StaticContentWithKeywords" && section.htmlContent && keywordsData && (
        <StaticContentWithKeywords 
          htmlContent={section.htmlContent} 
          keywordsData={keywordsData} 
        />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      {/* New: Handle FillInTheBlanksInteractive section type */}
      {section.type === "FillInTheBlanksInteractive" && section.segments && (
        <FillInTheBlanksInteractive
          sectionId={section.id}
          segments={section.segments}
          isReadOnly={isReadOnly}
          sectionAnswers={fillInTheBlanksAnswers} 
          onAnswerChange={onFillInTheBlanksAnswerChange}
        />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      
      {/* New: Handle DiagramLabelInteractive section type */}
      {section.type === "DiagramLabelInteractive" && section.diagramImageUrl && section.hotspots && (
        <DiagramLabelInteractive
          sectionId={section.id} 
          diagramImageUrl={section.diagramImageUrl}
          diagramAltText={section.diagramAltText}
          hotspots={section.hotspots}
          keywordsData={keywordsData}
          isReadOnly={isReadOnly}
          answers={diagramAnswers} 
          onAnswerChange={onDiagramAnswerChange}
        />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      {/* New: Handle FillInTheBlanksInteractive section type */}
      {section.type === "FillInTheBlanksInteractive" && section.segments && (
        <FillInTheBlanksInteractive
          sectionId={section.id}
          segments={section.segments}
          isReadOnly={isReadOnly}
          sectionAnswers={fillInTheBlanksAnswers} 
          onAnswerChange={onFillInTheBlanksAnswerChange}
        />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      
      

      {/* New: Handle KeywordGlossary section type */}
      {section.type === "KeywordGlossary" && section.termKeys && keywordsData && (
        <KeywordGlossary 
          introduction={section.introductionContent} 
          displayTermKeys={section.termKeys} 
          keywordsData={keywordsData}
        />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      {/* New: Handle FillInTheBlanksInteractive section type */}
      {section.type === "FillInTheBlanksInteractive" && section.segments && (
        <FillInTheBlanksInteractive
          sectionId={section.id}
          segments={section.segments}
          isReadOnly={isReadOnly}
          sectionAnswers={fillInTheBlanksAnswers} 
          onAnswerChange={onFillInTheBlanksAnswerChange}
        />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      
      {/* New: Handle DiagramLabelInteractive section type */}
      {section.type === "DiagramLabelInteractive" && section.diagramImageUrl && section.hotspots && (
        <DiagramLabelInteractive
          sectionId={section.id} 
          diagramImageUrl={section.diagramImageUrl}
          diagramAltText={section.diagramAltText}
          hotspots={section.hotspots}
          keywordsData={keywordsData}
          isReadOnly={isReadOnly}
          answers={diagramAnswers} 
          onAnswerChange={onDiagramAnswerChange}
        />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      {/* New: Handle FillInTheBlanksInteractive section type */}
      {section.type === "FillInTheBlanksInteractive" && section.segments && (
        <FillInTheBlanksInteractive
          sectionId={section.id}
          segments={section.segments}
          isReadOnly={isReadOnly}
          sectionAnswers={fillInTheBlanksAnswers} 
          onAnswerChange={onFillInTheBlanksAnswerChange}
        />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      
      
      
      
      {/* New: Handle Quiz section type */}
      {section.type === "Quiz" && section.questions && section.questions.length > 0 && (
        <div className="space-y-3"> {/* Adjusted spacing for list of questions */}
          {section.questions.map((question) => {
            if (question.type === "MultipleChoiceQuestion") {
              return (
                <MultipleChoiceQuestionInteractive
                  key={question.id}
                  questionData={question}
                  isReadOnly={isReadOnly}
                  selectedAnswer={quizAnswers?.[question.id]}
                  onAnswerSelect={onQuizAnswerSelect ? (qId, oId) => onQuizAnswerSelect(qId, oId) : () => {}}
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
            return <p key={question.id} className="text-red-500 text-sm">Unsupported question type: {question.type} in Quiz section {section.title}</p>;
          })}
        </div>
      )}
      {/* New: Handle OrderSequenceInteractive section type */}
      {section.type === "OrderSequenceInteractive" && section.orderItems && (
        <OrderSequenceInteractive
          sectionId={section.id}
          items={section.orderItems}
          isReadOnly={isReadOnly}
          studentOrder={orderSequenceAnswers} 
          onOrderChange={onOrderSequenceAnswerChange ? (sId, order) => onOrderSequenceAnswerChange(sId, order) : () => {}}
        />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      
      
      {section.type === "Questionnaire" && section.questions && section.questions.length > 0 && (
        <div className="space-y-4">
          {section.questions.map((question) => {
            if (question.type === "ShortAnswer") {
              return (
                <ShortAnswerQuestion 
                  key={question.id} 
                  question={question} 
                  isReadOnly={isReadOnly}
                  value={answers[question.id] || ''}
                  onChange={onAnswerChange}
                />
              );
            } else if (question.type === "StaticContent" && question.htmlContent) {
              return (
                <div key={question.id} className="p-3 my-2 bg-indigo-50 rounded-md">
                     <StaticContentBlock htmlContent={question.htmlContent} />
                </div>
              );
            }
            return <p key={question.id} className="text-red-500 text-sm">Unsupported question type: {question.type} in section {section.title}</p>;
          })}
        </div>
      )}
      {/* New: Handle OrderSequenceInteractive section type */}
      {section.type === "OrderSequenceInteractive" && section.orderItems && (
        <OrderSequenceInteractive
          sectionId={section.id}
          items={section.orderItems}
          isReadOnly={isReadOnly}
          studentOrder={orderSequenceAnswers} 
          onOrderChange={onOrderSequenceAnswerChange ? (sId, order) => onOrderSequenceAnswerChange(sId, order) : () => {}}
        />
      )}
      {/* New: Handle MatchingPairsInteractive section type */}
      {section.type === "MatchingPairsInteractive" && section.matchSetA && section.matchSetB && (
        <MatchingPairsInteractive
          sectionId={section.id}
          setA={section.matchSetA}
          setB={section.matchSetB}
          isReadOnly={isReadOnly}
          studentPairedIds={matchingPairsAnswers}
          onPairChange={onMatchingPairsAnswerChange ? (sId, pairs) => onMatchingPairsAnswerChange(sId, pairs) : () => {}}
        />
      )}
      
      
      {/* Fallback for other unsupported section types */}
      {section.type !== "StaticContent" && 
       section.type !== "StaticContentWithKeywords" && 
       section.type !== "KeywordGlossary" &&
       section.type !== "DiagramLabelInteractive" &&
       section.type !== "FillInTheBlanksInteractive" &&
       section.type !== "Quiz" &&
       section.type !== "OrderSequenceInteractive" &&
       section.type !== "MatchingPairsInteractive" &&
       section.type !== "Questionnaire" && (
         <p className="text-red-500 text-sm">Unsupported section type: {section.type}</p>
      )}
    </section>
  );
};

export default SectionComponent;
