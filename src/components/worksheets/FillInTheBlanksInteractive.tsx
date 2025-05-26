// src/components/worksheets/FillInTheBlanksInteractive.tsx
"use client";

import React from 'react';
import type { FillInTheBlanksSegment, Blank } from './worksheetTypes';

interface FillInTheBlanksInteractiveProps {
  segments?: FillInTheBlanksSegment[];
  isReadOnly?: boolean;
  // Answers for this specific section: { [blankId]: "student answer" }
  sectionAnswers?: Record<string, string>; 
  onAnswerChange?: (sectionId: string, blankId: string, value: string) => void;
  sectionId: string; // ID of the current section
}

const FillInTheBlanksInteractive: React.FC<FillInTheBlanksInteractiveProps> = ({
  segments = [],
  isReadOnly = false,
  sectionAnswers = {},
  onAnswerChange,
  sectionId,
}) => {
  if (segments.length === 0) {
    return <p className="text-sm text-gray-500">No fill-in-the-blanks content provided.</p>;
  }

  const handleInputChange = (blankId: string, value: string) => {
    if (onAnswerChange && !isReadOnly) {
      onAnswerChange(sectionId, blankId, value);
    }
  };

  return (
    <div className="text-gray-700 leading-relaxed prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none py-2">
      {segments.map((segment, index) => {
        if (typeof segment === 'string') {
          // Using dangerouslySetInnerHTML for string segments to allow basic HTML like <br> or emphasis
          // Ensure strings from Firestore are sanitized if they contain user-generated HTML.
          // For simple text, directly rendering is safer: {segment}
          return <span key={`text-${index}`} dangerouslySetInnerHTML={{ __html: segment }} />;
        } else {
          // Segment is a Blank object
          const blank = segment as Blank;
          return (
            <input
              key={blank.id}
              id={`${sectionId}-${blank.id}`} // Ensure unique DOM ID
              type="text"
              value={sectionAnswers[blank.id] || ''}
              onChange={(e) => handleInputChange(blank.id, e.target.value)}
              placeholder={blank.placeholder || '...'}
              readOnly={isReadOnly}
              className="mx-1 px-2 py-1 border-b-2 border-dotted border-indigo-400 focus:border-solid focus:border-indigo-600 focus:outline-none bg-transparent text-base align-baseline"
              style={{ width: blank.size ? `${blank.size * 0.9}ch` : '15ch' }} // Approximate width based on char count
              aria-label={`Fill in blank ${blank.id}`}
            />
          );
        }
      })}
    </div>
  );
};

export default FillInTheBlanksInteractive;
