// src/components/worksheets-new/sections/ExamQuestionsSectionDisplay.tsx
import React, { useState, useEffect } from 'react';
import { ExamQuestionsSection, ExamQuestion, TaskAttempt } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';

interface ExamQuestionDisplayProps {
  section: ExamQuestionsSection;
  onAnswerChange: (questionId: string, value: { answerText: string; selfAssessedMarks?: number }, isAttempted: boolean) => void;
  answers: Record<string, TaskAttempt>;
  onResetTask: (questionId?: string) => void;
}

const ExamQuestionsSectionDisplay: React.FC<ExamQuestionDisplayProps> = ({ section, onAnswerChange, answers, onResetTask }) => {
  const [markSchemesVisible, setMarkSchemesVisible] = useState<Record<string, boolean>>({});
  const [showMarkSchemeEnabled, setShowMarkSchemeEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialEnabledState: Record<string, boolean> = {};
    section.questions.forEach(q => {
      const answerText = (answers[q.id]?.value as { answerText: string })?.answerText || '';
      const requiredLength = (q.charsPerMarkForAttempt || 20) * q.marks;
      initialEnabledState[q.id] = answerText.trim().length >= requiredLength;
    });
    setShowMarkSchemeEnabled(initialEnabledState);
  }, [answers, section.questions]);

  const handleAnswerInput = (question: ExamQuestion, answerText: string) => {
    const requiredLength = (question.charsPerMarkForAttempt || 20) * question.marks;
    setShowMarkSchemeEnabled(prev => ({ ...prev, [question.id]: answerText.trim().length >= requiredLength }));
    const currentSelfAssessed = (answers[question.id]?.value as {selfAssessedMarks?: number})?.selfAssessedMarks;
    onAnswerChange(question.id, { answerText, selfAssessedMarks: currentSelfAssessed }, answerText.trim() !== '');
  };

  const handleSelfAssessChange = (questionId: string, marksStr: string) => {
    const answerText = (answers[questionId]?.value as { answerText: string })?.answerText || '';
    const marks = parseInt(marksStr);
    onAnswerChange(questionId, { answerText, selfAssessedMarks: isNaN(marks) ? undefined : marks }, !!answerText.trim());
  };

  const toggleMarkSchemeVisibility = (questionId: string) => setMarkSchemesVisible(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  const handleFullReset = () => { setMarkSchemesVisible({}); setShowMarkSchemeEnabled({}); onResetTask(); };

  return (
    <div className="p-1 task-container">
      <h3 className="text-xl task-title text-indigo-700"><span role="img" aria-label="graduation cap icon" className="mr-2">🎓</span>{section.title}</h3>
      {section.introText && <div className="mb-4 text-gray-700" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.introText) }} />}
      <div className="space-y-6">
        {section.questions.map((q) => {
          const currentAnswer = (answers[q.id]?.value as { answerText: string; selfAssessedMarks?: number }) || { answerText: '', selfAssessedMarks: undefined };
          const isMarkSchemeButtonEnabled = showMarkSchemeEnabled[q.id] || false;
          const requiredLength = (q.charsPerMarkForAttempt || 20) * q.marks;
          const buttonTitle = isMarkSchemeButtonEnabled ? "Show the mark scheme" : `Type at least ${Math.max(0, requiredLength - currentAnswer.answerText.trim().length)} more characters to unlock. (${currentAnswer.answerText.trim().length}/${requiredLength})`;
          return (
            <div key={q.id} className="exam-question mb-6 p-4 bg-white rounded border border-gray-200">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.questionText) }} />
              <textarea value={currentAnswer.answerText} onChange={(e) => handleAnswerInput(q, e.target.value)} placeholder={q.answerPlaceholder || "Type your answer here..."} rows={Math.max(3, q.marks + 1)} className="exam-answer-area w-full p-2 mt-2 border border-gray-300 rounded-md" />
              <div className="exam-controls mt-2 flex items-center space-x-4">
                <div><label htmlFor={`self-assess-${q.id}`} className="text-sm text-gray-600">My predicted marks:</label><input type="number" id={`self-assess-${q.id}`} value={currentAnswer.selfAssessedMarks === undefined ? '' : currentAnswer.selfAssessedMarks} onChange={(e) => handleSelfAssessChange(q.id, e.target.value)} min="0" max={q.marks} className="self-assess-input w-20 p-1 border border-gray-300 rounded ml-1" /></div>
                <button onClick={() => toggleMarkSchemeVisibility(q.id)} disabled={!isMarkSchemeButtonEnabled} title={buttonTitle} className="toggle-mark-scheme-btn px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">{markSchemesVisible[q.id] ? 'Hide' : 'Show'} Mark Scheme</button>
              </div>
              {markSchemesVisible[q.id] && <div className="mark-scheme bg-gray-100 p-3 mt-3 rounded border border-gray-200 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.markScheme) }} />}
            </div>
          );
        })}
      </div>
      <div className="mt-6"><button className="reset-button" onClick={handleFullReset}>Reset Task 8</button></div>
    </div>
  );
};
export default ExamQuestionsSectionDisplay;
