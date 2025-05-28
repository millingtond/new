// src/components/worksheets-new/sections/DiagramLabelDragDropDisplay.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DiagramLabelDragDropSection,
  DraggableLabelItem,
  DropZoneConfig,
  TaskAttempt,
} from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';
import { CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';


interface DiagramLabelDragDropDisplayProps {
  section: DiagramLabelDragDropSection;
  answers: Record<string, { placedLabelIds: string[]; isCorrect?: boolean }>; // From NewWorksheetStudentProgress
  onAnswerChange: (
    itemId: string, // Here, itemId will be the dropZone.id
    value: { placedLabelIds: string[]; isCorrect?: boolean },
    isAttempted: boolean
  ) => void;
  isAttempted: boolean;
  onResetTask: (questionId?: string) => void; // questionId will be the section.id for full reset
  keywordsData?: Record<string, { definition: string; link?: string }>;
}

// Individual Draggable Label Component
interface DraggableProps {
  id: UniqueIdentifier;
  item: DraggableLabelItem;
  isDragging?: boolean;
  isOverlay?: boolean;
}

const Draggable: React.FC<DraggableProps> = ({ id, item, isDragging, isOverlay }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isOver } = useSortable({
    id: id,
    data: { type: 'LABEL', item }, // Add item data here
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging || isOverlay ? 100 : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
    boxShadow: isOverlay ? '0px 5px 15px rgba(0,0,0,0.2)' : '0px 1px 3px rgba(0,0,0,0.1)',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 m-1 border rounded-md bg-blue-100 text-blue-700 touch-none select-none ${
        isDragging ? 'shadow-lg' : 'shadow-sm'
      } ${isOver ? 'ring-2 ring-blue-500' : ''}`}
    >
      {item.text}
    </div>
  );
};

// Individual Drop Zone Component
interface DroppableProps {
  id: UniqueIdentifier;
  zoneConfig: DropZoneConfig;
  items: DraggableLabelItem[]; // Labels currently in this zone
  onRemoveItem: (zoneId: UniqueIdentifier, itemId: UniqueIdentifier) => void;
  isOver?: boolean;
  showHints: boolean;
}

const Droppable: React.FC<DroppableProps> = ({ id, zoneConfig, items, onRemoveItem, isOver, showHints }) => {
  const { setNodeRef, isOver: dndIsOver } = useSortable({
    id: id,
    data: { type: 'ZONE', accepts: ['LABEL'], zoneConfig },
  });

  const [showHintTooltip, setShowHintTooltip] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={zoneConfig.style}
      className={`relative p-3 border-2 border-dashed rounded-lg min-h-[60px] flex flex-col items-center justify-center transition-colors
        ${dndIsOver || isOver ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50'}
        ${zoneConfig.className || ''}`}
    >
      {zoneConfig.title && <p className="text-sm font-medium text-slate-600 mb-1">{zoneConfig.title}</p>}
      
      {zoneConfig.hint && showHints && (
        <div className="absolute top-1 right-1">
          <QuestionMarkCircleIcon 
            className="h-5 w-5 text-slate-400 hover:text-slate-600 cursor-help"
            onMouseEnter={() => setShowHintTooltip(true)}
            onMouseLeave={() => setShowHintTooltip(false)}
          />
          {showHintTooltip && (
            <div className="absolute z-20 bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 text-xs text-white bg-slate-700 rounded-md shadow-lg">
              {zoneConfig.hint}
            </div>
          )}
        </div>
      )}

      {items.length === 0 && zoneConfig.placeholderText && (
        <p className="text-xs text-slate-400">{zoneConfig.placeholderText}</p>
      )}
      <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap justify-center items-center w-full">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <Draggable id={item.id} item={item} />
              <button
                onClick={() => onRemoveItem(id, item.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${item.text}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </SortableContext>
    </div>
  );
};


const DiagramLabelDragDropDisplay: React.FC<DiagramLabelDragDropDisplayProps> = ({
  section,
  answers,
  onAnswerChange,
  isAttempted,
  onResetTask,
}) => {
  // `containers` will store the state of labels: either in the 'labelBank' or in a specific dropZone.id
  // Each key is a container ID (either 'labelBank' or a zone.id). Value is an array of DraggableLabelItem.id.
  const [containers, setContainers] = useState<Record<UniqueIdentifier, UniqueIdentifier[]>>(() => {
    const initialContainers: Record<UniqueIdentifier, UniqueIdentifier[]> = { labelBank: section.labels.map(l => l.id) };
    section.dropZones.forEach(zone => initialContainers[zone.id] = []);

    // Populate from saved answers
    if (answers) {
      Object.entries(answers).forEach(([zoneId, zoneAnswer]) => {
        if (zoneAnswer && Array.isArray(zoneAnswer.placedLabelIds)) {
          initialContainers[zoneId] = zoneAnswer.placedLabelIds;
          // Remove these labels from the labelBank
          initialContainers.labelBank = initialContainers.labelBank.filter(
            labelId => !zoneAnswer.placedLabelIds.includes(labelId)
          );
        }
      });
    }
    return initialContainers;
  });

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showHints, setShowHints] = useState(true); // Control hint visibility

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  // Memoize items to prevent re-renders if section.labels doesn't change
  const allItems = useMemo(() => {
    const itemMap = new Map<UniqueIdentifier, DraggableLabelItem>();
    section.labels.forEach(label => itemMap.set(label.id, label));
    return itemMap;
  }, [section.labels]);

  const activeItem = activeId ? allItems.get(activeId) : null;

  useEffect(() => {
    // If parent signals reset (e.g. isAttempted becomes false after a global reset), reset internal state
    if (!isAttempted && showResults) {
        setShowResults(false);
        const initialContainers: Record<UniqueIdentifier, UniqueIdentifier[]> = { labelBank: section.labels.map(l => l.id) };
        section.dropZones.forEach(zone => initialContainers[zone.id] = []);
        setContainers(initialContainers);
    }
  }, [isAttempted, showResults, section.labels, section.dropZones]);


  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return; // Dropped outside any droppable

    const activeId = active.id;
    const overId = over.id;
    
    const activeContainer = findContainer(activeId);
    const overContainerId = over.data.current?.type === 'ZONE' ? overId : findContainer(overId);


    if (!activeContainer || !overContainerId || activeContainer === overContainerId) {
      // Handle reordering within the same container if desired, or just return
      if (activeContainer && overContainerId && activeContainer === overContainerId) {
        setContainers(prev => ({
          ...prev,
          [activeContainer]: arrayMove(prev[activeContainer], prev[activeContainer].indexOf(activeId), prev[activeContainer].indexOf(overId))
        }));
      }
      return;
    }
    
    // Moving from one container to another
    setContainers(prevContainers => {
      const newContainers = { ...prevContainers };
      const sourceZoneId = activeContainer;
      const destinationZoneId = overContainerId;

      // Remove from source
      newContainers[sourceZoneId] = prevContainers[sourceZoneId].filter(id => id !== activeId);

      // Add to destination
      const destinationZoneConfig = section.dropZones.find(z => z.id === destinationZoneId);
      if (destinationZoneId === 'labelBank' || (destinationZoneConfig && (destinationZoneConfig.allowMultiple || newContainers[destinationZoneId].length === 0))) {
        if (destinationZoneConfig && destinationZoneConfig.maxItems && newContainers[destinationZoneId].length >= destinationZoneConfig.maxItems) {
          // Max items reached, revert or notify user (here, we just don't add)
          // To revert, add it back to source:
          newContainers[sourceZoneId] = [...prevContainers[sourceZoneId]]; // This line simply copies, effectively no change
                                                                      // A more robust revert would put it back in its original position.
                                                                      // For simplicity, we'll just not add it if maxItems is hit.
          alert(`This zone can only hold ${destinationZoneConfig.maxItems} item(s).`);
          return prevContainers; // No change
        }
        
        // If over item is a label in the destination, insert before it, otherwise append
        const overItemIndex = newContainers[destinationZoneId].indexOf(overId);
        if (overItemIndex !== -1) {
            newContainers[destinationZoneId] = [
                ...newContainers[destinationZoneId].slice(0, overItemIndex),
                activeId,
                ...newContainers[destinationZoneId].slice(overItemIndex)
            ];
        } else {
            newContainers[destinationZoneId] = [...newContainers[destinationZoneId], activeId];
        }

      } else {
        // Destination is a single-item zone and already has an item, swap or revert
        // For simplicity, let's revert (don't allow drop if not multiple and full)
        // Or, if you want to swap, you'd move the existing item in destinationZoneId to sourceZoneId (or labelBank)
        alert("This zone can only hold one item. Drag the existing item out first.");
        return prevContainers; // No change
      }
      return newContainers;
    });
  };
  
  const findContainer = (itemId: UniqueIdentifier) => {
    for (const containerId in containers) {
      if (containers[containerId].includes(itemId)) {
        return containerId;
      }
    }
    return null; // Should not happen if itemId is valid
  };

  // Update parent component's answer state when `containers` change
  useEffect(() => {
    const newAnswers: Record<string, { placedLabelIds: string[]; isCorrect?: boolean }> = {};
    let anyAttemptMade = false;
    section.dropZones.forEach(zone => {
      const placedIds = containers[zone.id] || [];
      if (placedIds.length > 0) {
        anyAttemptMade = true;
      }
      newAnswers[zone.id] = { placedLabelIds: placedIds }; // isCorrect will be calculated on check
    });
    if(anyAttemptMade || isAttempted) { // Propagate if any attempt or if parent already marked as attempted
        onAnswerChange(section.id, newAnswers, anyAttemptMade || isAttempted);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containers, section.id, section.dropZones]); // onAnswerChange and isAttempted are not stable, so omit for now to prevent loops.
                                                  // This effect's job is to report the current state of `containers`.

  const handleCheckAnswers = () => {
    let allCorrect = true;
    const updatedAnswersFromCheck: Record<string, { placedLabelIds: string[]; isCorrect?: boolean }> = {};

    section.dropZones.forEach(zone => {
      const placedLabelIds = containers[zone.id] || [];
      const placedDataLabels = placedLabelIds.map(id => allItems.get(id)?.dataLabel).filter(Boolean) as string[];
      
      let zoneCorrect = false;
      if (zone.allowMultiple) {
        // All placed items must be in correctLabels, and all correctLabels must be present
        const correctLabelsSet = new Set(zone.correctLabels);
        const placedDataLabelsSet = new Set(placedDataLabels);
        zoneCorrect = zone.correctLabels.length === placedDataLabels.length && 
                      placedDataLabels.every(label => correctLabelsSet.has(label)) &&
                      zone.correctLabels.every(label => placedDataLabelsSet.has(label));

      } else { // Single item zone
        zoneCorrect = placedDataLabels.length === 1 && zone.correctLabels.includes(placedDataLabels[0]) && zone.correctLabels.length === 1;
      }
      
      updatedAnswersFromCheck[zone.id] = { placedLabelIds, isCorrect: zoneCorrect };
      if (!zoneCorrect) allCorrect = false;
    });
    
    setShowResults(true);
    // Update the parent with the correctness
    onAnswerChange(section.id, updatedAnswersFromCheck, true); 
    // alert(allCorrect ? "All labels are correct!" : "Some labels are incorrect or missing. Review the highlighted zones.");
  };

  const handleInternalReset = () => {
    setShowResults(false);
    const initialContainers: Record<UniqueIdentifier, UniqueIdentifier[]> = { labelBank: section.labels.map(l => l.id) };
    section.dropZones.forEach(zone => initialContainers[zone.id] = []);
    setContainers(initialContainers);
    // Notify parent to reset its state for this section
    onResetTask(section.id); // This will call the onAnswerChange with empty answers via useEffect
  };
  
  const getZoneStatus = (zoneId: string): 'correct' | 'incorrect' | 'neutral' => {
    if (!showResults || !answers || !answers[zoneId]) return 'neutral';
    return answers[zoneId].isCorrect ? 'correct' : 'incorrect';
  };


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      <div className="p-4 border rounded-lg shadow bg-white">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-slate-700">{section.title}</h3>
            <button
                onClick={() => setShowHints(prev => !prev)}
                className="text-sm text-blue-600 hover:text-blue-800"
            >
                {showHints ? "Hide Hints" : "Show Hints"}
            </button>
        </div>
        {section.introText && (
          <div
            className="prose prose-sm max-w-none mb-4 text-slate-600"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.introText) }}
          />
        )}

        {/* Diagram Image (Optional) */}
        {section.diagramImageUrl && (
          <div className="mb-4 flex justify-center">
            <img src={section.diagramImageUrl} alt="Diagram" className="max-w-full h-auto rounded-md" />
          </div>
        )}

        {/* Drop Zones Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-slate-100 rounded-md">
          {section.dropZones.map((zone) => {
            const zoneStatus = getZoneStatus(zone.id);
            let borderColor = 'border-slate-300';
            if (showResults) {
                borderColor = zoneStatus === 'correct' ? 'border-green-500' : 'border-red-500';
            }
            return (
                <div key={zone.id} className={`
                    relative p-1 rounded-lg transition-all
                    ${showResults && zoneStatus === 'correct' ? 'ring-2 ring-green-500 bg-green-50' : ''}
                    ${showResults && zoneStatus === 'incorrect' ? 'ring-2 ring-red-500 bg-red-50' : ''}
                    ${!showResults ? 'bg-slate-50' : ''}
                `}>
                    <Droppable
                        id={zone.id}
                        zoneConfig={zone}
                        items={(containers[zone.id] || []).map(id => allItems.get(id)).filter(Boolean) as DraggableLabelItem[]}
                        onRemoveItem={(zoneId, itemId) => {
                            setContainers(prev => ({
                                ...prev,
                                [zoneId]: prev[zoneId].filter(id => id !== itemId),
                                labelBank: [...prev.labelBank, itemId]
                            }));
                        }}
                        showHints={showHints}
                    />
                    {showResults && (
                        <div className="absolute -top-2 -right-2 transform translate-x-1/2 -translate-y-1/2">
                        {zoneStatus === 'correct' && <CheckCircleIcon className="h-6 w-6 text-green-500 bg-white rounded-full" />}
                        {zoneStatus === 'incorrect' && <XCircleIcon className="h-6 w-6 text-red-500 bg-white rounded-full" />}
                        </div>
                    )}
                </div>
            );
          })}
        </div>

        {/* Label Bank Area */}
        <div className="mb-6 p-4 border rounded-md bg-slate-50">
          <p className="text-sm font-medium text-slate-600 mb-2">Available Labels:</p>
          {containers.labelBank?.length === 0 && <p className="text-xs text-slate-500">All labels placed.</p>}
          <SortableContext items={containers.labelBank || []} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {(containers.labelBank || []).map(id => {
                const item = allItems.get(id);
                return item ? <Draggable key={id} id={id} item={item} /> : null;
              })}
            </div>
          </SortableContext>
        </div>
        
        <DragOverlay>
          {activeId && activeItem ? <Draggable id={activeId} item={activeItem} isOverlay /> : null}
        </DragOverlay>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleCheckAnswers}
            disabled={showResults}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-300"
          >
            Check Diagram Labels
          </button>
          <button
            onClick={handleInternalReset}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 flex items-center gap-1"
          >
            <ArrowPathIcon className="h-4 w-4"/> Reset Task
          </button>
        </div>
        {showResults && (
            <p className="mt-3 text-sm text-slate-600">
                Review the highlighted zones. Green indicates correct, Red indicates incorrect.
            </p>
        )}
      </div>
    </DndContext>
  );
};

export default DiagramLabelDragDropDisplay;
