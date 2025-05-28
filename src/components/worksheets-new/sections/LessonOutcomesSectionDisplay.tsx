// src/components/worksheets-new/sections/LessonOutcomesSectionDisplay.tsx
import React from 'react';
import { LessonOutcomesSection } from '@/types/worksheetNew';

interface LessonOutcomesProps {
  section: LessonOutcomesSection;
  onCompletedToggle: (completed: boolean) => void;
  isCompleted?: boolean;
}

const LessonOutcomesSectionDisplay: React.FC<LessonOutcomesProps> = ({
  section,
  onCompletedToggle,
  isCompleted,
}) => {
  return (
    <div className="p-1">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
        <span role="img" aria-label="target icon" className="mr-2">🎯</span>
        {section.title}
      </h2>
      <div className="bg-green-50 p-5 rounded-lg border border-green-200">
        <p className="font-semibold text-green-800 mb-3">By the end of this lesson, you should be able to:</p>
        <ul className="list-disc list-inside space-y-2 text-green-700 pl-4">
          {section.outcomes.map((outcome, index) => (
            <li key={index}>{outcome}</li>
          ))}
        </ul>
      </div>
      {!section.isActivity && (
        <div className="mt-6 p-3 bg-slate-50 rounded-md">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => onCompletedToggle(e.target.checked)}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-gray-700">I have read and understood this section.</span>
          </label>
        </div>
      )}
    </div>
  );
};

export default LessonOutcomesSectionDisplay;
