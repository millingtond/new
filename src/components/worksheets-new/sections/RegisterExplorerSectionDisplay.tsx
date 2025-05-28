// src/components/worksheets-new/sections/RegisterExplorerSectionDisplay.tsx
import React, { useState } from 'react';
import { RegisterExplorerSection, RegisterInfo, TaskAttempt } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';

interface RegisterExplorerProps {
  section: RegisterExplorerSection;
  onAnswerChange: (questionId: string, value: { selectedRegisterId: string | null }, isAttempted: boolean) => void;
  answers: Record<string, TaskAttempt>;
  onResetTask: () => void;
  onCompletedToggle: (completed: boolean) => void;
  isCompleted?: boolean;
}

const RegisterExplorerSectionDisplay: React.FC<RegisterExplorerProps> = ({ section, onAnswerChange, onResetTask, onCompletedToggle, isCompleted }) => {
  const [selectedRegister, setSelectedRegister] = useState<RegisterInfo | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleRegisterClick = (register: RegisterInfo) => {
    setSelectedRegister(register);
    onAnswerChange(section.id, { selectedRegisterId: register.id }, true);
    if (!hasInteracted) {
        setHasInteracted(true);
        if (!isCompleted) onCompletedToggle(true);
    }
  };

  const handleResetExplorer = () => {
    setSelectedRegister(null);
    onResetTask();
    setHasInteracted(false);
    if (isCompleted) onCompletedToggle(false);
    onAnswerChange(section.id, { selectedRegisterId: null }, false);
  };

  return (
    <div className="p-1 task-container">
      <h3 className="text-xl task-title text-indigo-700"><span role="img" aria-label="search icon" className="mr-2">🔍</span>{section.title}</h3>
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.introText) }} />
      <div className="register-explorer-container flex flex-wrap gap-4 justify-center my-6">
        {section.registers.map(register => (
          <button
            key={register.id}
            className={`register-button px-4 py-2 border-2 rounded font-semibold transition-all duration-200 ease-in-out ${selectedRegister?.id === register.id ? 'bg-purple-600 text-white border-purple-700 shadow-lg' : 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200 hover:border-purple-400'}`}
            onClick={() => handleRegisterClick(register)}
          >{register.name}</button>
        ))}
      </div>
      <div id="register-info-panel" className="min-h-[80px] bg-purple-50 border border-purple-200 p-4 rounded-lg text-purple-800 text-center">
        {selectedRegister ? (
          <>
            <h4 className="font-bold text-lg mb-2">{selectedRegister.displayName}</h4>
            <p className="text-sm text-left prose prose-sm max-w-none prose-purple" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedRegister.description) }} />
          </>
        ) : (<p>Click a register button above to see its details.</p>)}
      </div>
      <div className="mt-6 text-center">
        <button className="reset-button" onClick={handleResetExplorer}>Reset Explorer</button>
      </div>
    </div>
  );
};
export default RegisterExplorerSectionDisplay;
