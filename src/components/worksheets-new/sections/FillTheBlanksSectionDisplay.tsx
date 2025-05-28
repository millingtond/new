// src/components/worksheets-new/sections/FillTheBlanksSectionDisplay.tsx
import React, { useState, useEffect } from 'react';
import { FillTheBlanksSection, FillBlankSentence, TaskAttempt } from '@/types/worksheetNew';

interface FillTheBlanksProps {
  section: FillTheBlanksSection;
  onAnswerChange: (questionId: string, value: string, isAttempted: boolean) => void;
  answers: Record<string, TaskAttempt>;
  onResetTask: () => void;
}

const FillTheBlanksSectionDisplay: React.FC<FillTheBlanksProps> = ({ section, onAnswerChange, answers, onResetTask }) => {
  const [blankStatuses, setBlankStatuses] = useState<Record<string, 'correct' | 'incorrect' | 'unanswered'>>({});
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    const initialStatuses: Record<string, 'correct' | 'incorrect' | 'unanswered'> = {};
    section.sentences.forEach(sentence => {
      const answer = answers[sentence.id];
      if (answer && answer.isAttempted && typeof answer.value === 'string') {
        initialStatuses[sentence.id] = sentence.correctAnswers.includes(answer.value.trim().toLowerCase()) ? 'correct' : 'incorrect';
      } else { initialStatuses[sentence.id] = 'unanswered'; }
    });
    setBlankStatuses(initialStatuses);
  }, [answers, section.sentences]);

  const handleInputChange = (sentenceId: string, value: string) => {
    onAnswerChange(sentenceId, value, value.trim() !== '');
    setBlankStatuses(prev => ({ ...prev, [sentenceId]: 'unanswered' }));
    setFeedback('');
  };

  const checkAllBlanks = () => {
    let allCorrect = true; let feedbackHtml = "<ul>"; const newStatuses: Record<string, 'correct' | 'incorrect' | 'unanswered'> = {};
    section.sentences.forEach(sentence => {
      const userAnswer = answers[sentence.id]?.value as string || '';
      const isCorrect = sentence.correctAnswers.includes(userAnswer.trim().toLowerCase().replace(/\.$/, ''));
      if (userAnswer.trim() === '') { newStatuses[sentence.id] = 'unanswered'; feedbackHtml += `<li class="text-yellow-700"><i class="fas fa-question-circle mr-2"></i>Blank ${sentence.id.split('-')[1]} is empty.</li>`; allCorrect = false; }
      else if (isCorrect) { newStatuses[sentence.id] = 'correct'; feedbackHtml += `<li class="correct-feedback"><i class="fas fa-check mr-2"></i>Blank ${sentence.id.split('-')[1]} is correct!</li>`; }
      else { newStatuses[sentence.id] = 'incorrect'; feedbackHtml += `<li class="incorrect-feedback"><i class="fas fa-times mr-2"></i>Blank ${sentence.id.split('-')[1]} is incorrect. (Expected: '${sentence.correctAnswers[0]}')</li>`; allCorrect = false; }
    });
    setBlankStatuses(newStatuses); feedbackHtml += "</ul>";
    if (allCorrect) setFeedback(`<p class="correct-feedback font-semibold"><i class="fas fa-check mr-2"></i>All blanks filled correctly!</p>`);
    else setFeedback(`<p class="incorrect-feedback font-semibold"><i class="fas fa-times mr-2"></i>Some blanks are incorrect or empty. Check the highlighted fields.</p>${feedbackHtml}`);
  };

  const handleFullReset = () => { setBlankStatuses({}); setFeedback(''); onResetTask(); };

  const renderSentenceWithBlank = (sentence: FillBlankSentence) => {
    const parts = sentence.fullSentenceStructure?.split('{blank}');
    if (!parts || parts.length !== 2) return <p className="my-2">Error: Sentence structure incorrect for {sentence.id}</p>;
    return (
      <p className="my-2 text-gray-800 leading-relaxed">
        {parts[0]}
        <input type="text" value={answers[sentence.id]?.value as string || ''} onChange={(e) => handleInputChange(sentence.id, e.target.value)} placeholder={sentence.placeholder} aria-label={`Blank for sentence ${sentence.id.split('-')[1]}`}
          className={`fill-blank-input p-1 border rounded mx-1 text-sm w-40 md:w-auto focus:ring-indigo-500 focus:border-indigo-500 ${blankStatuses[sentence.id] === 'correct' ? 'border-green-500 bg-green-50 text-green-700 correct-blank' : blankStatuses[sentence.id] === 'incorrect' ? 'border-red-500 bg-red-50 text-red-700 incorrect-blank' : 'border-gray-300'}`} />
        {parts[1]}
      </p>
    );
  };

  return (
    <div className="p-1 task-container">
      <h3 className="text-xl task-title text-indigo-700"><span role="img" aria-label="pen icon" className="mr-2">✒️</span>{section.title}</h3>
      <div dangerouslySetInnerHTML={{ __html: section.introText }} />
      <div className="space-y-3 text-gray-800 mt-4">{section.sentences.map(renderSentenceWithBlank)}</div>
      <div className="mt-6 space-x-2">
        <button className="check-button" onClick={checkAllBlanks}>Check Blanks</button>
        <button className="reset-button" onClick={handleFullReset}>Reset Task 6</button>
      </div>
      {feedback && <div id="fill-blanks-feedback" className="feedback-area mt-3 p-3 border rounded show" dangerouslySetInnerHTML={{ __html: feedback }} />}
    </div>
  );
};
export default FillTheBlanksSectionDisplay;
