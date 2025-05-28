// src/components/worksheets-new/sections/ScenarioQuestionDisplay.tsx
import React, { useState, useEffect } from 'react';
import { ScenarioQuestionSection, Scenario, TaskAttempt } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';

interface ScenarioQuestionProps {
  section: ScenarioQuestionSection;
  onAnswerChange: (questionId: string, value: { selectedValue: string | null; isCorrect: boolean | null }, isAttempted: boolean) => void;
  answers: Record<string, TaskAttempt>;
  onResetTask: () => void;
}

const ScenarioQuestionDisplay: React.FC<ScenarioQuestionProps> = ({ section, onAnswerChange, answers, onResetTask }) => {
  const [answeredScenarios, setAnsweredScenarios] = useState<Record<string, boolean>>({});
  const [scenarioFeedbacks, setScenarioFeedbacks] = useState<Record<string, { text: string; isCorrect: boolean } | null>>({});

  useEffect(() => {
    const initialAnswered: Record<string, boolean> = {};
    const initialFeedbacks: Record<string, { text: string; isCorrect: boolean } | null> = {};
    section.scenarios.forEach(scenario => {
      const answer = answers[scenario.id];
      if (answer && answer.isAttempted) {
        initialAnswered[scenario.id] = true;
        if (answer.value?.isCorrect === true) initialFeedbacks[scenario.id] = { text: `Correct! The ${scenario.correctAnswerValue} is primarily involved here.`, isCorrect: true };
        else if (answer.value?.isCorrect === false) initialFeedbacks[scenario.id] = { text: `Incorrect. The correct register is the ${scenario.correctAnswerValue}. Think about its specific role.`, isCorrect: false };
        else initialFeedbacks[scenario.id] = null;
      } else { initialFeedbacks[scenario.id] = null; }
    });
    setAnsweredScenarios(initialAnswered);
    setScenarioFeedbacks(initialFeedbacks);
  }, [answers, section.scenarios]);

  const handleOptionClick = (scenario: Scenario, selectedOptionValue: string) => {
    if (answeredScenarios[scenario.id]) return;
    const isCorrect = selectedOptionValue === scenario.correctAnswerValue;
    setAnsweredScenarios(prev => ({ ...prev, [scenario.id]: true }));
    setScenarioFeedbacks(prev => ({ ...prev, [scenario.id]: { text: isCorrect ? `Correct! The ${scenario.correctAnswerValue} is primarily involved here.` : `Incorrect. The correct register is the ${scenario.correctAnswerValue}. Think about its specific role.`, isCorrect: isCorrect } }));
    onAnswerChange(scenario.id, { selectedValue: selectedOptionValue, isCorrect: isCorrect }, true);
  };

  const handleFullReset = () => { setAnsweredScenarios({}); setScenarioFeedbacks({}); onResetTask(); };

  return (
    <div className="p-1 task-container">
      <h3 className="text-xl task-title text-indigo-700"><span role="img" aria-label="clipboard icon" className="mr-2">📋</span>{section.title}</h3>
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.introText) }} />
      <div className="space-y-6 mt-4">
        {section.scenarios.map((scenario) => (
          <div key={scenario.id} className="scenario-question mb-4 p-4 bg-white rounded border border-gray-200">
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(scenario.questionText) }} />
            <div className="space-y-2 mt-3">
              {scenario.options.map((option) => {
                const answerForThisScenario = answers[scenario.id];
                let buttonClass = "scenario-option block w-full text-left p-2 border rounded-md bg-white border-gray-300 hover:bg-gray-100 transition-colors";
                if (answeredScenarios[scenario.id]) {
                  buttonClass += " disabled:opacity-70 disabled:cursor-not-allowed";
                  if (option.value === scenario.correctAnswerValue) buttonClass += " bg-green-100 border-green-400 text-green-700";
                  if (answerForThisScenario?.value?.selectedValue === option.value && !answerForThisScenario?.value?.isCorrect) buttonClass += " bg-red-100 border-red-400 text-red-700";
                }
                return (<button key={option.value} onClick={() => handleOptionClick(scenario, option.value)} className={buttonClass} disabled={answeredScenarios[scenario.id]}>{option.text}
                    {answeredScenarios[scenario.id] && option.value === scenario.correctAnswerValue && <span className="fas fa-check ml-2 text-green-600"></span>}
                    {answeredScenarios[scenario.id] && answerForThisScenario?.value?.selectedValue === option.value && !answerForThisScenario?.value?.isCorrect && <span className="fas fa-times ml-2 text-red-600"></span>}
                </button>);
              })}
            </div>
            {scenarioFeedbacks[scenario.id] && (<div className={`scenario-feedback mt-2 text-sm p-2 rounded ${scenarioFeedbacks[scenario.id]?.isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{scenarioFeedbacks[scenario.id]?.text}</div>)}
          </div>
        ))}
      </div>
      <div className="mt-6 text-center"><button className="reset-button" onClick={handleFullReset}>Reset Scenarios</button></div>
    </div>
  );
};
export default ScenarioQuestionDisplay;
