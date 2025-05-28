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
    if (initialProgress) return initialProgress;
    const initialSectionStates: Record<string, { isCompleted: boolean; isAttempted?: boolean; answers?: Record<string, TaskAttempt> }> = {};
    worksheetData.sections.forEach(sec => {
      initialSectionStates[sec.id] = { isCompleted: false, isAttempted: false, answers: {} };
       if (sec.isActivity) {
         switch(sec.type) {
            case 'StarterActivity':
                (sec as StarterActivitySection).questions.forEach(q => {
                    if (!initialSectionStates[sec.id].answers) initialSectionStates[sec.id].answers = {};
                    initialSectionStates[sec.id].answers![q.id] = { value: '', isAttempted: false };
                });
                break;
            case 'ExamQuestions':
                (sec as ExamQuestionsSection).questions.forEach(q => {
                    if (!initialSectionStates[sec.id].answers) initialSectionStates[sec.id].answers = {};
                    initialSectionStates[sec.id].answers![q.id] = { value: {answerText: ''}, isAttempted: false };
                });
                break;
            case 'FillTheBlanks':
                 (sec as FillTheBlanksSection).sentences.forEach(s => {
                    if (!initialSectionStates[sec.id].answers) initialSectionStates[sec.id].answers = {};
                    initialSectionStates[sec.id].answers![s.id] = { value: '', isAttempted: false };
                 });
                 break;
            case 'MultipleChoiceQuiz':
                (sec as MultipleChoiceQuizSection).questions.forEach(q => {
                    if (!initialSectionStates[sec.id].answers) initialSectionStates[sec.id].answers = {};
                    initialSectionStates[sec.id].answers![q.id] = { value: {selectedAnswer: '', isCorrect: false}, isAttempted: false };
                });
                break;
            case 'ScenarioQuestion':
                (sec as ScenarioQuestionSection).scenarios.forEach(s => {
                    if (!initialSectionStates[sec.id].answers) initialSectionStates[sec.id].answers = {};
                    initialSectionStates[sec.id].answers![s.id] = { value: {selectedValue: null, isCorrect: null}, isAttempted: false };
                });
                break;
            case 'ExtensionActivities':
                 (sec as ExtensionActivitiesSection).activities.forEach(act => {
                    if (!initialSectionStates[sec.id].answers) initialSectionStates[sec.id].answers = {};
                    initialSectionStates[sec.id].answers![act.id] = { value: '', isAttempted: false };
                 });
                 break;
            case 'DiagramLabelDragDrop':
            case 'MatchingTask':
                 initialSectionStates[sec.id].answers = {};
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
      setProgress(initialProgress);
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
    sectionId: string,
    questionOrItemId: string,
    value: any,
    minLengthForAttempt?: number,
    isDirectlyAttempted?: boolean
  ) => {
    setProgress(prev => {
      const sectionState = prev.sectionStates[sectionId] || { isCompleted: false, isAttempted: false, answers: {} };
      const currentAnswers = sectionState.answers || {};
      let itemAttempted = isDirectlyAttempted !== undefined ? isDirectlyAttempted : false;
      if (!itemAttempted) {
          if (typeof value === 'string') itemAttempted = minLengthForAttempt ? value.length >= minLengthForAttempt : !!value.trim();
          else if (value && typeof value === 'object' && value.hasOwnProperty('selectedValue')) itemAttempted = value.selectedValue !== null && value.selectedValue !== undefined;
          else if (value && typeof value === 'object' && value.hasOwnProperty('labelId')) itemAttempted = value.labelId !== null;
          else itemAttempted = !!value;
      }
      const updatedAnswers = { ...currentAnswers, [questionOrItemId]: { value, isAttempted: itemAttempted, isCorrect: value?.isCorrect } };
      const sectionNowAttempted = Object.values(updatedAnswers).some((ans: any) => ans.isAttempted);
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
        const sectionToReset = newProg.sectionStates[sectionId];
        if (sectionToReset) {
            if (questionId && sectionToReset.answers && sectionToReset.answers[questionId]) {
                sectionToReset.answers[questionId] = { value: '', isAttempted: false, isCorrect: undefined };
            } else if (!questionId) {
                const originalSectionDef = worksheetData.sections.find(s => s.id === sectionId);
                const newAnswers: Record<string, TaskAttempt> = {};
                 if (originalSectionDef?.isActivity) {
                     switch(originalSectionDef.type) {
                        case 'StarterActivity': (originalSectionDef as StarterActivitySection).questions.forEach(q => { newAnswers[q.id] = { value: '', isAttempted: false }; }); break;
                        case 'ExamQuestions': (originalSectionDef as ExamQuestionsSection).questions.forEach(q => { newAnswers[q.id] = { value: {answerText: ''}, isAttempted: false }; }); break;
                        case 'FillTheBlanks': (originalSectionDef as FillTheBlanksSection).sentences.forEach(s => { newAnswers[s.id] = { value: '', isAttempted: false }; }); break;
                        case 'MultipleChoiceQuiz': (originalSectionDef as MultipleChoiceQuizSection).questions.forEach(q => { newAnswers[q.id] = { value: {selectedAnswer: '', isCorrect: false}, isAttempted: false };}); break;
                        case 'ScenarioQuestion': (originalSectionDef as ScenarioQuestionSection).scenarios.forEach(s => { newAnswers[s.id] = { value: {selectedValue: null, isCorrect: null}, isAttempted: false };}); break;
                        case 'ExtensionActivities': (originalSectionDef as ExtensionActivitiesSection).activities.forEach(act => { newAnswers[act.id] = { value: '', isAttempted: false }; }); break;
                        default: sectionToReset.answers = {}; break;
                     }
                 }
                sectionToReset.answers = newAnswers;
                sectionToReset.isAttempted = false;
            }
        }
        newProg.lastUpdated = new Date();
        debouncedSaveProgress(newProg);
        return newProg;
    });
  };

  const handleResetAllTasks = () => {
    const initialSectionStates: Record<string, { isCompleted: boolean; isAttempted?: boolean; answers?: Record<string, TaskAttempt> }> = {};
    worksheetData.sections.forEach(sec => {
      initialSectionStates[sec.id] = { isCompleted: false, isAttempted: false, answers: {} };
       if (sec.isActivity) { /* Re-initialize answers as in constructor */ }
    });
    const newProgress: NewWorksheetStudentProgress = {
        worksheetId: worksheetData.id, studentId: studentId, currentSectionIndex: 0,
        sectionStates: initialSectionStates, overallStatus: 'not-started', lastUpdated: new Date(),
    };
    setProgress(newProgress); setCurrentSectionIndex(0); debouncedSaveProgress(newProgress);
    alert("All tasks and inputs in this lesson have been reset.");
  };

  const handleExportToPDF = async () => {
    alert('Preparing PDF... This might take a moment.');
    const contentToPrintId = 'worksheet-content-for-pdf'; // ID for the main content wrapper
    const elementToPrint = document.getElementById(contentToPrintId);

    if (!elementToPrint) {
        alert("Could not find content to export. Ensure you are on the summary page or the main player has the ID 'worksheet-content-for-pdf'.");
        return;
    }
    
    const html2pdf = (window as any).html2pdf;
    if (!html2pdf) { alert("PDF generation library not loaded."); return; }

    const opt = {
      margin: [0.5, 0.2, 0.5, 0.2], filename: `${worksheetData.id}-summary.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, logging: false, useCORS: true, scrollY: -window.scrollY }, // Try to capture from top
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // Temporarily show all sections for PDF if on summary page
    let originalSectionDisplay: Array<{id: string, display: string}> = [];
    if (currentSectionIndex >= worksheetData.sections.length) {
        document.querySelectorAll('.pdf-section-summary').forEach(el => {
            const htmlEl = el as HTMLElement;
            originalSectionDisplay.push({id: htmlEl.id, display: htmlEl.style.display});
            htmlEl.style.display = 'block'; // Ensure all summary sections are visible
        });
    }


    html2pdf().from(elementToPrint).set(opt).save()
      .then(() => { console.log("PDF Exported"); })
      .catch((err: any) => { console.error("PDF Export error:", err); alert("Failed to generate PDF."); })
      .finally(() => {
          // Restore original display
          originalSectionDisplay.forEach(item => {
              const el = document.getElementById(item.id) as HTMLElement | null;
              if (el) el.style.display = item.display;
          });
      });
  };

  const currentSection = worksheetData.sections[currentSectionIndex];

  const renderAnswerSummary = (section: WorksheetSection, sectionProgress: any) => {
    if (!sectionProgress) return <p className="text-sm text-gray-500 ml-4">Section not started.</p>;
    if (!section.isActivity && sectionProgress.isCompleted) return <p className="text-sm text-gray-600 ml-4">Section marked as read.</p>;
    if (!section.isActivity) return null; // Don't show non-activities that aren't marked read
    if (!sectionProgress.isAttempted && !sectionProgress.isCompleted) return <p className="text-sm text-gray-500 ml-4">Activity not attempted.</p>;

    let content = null;
    const answers = sectionProgress.answers || {};
    switch (section.type) {
      case 'StarterActivity':
        content = (<ul className="list-disc pl-5 space-y-1 text-sm">{ (section as StarterActivitySection).questions.map(q => { const ans = answers[q.id]; return ans?.isAttempted ? <li key={q.id}><strong dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(q.questionText.substring(0,30)+ "...")}}></strong> {DOMPurify.sanitize(ans.value || '')}</li> : null; }) }</ul>);
        break;
      case 'ExamQuestions':
        content = (<ul className="list-disc pl-5 space-y-1 text-sm">{ (section as ExamQuestionsSection).questions.map(q => { const ans = answers[q.id]; return ans?.isAttempted ? <li key={q.id}><strong>Q{q.id.slice(-1)}:</strong> {(ans.value?.answerText || '').substring(0,50)}... {ans.value?.selfAssessedMarks !== undefined ? `(Self-assessed: ${ans.value.selfAssessedMarks}/${q.marks})`:''}</li> : null; }) }</ul>);
        break;
      case 'FillTheBlanks':
        content = (<ul className="list-disc pl-5 space-y-1 text-sm">{ (section as FillTheBlanksSection).sentences.map(s => { const ans = answers[s.id]; return ans?.isAttempted ? <li key={s.id}><strong>Blank {s.id.slice(-1)}:</strong> {DOMPurify.sanitize(ans.value || '')}</li> : null; }) }</ul>);
        break;
      case 'MultipleChoiceQuiz':
        const correctQuizAnswers = Object.values(answers).filter((ans: any) => ans.value?.isCorrect).length;
        content = <p className="text-sm text-gray-600 ml-4">Score: {correctQuizAnswers} / {(section as MultipleChoiceQuizSection).questions.length}</p>;
        break;
      case 'ScenarioQuestion':
        const correctScenarioAnswers = Object.values(answers).filter((ans: any) => ans.value?.isCorrect).length;
        content = <p className="text-sm text-gray-600 ml-4">Answered: {Object.keys(answers).length}, Correct: {correctScenarioAnswers} / {(section as ScenarioQuestionSection).scenarios.length}</p>;
        break;
      case 'ExtensionActivities':
        content = (<ul className="list-disc pl-5 space-y-1 text-sm">{ (section as ExtensionActivitiesSection).activities.map(act => { const ans = answers[act.id]; return ans?.isAttempted ? <li key={act.id}><strong>{act.title}:</strong> {(ans.value as string || '').substring(0, 70)}...</li> : null; }) }</ul>);
        break;
      case 'VideoPlaceholder': // Notes for videos
        content = (<ul className="list-disc pl-5 space-y-1 text-sm">{ (section as VideoPlaceholderSection).videos.map(vid => { const ans = answers[vid.id]; return ans?.isAttempted && ans.value ? <li key={vid.id}><strong>Notes for "{vid.title.substring(0,30)}...":</strong> {(ans.value as string || '').substring(0, 70)}...</li> : null; }) }</ul>);
        break;
      default:
        const attemptedItems = Object.values(answers).filter((ans: any) => ans.isAttempted).length;
        if (attemptedItems > 0) content = <p className="text-sm text-gray-600 ml-4">{attemptedItems} item(s) attempted. Review in task.</p>;
        else if (sectionProgress.isCompleted) content = <p className="text-sm text-gray-600 ml-4">Section marked as completed/read.</p>;
        else content = <p className="text-sm text-gray-500 ml-4">No specific answer recorded for this activity.</p>;
        break;
    }
    return content;
  };

  const renderSection = (section: WorksheetSection) => {
    const sectionState = progress.sectionStates[section.id] || { isCompleted: false, answers: {} };
    const commonProps: any = { section, onCompletedToggle: (completed: boolean) => handleSectionCompletedToggle(section.id, completed), isCompleted: sectionState.isCompleted, keywordsData: worksheetData.keywordsData };
    const activityCommonProps: any = { ...commonProps, answers: sectionState.answers || {}, isAttempted: sectionState.isAttempted || false, onResetTask: (questionId?:string) => handleResetTask(section.id, questionId) };

    switch (section.type) {
      case 'StaticText': case 'KeyTakeaways': return <RichTextSectionDisplay {...commonProps} section={section as StaticTextSection} />;
      case 'StarterActivity': return <StarterActivitySectionDisplay {...activityCommonProps} section={section as StarterActivitySection} onAnswerChange={(qId, val, minLen) => handleAnswerChange(section.id, qId, val, minLen)} />;
      case 'LessonOutcomes': return <LessonOutcomesSectionDisplay {...commonProps} section={section as LessonOutcomesSection} />;
      case 'DiagramLabelDragDrop': return <DiagramLabelDragDropDisplay {...activityCommonProps} section={section as DiagramLabelDragDropSection} onAnswerChange={(itemId, val, isAttempted) => handleAnswerChange(section.id, itemId, val, undefined, isAttempted)} />;
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
      default: return <div className="p-4 bg-red-100 border border-red-400 rounded">Unsupported section type: {(section as any).type}</div>;
    }
  };

  const noCopyPasteStyles = `.no-select {-webkit-user-select: none; -ms-user-select: none; user-select: none;}`;

  if (currentSectionIndex >= worksheetData.sections.length) {
    const uncompletedMandatorySections = worksheetData.sections.filter(s => s.isActivity && (!progress.sectionStates[s.id]?.isAttempted && !progress.sectionStates[s.id]?.isCompleted));
    return (
      <div className={`max-w-4xl mx-auto p-4 sm:p-6 lg:p-8`}>
        <div id="worksheet-content-for-pdf"> {/* ID for PDF export target */}
            <div className="bg-white shadow-xl rounded-lg overflow-hidden p-6 md:p-8">
            <header className="border-b pb-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-indigo-700 mb-1">Lesson Summary: {worksheetData.title}</h1>
                <p className="text-sm text-gray-500">{worksheetData.course} - {worksheetData.unit}</p>
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

            <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6">Your Responses:</h2>
            <div className="space-y-4 mb-6">
                {worksheetData.sections.map(sec => {
                const sectionProgress = progress.sectionStates[sec.id];
                // For PDF, we might want to show all sections, not just attempted/completed
                const summaryContent = renderAnswerSummary(sec, sectionProgress);
                return (
                    <div key={sec.id} className="pdf-section-summary p-3 border rounded-md bg-gray-50 break-inside-avoid">
                    <h3 className="font-medium text-gray-700">{sec.title}</h3>
                    {summaryContent || <p className="text-sm text-gray-500 ml-4">No interaction recorded or section not an activity.</p>}
                    </div>
                );
                })}
            </div>
            </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <ActionToolbar onResetAll={handleResetAllTasks} onExportPDF={handleExportToPDF} />
            <button onClick={() => alert("Lesson Finished! Progress (simulated) saved.")} className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold text-lg w-full sm:w-auto">
                Finish Lesson
            </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {disableCopyPaste && <style>{noCopyPasteStyles}</style>}
      <div id="worksheet-content-for-pdf" className={`max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 ${disableCopyPaste ? 'no-select' : ''}`}
           onCopy={(e) => disableCopyPaste && e.preventDefault()}
           onCut={(e) => disableCopyPaste && e.preventDefault()}
           onPaste={(e) => disableCopyPaste && e.preventDefault()}
      >
        <a href="/path-to/systems-architecture" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 group text-sm no-print">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 transition-transform duration-200 group-hover:-translate-x-0.5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back to Systems Architecture
        </a>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <header className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{worksheetData.title}</h1>
            <p className="text-sm opacity-90">{worksheetData.course} - {worksheetData.unit}</p>
          </header>
          <ActionToolbar onResetAll={handleResetAllTasks} onExportPDF={handleExportToPDF} />
          <main className="p-6 md:p-8 min-h-[400px]">
            {currentSection ? renderSection(currentSection) : <p>Loading section...</p>}
          </main>
          <NavigationControls
            onBack={handleBack}
            onNext={handleNext}
            isBackDisabled={currentSectionIndex === 0}
            isNextDisabled={currentSectionIndex >= worksheetData.sections.length}
            nextButtonText={currentSectionIndex === worksheetData.sections.length - 1 ? 'View Summary' : 'Next'}
          />
          <footer className="p-4 bg-gray-50 border-t text-center text-xs text-gray-500">
            Section {Math.min(currentSectionIndex + 1, worksheetData.sections.length)} of {worksheetData.sections.length}
          </footer>
        </div>
      </div>
    </>
  );
};

export default NewWorksheetPlayer;
