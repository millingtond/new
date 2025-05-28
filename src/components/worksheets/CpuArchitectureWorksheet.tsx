import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    ChevronLeft, ChevronRight, CheckCircle, XCircle, RotateCcw, Download, 
    Eye, EyeOff, ListChecks, AlertTriangle, Video, Target, Zap, BookOpen, 
    HelpCircle, Lightbulb, Edit3, Brain, Settings, Server, MemoryStick, Bus, 
    Puzzle, GitCompareArrows, Unplug, Info, Search, Clock, Layers, Cpu,
    Users, Shuffle, CheckSquare, MessageSquareWarning, FileText, TrendingUp, ExternalLink,
    MousePointerClick, MoveUp, MoveDown
} from 'lucide-react';

// --- Helper Types & Interfaces ---
interface AnswerBase {
  isAttempted?: boolean;
  isCorrect?: boolean | null;
  score?: number;
}

interface ShortAnswerState extends AnswerBase {
  answer: string;
}

interface QuizAnswerState extends AnswerBase {
  selectedOptionId: string | null;
}

interface FillBlanksState extends AnswerBase {
  blanks: Record<string, string>; 
}

interface OrderSequenceState extends AnswerBase {
  currentOrder: string[]; 
}

interface MatchingPairsState extends AnswerBase {
  pairs: Array<{ itemAId: string; itemBId: string }>;
}

interface DiagramLabelState extends AnswerBase {
    revealedLabels: Record<string, boolean>; // hotspotId: isRevealed
}

type TaskState = ShortAnswerState | QuizAnswerState | FillBlanksState | OrderSequenceState | MatchingPairsState | DiagramLabelState;
type AllTaskStates = Record<string, TaskState>; 

interface ReadSectionsState {
  [sectionId: string]: boolean;
}

// --- Worksheet Content Structure Definitions ---
interface Option {
  id: string;
  text: string | React.ReactNode;
  isCorrect?: boolean; 
}

interface Question {
  id: string; 
  type: 'short-answer' | 'multiple-choice';
  prompt: string | React.ReactNode;
  options?: Option[]; 
  correctAnswer?: string | string[]; 
  markScheme?: string | React.ReactNode; 
  marks?: number;
  minLengthForMarkScheme?: number; 
}

interface FillBlankSegment {
  type: 'text' | 'blank';
  content?: string; 
  id?: string;      
  placeholder?: string;
  correctAnswer?: string;
  size?: number; 
}

interface OrderItem {
  id: string; 
  content: string | React.ReactNode; 
}

interface MatchItem {
  id: string; 
  content: string | React.ReactNode; 
}

interface VideoPlaceholder {
  id: string;
  title: string;
  description?: string;
}

interface DiagramHotspot {
    id: string; // Unique ID for the hotspot (e.g., "cu_hotspot")
    label: string; // The correct label for this hotspot (e.g., "Control Unit")
    position: { top: string; left: string; }; // e.g., { top: '20%', left: '30%' }
    hint?: string;
}

interface SectionData {
  id: string; 
  title: string;
  type: 
    | 'introduction' 
    | 'learningOutcomes' 
    | 'starterActivity' 
    | 'contentBlock' 
    | 'interactiveDiagramLabeling' // Updated from placeholder
    | 'fillInTheBlanks'
    | 'multipleChoiceQuiz' 
    | 'orderSequenceTask'
    | 'matchingPairsTask'
    | 'realWorldContext'
    | 'mythBusters'
    | 'examPractice' 
    | 'videoSection'
    | 'keyTakeaways'
    | 'nextSteps'
    | 'extensionActivity' 
    | 'completionSummary'
    | 'registerExplorer' // New type for register explorer
    | 'busSimulation'; // New type for bus simulation
  icon?: React.ElementType;
  content?: string | React.ReactNode; 
  questions?: Question[]; 
  segments?: FillBlankSegment[]; 
  orderItemsInitial?: OrderItem[]; 
  correctOrderIds?: string[]; 
  matchSetA?: MatchItem[]; 
  matchSetB?: MatchItem[]; 
  correctPairs?: Array<{ itemAId: string; itemBId: string }>; 
  requiresReadConfirmation?: boolean;
  videoPlaceholders?: VideoPlaceholder[];
  mainLearningPoints?: string[]; 
  nextLessonTopics?: { title: string, specRef?: string }[]; 
  diagramImageSrc?: string; // For interactiveDiagramLabeling
  diagramHotspots?: DiagramHotspot[]; // For interactiveDiagramLabeling
  registerInfo?: Array<{ id: string; name: string; description: string }>; // For registerExplorer
}

// --- Hardcoded Worksheet Data (CPU Architecture) - REVISED ---
const cpuArchitectureWorksheetDataV2: SectionData[] = [
  {
    id: 's0_outcomes', title: 'Today\'s Learning Journey', type: 'learningOutcomes', icon: Target, requiresReadConfirmation: true,
    mainLearningPoints: [
      "Describe the main components of the Von Neumann architecture (CPU, Memory, Buses).",
      "Identify the key components within the CPU: Control Unit (CU), Arithmetic Logic Unit (ALU), Cache, and Registers.",
      "Explain the specific function of the CU and the ALU.",
      "Name and describe the purpose of key CPU registers: PC, MAR, MDR, ACC, CIR.",
      "Explain the purpose of the Address Bus, Data Bus, and Control Bus."
    ]
  },
  {
    id: 's1_intro', title: 'Welcome: Inside the Computer\'s Brain!', type: 'introduction', icon: Lightbulb, requiresReadConfirmation: true,
    content: `<p class="text-gray-700 text-base">Welcome! The Central Processing Unit (CPU) is the heart of every computer, responsible for executing instructions. Think of it as the computer's brain.</p><p class="text-gray-700 text-base">In this lesson, we'll explore the fundamental <strong>Von Neumann architecture</strong> and dissect the CPU's core components: the Control Unit (CU), Arithmetic Logic Unit (ALU), Cache, and Registers. This is key to understanding the Fetch-Decode-Execute (FDE) cycle.</p>`
  },
  {
    id: 's2_starter', title: 'Warm-up: CPU Brainstorm', type: 'starterActivity', icon: HelpCircle,
    questions: [
      { id: 'starter_q1', type: 'short-answer', prompt: 'What is the main job of the CPU, in your own words?', marks: 1, minLengthForMarkScheme: 5 },
      { id: 'starter_q2', type: 'short-answer', prompt: 'What do you think "CPU Registers" are used for?', marks: 1, minLengthForMarkScheme: 5  },
    ]
  },
  {
    id: 's3_von_neumann_arch', title: 'Von Neumann Architecture', type: 'contentBlock', icon: Server, requiresReadConfirmation: true,
    content: `<h4 class="text-lg font-semibold text-indigo-700 mb-2">The Blueprint</h4><p class="text-gray-700">Most computers use the <strong>Von Neumann architecture</strong>. Key idea: <strong>Stored Program Concept</strong> - instructions and data share the same main memory (RAM) and buses.</p><p class="font-medium text-gray-800 mt-3">Core Components:</p><ul class="list-disc list-inside space-y-1 text-gray-700 pl-4"><li><strong>CPU:</strong> Fetches, decodes, executes instructions.</li><li><strong>Main Memory (RAM):</strong> Stores active programs and data.</li><li><strong>Buses:</strong> Pathways for communication (Address, Data, Control).</li></ul>`
  },
  {
    id: 's4_cpu_internals', title: 'CPU Components', type: 'contentBlock', icon: Cpu, requiresReadConfirmation: true,
    content: `<h4 class="text-lg font-semibold text-indigo-700 mb-2">Inside the Chip</h4><p class="text-gray-700">The CPU contains:</p><ul class="list-disc list-inside space-y-1 text-gray-700 pl-4"><li><strong>Control Unit (CU):</strong> Manages operations, decodes instructions, directs data flow.</li><li><strong>Arithmetic Logic Unit (ALU):</strong> Performs calculations (math) and logical comparisons (AND, OR, NOT).</li><li><strong>Registers:</strong> Extremely fast, small, temporary storage inside the CPU for data/addresses currently being processed.</li><li><strong>Cache:</strong> Small, very fast memory (faster than RAM) on or near the CPU, storing frequently used data/instructions.</li></ul>`
  },
  {
    id: 's5_interactive_diagram_cpu', title: 'Activity: Label the CPU Diagram', type: 'interactiveDiagramLabeling', icon: Brain,
    content: `<p class="text-sm text-gray-600 mb-3">Click on a hotspot number on the diagram, then select the correct label from the list below.</p>`,
    diagramImageSrc: '/assets/images/simple_cpu_placeholder.png', // YOU NEED TO PROVIDE THIS IMAGE in public/assets/images/
    diagramHotspots: [
      { id: 'hs1', label: 'Control Unit (CU)', position: { top: '25%', left: '30%' }, hint: 'The "manager" of the CPU.' },
      { id: 'hs2', label: 'Arithmetic Logic Unit (ALU)', position: { top: '65%', left: '30%' }, hint: 'The "calculator" of the CPU.' },
      { id: 'hs3', label: 'Registers', position: { top: '25%', left: '70%' }, hint: 'Fast, on-CPU storage.' },
      { id: 'hs4', label: 'Cache', position: { top: '65%', left: '70%' }, hint: 'Small, very fast memory near CPU cores.' },
    ]
  },
  {
    id: 's6_register_explorer', title: 'Activity: Register Explorer', type: 'registerExplorer', icon: MemoryStick,
    content: `<p class="text-sm text-gray-600 mb-3">Click on each register name to learn its specific function in the CPU.</p>`,
    registerInfo: [
      { id: 'pc_info', name: 'Program Counter (PC)', description: 'Holds the memory address of the <strong>next instruction</strong> to be fetched. It increments after each fetch.' },
      { id: 'mar_info', name: 'Memory Address Register (MAR)', description: 'Holds the <strong>address in memory</strong> where the CPU needs to fetch data from or write data to.' },
      { id: 'mdr_info', name: 'Memory Data Register (MDR)', description: 'Temporarily holds <strong>data or instructions</strong> that are being transferred between the CPU and memory. Acts as a buffer.' },
      { id: 'acc_info', name: 'Accumulator (ACC)', description: 'A register used by the ALU to store the <strong>intermediate results</strong> of arithmetic and logical operations.' },
      { id: 'cir_info', name: 'Current Instruction Register (CIR)', description: 'Holds the <strong>current instruction</strong> while it is being decoded and executed by the Control Unit.' },
    ]
  },
  {
    id: 's7_bus_simulation', title: 'Activity: Bus Function Simulation', type: 'busSimulation', icon: Bus,
    content: `<p class="text-sm text-gray-600 mb-3">Click the buttons to see a simplified representation of how buses are used for reading from and writing to RAM.</p>`
    // Actual simulation logic will be in the component
  },
  {
    id: 's8_fde_order', title: 'Activity: Order the FDE Cycle', type: 'orderSequenceTask', icon: Shuffle,
    content: `<p class="text-sm text-gray-600 mb-2">The Fetch-Decode-Execute cycle is fundamental. Arrange these simplified steps into the correct logical order using the up/down arrows:</p>`,
    orderItemsInitial: [ 
        { id: "fde_decode", content: "<strong>DECODE:</strong> CU interprets the instruction in CIR." },
        { id: "fde_execute", content: "<strong>EXECUTE:</strong> Instruction is carried out (ALU or data move)." },
        { id: "fde_fetch_addr_to_mar", content: "<strong>FETCH (1):</strong> PC's address copied to MAR." },
        { id: "fde_inc_pc", content: "<strong>FETCH (2):</strong> PC incremented." },
        { id: "fde_fetch_inst_to_mdr_cir", content: "<strong>FETCH (3):</strong> Instruction from RAM (at MAR's address) to MDR, then CIR." }
    ],
    correctOrderIds: ["fde_fetch_addr_to_mar", "fde_inc_pc", "fde_fetch_inst_to_mdr_cir", "fde_decode", "fde_execute"]
  },
  {
    id: 's9_real_world', title: 'CPU in the Real World', type: 'realWorldContext', icon: Zap, requiresReadConfirmation: true,
    content: `<p class="text-gray-700">Understanding CPU architecture helps explain why your phone gets faster, how game developers optimize performance, and how new technologies like AI chips are designed. It's the foundation of all modern computing!</p>`
  },
  {
    id: 's10_exam_practice', title: 'Exam Corner', type: 'examPractice', icon: BookOpen,
    questions: [
      { id: 'exam_q1_cu', type: 'short-answer', prompt: 'Describe <strong>two</strong> functions of the Control Unit (CU). (2 marks)', marks: 2, minLengthForMarkScheme: 15,
        markScheme: `<ul><li>Fetches instructions (1 mark)</li><li>Decodes instructions (1 mark)</li><li>Manages execution of instructions / Sends control signals (1 mark)</li><li>Controls data flow (1 mark) (Max 2)</li></ul>`
      },
      { id: 'exam_q2_mar_mdr', type: 'short-answer', prompt: 'Explain the purpose of the MAR <strong>and</strong> the MDR during a memory read operation. (4 marks)', marks: 4, minLengthForMarkScheme: 25,
        markScheme: `<ul><li>MAR holds the address of the memory location to be read from. (1)</li><li>This address is sent via the Address Bus. (1)</li><li>MDR temporarily stores the data/instruction fetched from that memory location. (1)</li><li>Data travels from memory to MDR via the Data Bus. (1)</li></ul>`
      }
    ]
  },
  {
    id: 's11_videos', title: 'Watch & Learn', type: 'videoSection', icon: Video, requiresReadConfirmation: true,
    content: `<p class="text-sm text-gray-600">Your teacher may provide links to helpful videos on these topics.</p>`,
    videoPlaceholders: [
      {id: 'vid_vn', title: 'Von Neumann Architecture Explained'},
      {id: 'vid_fde', title: 'The Fetch-Decode-Execute Cycle in Detail'}
    ]
  },
  {
    id: 's12_key_takeaways', title: 'Summary: Key Points', type: 'keyTakeaways', icon: CheckCircle, requiresReadConfirmation: true,
    mainLearningPoints: [
      "Von Neumann: CPU, Memory (for instructions & data), Buses.",
      "CPU: CU (directs), ALU (calculates/compares), Registers (fast internal storage), Cache (fast nearby storage).",
      "Registers: PC (next instruction address), MAR (memory access address), MDR (data buffer), ACC (ALU results), CIR (current instruction).",
      "Buses: Address (CPU -> Mem), Data (CPU <-> Mem), Control (CPU <-> Components)."
    ]
  },
  {
    id: 's13_next_steps', title: 'What\'s Next?', type: 'nextSteps', icon: TrendingUp, requiresReadConfirmation: true,
    nextLessonTopics: [
      { title: 'CPU Performance: Clock Speed, Cores, Cache', specRef: '1.1.2' },
      { title: 'Embedded Systems', specRef: '1.1.3' }
    ]
  },
  {
    id: 's14_extension', title: 'Challenge Zone (Beyond GCSE)', type: 'extensionActivity', icon: Zap,
    questions: [
      { id: 'ext_q1_harvard', type: 'short-answer', prompt: 'Research the "Harvard Architecture." How does it differ from Von Neumann, and what is its main advantage for fetching instructions?' },
    ]
  },
  {
    id: 's15_summary', title: 'Lesson Completion', type: 'completionSummary', icon: ListChecks,
    content: `<p class="text-gray-700">Review your progress. Use the 'Previous' button to revisit any sections.</p>`
  }
];

// --- Main Worksheet Component ---
const CpuArchitectureWorksheetV2: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [taskStates, setTaskStates] = useState<AllTaskStates>({});
  const [readSections, setReadSections] = useState<ReadSectionsState>({});
  const [showMarkScheme, setShowMarkScheme] = useState<Record<string, boolean>>({});
  const [activeRegisterInfo, setActiveRegisterInfo] = useState<string | null>(null);
  const [busSimStatus, setBusSimStatus] = useState<string>("Click a button to start.");
  
  const worksheetContainerRef = useRef<HTMLDivElement>(null);
  const currentSectionData = cpuArchitectureWorksheetDataV2[currentStepIndex];

  useEffect(() => {
    worksheetContainerRef.current?.scrollTo(0, 0);
    setActiveRegisterInfo(null); // Reset register explorer on section change
  }, [currentStepIndex]);

  const disableCopyPaste = useCallback((e: ClipboardEvent) => {
    e.preventDefault();
    alert("Copying, pasting, and cutting is disabled for this worksheet.");
  }, []);

  useEffect(() => {
    const el = worksheetContainerRef.current;
    if (el) {
      const preventDefaultHandler = (event: Event) => event.preventDefault();
      el.addEventListener('copy', disableCopyPaste);
      el.addEventListener('paste', disableCopyPaste);
      el.addEventListener('cut', disableCopyPaste);
      el.addEventListener('contextmenu', preventDefaultHandler);
      return () => {
        el.removeEventListener('copy', disableCopyPaste);
        el.removeEventListener('paste', disableCopyPaste);
        el.removeEventListener('cut', disableCopyPaste);
        el.removeEventListener('contextmenu', preventDefaultHandler);
      };
    }
  }, [disableCopyPaste, currentStepIndex]);

  const updateTaskState = (taskId: string, updates: Partial<TaskState>) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), ...updates, isAttempted: true } as TaskState,
    }));
  };
  
  const handleShortAnswerChange = (taskId: string, answer: string) => updateTaskState(taskId, { answer });
  const handleQuizSelection = (taskId: string, selectedOptionId: string | null) => {
    const question = currentSectionData.questions?.find(q => q.id === taskId);
    const isCorrect = question?.options?.find(o => o.id === selectedOptionId)?.isCorrect || false;
    updateTaskState(taskId, { selectedOptionId, isCorrect });
  };
  const handleFillBlankChange = (taskId: string, blankId: string, value: string) => {
    setTaskStates(prev => {
      const currentSectionBlanks = (prev[taskId] as FillBlanksState)?.blanks || {};
      return {...prev, [taskId]: { isAttempted: true, blanks: { ...currentSectionBlanks, [blankId]: value } } as FillBlanksState };
    });
  };
  const handleOrderChange = (taskId: string, newOrder: string[]) => updateTaskState(taskId, { currentOrder: newOrder });
  const handleMatchingPairsChange = (taskId: string, newPairs: Array<{ itemAId: string; itemBId: string }>) => updateTaskState(taskId, { pairs: newPairs });
  const handleDiagramLabelReveal = (taskId: string, hotspotId: string, revealed: boolean) => {
     setTaskStates(prev => {
        const currentRevealed = (prev[taskId] as DiagramLabelState)?.revealedLabels || {};
        return {...prev, [taskId]: { isAttempted: true, revealedLabels: {...currentRevealed, [hotspotId]: revealed}} as DiagramLabelState};
     });
  };

  const toggleReadSection = (sectionId: string) => setReadSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));

  const isTaskSufficientlyAttempted = (questionId: string, minLength: number): boolean => {
    const answerState = taskStates[questionId] as ShortAnswerState;
    return !!answerState?.answer && answerState.answer.trim().length >= minLength;
  };

  const toggleExamMarkScheme = (questionId: string) => {
    const question = currentSectionData.questions?.find(q => q.id === questionId);
    if (question && isTaskSufficientlyAttempted(questionId, question.minLengthForMarkScheme || 10)) {
        setShowMarkScheme(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    } else {
        alert(`Please write a more substantial answer (at least ${question?.minLengthForMarkScheme || 10} characters) before viewing the mark scheme.`);
    }
  };

  const resetTask = (taskId: string, sectionType?: SectionData['type']) => {
    setTaskStates(prev => {
      const newAnswers = { ...prev };
      if (newAnswers[taskId]) {
        if (sectionType === 'fillInTheBlanks') newAnswers[taskId] = { blanks: {}, isAttempted: false } as FillBlanksState;
        else if (sectionType === 'orderSequenceTask') {
            const sectionData = cpuArchitectureWorksheetDataV2.find(s => s.id === taskId);
            newAnswers[taskId] = { currentOrder: sectionData?.orderItemsInitial?.map(i => i.id) || [], isAttempted: false } as OrderSequenceState;
        }
        else if (sectionType === 'matchingPairsTask') newAnswers[taskId] = { pairs: [], isAttempted: false } as MatchingPairsState;
        else if (sectionType === 'interactiveDiagramLabeling') newAnswers[taskId] = { revealedLabels: {}, isAttempted: false} as DiagramLabelState;
        else if ((newAnswers[taskId] as ShortAnswerState).answer !== undefined) (newAnswers[taskId] as ShortAnswerState).answer = '';
        else if ((newAnswers[taskId] as QuizAnswerState).selectedOptionId !== undefined) (newAnswers[taskId] as QuizAnswerState).selectedOptionId = null;
        
        newAnswers[taskId].isAttempted = false;
        newAnswers[taskId].isCorrect = null; // Reset correctness
      }
      return newAnswers;
    });
    if (showMarkScheme[taskId]) setShowMarkScheme(prev => ({...prev, [taskId]: false}));
  };

  const resetAll = () => {
    if (window.confirm("Are you sure you want to reset all answers and read confirmations?")) {
        setTaskStates({}); setReadSections({}); setShowMarkScheme({}); setCurrentStepIndex(0);
    }
  };
  
  const handleNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      if (currentSectionData.requiresReadConfirmation && !readSections[currentSectionData.id]) {
        alert("Please tick 'Mark as Read' before proceeding."); return;
      }
      setCurrentStepIndex(prev => Math.min(prev + 1, cpuArchitectureWorksheetDataV2.length - 1));
    } else {
      setCurrentStepIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const getCompletionStatus = () => {
    const missedReadSections = cpuArchitectureWorksheetDataV2.filter(s => s.requiresReadConfirmation && !readSections[s.id]);
    let missedTasks: {id: string, title: string}[] = [];
    cpuArchitectureWorksheetDataV2.forEach(section => {
        if (section.questions) {
            section.questions.forEach(q => { if (!taskStates[q.id]?.isAttempted) missedTasks.push({id: q.id, title: `${section.title} - Question`}); });
        } else if (['fillInTheBlanks', 'orderSequenceTask', 'matchingPairsTask', 'interactiveDiagramLabeling'].includes(section.type)) {
            if (!taskStates[section.id]?.isAttempted) missedTasks.push({id: section.id, title: section.title});
        }
    });
    return { missedReadSections, missedTasks };
  };

  const handleExportToPDF = () => alert("PDF export functionality placeholder.");

  const simulateBusActivity = (type: 'read' | 'write') => {
    const sequence = type === 'read' ? 
        ["CPU places address on Address Bus...", "Address travels to RAM...", "CPU sends 'Read' signal on Control Bus...", "RAM places data on Data Bus...", "Data travels to CPU... Read complete!"] :
        ["CPU places address on Address Bus...", "Address travels to RAM...", "CPU places data on Data Bus...", "Data travels to RAM...", "CPU sends 'Write' signal on Control Bus... Write complete!"];
    
    let i = 0;
    setBusSimStatus(sequence[i]);
    const interval = setInterval(() => {
        i++;
        if (i < sequence.length) {
            setBusSimStatus(sequence[i]);
        } else {
            clearInterval(interval);
        }
    }, 1200);
  };

  const renderContent = () => {
    const section = currentSectionData;
    if (!section) return <p>Error: Section data not found.</p>;

    const commonInteractiveClasses = "p-4 border border-gray-200 rounded-lg bg-slate-50 shadow-sm my-4";

    switch (section.type) {
      case 'introduction': case 'contentBlock': case 'realWorldContext': case 'mythBusters':
        return <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: section.content as string }} />;
      
      case 'learningOutcomes': case 'keyTakeaways':
        return (
          <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
            <p className="font-semibold text-indigo-700">{section.type === 'learningOutcomes' ? "By the end of this lesson, you will be able to:" : "Remember these key points:"}</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              {section.mainLearningPoints?.map((point, i) => <li key={i} dangerouslySetInnerHTML={{__html: point}}/>)}
            </ul>
          </div>
        );
      case 'nextSteps':
        return (
          <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
            <p className="font-semibold text-indigo-700">Moving forward, we will explore:</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              {section.nextLessonTopics?.map((topic, i) => (
                <li key={i}>{topic.title} {topic.specRef && <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full ml-1">Spec {topic.specRef}</span>}</li>
              ))}
            </ul>
          </div>
        );
      case 'starterActivity': case 'extensionActivity': case 'examPractice':
        return (
          <div className="space-y-6">
            {section.content && <div className="prose prose-sm sm:prose-base max-w-none mb-4 text-gray-700" dangerouslySetInnerHTML={{ __html: section.content as string }} />}
            {section.questions?.map(q => (
              <div key={q.id} className={`p-4 border rounded-lg shadow-sm ${section.type === 'examPractice' ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <label htmlFor={q.id} className="block text-sm font-medium text-gray-800 mb-2" dangerouslySetInnerHTML={{__html: q.prompt + (q.marks ? ` (${q.marks} marks)`: '')}} />
                <textarea
                  id={q.id} rows={section.type === 'examPractice' ? 5 : 3}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 bg-white"
                  value={(taskStates[q.id] as ShortAnswerState)?.answer || ''}
                  onChange={(e) => handleShortAnswerChange(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                />
                <div className="mt-3 flex items-center justify-between">
                  <button onClick={() => resetTask(q.id)} className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700">Reset</button>
                  {section.type === 'examPractice' && q.markScheme && (
                    <button 
                      onClick={() => toggleExamMarkScheme(q.id)}
                      disabled={!isTaskSufficientlyAttempted(q.id, q.minLengthForMarkScheme || 10)}
                      className="text-xs px-3 py-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {showMarkScheme[q.id] ? <EyeOff size={14} className="mr-1"/> : <Eye size={14} className="mr-1"/>} 
                      {showMarkScheme[q.id] ? 'Hide' : 'Show'} Mark Scheme
                    </button>
                  )}
                </div>
                {section.type === 'examPractice' && showMarkScheme[q.id] && q.markScheme && (
                  <div className="mt-3 p-3 bg-gray-100 border border-gray-200 rounded prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: q.markScheme as string }} />
                )}
              </div>
            ))}
          </div>
        );
      case 'interactiveDiagramLabeling':
        const diagramState = taskStates[section.id] as DiagramLabelState;
        return (
          <div className={commonInteractiveClasses}>
            {section.content && <div className="prose prose-sm sm:prose-base max-w-none mb-4 text-gray-700" dangerouslySetInnerHTML={{ __html: section.content as string }} />}
            {section.diagramImageSrc ? (
                <div className="relative w-full max-w-md mx-auto aspect-square bg-gray-200 rounded-md overflow-hidden my-4">
                    <img src={section.diagramImageSrc} alt={section.title || "CPU Diagram"} className="w-full h-full object-contain" />
                    {section.diagramHotspots?.map(hotspot => (
                        <button 
                            key={hotspot.id}
                            onClick={() => handleDiagramLabelReveal(section.id, hotspot.id, !(diagramState?.revealedLabels?.[hotspot.id]))}
                            className={`absolute p-1.5 rounded-full text-xs font-bold transition-all
                                        ${diagramState?.revealedLabels?.[hotspot.id] ? 'bg-green-500 text-white w-auto px-2 min-w-[24px]' : 'bg-blue-500 text-white w-6 h-6 flex items-center justify-center hover:bg-blue-600'}`}
                            style={{ top: hotspot.position.top, left: hotspot.position.left, transform: 'translate(-50%, -50%)' }}
                            title={hotspot.hint}
                        >
                            {diagramState?.revealedLabels?.[hotspot.id] ? hotspot.label : hotspot.id.replace('hs','')}
                        </button>
                    ))}
                </div>
            ) : <p className="text-center text-gray-500">Diagram image missing.</p>}
            <button onClick={() => resetTask(section.id, 'interactiveDiagramLabeling')} className="mt-2 text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700">Reset Labels</button>
          </div>
        );
      case 'fillInTheBlanks':
        return (
          <div className={commonInteractiveClasses}>
            {section.content && <div className="prose prose-sm sm:prose-base max-w-none mb-4 text-gray-700" dangerouslySetInnerHTML={{ __html: section.content as string }} />}
            <div className="text-gray-700 leading-relaxed text-base">
              {section.segments?.map((seg, index) => {
                const key = seg.type === 'text' ? `fib-text-${section.id}-${index}` : `fib-blank-${section.id}-${seg.id || index}`;
                if (seg.type === 'text') {
                  return <span key={key} dangerouslySetInnerHTML={{ __html: seg.content || '' }} />;
                } else if (seg.type === 'blank') {
                  return (
                    <input
                      key={key}
                      type="text"
                      className="mx-1 my-1 px-2 py-1 border-b-2 border-dotted border-indigo-500 focus:border-solid focus:border-indigo-600 outline-none bg-indigo-50 w-auto inline-block text-sm"
                      style={{minWidth: `${(seg.size || 12) * 0.8}ch`}}
                      placeholder={seg.placeholder || '...'}
                      value={(taskStates[section.id] as FillBlanksState)?.blanks?.[seg.id!] || ''}
                      onChange={(e) => handleFillBlankChange(section.id, seg.id!, e.target.value)}
                    />
                  );
                }
                return null;
              })}
            </div>
            <button onClick={() => resetTask(section.id, 'fillInTheBlanks')} className="mt-4 text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700">Reset Blanks</button>
          </div>
        );
      case 'multipleChoiceQuiz':
         return (
          <div className={`${commonInteractiveClasses} space-y-6`}>
            {section.content && <div className="prose prose-sm sm:prose-base max-w-none mb-4 text-gray-700" dangerouslySetInnerHTML={{ __html: section.content as string }} />}
            {section.questions?.map(q => (
              <div key={q.id} className="p-3 border border-gray-200 rounded-md bg-white">
                <p className="font-medium text-gray-800 mb-3 text-sm" dangerouslySetInnerHTML={{__html: q.prompt + (q.marks ? ` (${q.marks} marks)`: '')}} />
                <div className="space-y-2">
                  {q.options?.map(opt => {
                    const isSelected = (taskStates[q.id] as QuizAnswerState)?.selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleQuizSelection(q.id, opt.id)}
                        className={`block w-full text-left p-2.5 border rounded-md transition-colors text-sm
                          ${isSelected ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300 ring-offset-1' 
                                       : 'bg-white hover:bg-indigo-50 border-gray-300 text-gray-700'}`}
                        aria-pressed={isSelected}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
                 <button onClick={() => resetTask(q.id)} className="mt-3 text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700">Clear Selection</button>
              </div>
            ))}
          </div>
        );
      case 'orderSequenceTask':
        const orderTaskState = (taskStates[section.id] as OrderSequenceState);
        const currentOrderIds = orderTaskState?.currentOrder || section.orderItemsInitial?.map(item => item.id) || [];
        const itemsToDisplay = currentOrderIds.map(id => section.orderItemsInitial?.find(item => item.id === id)).filter(Boolean) as OrderItem[];
        
        return (
            <div className={commonInteractiveClasses}>
                {section.content && <div className="prose prose-sm sm:prose-base max-w-none mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: section.content as string }} />}
                <div className="space-y-2">
                    {itemsToDisplay.map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-md bg-white hover:bg-gray-50 transition-colors shadow-sm">
                            <div className="prose prose-sm max-w-none text-gray-800 flex-grow" dangerouslySetInnerHTML={{ __html: item.content as string }} />
                            <div className="space-x-1 flex-shrink-0 ml-2">
                                <button 
                                    onClick={() => {
                                        if (idx === 0) return;
                                        const newOrder = [...currentOrderIds];
                                        [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
                                        handleOrderChange(section.id, newOrder);
                                    }}
                                    disabled={idx === 0}
                                    className="p-1.5 text-xs bg-gray-200 hover:bg-gray-300 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label={`Move item up`}
                                > <MoveUp size={14}/> </button>
                                <button 
                                    onClick={() => {
                                        if (idx === itemsToDisplay.length - 1) return;
                                        const newOrder = [...currentOrderIds];
                                        [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
                                        handleOrderChange(section.id, newOrder);
                                    }}
                                    disabled={idx === itemsToDisplay.length - 1}
                                    className="p-1.5 text-xs bg-gray-200 hover:bg-gray-300 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label={`Move item down`}
                                > <MoveDown size={14}/> </button>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={() => resetTask(section.id, 'orderSequenceTask')} className="mt-4 text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700">Reset Order</button>
            </div>
        );
      case 'matchingPairsTask':
        const matchingTaskState = (taskStates[section.id] as MatchingPairsState);
        const currentTaskPairs = matchingTaskState?.pairs || [];
        const [selectedMatchA, setSelectedMatchA] = useState<string | null>(null);

        const handleMatchItemAClick = (itemAId: string) => {
            if (currentTaskPairs.some(p => p.itemAId === itemAId)) return; // Already paired
            setSelectedMatchA(prev => prev === itemAId ? null : itemAId);
        };
        const handleMatchItemBClick = (itemBId: string) => {
            if (!selectedMatchA || currentTaskPairs.some(p => p.itemBId === itemBId)) return; // No A selected or B already paired
            const newPairs = [...currentTaskPairs.filter(p=>p.itemAId !== selectedMatchA), { itemAId: selectedMatchA, itemBId: itemBId }];
            handleMatchingPairsChange(section.id, newPairs);
            setSelectedMatchA(null);
        };
        
        return (
            <div className={commonInteractiveClasses}>
                {section.content && <div className="prose prose-sm sm:prose-base max-w-none mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: section.content as string }} />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                        <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1.5 text-center">Set A</h5>
                        {section.matchSetA?.map(itemA => {
                            const isPairedA = currentTaskPairs.some(p => p.itemAId === itemA.id);
                            const pairedBItem = isPairedA ? section.matchSetB?.find(b => b.id === currentTaskPairs.find(p=>p.itemAId === itemA.id)?.itemBId) : null;
                            return (
                                <div key={itemA.id} 
                                     className={`p-2.5 border rounded-md mb-1.5 transition-all text-sm 
                                        ${selectedMatchA === itemA.id ? 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-300' : 
                                         isPairedA ? 'bg-green-50 border-green-400' : 'bg-white border-gray-300 hover:bg-slate-50'}
                                        ${!isPairedA ? 'cursor-pointer' : 'cursor-default'}`}
                                     onClick={() => !isPairedA && handleMatchItemAClick(itemA.id)}>
                                    <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: itemA.content as string }} />
                                    {isPairedA && pairedBItem && 
                                        <div className="mt-1 pt-1 border-t border-green-200 text-xs text-green-700">
                                            Matched: <span className="italic" dangerouslySetInnerHTML={{__html: pairedBItem.content as string}}/>
                                        </div>
                                    }
                                </div>
                            );
                        })}
                    </div>
                    <div>
                        <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1.5 text-center">Set B</h5>
                        {section.matchSetB?.map(itemB => {
                             const isPairedB = currentTaskPairs.some(p => p.itemBId === itemB.id);
                            return (
                                <div key={itemB.id} 
                                     className={`p-2.5 border rounded-md mb-1.5 transition-all text-sm 
                                        ${isPairedB ? 'bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed' : 
                                         selectedA ? 'bg-white border-gray-300 hover:bg-blue-50 cursor-pointer' : 'bg-white border-gray-300 opacity-60 cursor-not-allowed'}`}
                                     onClick={() => selectedA && !isPairedB && handleMatchItemBClick(itemB.id)}>
                                    <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: itemB.content as string }} />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <button onClick={() => resetTask(section.id, 'matchingPairsTask')} className="mt-4 text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700">Reset Matches</button>
            </div>
        );
      case 'registerExplorer':
        return (
            <div className={commonInteractiveClasses}>
                {section.content && <div className="prose prose-sm sm:prose-base max-w-none mb-4 text-gray-700" dangerouslySetInnerHTML={{ __html: section.content as string }} />}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {section.registerInfo?.map(reg => (
                        <button key={reg.id} onClick={() => setActiveRegisterInfo(activeRegisterInfo === reg.id ? null : reg.id)}
                                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md border transition-colors
                                            ${activeRegisterInfo === reg.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50'}`}>
                            {reg.name}
                        </button>
                    ))}
                </div>
                {activeRegisterInfo && section.registerInfo?.find(r => r.id === activeRegisterInfo) && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md text-sm text-indigo-800">
                        <h5 className="font-semibold mb-1">{section.registerInfo.find(r => r.id === activeRegisterInfo)?.name}</h5>
                        <p dangerouslySetInnerHTML={{__html: section.registerInfo.find(r => r.id === activeRegisterInfo)?.description || ''}} />
                    </div>
                )}
            </div>
        );
      case 'busSimulation':
        return (
            <div className={commonInteractiveClasses}>
                {section.content && <div className="prose prose-sm sm:prose-base max-w-none mb-4 text-gray-700" dangerouslySetInnerHTML={{ __html: section.content as string }} />}
                <div className="flex justify-around items-center my-4 p-4 bg-gray-100 rounded-md min-h-[100px]">
                    <div className="text-center"><Server size={32} className="text-blue-600 mx-auto mb-1"/><span className="text-xs font-medium">CPU</span></div>
                    <div className="flex flex-col items-center w-1/3">
                        <div className="text-xs text-center text-gray-600 mb-1">Address Bus &rarr;</div>
                        <div className="w-full h-1.5 bg-red-400 rounded-full mb-2"></div>
                        <div className="text-xs text-center text-gray-600 mb-1">&larr; Data Bus &rarr;</div>
                        <div className="w-full h-1.5 bg-green-400 rounded-full mb-2"></div>
                        <div className="text-xs text-center text-gray-600">&larr; Control Bus &rarr;</div>
                        <div className="w-full h-1.5 bg-yellow-400 rounded-full"></div>
                    </div>
                    <div className="text-center"><MemoryStick size={32} className="text-purple-600 mx-auto mb-1"/><span className="text-xs font-medium">RAM</span></div>
                </div>
                <div className="text-center my-2 p-2 bg-indigo-50 text-indigo-700 rounded text-sm min-h-[40px]">{busSimStatus}</div>
                <div className="flex justify-center gap-2 mt-2">
                    <button onClick={() => simulateBusActivity('read')} className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600">Simulate Read</button>
                    <button onClick={() => simulateBusActivity('write')} className="text-xs px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600">Simulate Write</button>
                </div>
            </div>
        );
      case 'videoSection':
        return (
          <div className={commonInteractiveClasses}>
            {section.content && <div className="prose prose-sm sm:prose-base max-w-none mb-4 text-gray-700" dangerouslySetInnerHTML={{ __html: section.content as string }} />}
            <div className="space-y-4">
              {section.videoPlaceholders?.map(video => (
                <div key={video.id} className="p-3 border border-dashed border-purple-300 rounded-lg text-center bg-purple-50">
                  <Video size={36} className="mx-auto text-purple-400 mb-1.5" />
                  <h4 className="font-medium text-sm text-purple-700">{video.title}</h4>
                  {video.description && <p className="text-xs text-gray-500 mt-0.5">{video.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      case 'completionSummary':
        const { missedReadSections, missedTasks } = getCompletionStatus();
        return (
            <div className="text-center p-4">
                <h3 className="text-xl font-semibold text-indigo-700 mb-4">Lesson Review</h3>
                {missedReadSections.length === 0 && missedTasks.length === 0 ? (
                    <div className="p-4 bg-green-100 text-green-800 border border-green-300 rounded-md flex flex-col items-center justify-center">
                        <CheckCircle size={32} className="mb-2 text-green-600"/> 
                        <p className="font-semibold">Excellent work!</p>
                        <p className="text-sm">You've attempted all tasks and marked all content sections as read.</p>
                    </div>
                ) : (
                    <div className="p-4 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-md">
                        <div className="flex items-center justify-center mb-3">
                           <AlertTriangle size={24} className="mr-2 text-yellow-600"/>
                           <p className="font-semibold">You have some items to review or complete:</p>
                        </div>
                        {missedReadSections.length > 0 && (
                            <div className="mb-3 text-left">
                                <p className="font-medium text-sm">Sections not marked as read:</p>
                                <ul className="list-disc list-inside text-xs ml-4">
                                    {missedReadSections.map(s => <li key={`missed-read-${s.id}`}>{s.title}</li>)}
                                </ul>
                            </div>
                        )}
                        {missedTasks.length > 0 && (
                            <div className="text-left">
                                <p className="font-medium text-sm">Tasks/Questions not yet attempted:</p>
                                <ul className="list-disc list-inside text-xs ml-4">
                                    {missedTasks.map(task => <li key={`missed-task-${task.id}`}>{task.title}</li>)}
                                </ul>
                            </div>
                        )}
                         <button 
                            onClick={() => setCurrentStepIndex(0)} 
                            className="mt-6 px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center mx-auto"
                        >
                            <ChevronLeft size={16} className="mr-1"/> Go to Beginning to Review
                        </button>
                    </div>
                )}
            </div>
        );
      default:
        return <p className="text-red-600 p-4">Error: Unsupported section type '{section.type}'</p>;
    }
  };

  const CurrentIcon = currentSectionData.icon || Lightbulb;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden my-6 border border-gray-200">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 sm:p-6">
        <div className="flex items-center space-x-3">
            <Cpu size={32} className="opacity-80"/>
            <div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">CPU Architecture & Von Neumann</h1>
                <p className="text-xs sm:text-sm text-indigo-200 opacity-90">Interactive GCSE Lesson (J277 1.1.1)</p>
            </div>
        </div>
      </header>

      <div className="p-4 sm:p-5 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0">
            <CurrentIcon size={24} className="text-indigo-500 flex-shrink-0" />
            <h2 className="text-md sm:text-lg font-semibold text-indigo-700 truncate" title={currentSectionData.title}>{currentSectionData.title}</h2>
        </div>
        {currentSectionData.requiresReadConfirmation && (
          <label className="flex items-center text-xs sm:text-sm text-gray-600 cursor-pointer whitespace-nowrap self-start sm:self-center mt-2 sm:mt-0 py-1.5 px-2.5 hover:bg-indigo-100 rounded-md transition-colors border border-gray-300 hover:border-indigo-300">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 text-indigo-600 border-gray-400 rounded focus:ring-indigo-500 focus:ring-offset-1 mr-2"
              checked={!!readSections[currentSectionData.id]}
              onChange={() => toggleReadSection(currentSectionData.id)}
            />
            Mark as Read
          </label>
        )}
      </div>
      
      <div 
        ref={worksheetContainerRef} 
        className="p-4 sm:p-5 md:p-6 worksheet-content-area bg-white" 
        style={{ minHeight: '380px', maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}
      >
        {renderContent()}
      </div>

      <footer className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:justify-between sm:items-center">
        <div className="flex justify-center sm:justify-start space-x-2 w-full sm:w-auto">
            <button
            onClick={() => handleNavigation('prev')}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
            >
            <ChevronLeft size={16} className="mr-1.5" /> Previous
            </button>
            <button
            onClick={() => handleNavigation('next')}
            disabled={currentStepIndex === cpuArchitectureWorksheetDataV2.length - 1}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
            >
            Next <ChevronRight size={16} className="ml-1.5" />
            </button>
        </div>
        <div className="flex justify-center sm:justify-end space-x-2 w-full sm:w-auto">
            <button 
                onClick={resetAll}
                className="px-3 py-1.5 text-xs text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center shadow-sm"
                title="Reset all answers and read confirmations"
            >
                <RotateCcw size={14} className="mr-1.5"/> Reset All
            </button>
            <button 
                onClick={handleExportToPDF}
                className="px-3 py-1.5 text-xs text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center shadow-sm"
                title="Export worksheet to PDF (placeholder)"
            >
                <Download size={14} className="mr-1.5"/> Export PDF
            </button>
        </div>
      </footer>
       <div className="p-2 bg-gray-100 text-center text-xs text-gray-500 border-t border-gray-200">
        Section {currentStepIndex + 1} of {cpuArchitectureWorksheetDataV2.length}
      </div>
    </div>
  );
};

export default CpuArchitectureWorksheetV2;
