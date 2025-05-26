// src/components/worksheets/MultipleChoiceQuestionInteractive.tsx
"use client";

import React from 'react';
import type { Question as QuestionData, MultipleChoiceOption } from './worksheetTypes'; // Renamed to avoid conflict

interface MultipleChoiceQuestionInteractiveProps {
  questionData: QuestionData; // Contains prompt, options, correctAnswerId, etc.
  isReadOnly?: boolean;
  // The ID of the currently selected option for this question
  selectedAnswer?: string | null; 
  onAnswerSelect: (questionId: string, selectedOptionId: string) => void;
  showFeedback?: boolean; // If true, will indicate correct/incorrect based on selectedAnswer
}

const MultipleChoiceQuestionInteractive: React.FC<MultipleChoiceQuestionInteractiveProps> = ({
  questionData,
  isReadOnly = false,
  selectedAnswer = null,
  onAnswerSelect,
  showFeedback = false, // Default to not showing feedback immediately
}) => {
  const { id: questionId, prompt, options = [], correctAnswerId, feedback } = questionData;

  const handleOptionClick = (optionId: string) => {
    if (!isReadOnly) {
      onAnswerSelect(questionId, optionId);
    }
  };
  
  const getOptionSpecificFeedback = (optionId: string): string | undefined => {
    if (!feedback) return undefined;
    // Check if feedback is an object and has the optionId as a key
    if (typeof feedback === 'object' && feedback !== null && optionId in feedback) {
        return (feedback as Record<string, string>)[optionId];
    }
    return undefined;
  };
  
  const generalFeedbackText = showFeedback && selectedAnswer 
    ? (selectedAnswer === correctAnswerId ? (feedback as Record<string, string>)?.correct : (feedback as Record<string, string>)?.incorrect)
    : undefined;

  return (
    <div className="py-4 my-3 border-t border-gray-200 first:border-t-0">
      {prompt && <p className="mb-3 text-gray-800 font-medium" dangerouslySetInnerHTML={{ __html: prompt }} />}
      <div className="space-y-2">
        {options.map((option: MultipleChoiceOption) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrect = option.id === correctAnswerId;
          
          let buttonStyle = "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"; // Default
          let specificFeedbackText: string | undefined = getOptionSpecificFeedback(option.id);

          if (showFeedback && isSelected) {
            buttonStyle = isCorrect 
              ? "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-300" 
              : "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-300";
            // Prioritize specific feedback for the selected option, then general feedback
            if (!specificFeedbackText && generalFeedbackText) specificFeedbackText = generalFeedbackText;

          } else if (showFeedback && !isSelected && isCorrect && !isReadOnly) {
            // Optionally highlight the correct answer if feedback mode is on and student selected wrong or nothing (for review)
            // This can be adjusted based on desired UX for "review mode" vs "active attempt mode"
            // buttonStyle = "border-green-500 bg-green-50 text-green-700";
          } else if (isSelected) {
            buttonStyle = "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-300";
          }


          return (
            <div key={option.id}>
              <button
                type="button"
                onClick={() => handleOptionClick(option.id)}
                disabled={isReadOnly}
                className={`w-full text-left p-3 border rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 ${buttonStyle} ${isReadOnly ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                aria-pressed={isSelected}
              >
                <span dangerouslySetInnerHTML={{ __html: option.text }} />
              </button>
              {showFeedback && isSelected && specificFeedbackText && (
                <p className={`mt-1 text-xs px-1 ${selectedAnswer === correctAnswerId ? 'text-green-600' : 'text-red-600'}`}>
                  {specificFeedbackText}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceQuestionInteractive;
