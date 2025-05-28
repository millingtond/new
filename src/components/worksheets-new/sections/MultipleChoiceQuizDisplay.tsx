// src/components/worksheets-new/sections/MultipleChoiceQuizDisplay.tsx
import React, { useState, useEffect } from 'react';
import { MultipleChoiceQuizSection, QuizQuestion, TaskAttempt } from '@/types/worksheetNew';

interface QuizProps {
  section: MultipleChoiceQuizSection;
  onAnswerChange: (questionId: string, value: { selectedAnswer: string; isCorrect: boolean }, isAttempted: boolean) => void;
  answers: Record<string, TaskAttempt>;
  onResetTask: () => void;
}

const MultipleChoiceQuizDisplay: React.FC<QuizProps> = ({ section, onAnswerChange, answers, onResetTask }) => {
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, { text: string; isCorrect: boolean } | null>>({});
  const totalQuestions = section.questions.length;

  useEffect(() => {
    let initialScore = 0; const initialAnswered: Record<string, boolean> = {}; const initialFeedbacks: Record<string, { text: string; isCorrect: boolean } | null> = {};
    section.questions.forEach(q => {
      const answer = answers[q.id];
      if (answer && answer.isAttempted) {
        initialAnswered[q.id] = true;
        if (answer.value?.isCorrect) initialScore++;
        initialFeedbacks[q.id] = { text: answer.value?.isCorrect ? q.feedbackCorrect : q.feedbackIncorrect, isCorrect: answer.value?.isCorrect ?? false };
      } else { initialFeedbacks[q.id] = null; }
    });
    setScore(initialScore); setAnsweredQuestions(initialAnswered); setFeedbacks(initialFeedbacks);
  }, [answers, section.questions]);

  const handleAnswerSelect = (question: QuizQuestion, selectedOption: string) => {
    if (answeredQuestions[question.id]) return;
    const isCorrect = selectedOption === question.correctAnswer;
    setScore(prevScore => isCorrect ? prevScore + 1 : prevScore);
    setAnsweredQuestions(prev => ({ ...prev, [question.id]: true }));
    setFeedbacks(prev => ({ ...prev, [question.id]: { text: isCorrect ? question.feedbackCorrect : question.feedbackIncorrect, isCorrect: isCorrect } }));
    onAnswerChange(question.id, { selectedAnswer: selectedOption, isCorrect: isCorrect }, true);
  };

  const handleFullReset = () => { setScore(0); setAnsweredQuestions({}); setFeedbacks({}); onResetTask(); };

  return (
    <div className="p-1 task-container">
      <h3 className="text-xl task-title text-indigo-700"><span role="img" aria-label="question mark icon" className="mr-2">❓</span>{section.title}</h3>
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-medium text-purple-800">Component Quiz</p>
          <p className="text-lg font-semibold text-purple-800">Score: <span>{score}</span> / <span>{totalQuestions}</span></p>
        </div>
        <div className="space-y-6">
          {section.questions.map((q, index) => (
            <div key={q.id} className="quiz-question-container">
              <p className="font-semibold mb-3 text-gray-800">{`${index + 1}. ${q.questionText}`}</p>
              <div className="space-y-2">
                {q.options.map((option, optIndex) => {
                  const isAnswered = answeredQuestions[q.id];
                  const answerDetail = answers[q.id]?.value as { selectedAnswer: string; isCorrect: boolean } | undefined;
                  let optionClass = "quiz-option block w-full text-left p-3 border rounded-md bg-white border-gray-300 hover:border-blue-400 transition-colors";
                  if (isAnswered) {
                    optionClass += " disabled:opacity-80 disabled:cursor-not-allowed";
                    if (option === q.correctAnswer) optionClass += " bg-green-100 border-green-400 text-green-700";
                    else if (answerDetail?.selectedAnswer === option && !answerDetail?.isCorrect) optionClass += " bg-red-100 border-red-400 text-red-700";
                  }
                  return (<button key={optIndex} onClick={() => handleAnswerSelect(q, option)} className={optionClass} disabled={isAnswered}>{option}
                      {isAnswered && option === q.correctAnswer && <span className="fas fa-check ml-2 text-green-600"></span>}
                      {isAnswered && answerDetail?.selectedAnswer === option && !answerDetail?.isCorrect && <span className="fas fa-times ml-2 text-red-600"></span>}
                  </button>);
                })}
              </div>
              {feedbacks[q.id] && (<p className={`quiz-feedback mt-2 text-sm p-2 rounded ${feedbacks[q.id]?.isCorrect ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{feedbacks[q.id]?.text}</p>)}
            </div>
          ))}
        </div>
        {Object.keys(answeredQuestions).length === totalQuestions && (<button className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200" onClick={handleFullReset}>Reset Task 7</button>)}
      </div>
    </div>
  );
};
export default MultipleChoiceQuizDisplay;
