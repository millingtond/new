// src/components/worksheets-new/NewWorksheetPlayer.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  NewWorksheet, WorksheetSection, NewWorksheetStudentProgress, TaskAttempt,
  StaticTextSection, StarterActivitySection, LessonOutcomesSection,
  DiagramLabelDragDropSection, MatchingTaskSection, RegisterExplorerSection,
  BusSimulationSection, ScenarioQuestionSection, FillTheBlanksSection,
  MultipleChoiceQuizSection, ExamQuestionsSection, VideoPlaceholderSection,
  // KeyTakeawaysSection is handled as StaticTextSection
  WhatsNextSection, ExtensionActivitiesSection, FillBlankSentence, ExamQuestion, QuizQuestion, Scenario, ExtensionActivity, StarterQuestion
} from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';
import { throttle } from 'lodash';

// Import section display components
import RichTextSectionDisplay from './sections/RichTextSectionDisplay';
import StarterActivitySectionDisplay from './sections/StarterActivitySectionDisplay';
import LessonOutcomesSectionDisplay from './sections/LessonOutcomesSectionDisplay';
import DiagramLabelDragDropDisplay from './sections/DiagramLabelDragDropDisplay';
import MatchingTaskSectionDisplay from './sections/MatchingTaskSectionDisplay';
import RegisterExplorerSectionDisplay from './sections/RegisterExplorerSectionDisplay';
import BusSimulationSectionDisplay from './sections/BusSimulationSectionDisplay';
import ScenarioQuestionDisplay from './sections/ScenarioQuestionDisplay';
import FillTheBlanksSectionDisplay from './sections/FillTheBlanksSectionDisplay';
import MultipleChoiceQuizDisplay from './sections/MultipleChoiceQuizDisplay';
import ExamQuestionsSectionDisplay from './sections/ExamQuestionsSectionDisplay';
import VideoPlaceholderSectionDisplay from './sections/VideoPlaceholderSectionDisplay';
import WhatsNextSectionDisplay from './sections/WhatsNextSectionDisplay';
import ExtensionActivitiesSectionDisplay from './sections/ExtensionActivitiesSectionDisplay';

import NavigationControls from './controls/NavigationControls';
import ActionToolbar from './controls/ActionToolbar';

interface NewWorksheetPlayerProps {
  worksheetData: NewWorksheet;
  initialProgress?: NewWorksheetStudentProgress;
  onSaveProgress: (progress: NewWorksheetStudentProgress) => Promise<void>;
  studentId: string;
}

const NewWorksheetPlayer: React.FC<NewWorksheetPlayerProps> = ({
  worksheetData,
  initialProgress,
  onSaveProgress,
  studentId,
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [progress, setProgress] = useState<NewWorksheetStudentProgress>(() => {
    // Initialize progress: use initialProgress if available, otherwise create a new structure.
    if (initialProgress) {
        // Ensure all sections from worksheetData have a state, even if not in initialProgress
        const completeSectionStates = { ...initialProgress.sectionStates };
        worksheetData.sections.forEach(sec => {
            if (!completeSectionStates[sec.id]) {
                completeSectionStates[sec.id] = { isCompleted: false, isAttempted: false, answers: {} };
                 // Initialize answers for activity types if not present
                if (sec.isActivity && !completeSectionStates[sec.id].answers) {
                     switch(sec.type) {
                        case 'StarterActivity':
                            (sec as StarterActivitySection).questions.forEach(q => {
                                if (!completeSectionStates[sec.id].answers) completeSectionStates[sec.id].answers = {};
                                completeSectionStates[sec.id].answers![q.id] = { value: '', isAttempted: false };
                            });
                            break;
                        case 'ExamQuestions':
                            (sec as ExamQuestionsSection).questions.forEach(q => {
                                if (!completeSectionStates[sec.id].answers) completeSectionStates[sec.id].answers = {};
                                completeSectionStates[sec.id].answers![q.id] = { value: {answerText: ''}, isAttempted: false };
                            });
                            break;
                        case 'FillTheBlanks':
                             (sec as FillTheBlanksSection).sentences.forEach(s => {
                                if (!completeSectionStates[sec.id].answers) completeSectionStates[sec.id].answers = {};
                                completeSectionStates[sec.id].answers![s.id] = { value: '', isAttempted: false };
                             });
                             break;
                        case 'MultipleChoiceQuiz':
                            (sec as MultipleChoiceQuizSection).questions.forEach(q => {
                                if (!completeSectionStates[sec.id].answers) completeSectionStates[sec.id].answers = {};
                                completeSectionStates[sec.id].answers![q.id] = { value: {selectedAnswer: '', isCorrect: false}, isAttempted: false };
                            });
                            break;
                        case 'ScenarioQuestion':
                            (sec as ScenarioQuestionSection).scenarios.forEach(s => {
                                if (!completeSectionStates[sec.id].answers) completeSectionStates[sec.id].answers = {};
                                completeSectionStates[sec.id].answers![s.id] = { value: {selectedValue: null, isCorrect: null}, isAttempted: false };
                            });
                            break;
                        case 'ExtensionActivities':
                             (sec as ExtensionActivitiesSection).activities.forEach(act => {
                                if (!completeSectionStates[sec.id].answers) completeSectionStates[sec.id].answers = {};
                                completeSectionStates[sec.id].answers![act.id] = { value: '', isAttempted: false };
                             });
                             break;
                        case 'DiagramLabelDragDrop': // Answers are { [dropZoneId: string]: { placedLabelIds: string[], isCorrect?: boolean } }
                        case 'MatchingTask': // Answers could be { [matchItemId: string]: { selectedDescriptionId: string, isCorrect?: boolean } }
                             completeSectionStates[sec.id].answers = {}; // Initialize as empty; specific component populates
                             break;
                     }
                }
            } else if (sec.isActivity && !completeSectionStates[sec.id].answers) {
                 // If section state exists but answers is missing for an activity, initialize it
                 completeSectionStates[sec.id].answers = {};
                 // Add specific initializations as above if needed for robustness
            }
        });
        return { ...initialProgress, sectionStates: completeSectionStates };
    }

    // No initialProgress, create from scratch
    const initialSectionStates: Record<string, { isCompleted: boolean; isAttempted?: boolean; answers?: Record<string, TaskAttempt | any> }> = {};
    worksheetData.sections.forEach(sec => {
      initialSectionStates[sec.id] = { isCompleted: false, isAttempted: false, answers: {} };
       if (sec.isActivity) {
         switch(sec.type) {
            case 'StarterActivity':
                (sec as StarterActivitySection).questions.forEach(q => {
                    initialSectionStates[sec.id].answers![q.id] = { value: '', isAttempted: false };
                });
                break;
            case 'ExamQuestions':
                (sec as ExamQuestionsSection).questions.forEach(q => {
                    initialSectionStates[sec.id].answers![q.id] = { value: {answerText: ''}, isAttempted: false };
                });
                break;
            case 'FillTheBlanks':
                 (sec as FillTheBlanksSection).sentences.forEach(s => {
                    initialSectionStates[sec.id].answers![s.id] = { value: '', isAttempted: false };
                 });
                 break;
            case 'MultipleChoiceQuiz':
                (sec as MultipleChoiceQuizSection).questions.forEach(q => {
                    initialSectionStates[sec.id].answers![q.id] = { value: {selectedAnswer: '', isCorrect: false}, isAttempted: false };
                });
                break;
            case 'ScenarioQuestion':
                (sec as ScenarioQuestionSection).scenarios.forEach(s => {
                    initialSectionStates[sec.id].answers![s.id] = { value: {selectedValue: null, isCorrect: null}, isAttempted: false };
                });
                break;
            case 'ExtensionActivities':
                 (sec as ExtensionActivitiesSection).activities.forEach(act => {
                    initialSectionStates[sec.id].answers![act.id] = { value: '', isAttempted: false };
                 });
                 break;
            case 'DiagramLabelDragDrop': // For D&D, answers are keyed by dropZoneId by the component itself
            case 'MatchingTask': // Similarly, matching tasks might have complex answer structures
                 initialSectionStates[sec.id].answers = {}; // Initialize as empty; component will structure it
                 break;
         }
      }
    });
    return {
      worksheetId: worksheetData.id,
      studentId: studentId,
      currentSectionIndex: 0,
      sectionStates: initialSectionStates,
      overallStatus: 'not-started',
      lastUpdated: new Date(),
    };
  });

  const [disableCopyPaste] = useState(true); 

  const debouncedSaveProgress = useCallback(
    throttle((newProgress: NewWorksheetStudentProgress) => {
      onSaveProgress(newProgress);
      console.log("Progress saved:", newProgress);
    }, 2000), 
    [onSaveProgress]
  );

  useEffect(() => {
    if (initialProgress) {
      setCurrentSectionIndex(initialProgress.currentSectionIndex);
      // setProgress is already handled by the useState initializer
    } else if (progress.overallStatus === 'not-started' && Object.keys(progress.sectionStates).length > 0) {
        debouncedSaveProgress(progress);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProgress]); 


  const handleNext = () => {
    const newIndex = currentSectionIndex + 1;
    setCurrentSectionIndex(newIndex);
    setProgress(prev => {
      const newProg = {...prev, currentSectionIndex: newIndex, lastUpdated: new Date() };
      if (newIndex >= worksheetData.sections.length) {
        newProg.overallStatus = 'completed'; 
      }
      debouncedSaveProgress(newProg);
      return newProg;
    });
  };

  const handleBack = () => {
    if (currentSectionIndex > 0) {
      const newIndex = currentSectionIndex - 1;
      setCurrentSectionIndex(newIndex);
      setProgress(prev => {
        const newProg = {...prev, currentSectionIndex: newIndex, lastUpdated: new Date() };
        debouncedSaveProgress(newProg);
        return newProg;
      });
    }
  };

  const handleAnswerChange = (
    sectionId: string, // This is the section.id
    questionOrItemIdOrAnswers: string | Record<string, any>, // For D&D, this will be the entire answers object for the section
    value?: any, // For simple Qs, this is the value. For D&D, this is undefined.
    minLengthForAttempt?: number,
    isDirectlyAttempted?: boolean
  ) => {
    setProgress(prev => {
      const sectionState = prev.sectionStates[sectionId] || { isCompleted: false, isAttempted: false, answers: {} };
      let updatedAnswers = { ...(sectionState.answers || {}) };
      let sectionNowAttempted = sectionState.isAttempted || false;

      if (typeof questionOrItemIdOrAnswers === 'string') {
        // Handling for simple question types (StarterActivity, FillTheBlanks, etc.)
        const questionId = questionOrItemIdOrAnswers;
        let itemAttempted = isDirectlyAttempted !== undefined ? isDirectlyAttempted : false;
        if (!itemAttempted) {
            if (typeof value === 'string') {
              itemAttempted = minLengthForAttempt ? value.length >= minLengthForAttempt : !!value.trim();
            } else if (value && typeof value === 'object' && value.hasOwnProperty('selectedValue')) {
              itemAttempted = value.selectedValue !== null && value.selectedValue !== undefined;
            } else if (value && typeof value === 'object' && value.hasOwnProperty('labelId')) {
               itemAttempted = value.labelId !== null;
            } else {
              itemAttempted = !!value;
            }
        }

        const newAttemptObject: TaskAttempt = { value, isAttempted: itemAttempted };
        if (value && typeof value === 'object' && typeof value.isCorrect === 'boolean') {
          newAttemptObject.isCorrect = value.isCorrect;
        }
        updatedAnswers[questionId] = newAttemptObject;
        if (itemAttempted) sectionNowAttempted = true;

      } else {
        // Handling for complex answer types like DiagramLabelDragDrop
        // Here, questionOrItemIdOrAnswers is the entire answers object for the section
        updatedAnswers = questionOrItemIdOrAnswers;
        // Determine if section is attempted based on the new complex answer structure
        // For DiagramLabelDragDrop, check if any drop zone has placed items
        if (worksheetData.sections.find(s => s.id === sectionId)?.type === 'DiagramLabelDragDrop') {
            sectionNowAttempted = Object.values(updatedAnswers).some((zoneAnswer: any) => zoneAnswer.placedLabelIds && zoneAnswer.placedLabelIds.length > 0);
        } else {
            // Add logic for other complex types if needed
            sectionNowAttempted = Object.values(updatedAnswers).some((ans: any) => ans.isAttempted);
        }
        if (isDirectlyAttempted !== undefined) { // If component explicitly passes attempt status for the whole section
            sectionNowAttempted = isDirectlyAttempted;
        }
      }
      
      const newProg = {
        ...prev,
        sectionStates: { ...prev.sectionStates, [sectionId]: { ...sectionState, isAttempted: sectionNowAttempted, answers: updatedAnswers }},
        overallStatus: prev.overallStatus === 'not-started' && sectionNowAttempted ? 'in-progress' as const : prev.overallStatus,
        lastUpdated: new Date(),
      };
      debouncedSaveProgress(newProg);
      return newProg;
    });
  };

  const handleSectionCompletedToggle = (sectionId: string, completed: boolean) => {
    setProgress(prev => {
      const newProg = { ...prev, sectionStates: { ...prev.sectionStates, [sectionId]: { ...prev.sectionStates[sectionId], isCompleted: completed }}, lastUpdated: new Date() };
      debouncedSaveProgress(newProg);
      return newProg;
    });
  };

  const handleResetTask = (sectionId: string, questionId?: string) => {
    setProgress(prev => {
        const newProg = {...prev};
        const sectionToResetState = newProg.sectionStates[sectionId];
        const originalSectionDef = worksheetData.sections.find(s => s.id === sectionId);

        if (sectionToResetState && originalSectionDef) {
            if (questionId && sectionToResetState.answers && sectionToResetState.answers[questionId]) {
                // Reset a specific question/item within the section
                let defaultValue: any = ''; 
                if(originalSectionDef.type === 'ExamQuestions') defaultValue = {answerText: ''};
                else if(originalSectionDef.type === 'MultipleChoiceQuiz') defaultValue = {selectedAnswer: '', isCorrect: false};
                else if(originalSectionDef.type === 'ScenarioQuestion') defaultValue = {selectedValue: null, isCorrect: null};
                
                const resetAttempt: TaskAttempt = { value: defaultValue, isAttempted: false };
                sectionToResetState.answers[questionId] = resetAttempt;
                // Recalculate if section is still attempted
                sectionToResetState.isAttempted = Object.values(sectionToResetState.answers).some((ans: any) => ans.isAttempted);

            } else if (!questionId) {
                // Reset all answers for the entire section
                const newAnswersForSection: Record<string, TaskAttempt | any> = {};
                 if (originalSectionDef.isActivity) {
                     switch(originalSectionDef.type) {
                        case 'StarterActivity': (originalSectionDef as StarterActivitySection).questions.forEach(q => { newAnswersForSection[q.id] = { value: '', isAttempted: false }; }); break;
                        case 'ExamQuestions': (originalSectionDef as ExamQuestionsSection).questions.forEach(q => { newAnswersForSection[q.id] = { value: {answerText: ''}, isAttempted: false }; }); break;
                        case 'FillTheBlanks': (originalSectionDef as FillTheBlanksSection).sentences.forEach(s => { newAnswersForSection[s.id] = { value: '', isAttempted: false }; }); break;
                        case 'MultipleChoiceQuiz': (originalSectionDef as MultipleChoiceQuizSection).questions.forEach(q => { newAnswersForSection[q.id] = { value: {selectedAnswer: '', isCorrect: false}, isAttempted: false };}); break;
                        case 'ScenarioQuestion': (originalSectionDef as ScenarioQuestionSection).scenarios.forEach(s => { newAnswersForSection[s.id] = { value: {selectedValue: null, isCorrect: null}, isAttempted: false };}); break;
                        case 'ExtensionActivities': (originalSectionDef as ExtensionActivitiesSection).activities.forEach(act => { newAnswersForSection[act.id] = { value: '', isAttempted: false }; }); break;
                        case 'DiagramLabelDragDrop': // For D&D, answers are { [dropZoneId: string]: { placedLabelIds: string[] } }
                        case 'MatchingTask':
                             // Resetting to an empty object, the component will re-initialize its internal state.
                             break; // newAnswersForSection remains {}
                        default: break; 
                     }
                 }
                sectionToResetState.answers = newAnswersForSection;
                sectionToResetState.isAttempted = false; 
            }
        }
        newProg.lastUpdated = new Date();
        debouncedSaveProgress(newProg);
        return newProg;
    });
  };

  const handleResetAllTasks = () => {
    const confirmed = window.confirm("Are you sure you want to reset all your answers and progress for this lesson? This action cannot be undone.");
    if (!confirmed) return;

    const initialSectionStatesReset: Record<string, { isCompleted: boolean; isAttempted?: boolean; answers?: Record<string, TaskAttempt | any> }> = {};
    worksheetData.sections.forEach(sec => {
      initialSectionStatesReset[sec.id] = { isCompleted: false, isAttempted: false, answers: {} };
       if (sec.isActivity) { 
            switch(sec.type) {
                case 'StarterActivity': (sec as StarterActivitySection).questions.forEach(q => { initialSectionStatesReset[sec.id].answers![q.id] = { value: '', isAttempted: false }; }); break;
                case 'ExamQuestions': (sec as ExamQuestionsSection).questions.forEach(q => { initialSectionStatesReset[sec.id].answers![q.id] = { value: {answerText: ''}, isAttempted: false }; }); break;
                case 'FillTheBlanks': (sec as FillTheBlanksSection).sentences.forEach(s => { initialSectionStatesReset[sec.id].answers![s.id] = { value: '', isAttempted: false }; }); break;
                case 'MultipleChoiceQuiz': (sec as MultipleChoiceQuizSection).questions.forEach(q => { initialSectionStatesReset[sec.id].answers![q.id] = { value: {selectedAnswer: '', isCorrect: false}, isAttempted: false }; }); break;
                case 'ScenarioQuestion': (sec as ScenarioQuestionSection).scenarios.forEach(s => { initialSectionStatesReset[sec.id].answers![s.id] = { value: {selectedValue: null, isCorrect: null}, isAttempted: false }; }); break;
                case 'ExtensionActivities': (sec as ExtensionActivitiesSection).activities.forEach(act => { initialSectionStatesReset[sec.id].answers![act.id] = { value: '', isAttempted: false }; }); break;
                case 'DiagramLabelDragDrop': 
                case 'MatchingTask': 
                    initialSectionStatesReset[sec.id].answers = {}; break; 
            }
        }
    });
    const newProgressData: NewWorksheetStudentProgress = {
        worksheetId: worksheetData.id, studentId: studentId, currentSectionIndex: 0,
        sectionStates: initialSectionStatesReset, overallStatus: 'not-started', lastUpdated: new Date(),
    };
    setProgress(newProgressData); 
    setCurrentSectionIndex(0); 
    debouncedSaveProgress(newProgressData); 
    alert("All tasks and inputs in this lesson have been reset.");
  };

  const handleExportToPDF = async () => {
    alert('Preparing PDF... This might take a moment.');
    const contentToPrintId = 'worksheet-content-for-pdf';
    const elementToPrint = document.getElementById(contentToPrintId);

    if (!elementToPrint) {
        alert("Could not find content to export.");
        return;
    }
    
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) { alert("PDF generation library not loaded. Please ensure html2pdf.js is included."); return; }

    const opt = {
      margin: [0.5, 0.2, 0.5, 0.2], 
      filename: `${worksheetData.id}-summary.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, logging: false, useCORS: true, scrollY: -window.scrollY },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    let originalSectionDisplayStates: Array<{id: string, display: string}> = [];
    if (currentSectionIndex >= worksheetData.sections.length) {
        document.querySelectorAll('.pdf-section-summary').forEach(el => {
            const htmlEl = el as HTMLElement;
            originalSectionDisplayStates.push({id: htmlEl.id, display: htmlEl.style.display});
            htmlEl.style.display = 'block'; 
        });
    }

    html2pdf().from(elementToPrint).set(opt).save()
      .then(() => { console.log("PDF Exported"); })
      .catch((err: any) => { console.error("PDF Export error:", err); alert("Failed to generate PDF."); })
      .finally(() => {
          originalSectionDisplayStates.forEach(item => {
              const el = document.getElementById(item.id) as HTMLElement | null;
              if (el) el.style.display = item.display;
          });
      });
  };

  const currentSection = worksheetData.sections[currentSectionIndex];

  const renderAnswerSummary = (section: WorksheetSection, sectionProgressState: any) => {
    if (!sectionProgressState) return <p className="text-sm text-slate-600 ml-4">Section not started.</p>;
    if (!section.isActivity && sectionProgressState.isCompleted) return <p className="text-sm text-slate-700 ml-4">Section marked as read.</p>;
    if (!section.isActivity) return null; 
    if (!sectionProgressState.isAttempted && !sectionProgressState.isCompleted) return <p className="text-sm text-slate-600 ml-4">Activity not attempted.</p>;

    let contentSummary = null;
    const answers = sectionProgressState.answers || {};
    switch (section.type) {
      case 'StarterActivity':
        contentSummary = (<ul className="list-disc pl-5 space-y-1 text-sm">{ (section as StarterActivitySection).questions.map(q => { const ans = answers[q.id]; return ans?.isAttempted ? <li key={q.id}><strong dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(q.questionText.substring(0,30)+ "...")}}></strong> {DOMPurify.sanitize(ans.value || '')}</li> : null; }) }</ul>);
        break;
      case 'ExamQuestions':
        contentSummary = (<ul className="list-disc pl-5 space-y-1 text-sm">{ (section as ExamQuestionsSection).questions.map(q => { const ans = answers[q.id]; return ans?.isAttempted ? <li key={q.id}><strong>Q{q.id.slice(-1)}:</strong> {(ans.value?.answerText || '').substring(0,50)}... {ans.value?.selfAssessedMarks !== undefined ? `(Self-assessed: ${ans.value.selfAssessedMarks}/${q.marks})`:''}</li> : null; }) }</ul>);
        break;
      case 'FillTheBlanks':
        contentSummary = (<ul className="list-disc pl-5 space-y-1 text-sm">{ (section as FillTheBlanksSection).sentences.map(s => { const ans = answers[s.id]; return ans?.isAttempted ? <li key={s.id}><strong>Blank {s.id.slice(-1)}:</strong> {DOMPurify.sanitize(ans.value || '')}</li> : null; }) }</ul>);
        break;
      case 'MultipleChoiceQuiz':
        const correctQuizAnswers = Object.values(answers).filter((ans: any) => ans.value?.isCorrect).length;
        contentSummary = <p className="text-sm text-slate-700 ml-4">Score: {correctQuizAnswers} / {(section as MultipleChoiceQuizSection).questions.length}</p>;
        break;
      case 'ScenarioQuestion':
        const correctScenarioAnswers = Object.values(answers).filter((ans: any) => ans.value?.isCorrect).length;
        contentSummary = <p className="text-sm text-slate-700 ml-4">Answered: {Object.keys(answers).length}, Correct: {correctScenarioAnswers} / {(section as ScenarioQuestionSection).scenarios.length}</p>;
        break;
      case 'ExtensionActivities':
        contentSummary = (<ul className="list-disc pl-5 space-y-1 text-sm">{ (section as ExtensionActivitiesSection).activities.map(act => { const ans = answers[act.id]; return ans?.isAttempted ? <li key={act.id}><strong>{act.title}:</strong> {(ans.value as string || '').substring(0, 70)}...</li> : null; }) }</ul>);
        break;
      case 'VideoPlaceholder': 
        contentSummary = (<ul className="list-disc pl-5 space-y-1 text-sm">{ (section as VideoPlaceholderSection).videos.map(vid => { const ans = answers[vid.id]; return ans?.isAttempted && ans.value ? <li key={vid.id}><strong>Notes for "{vid.title.substring(0,30)}...":</strong> {(ans.value as string || '').substring(0, 70)}...</li> : null; }) }</ul>);
        break;
      case 'DiagramLabelDragDrop':
        const dndAnswers = answers as Record<string, { placedLabelIds: string[]; isCorrect?: boolean }>;
        const placedSummaries = Object.entries(dndAnswers).map(([zoneId, zoneAnswer]) => {
            const zoneConfig = (section as DiagramLabelDragDropSection).dropZones.find(z => z.id === zoneId);
            if (zoneAnswer.placedLabelIds && zoneAnswer.placedLabelIds.length > 0) {
                const labelTexts = zoneAnswer.placedLabelIds.map(labelId => {
                    const label = (section as DiagramLabelDragDropSection).labels.find(l => l.id === labelId);
                    return label ? label.text : 'Unknown Label';
                }).join(', ');
                return <li key={zoneId}><strong>{zoneConfig?.title || zoneId}:</strong> {labelTexts} {zoneAnswer.isCorrect !== undefined ? (zoneAnswer.isCorrect ? ' (Correct)' : ' (Incorrect)') : ''}</li>;
            }
            return null;
        }).filter(Boolean);
        if (placedSummaries.length > 0) {
            contentSummary = <ul className="list-disc pl-5 space-y-1 text-sm">{placedSummaries}</ul>;
        } else {
            contentSummary = <p className="text-sm text-slate-600 ml-4">No labels placed in diagram.</p>;
        }
        break;
      default: 
        const attemptedItems = Object.values(answers).filter((ans: any) => ans.isAttempted).length;
        if (attemptedItems > 0) contentSummary = <p className="text-sm text-slate-700 ml-4">{attemptedItems} item(s) attempted. Review in task.</p>;
        else if (sectionProgressState.isCompleted) contentSummary = <p className="text-sm text-slate-700 ml-4">Section marked as completed/read.</p>;
        else contentSummary = <p className="text-sm text-slate-600 ml-4">No specific answer recorded for this activity.</p>;
        break;
    }
    return contentSummary;
  };

  const renderSection = (section: WorksheetSection) => {
    const sectionState = progress.sectionStates[section.id] || { isCompleted: false, answers: {} };
    const commonProps: any = { 
        section, 
        onCompletedToggle: (completed: boolean) => handleSectionCompletedToggle(section.id, completed), 
        isCompleted: sectionState.isCompleted, 
        keywordsData: worksheetData.keywordsData 
    };
    const activityCommonProps: any = { 
        ...commonProps, 
        answers: sectionState.answers || {}, 
        isAttempted: sectionState.isAttempted || false, 
        onResetTask: (questionId?:string) => handleResetTask(section.id, questionId) 
    };

    switch (section.type) {
      case 'StaticText': case 'KeyTakeaways': return <RichTextSectionDisplay {...commonProps} section={section as StaticTextSection} />;
      case 'StarterActivity': return <StarterActivitySectionDisplay {...activityCommonProps} section={section as StarterActivitySection} onAnswerChange={(qId, val, minLen) => handleAnswerChange(section.id, qId, val, minLen)} />;
      case 'LessonOutcomes': return <LessonOutcomesSectionDisplay {...commonProps} section={section as LessonOutcomesSection} />;
      case 'DiagramLabelDragDrop': 
        // Pass the specific onAnswerChange for DiagramLabelDragDrop
        return <DiagramLabelDragDropDisplay 
                    {...activityCommonProps} 
                    section={section as DiagramLabelDragDropSection} 
                    onAnswerChange={(answersForSection, isSectionAttempted) => handleAnswerChange(section.id, answersForSection, undefined, undefined, isSectionAttempted)} 
                />;
      case 'MatchingTask': return <MatchingTaskSectionDisplay {...activityCommonProps} section={section as MatchingTaskSection} onAnswerChange={(itemId, val, isAttempted) => handleAnswerChange(section.id, itemId, val, undefined, isAttempted)} />;
      case 'RegisterExplorer': return <RegisterExplorerSectionDisplay {...activityCommonProps} section={section as RegisterExplorerSection} onAnswerChange={(itemId, val, isAttempted) => handleAnswerChange(section.id, itemId, val, undefined, isAttempted)} />; 
      case 'BusSimulation': return <BusSimulationSectionDisplay section={section as BusSimulationSection} keywordsData={worksheetData.keywordsData} />; 
      case 'ScenarioQuestion': return <ScenarioQuestionDisplay {...activityCommonProps} section={section as ScenarioQuestionSection} onAnswerChange={(itemId, val, isAttempted) => handleAnswerChange(section.id, itemId, val, undefined, isAttempted)} />;
      case 'FillTheBlanks': return <FillTheBlanksSectionDisplay {...activityCommonProps} section={section as FillTheBlanksSection} onAnswerChange={(itemId, val, isAttempted) => handleAnswerChange(section.id, itemId, val, undefined, isAttempted)} />;
      case 'MultipleChoiceQuiz': return <MultipleChoiceQuizDisplay {...activityCommonProps} section={section as MultipleChoiceQuizSection} onAnswerChange={(itemId, val, isAttempted) => handleAnswerChange(section.id, itemId, val, undefined, isAttempted)} />;
      case 'ExamQuestions': return <ExamQuestionsSectionDisplay {...activityCommonProps} section={section as ExamQuestionsSection} onAnswerChange={(itemId, val, isAttempted) => handleAnswerChange(section.id, itemId, val, undefined, isAttempted)} />;
      case 'VideoPlaceholder': return <VideoPlaceholderSectionDisplay {...commonProps} section={section as VideoPlaceholderSection} answers={sectionState.answers || {}} onAnswerChange={(itemId, notes, isAttempted) => handleAnswerChange(section.id, itemId, notes, undefined, isAttempted)} />;
      case 'WhatsNext': return <WhatsNextSectionDisplay {...commonProps} section={section as WhatsNextSection} />;
      case 'ExtensionActivities': return <ExtensionActivitiesSectionDisplay {...activityCommonProps} section={section as ExtensionActivitiesSection} onAnswerChange={(itemId, notes, isAttempted) => handleAnswerChange(section.id, itemId, notes, undefined, isAttempted)} />;
      default: return <div className="p-4 bg-red-100 border border-red-400 rounded text-red-700">Unsupported section type: {(section as any).type}</div>;
    }
  };

  const noCopyPasteStyles = `.no-select {-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;}`;

  if (currentSectionIndex >= worksheetData.sections.length) {
    const uncompletedMandatorySections = worksheetData.sections.filter(s => s.isActivity && (!progress.sectionStates[s.id]?.isAttempted && !progress.sectionStates[s.id]?.isCompleted));
    return (
      <div className={`max-w-4xl mx-auto p-4 sm:p-6 lg:p-8`}>
        <div id="worksheet-content-for-pdf"> 
            <div className="bg-white shadow-xl rounded-lg overflow-hidden p-6 md:p-8">
            <header className="border-b pb-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-indigo-700 mb-1">Lesson Summary: {worksheetData.title}</h1>
                <p className="text-sm text-slate-600">{worksheetData.course} - {worksheetData.unit}</p>
            </header>

            {uncompletedMandatorySections.length > 0 && (
                <div className="my-4 p-4 bg-yellow-100 border border-yellow-400 rounded-md text-yellow-800">
                <h3 className="font-semibold"><i className="fas fa-exclamation-triangle mr-2"></i>Attention!</h3>
                <p>You seem to have missed or not fully completed the following activities:</p>
                <ul className="list-disc list-inside mt-2 text-sm">
                    {uncompletedMandatorySections.map(sec => (
                    <li key={sec.id}>
                        <button onClick={() => { const missedIndex = worksheetData.sections.findIndex(s => s.id === sec.id); if (missedIndex !== -1) setCurrentSectionIndex(missedIndex);}}
                        className="text-yellow-900 hover:underline font-medium" > {sec.title} </button>
                    </li>
                    ))}
                </ul>
                </div>
            )}

            <h2 className="text-xl font-semibold text-slate-800 mb-4 mt-6">Your Responses & Progress:</h2>
            <div className="space-y-4 mb-6">
                {worksheetData.sections.map(sec => {
                const sectionProgressState = progress.sectionStates[sec.id];
                const summaryContent = renderAnswerSummary(sec, sectionProgressState);
                return (
                    <div key={sec.id} id={`summary-${sec.id}`} className="pdf-section-summary p-3 border rounded-md bg-slate-50 break-inside-avoid">
                    <h3 className="font-medium text-slate-700">{sec.title}</h3>
                    {summaryContent || <p className="text-sm text-slate-600 ml-4">No interaction recorded or section not an activity.</p>}
                    </div>
                );
                })}
            </div>
            </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <ActionToolbar onResetAll={handleResetAllTasks} onExportPDF={handleExportToPDF} />
            <button 
                onClick={() => {
                    alert("Lesson Finished! Your progress has been saved."); 
                }} 
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold text-lg w-full sm:w-auto"
            >
                Finish Lesson & Save
            </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {disableCopyPaste && <style>{noCopyPasteStyles}</style>}
      <div 
        id="worksheet-content-for-pdf" 
        className={`max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 ${disableCopyPaste ? 'no-select' : ''}`}
        onCopy={(e) => disableCopyPaste && e.preventDefault()}
        onCut={(e) => disableCopyPaste && e.preventDefault()}
        onPaste={(e) => disableCopyPaste && e.preventDefault()}
      >
        <a href="#" onClick={(e) => { e.preventDefault(); window.history.back();}} className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 group text-sm no-print">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 transition-transform duration-200 group-hover:-translate-x-0.5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back to Previous Page
        </a>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <header className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{worksheetData.title}</h1>
            <p className="text-sm opacity-90">{worksheetData.course} - {worksheetData.unit}</p>
          </header>
          <ActionToolbar onResetAll={handleResetAllTasks} onExportPDF={handleExportToPDF} />
          <main className="p-6 md:p-8 min-h-[400px] text-slate-700"> 
            {currentSection ? renderSection(currentSection) : <p className="text-slate-600">Loading section...</p>}
          </main>
          <NavigationControls
            onBack={handleBack}
            onNext={handleNext}
            isBackDisabled={currentSectionIndex === 0}
            isNextDisabled={currentSectionIndex >= worksheetData.sections.length} 
            nextButtonText={currentSectionIndex === worksheetData.sections.length - 1 ? 'View Summary' : 'Next'}
          />
          <footer className="p-4 bg-slate-50 border-t text-center text-xs text-slate-600">
            Section {Math.min(currentSectionIndex + 1, worksheetData.sections.length)} of {worksheetData.sections.length}
          </footer>
        </div>
      </div>
    </>
  );
};

export default NewWorksheetPlayer;
