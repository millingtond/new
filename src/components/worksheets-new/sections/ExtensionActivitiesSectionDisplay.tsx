// src/components/worksheets-new/sections/ExtensionActivitiesSectionDisplay.tsx
import React from 'react';
import { ExtensionActivitiesSection, TaskAttempt } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';

interface ExtensionActivitiesProps {
  section: ExtensionActivitiesSection;
  onAnswerChange: (activityId: string, notes: string, isAttempted: boolean) => void;
  answers: Record<string, TaskAttempt>;
}

const ExtensionActivitiesSectionDisplay: React.FC<ExtensionActivitiesProps> = ({ section, onAnswerChange, answers }) => {
  const handleNotesChange = (activityId: string, notes: string) => onAnswerChange(activityId, notes, notes.trim() !== '');
  return (
    <div className="p-1">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4"><span role="img" aria-label="puzzle piece icon" className="mr-2">🧩</span>{section.title}</h2>
      {section.introText && <div className="mb-4 text-gray-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.introText) }} />}
      <div className="bg-orange-50 p-5 rounded-lg border border-orange-200 space-y-6">
        {section.activities.map((activity, index) => (
          <div key={activity.id} className={`extension-task ${index > 0 ? 'border-t border-orange-200 pt-4' : ''}`}>
            <h3 className="font-semibold text-orange-800 mb-2">{activity.title}</h3>
            <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activity.description) }} />
            <textarea rows={4} value={(answers[activity.id]?.value as string) || ''} onChange={(e) => handleNotesChange(activity.id, e.target.value)} placeholder={activity.placeholder || "Your research notes..."} className="w-full p-2 mt-2 border border-orange-300 rounded-md bg-white focus:ring-orange-500 focus:border-orange-500 text-sm" />
          </div>
        ))}
      </div>
    </div>
  );
};
export default ExtensionActivitiesSectionDisplay;
