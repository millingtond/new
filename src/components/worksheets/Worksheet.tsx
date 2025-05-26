// src/components/worksheets/Worksheet.tsx
'use client';

import React from 'react';
import type { Worksheet } from './worksheetTypes'; 
import SectionComponent from './Section'; 
import StaticContentBlock from './StaticContentBlock';


interface WorksheetComponentProps {
  worksheet: Worksheet | null; 
  isLoading?: boolean;
  error?: string | null;
  isReadOnly?: boolean; // For overall worksheet read-only state
  // Props for answer handling, to be passed down to section components
  answers?: Record<string, string>;
  onAnswerChange?: (questionId: string, answer: string) => void;
}

const WorksheetComponent: React.FC<WorksheetComponentProps> = ({ 
  worksheet, 
  isLoading, 
  error, 
  isReadOnly = true, // Default to read-only
  answers = {},
  onAnswerChange
}) => {
  if (isLoading) {
    return <p className="text-center mt-10 p-4 text-gray-600">Loading worksheet...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 p-4 text-red-600 bg-red-50 rounded-md">Error: {error}</p>;
  }

  if (!worksheet) {
    return <p className="text-center mt-10 p-4 text-gray-500">No worksheet data available.</p>;
  }

  return (
    <article className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-2xl my-8">
      <header className="mb-8 pb-6 border-b border-gray-300">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-800 mb-2">{worksheet.title}</h1>
        {/* ... other header details ... */}
        {worksheet.course && (
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Course:</span> {worksheet.course}
          </p>
        )}
        {worksheet.unit && (
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Unit:</span> {worksheet.unit}
          </p>
        )}
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
              <li key={index}>{obj}</li>
            ))}
          </ul>
        </div>
      )}
      
      {worksheet.keywords && worksheet.keywords.length > 0 && (
        <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Keywords</h2>
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
        worksheet.sections.map((section) => (
          <SectionComponent 
            key={section.id} 
            section={section} 
            isReadOnly={isReadOnly}
            answers={answers}
            onAnswerChange={onAnswerChange}
          />
        ))
      ) : (
        <p className="text-gray-500">This worksheet has no sections defined.</p>
      )}

      <footer className="mt-12 pt-6 border-t border-gray-300 text-center">
        <p className="text-xs text-gray-400">
            Worksheet content generated on {new Date().toLocaleDateString()}.
            {worksheet.createdAt && typeof worksheet.createdAt.toDate === 'function' && 
             ` Originally created: ${worksheet.createdAt.toDate().toLocaleDateString()}`
            }
        </p>
      </footer>
    </article>
  );
};

export default WorksheetComponent;
