// src/components/worksheets/ShortAnswerQuestion.tsx
'use client';

import React from 'react';
import type { Question } from './worksheetTypes'; // Assuming worksheetTypes.ts is created or types are imported
import StaticContentBlock from './StaticContentBlock';


interface ShortAnswerQuestionProps {
  question: Question; 
  isReadOnly?: boolean; // True for teacher previews, false for student interaction
  value?: string; // Current answer value for this question
  onChange?: (questionId: string, answer: string) => void; // Callback when answer changes
}

const ShortAnswerQuestion: React.FC<ShortAnswerQuestionProps> = ({ 
  question, 
  isReadOnly = false, // Default to false (editable) for student use
  value = '',       // Default to empty string
  onChange 
}) => {
  if (question.type !== "ShortAnswer") {
    console.warn(`ShortAnswerQuestion received question of type: ${question.type}`);
    return null;
  }

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(question.id, event.target.value);
    }
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      {question.prompt && (
        // Using StaticContentBlock for the prompt to allow HTML formatting in prompts
        <label htmlFor={question.id} className="block text-sm font-medium text-gray-800 mb-2">
          <StaticContentBlock htmlContent={question.prompt} />
        </label>
      )}
      <textarea
        id={question.id}
        rows={3}
        className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        placeholder={question.placeholder || "Your answer..."}
        readOnly={isReadOnly}
        value={value}
        onChange={!isReadOnly ? handleChange : undefined} // Only allow onChange if not read-only
        aria-label={question.prompt || "Short answer question input"}
      />
      {/* In a read-only teacher view, a previously saved student answer might be displayed here instead of the textarea value */}
    </div>
  );
};

export default ShortAnswerQuestion;
