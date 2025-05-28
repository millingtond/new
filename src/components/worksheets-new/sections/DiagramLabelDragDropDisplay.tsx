// src/components/worksheets-new/sections/DiagramLabelDragDropDisplay.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { DiagramLabelDragDropSection, DraggableLabelItem, DropZoneConfig, TaskAttempt } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';

interface DiagramLabelDragDropProps {
  section: DiagramLabelDragDropSection;
  onAnswerChange: (questionId: string, value: { labelId: string | null, dataLabel: string | null }, isAttempted: boolean) => void;
  answers: Record<string, TaskAttempt>; // Keyed by dropZone.id
  onResetTask: (questionId?: string) => void;
}

const DiagramLabelDragDropDisplay: React.FC<DiagramLabelDragDropProps> = ({
  section,
  onAnswerChange,
  answers,
  onResetTask,
}) => {
  const [placedLabels, setPlacedLabels] = useState<Record<string, DraggableLabelItem | null>>({});
  const [bankLabels, setBankLabels] = useState<DraggableLabelItem[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [draggedLabel, setDraggedLabel] = useState<DraggableLabelItem | null>(null);

  const initializeState = useCallback(() => {
    const initialDrops: Record<string, DraggableLabelItem | null> = {};
    let currentBankLabels = [...section.labels];

    section.dropZones.forEach(dz => {
        const answer = answers[dz.id];
        if (answer && answer.value && typeof answer.value === 'object' && answer.value.labelId) {
            const labelInZone = section.labels.find(l => l.id === answer.value.labelId);
            if (labelInZone) {
                initialDrops[dz.id] = labelInZone;
                currentBankLabels = currentBankLabels.filter(l => l.id !== labelInZone.id);
            } else {
                 initialDrops[dz.id] = null;
            }
        } else {
            initialDrops[dz.id] = null;
        }
    });
    setPlacedLabels(initialDrops);
    setBankLabels(currentBankLabels);
    setFeedback('');
  }, [section.labels, section.dropZones, answers]);

  useEffect(() => {
    initializeState();
  }, [initializeState]);

  const handleDragStart = (e: React.DragEvent<HTMLSpanElement>, label: DraggableLabelItem) => {
    setDraggedLabel(label);
    e.dataTransfer.setData("application/json", JSON.stringify(label));
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add('dragging'); // From style.css
  };

  const handleDragEnd = (e: React.DragEvent<HTMLSpanElement>) => {
     e.currentTarget.classList.remove('dragging');
     setDraggedLabel(null);
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropZoneConfig: DropZoneConfig) => {
    e.preventDefault();
    e.currentTarget.classList.remove('over'); // From style.css
    if (!draggedLabel) return;

    const currentLabelInDropZone = placedLabels[dropZoneConfig.id];

    setPlacedLabels(prevPlaced => ({
      ...prevPlaced,
      [dropZoneConfig.id]: draggedLabel
    }));

    setBankLabels(prevBank => {
      let newBank = prevBank.filter(l => l.id !== draggedLabel.id);
      if (currentLabelInDropZone && currentLabelInDropZone.id !== draggedLabel.id) {
        newBank = [...newBank, currentLabelInDropZone];
      }
      return newBank;
    });
    onAnswerChange(dropZoneConfig.id, { labelId: draggedLabel.id, dataLabel: draggedLabel.dataLabel }, true);
    setDraggedLabel(null);
  };

  const handleDropOnBank = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('over');
    if (!draggedLabel) return;

    // Remove from any drop zone
    let labelWasInZone = false;
    const newPlacedLabels = { ...placedLabels };
    for (const dzId in newPlacedLabels) {
      if (newPlacedLabels[dzId]?.id === draggedLabel.id) {
        newPlacedLabels[dzId] = null;
        onAnswerChange(dzId, { labelId: null, dataLabel: null }, !!answers[dzId]?.isAttempted);
        labelWasInZone = true;
        break;
      }
    }
    setPlacedLabels(newPlacedLabels);

    // Add to bank if not already there
    if (!bankLabels.find(l => l.id === draggedLabel.id) || labelWasInZone) {
         setBankLabels(prevBank => {
            const filteredBank = prevBank.filter(l => l.id !== draggedLabel!.id); // Remove if it was there (e.g. dragging from bank to bank)
            return [...filteredBank, draggedLabel];
         });
    }
    setDraggedLabel(null);
  };

  const allowDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.currentTarget.classList.add('over');};
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.currentTarget.classList.remove('over');};

  const checkDiagram = () => {
    let correctCount = 0;
    let feedbackMessages: string[] = [];
    let allCorrectOverall = true;

    section.dropZones.forEach(dz => {
      const dropZoneElement = document.getElementById(dz.id); // For direct style manipulation if needed
      if (dropZoneElement) dropZoneElement.className = dz.className ? `drop-zone ${dz.className}` : 'drop-zone'; // Reset visual state

      const placed = placedLabels[dz.id];
      if (placed && placed.dataLabel === dz.dataCorrect) {
        correctCount++;
        feedbackMessages.push(`<li class="correct-feedback"><i class="fas fa-check mr-2"></i>'${placed.text}' is placed correctly in ${dz.id.replace('drop-','').replace('-title','')}!</li>`);
        if(dropZoneElement) dropZoneElement.classList.add('correct-drop');
      } else if (placed) {
        allCorrectOverall = false;
        feedbackMessages.push(`<li class="incorrect-feedback"><i class="fas fa-times mr-2"></i>'${placed.text}' is incorrect for ${dz.id.replace('drop-','').replace('-title','')}.</li>`);
        if(dropZoneElement) dropZoneElement.classList.add('incorrect-drop');
      } else {
        allCorrectOverall = false;
        feedbackMessages.push(`<li class="incorrect-feedback"><i class="fas fa-times mr-2"></i>Drop zone for '${dz.dataCorrect}' is empty.</li>`);
        if(dropZoneElement) dropZoneElement.classList.add('incorrect-drop');
      }
    });

    if (allCorrectOverall) {
      setFeedback(`<p class="correct-feedback font-semibold"><i class="fas fa-check mr-2"></i>All labels placed correctly!</p>`);
    } else {
      setFeedback(`<p class="incorrect-feedback font-semibold"><i class="fas fa-times mr-2"></i>Some labels are incorrect or missing. You got ${correctCount}/${section.dropZones.length} correct.</p><ul>${feedbackMessages.join('')}</ul>`);
    }
  };

  const handleFullReset = () => {
    initializeState(); // Resets local state
    onResetTask();    // Calls parent to reset stored answers for the whole section
  };

  return (
    <div className="p-1 task-container">
      <h3 className="text-xl task-title text-indigo-700"><span role="img" aria-label="arrows icon" className="mr-2">✥</span>{section.title}</h3>
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.introText) }} />
      
      {/* Diagram Area - Apply styles from style.css using IDs or Tailwind equivalents */}
      <div className="diagram-layout-container my-4 p-2 bg-gray-100 border rounded relative" style={{height: '420px', maxWidth: '600px', margin: '1rem auto'}}>
        {section.dropZones.map(dz => (
          <div
            key={dz.id}
            id={dz.id}
            className={`drop-zone absolute flex items-center justify-center border-2 border-dashed border-gray-400 rounded m-1 min-h-[35px] p-1 text-xs text-gray-500 ${dz.className || ''} ${placedLabels[dz.id]?.dataLabel === dz.dataCorrect && feedback.includes("correct-feedback") ? 'correct-drop' : feedback.includes("incorrect-feedback") && placedLabels[dz.id]?.dataLabel !== dz.dataCorrect ? 'incorrect-drop' : ''}`}
            style={dz.style}
            onDrop={(e) => handleDrop(e, dz)}
            onDragOver={allowDrop}
            onDragLeave={handleDragLeave}
          >
            {placedLabels[dz.id] ? (
              <span className="draggable-label bg-blue-100 p-1 border border-blue-300 rounded text-xs" draggable onDragStart={(e) => handleDragStart(e, placedLabels[dz.id]!)} onDragEnd={handleDragEnd}>
                {placedLabels[dz.id]!.text}
              </span>
            ) : ( <span className="text-xs text-gray-400">{dz.hint ? 'Drop here' : ''}</span> )}
            {dz.hint && <span className="hint-icon absolute top-1 right-1 text-gray-400 text-xs cursor-help" title={dz.hint}><i className="fas fa-circle-question"></i></span>}
          </div>
        ))}
      </div>

      <div id="label-bank" className="label-bank p-3 my-4 bg-gray-200 rounded border border-gray-300 flex flex-wrap justify-center items-center gap-2 min-h-[50px]" onDrop={handleDropOnBank} onDragOver={allowDrop} onDragLeave={handleDragLeave}>
        {bankLabels.map(label => (
          <span key={label.id} id={label.id} className="draggable-label bg-white border border-gray-500 px-2 py-1 rounded cursor-grab text-xs" draggable onDragStart={(e) => handleDragStart(e, label)} onDragEnd={handleDragEnd}>
            {label.text}
          </span>
        ))}
      </div>
      <div className="mt-4 space-x-2">
        <button className="check-button" onClick={checkDiagram}>Check Diagram Labels</button>
        <button className="reset-button" onClick={handleFullReset}>Reset Task 1</button>
      </div>
      {feedback && <div id="dragdrop-feedback" className="feedback-area mt-3 p-3 border rounded show" dangerouslySetInnerHTML={{ __html: feedback }} />}
    </div>
  );
};
export default DiagramLabelDragDropDisplay;
