// src/components/worksheets/Section.tsx
'use client';

import React from 'react';
import type { Section, Question } from './worksheetTypes'; // Assuming worksheetTypes.ts is created
import StaticContentBlock from './StaticContentBlock';
import ShortAnswerQuestion from './ShortAnswerQuestion';


interface SectionComponentProps {
  section: Section; 
  isReadOnly?: boolean;
  // Props for answer handling, to be passed down to question components
  answers?: Record<string, string>; // e.g., { questionId1: "answer1", questionId2: "answer2" }
  onAnswerChange?: (questionId: string, answer: string) => void;
}

const SectionComponent: React.FC<SectionComponentProps> = ({ 
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
      {section.type !== "StaticContent" && section.type !== "Questionnaire" && (
         <p className="text-red-500 text-sm">Unsupported section type: {section.type}</p>
      )}
    </section>
  );
};

export default SectionComponent;
