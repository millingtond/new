// src/components/worksheets-new/sections/StarterActivitySectionDisplay.tsx
import React from 'react';
import { StarterActivitySection, StarterQuestion, TaskAttempt } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: string}> = ({ children, className, variant, ...props }) => (
  <button className={`px-3 py-1.5 text-xs rounded ${variant === 'danger_ghost' ? 'text-red-600 hover:bg-red-50' : 'bg-gray-200 hover:bg-gray-300'} ${className || ''}`} {...props}>{children}</button>
);

interface StarterActivityProps {
  section: StarterActivitySection;
  onAnswerChange: (questionId: string, value: any, minLengthForAttempt?: number) => void;
  answers: Record<string, TaskAttempt>;
  onResetTask: (questionId: string) => void;
}

const StarterActivitySectionDisplay: React.FC<StarterActivityProps> = ({
  section,
  onAnswerChange,
  answers,
  onResetTask,
}) => {
  const renderQuestion = (question: StarterQuestion) => {
    const answer = answers[question.id] || { value: '', isAttempted: false };
    return (
      <div key={question.id} className="starter-question bg-white p-4 rounded-md border border-yellow-300 shadow-sm">
        <label htmlFor={`starter-${question.id}`} className="block text-sm font-medium text-yellow-700 mb-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.questionText) }} />
        {question.questionType === 'shortAnswer' && (
          <input
            type="text"
            id={`starter-${question.id}`}
            value={answer.value as string || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value, question.minLengthForAttempt)}
            placeholder={question.placeholder || "Your initial thoughts..."}
            className="mt-1 block w-full p-2 border border-yellow-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
          />
        )}
        {question.questionType === 'trueFalse' && (
          <div className="space-y-2 mt-2">
            {[{ label: 'True', value: 'true' }, { label: 'False', value: 'false' }].map(opt => (
              <label key={opt.value} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-yellow-50 cursor-pointer">
                <input
                  type="radio"
                  name={`starter-${section.id}-${question.id}`}
                  value={opt.value}
                  checked={answer.value === opt.value}
                  onChange={(e) => onAnswerChange(question.id, e.target.value, 1)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )}
        <div className="mt-2 text-right">
             <Button onClick={() => onResetTask(question.id)} variant="danger_ghost">Reset</Button>
        </div>
        {answer.isAttempted && <small className="text-green-600 block mt-1 text-xs">Answered.</small>}
      </div>
    );
  };

  return (
    <div className="p-1">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
         <span role="img" aria-label="lightbulb" className="mr-2 text-yellow-500">💡</span>
        {section.title}
      </h2>
      <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-200 space-y-4">
        {section.introText && <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.introText) }} />}
        <div className="space-y-3">
            {section.questions.map(renderQuestion)}
        </div>
      </div>
    </div>
  );
};

export default StarterActivitySectionDisplay;
