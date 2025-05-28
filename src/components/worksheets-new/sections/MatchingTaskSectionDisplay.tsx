// src/components/worksheets-new/sections/MatchingTaskSectionDisplay.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { MatchingTaskSection, MatchItem, MatchDescriptionItem, TaskAttempt } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface MatchingTaskProps {
  section: MatchingTaskSection;
  onAnswerChange: (questionId: string, value: { descriptionId: string | null; isCorrect: boolean | null }, isAttempted: boolean) => void;
  answers: Record<string, TaskAttempt>;
  onResetTask: () => void;
}

const MatchingTaskSectionDisplay: React.FC<MatchingTaskProps> = ({ section, onAnswerChange, answers, onResetTask }) => {
  const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<MatchDescriptionItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [incorrectAttempts, setIncorrectAttempts] = useState<Set<string>>(new Set());
  const [shuffledDescriptions, setShuffledDescriptions] = useState<MatchDescriptionItem[]>([]);
  const [feedback, setFeedback] = useState<string>('');

  const initializeTask = useCallback(() => {
    setSelectedItem(null);
    setSelectedDescription(null);
    const initialMatchedPairs: Record<string, string> = {};
    Object.entries(answers).forEach(([itemId, taskAttempt]) => {
      if (taskAttempt?.value?.descriptionId && taskAttempt?.value?.isCorrect === true) {
        initialMatchedPairs[itemId] = taskAttempt.value.descriptionId;
      }
    });
    setMatchedPairs(initialMatchedPairs);
    setIncorrectAttempts(new Set());
    setShuffledDescriptions(shuffleArray(section.descriptions));
    setFeedback('');
  }, [section.descriptions, answers]);

  useEffect(() => { initializeTask(); }, [initializeTask]);

  const handleItemClick = (item: MatchItem) => {
    if (matchedPairs[item.id]) return;
    setIncorrectAttempts(new Set());
    setSelectedItem(prev => (prev?.id === item.id ? null : item));
  };

  const handleDescriptionClick = (desc: MatchDescriptionItem) => {
    if (Object.values(matchedPairs).includes(desc.id)) return;
    setIncorrectAttempts(new Set());
    setSelectedDescription(prev => (prev?.id === desc.id ? null : desc));
  };

  useEffect(() => {
    if (selectedItem && selectedDescription) {
      const isCorrectMatch = selectedDescription.matchesTo === selectedItem.id;
      if (isCorrectMatch) {
        setMatchedPairs(prev => ({ ...prev, [selectedItem.id]: selectedDescription.id }));
        onAnswerChange(selectedItem.id, { descriptionId: selectedDescription.id, isCorrect: true }, true);
        setSelectedItem(null); setSelectedDescription(null);
      } else {
        setIncorrectAttempts(new Set([selectedItem.id, selectedDescription.id]));
        onAnswerChange(selectedItem.id, { descriptionId: selectedDescription.id, isCorrect: false }, true);
        setTimeout(() => { setIncorrectAttempts(new Set()); setSelectedItem(null); setSelectedDescription(null); }, 800);
      }
    }
  }, [selectedItem, selectedDescription, onAnswerChange]);

  const checkAllMatches = () => {
    const totalPossibleMatches = section.items.length;
    let correctMatchesCount = 0;
    section.items.forEach(item => {
        if(matchedPairs[item.id] && section.descriptions.find(d => d.id === matchedPairs[item.id])?.matchesTo === item.id) {
            correctMatchesCount++;
        }
    });
    
    if (correctMatchesCount === totalPossibleMatches) {
      setFeedback(`<p class="correct-feedback font-semibold"><i class="fas fa-check mr-2"></i>Excellent! All items matched correctly.</p>`);
    } else {
      setFeedback(`<p class="incorrect-feedback font-semibold"><i class="fas fa-times mr-2"></i>You matched ${correctMatchesCount} out of ${totalPossibleMatches} correctly. Keep trying!</p>`);
    }
  };

  const handleReset = () => { initializeTask(); onResetTask(); };

  const getItemClasses = (item: MatchItem) => `matching-item p-3 border rounded cursor-pointer transition-all duration-200 ease-in-out text-sm ${matchedPairs[item.id] ? 'matched-correct bg-green-100 border-green-400 text-green-700 cursor-default' : selectedItem?.id === item.id ? 'selected bg-blue-100 border-blue-400 text-blue-700' : incorrectAttempts.has(item.id) ? 'matched-incorrect bg-red-100 border-red-400 text-red-700' : 'bg-white border-gray-300 hover:bg-gray-50'}`;
  const getDescClasses = (desc: MatchDescriptionItem) => `matching-item p-3 border rounded cursor-pointer transition-all duration-200 ease-in-out text-sm ${Object.values(matchedPairs).includes(desc.id) ? 'matched-correct bg-green-100 border-green-400 text-green-700 cursor-default' : selectedDescription?.id === desc.id ? 'selected bg-blue-100 border-blue-400 text-blue-700' : incorrectAttempts.has(desc.id) ? 'matched-incorrect bg-red-100 border-red-400 text-red-700' : 'bg-white border-gray-300 hover:bg-gray-50'}`;

  return (
    <div className="p-1 task-container">
      <h3 className="text-xl task-title text-indigo-700"><span role="img" aria-label="puzzle piece icon" className="mr-2">🧩</span>{section.title}</h3>
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.introText) }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <h4 className="font-semibold mb-2 text-center text-gray-600">{section.matchItemsTitle}</h4>
          <ul className="matching-list space-y-2">{section.items.map(item => <li key={item.id} className={getItemClasses(item)} onClick={() => handleItemClick(item)}>{item.text}</li>)}</ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-center text-gray-600">{section.descriptionItemsTitle}</h4>
          <ul className="matching-list space-y-2">{shuffledDescriptions.map(desc => <li key={desc.id} className={getDescClasses(desc)} onClick={() => handleDescriptionClick(desc)}>{desc.text}</li>)}</ul>
        </div>
      </div>
      <div className="mt-6 space-x-2">
        <button className="check-button" onClick={checkAllMatches}>Check Matches</button>
        <button className="reset-button" onClick={handleReset}>Reset Task 2</button>
      </div>
      {feedback && <div id="matching-feedback" className="feedback-area mt-3 p-3 border rounded show" dangerouslySetInnerHTML={{ __html: feedback }} />}
    </div>
  );
};
export default MatchingTaskSectionDisplay;
