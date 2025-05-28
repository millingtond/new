import os
from pathlib import Path

# --- Configuration ---
# !!! IMPORTANT: Run this script from the ROOT of your Next.js project,
# or change PROJECT_ROOT to the correct absolute path.
PROJECT_ROOT = Path(".") # Assumes script is in the project root

# --- File Definitions ---
# Each entry is a dictionary: {'path': 'relative/path/to/file.ext', 'content': """...file content..."""}
FILES_TO_CREATE = []

# 1. TypeScript Definitions
FILES_TO_CREATE.append({
    'path': 'src/types/worksheetNew.ts',
    'content': """// src/types/worksheetNew.ts

export interface TaskAttempt {
  value: any;
  isAttempted: boolean;
  isCorrect?: boolean;
}

export interface BaseSection {
  id: string;
  title: string;
  type: SectionType;
  isActivity: boolean;
  isCompleted?: boolean;
  isAttempted?: boolean;
}

export interface StaticTextSection extends BaseSection {
  type: 'StaticText';
  content: string; // HTML content
  isActivity: false;
}

export interface StarterQuestion {
  id:string;
  questionText: string;
  questionType: 'shortAnswer' | 'multipleChoice' | 'trueFalse';
  options?: string[];
  placeholder?: string;
  minLengthForAttempt?: number;
}
export interface StarterActivitySection extends BaseSection {
  type: 'StarterActivity';
  introText?: string;
  questions: StarterQuestion[];
  isActivity: true;
}

export interface LessonOutcomesSection extends BaseSection {
  type: 'LessonOutcomes';
  outcomes: string[];
  isActivity: false;
}

export interface DraggableLabelItem {
  id: string;
  text: string;
  dataLabel: string; // Corresponds to data-label in original HTML
}

export interface DropZoneConfig {
  id: string; // e.g., "drop-cu-title"
  dataCorrect: string; // The dataLabel of the correct DraggableLabelItem
  hint?: string; // Optional hint text for the zone
  // For styling/positioning, these can be used if not handled by pure CSS for these specific IDs
  style?: React.CSSProperties;
  className?: string; // To apply specific classes for positioning from style.css
  isRegisterZone?: boolean;
  dataRegister?: string;
}

export interface DiagramLabelDragDropSection extends BaseSection {
  type: 'DiagramLabelDragDrop';
  introText: string;
  diagramImageUrl?: string; // Optional: if there's a background image for the diagram
  dropZones: DropZoneConfig[];
  labels: DraggableLabelItem[];
  isActivity: true;
}

export interface MatchItem {
  id: string; // Unique ID for this item, e.g., "cu"
  text: string; // Display text, e.g., "Control Unit (CU)"
}

export interface MatchDescriptionItem {
  id: string; // Unique ID for this description, e.g., "desc-cu"
  text: string; // Display text of the description
  matchesTo: string; // The id of the MatchItem it correctly matches
}

export interface MatchingTaskSection extends BaseSection {
  type: 'MatchingTask';
  introText: string;
  matchItemsTitle: string; // e.g., "Component/Register"
  descriptionItemsTitle: string; // e.g., "Description"
  items: MatchItem[];
  descriptions: MatchDescriptionItem[];
  isActivity: true;
}

export interface RegisterInfo {
  id: string; // e.g., "pc"
  name: string; // e.g., "PC"
  displayName: string; // e.g., "Program Counter (PC)"
  description: string;
}

export interface RegisterExplorerSection extends BaseSection {
  type: 'RegisterExplorer';
  introText: string;
  registers: RegisterInfo[];
  isActivity: true; // It's an interactive exploration
}

export interface BusSimulationSection extends BaseSection {
  type: 'BusSimulation';
  introText: string;
  isActivity: true;
}

export interface ScenarioOption {
  text: string;
  value: string; // e.g., "PC" (the correct acronym/identifier)
}

export interface Scenario {
  id: string; // Unique ID for the scenario, e.g., "scenario1"
  questionText: string; // The scenario description (can be HTML)
  options: ScenarioOption[];
  correctAnswerValue: string; // The 'value' of the correct ScenarioOption
}

export interface ScenarioQuestionSection extends BaseSection {
  type: 'ScenarioQuestion';
  introText: string;
  scenarios: Scenario[];
  isActivity: true;
}

export interface FillBlankSentence {
  id: string; // e.g., "fill-1"
  leadingText?: string; // Text before the blank
  trailingText?: string; // Text after the blank
  placeholder: string; // Placeholder for the blank, e.g., "Component"
  correctAnswers: string[]; // Array of acceptable answers (case-insensitive)
  fullSentenceStructure?: string; // Optional: "1. The {blank} decodes instructions..."
}

export interface FillTheBlanksSection extends BaseSection {
  type: 'FillTheBlanks';
  introText: string;
  sentences: FillBlankSentence[];
  isActivity: true;
}

export interface QuizQuestion {
  id: string; // e.g., "q1", "q2"
  questionText: string;
  options: string[];
  correctAnswer: string; // The text of the correct option
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface MultipleChoiceQuizSection extends BaseSection {
  type: 'MultipleChoiceQuiz';
  questions: QuizQuestion[];
  isActivity: true;
}

export interface ExamQuestion {
  id: string; // e.g., "exam-q-pc"
  questionText: string; // HTML content for the question
  marks: number; // Max marks for the question
  answerPlaceholder?: string;
  markScheme: string; // HTML content for the mark scheme
  charsPerMarkForAttempt?: number; // e.g., 20 chars per mark
  minLengthForAttempt?: number; // Alternative: specify absolute minimum length
}

export interface ExamQuestionsSection extends BaseSection {
  type: 'ExamQuestions';
  introText?: string;
  questions: ExamQuestion[];
  isActivity: true;
}

export interface VideoEntry {
  id: string; // Unique ID for the video entry, e.g., "video-fde"
  title: string; // e.g., "1.1 The purpose of the CPU - The fetch-execute cycle"
  embedUrl: string; // The YouTube embed URL
  notesPlaceholder?: string; // e.g., "Optional: Add any additional notes from this video..."
}

export interface VideoPlaceholderSection extends BaseSection {
  type: 'VideoPlaceholder';
  introText?: string; // e.g., "Watch these videos to reinforce..."
  videos: VideoEntry[];
  isActivity: false; // Primarily for viewing, notes are optional self-study
}

export interface KeyTakeawaysSection extends BaseSection { // Using StaticTextSection structure by using 'content'
  type: 'KeyTakeaways';
  content: string; // HTML content for RichTextSectionDisplay
  isActivity: false;
}

export interface WhatsNextLink {
  text: string; // Can be HTML with <keyword>
  url?: string; // For internal app paths or external links
  specReference?: string; // e.g., "Spec 1.1.2"
}

export interface WhatsNextSection extends BaseSection {
  type: 'WhatsNext';
  description: string; // HTML
  links: WhatsNextLink[];
  isActivity: false;
}

export interface ExtensionActivity {
  id: string;
  title: string;
  description: string; // HTML
  placeholder?: string; // For the textarea
}

export interface ExtensionActivitiesSection extends BaseSection {
  type: 'ExtensionActivities';
  introText?: string;
  activities: ExtensionActivity[];
  isActivity: true;
}

// Represents a student's answers/progress for a new worksheet
export interface NewWorksheetStudentProgress {
  worksheetId: string;
  studentId: string;
  currentSectionIndex: number;
  sectionStates: Record<string, {
    isCompleted: boolean;
    isAttempted?: boolean;
    answers?: Record<string, TaskAttempt>; // Keyed by question/item.id within a section
  }>;
  overallStatus: 'not-started' | 'in-progress' | 'completed';
  lastUpdated: Date;
}


export type WorksheetSection =
  | StaticTextSection
  | StarterActivitySection
  | LessonOutcomesSection
  | DiagramLabelDragDropSection
  | MatchingTaskSection
  | RegisterExplorerSection
  | BusSimulationSection
  | ScenarioQuestionSection
  | FillTheBlanksSection
  | MultipleChoiceQuizSection
  | ExamQuestionsSection
  | VideoPlaceholderSection
  | KeyTakeawaysSection // Will be treated as StaticTextSection in data
  | WhatsNextSection
  | ExtensionActivitiesSection;

export type SectionType =
  | 'StaticText'
  | 'StarterActivity'
  | 'LessonOutcomes'
  | 'DiagramLabelDragDrop'
  | 'MatchingTask'
  | 'RegisterExplorer'
  | 'BusSimulation'
  | 'ScenarioQuestion'
  | 'FillTheBlanks'
  | 'MultipleChoiceQuiz'
  | 'ExamQuestions'
  | 'VideoPlaceholder'
  | 'KeyTakeaways'
  | 'WhatsNext'
  | 'ExtensionActivities';

export interface NewWorksheet {
  id: string;
  title: string;
  course: string;
  unit: string;
  sections: WorksheetSection[];
  keywordsData?: Record<string, { definition: string; link?: string }>;
}
"""
})

# 2. Sample Lesson Data
FILES_TO_CREATE.append({
    'path': 'src/data/sampleCpuLessonData.ts',
    'content': """// src/data/sampleCpuLessonData.ts
import {
  NewWorksheet,
  StaticTextSection,
  StarterActivitySection, StarterQuestion,
  LessonOutcomesSection,
  DiagramLabelDragDropSection, DraggableLabelItem, DropZoneConfig,
  MatchingTaskSection, MatchItem, MatchDescriptionItem,
  RegisterExplorerSection, RegisterInfo,
  BusSimulationSection,
  ScenarioQuestionSection, Scenario, ScenarioOption,
  FillTheBlanksSection, FillBlankSentence,
  MultipleChoiceQuizSection, QuizQuestion,
  ExamQuestionsSection, ExamQuestion,
  VideoPlaceholderSection, VideoEntry,
  WhatsNextSection, WhatsNextLink,
  ExtensionActivitiesSection, ExtensionActivity,
} from '@/types/worksheetNew';

const cpuLessonKeywords = {
  "cpu": { definition: "Central Processing Unit: This component repeatedly fetches, decodes and executes instructions. Often abbreviated to CPU." },
  "fetch-decode-execute cycle": { definition: "Also known as the instruction cycle, the complete process of retrieving an instruction from store, decoding it and carrying it out." },
  "von neumann architecture": { definition: "Basic design of most modern computers. Consists of a CPU, Memory (where instructions and data are held), I/O, and uses buses for communication. Key idea: Stored Program Concept." },
  "registers": { definition: "The collection of tiny areas of extremely fast memory located *inside* the CPU, each with a specific purpose, where data or control information is stored temporarily. Examples: MAR, MDR, PC, Accumulator." },
  "pc": { definition: "Program Counter: Holds the address of the next instruction to be fetched." },
  "mar": { definition: "Memory Address Register: Holds the address of the memory location being accessed." },
  "mdr": { definition: "Memory Data Register: Temporarily holds data or instructions transferred to/from memory." },
  "cir": { definition: "Current Instruction Register: Holds the instruction currently being decoded or executed." },
  "acc": { definition: "Accumulator: A register used with the ALU that stores the intermediate results of calculations." },
  "alu": { definition: "Arithmetic Logic Unit: Performs mathematical operations (ADD, SUBTRACT, shifts) and logical comparisons (AND, OR, NOT, >, <, ==) in the CPU." },
  "control unit": { definition: "Component of the CPU which controls the flow of data around the CPU, communication between the CPU and input/output devices, decodes and executes instructions." },
  "cache": { definition: "A small amount of very fast memory built on or very close to the CPU. Stores frequently used instructions and data, making access much faster than fetching from RAM." },
  "buses": { definition: "Any of three communication pathways between the CPU and RAM in the Von Neumann architecture. There is one for addresses (Address Bus), one for data (Data Bus) and one for control signals (Control Bus)." },
  "address bus": { definition: "The bus used by the CPU to specify the memory address it wants to access." },
  "data bus": { definition: "The bus used to transfer actual data and instructions between the CPU and RAM." },
  "control bus": { definition: "The bus used to send control signals between the CPU and other components (e.g., memory read/write signals)." },
  "ram": { definition: "Random Access Memory (Main memory). Volatile storage where currently running programs and data are held for the CPU." },
  "memory": { definition: "Usually refers to RAM (Main Memory), where data and instructions are stored for the CPU to access quickly." },
  "clock speed": { definition: "The number of FDE cycles a CPU can perform per second (measured in Hz, typically GHz)." },
  "cores": { definition: "An individual processing unit within a CPU. Multi-core CPUs have more than one." },
  "embedded systems": { definition: "A computer system with a dedicated function within a larger mechanical or electrical system. Often includes hardware and software together." },
  "example": { definition: "This is an example tooltip!"}
};

const introSectionContent = `
  <p>In the previous lesson, we learned that the <keyword data-key="cpu">CPU</keyword> is the 'brain' of the computer and follows the <keyword data-key="fetch-decode-execute cycle">Fetch-Decode-Execute Cycle</keyword>.</p>
  <p>This lesson dives deeper into how the CPU is organised based on the <strong class="font-semibold text-indigo-800"><keyword data-key="von neumann architecture">Von Neumann Architecture</keyword></strong>, and explores the key components inside the CPU, including special memory locations called <keyword data-key="registers">Registers</keyword>, that make the FDE cycle work.</p>
  <p>Complete the tasks below to build your understanding. Hover over <keyword data-key="example">keywords</keyword> for quick definitions!</p>
`;

const starterQuestions: StarterQuestion[] = [
  { id: 'starter-cu', questionText: '<strong>Control Unit (CU):</strong> What might this control?', questionType: 'shortAnswer', placeholder: 'Your initial thoughts...', minLengthForAttempt: 5 },
  { id: 'starter-alu', questionText: '<strong>ALU (Arithmetic Logic Unit):</strong> What kind of operations might this perform?', questionType: 'shortAnswer', placeholder: 'Your initial thoughts...', minLengthForAttempt: 5 },
  { id: 'starter-registers', questionText: '<strong>Registers (e.g., PC, MAR, MDR):</strong> What could these small memory locations be used for?', questionType: 'shortAnswer', placeholder: 'Your initial thoughts...', minLengthForAttempt: 5 },
  { id: 'starter-buses', questionText: '<strong>Buses (Address, Data, Control):</strong> What might these pathways transfer?', questionType: 'shortAnswer', placeholder: 'Your initial thoughts...', minLengthForAttempt: 5 },
  { id: 'starter-cache', questionText: '<strong>Cache:</strong> Why might the CPU have a small amount of very fast memory built into it?', questionType: 'shortAnswer', placeholder: 'Your initial thoughts...', minLengthForAttempt: 5 },
];

const lessonOutcomesContent: string[] = [
  "Describe the main components of the Von Neumann architecture (CPU, Memory, Buses).",
  "Identify the key components within the CPU: Control Unit (CU), Arithmetic Logic Unit (ALU), Cache, and Registers.",
  "Explain the specific function of the CU and the ALU.",
  "Name and describe the purpose of key CPU registers: PC, MAR, MDR, ACC, CIR.",
  "Explain the purpose of the Address Bus, Data Bus, and Control Bus in transferring data and signals.",
];

const task1IntroText = "<p class=\\"mb-4 text-gray-700\\">Drag the labels from the bank below onto the correct component boxes in the diagram. Hover over the <i class=\\"fas fa-circle-question text-gray-500\\"></i> icons for hints!</p>";
const task1Labels: DraggableLabelItem[] = [
  { id: "label-item-reg", text: "Registers", dataLabel: "registers" }, { id: "label-item-pc", text: "PC", dataLabel: "pc" }, { id: "label-item-mar", text: "MAR", dataLabel: "mar" }, { id: "label-item-mdr", text: "MDR", dataLabel: "mdr" }, { id: "label-item-cir", text: "CIR", dataLabel: "cir" }, { id: "label-item-acc", text: "Accumulator", dataLabel: "acc" }, { id: "label-item-alu", text: "ALU", dataLabel: "alu" }, { id: "label-item-cu", text: "Control Unit", dataLabel: "cu" }, { id: "label-item-mem", text: "Memory", dataLabel: "memory" },
];
// For DiagramLabelDragDropSection, positions are best handled by CSS based on IDs.
// We'll keep the original IDs for CSS targeting and add classNames for general component box styling.
const task1DropZones: DropZoneConfig[] = [
  { id: "drop-registers-title", dataCorrect: "registers", hint: "The main title for this group of fast, internal CPU memory locations.", className: "diagram-component-box", style: { top: '15px', left: '190px', width: '150px', height: '250px', backgroundColor: '#f3e8ff', borderColor: '#a855f7' } },
  { id: "drop-pc", dataCorrect: "pc", dataRegister: "pc", isRegisterZone: true, hint: "Holds the address of the NEXT instruction.", className: "register-zone" },
  { id: "drop-mar", dataCorrect: "mar", dataRegister: "mar", isRegisterZone: true, hint: "Holds the memory ADDRESS to read/write.", className: "register-zone" },
  { id: "drop-mdr", dataCorrect: "mdr", dataRegister: "mdr", isRegisterZone: true, hint: "Holds the DATA coming from or going to memory.", className: "register-zone" },
  { id: "drop-cir", dataCorrect: "cir", dataRegister: "cir", isRegisterZone: true, hint: "Holds the CURRENT instruction being processed.", className: "register-zone" },
  { id: "drop-memory-title", dataCorrect: "memory", hint: "Stores instructions and data (RAM).", className: "diagram-component-box", style: { top: '15px', right: '20px', width: '150px', height: '280px', backgroundColor: '#d1d5db', borderColor: '#4b5563' } },
  { id: "drop-alu-title", dataCorrect: "alu", hint: "Performs calculations and logic.", className: "diagram-component-box", style: { bottom: '15px', left: '20px', width: '130px', height: '90px', backgroundColor: '#dbeafe', borderColor: '#3b82f6', justifyContent: 'center'} },
  { id: "drop-cu-title", dataCorrect: "cu", hint: "Controls the FDE cycle and data flow.", className: "diagram-component-box", style: { bottom: '15px', left: '190px', width: '150px', height: '90px', backgroundColor: '#fee2e2', borderColor: '#ef4444', justifyContent: 'center'} },
  { id: "drop-acc-title", dataCorrect: "acc", hint: "Temporarily stores calculation results.", className: "diagram-component-box", style: { top: '140px', left: '20px', width: '130px', height: '90px', backgroundColor: '#d1fae5', borderColor: '#10b981', justifyContent: 'center'} },
];


const task2IntroText = "<p class=\\"mb-4 text-gray-700\\">Match the CPU component or register on the left with its correct description on the right. Click one item from each list to create a pair.</p>";
const task2MatchItems: MatchItem[] = [
  { id: "cu", text: "Control Unit (CU)" }, { id: "alu", text: "ALU" }, { id: "cache", text: "Cache" }, { id: "registers", text: "Registers" }, { id: "pc", text: "Program Counter (PC)" }, { id: "mar", text: "MAR" }, { id: "mdr", text: "MDR" }, { id: "acc", text: "Accumulator" },
];
const task2Descriptions: MatchDescriptionItem[] = [
  { id: "desc-mar", text: "Holds the memory address being read from or written to.", matchesTo: "mar" }, { id: "desc-alu", text: "Performs calculations and logical comparisons.", matchesTo: "alu" }, { id: "desc-pc", text: "Holds the address of the next instruction to be fetched.", matchesTo: "pc" }, { id: "desc-cu", text: "Decodes instructions and controls data flow.", matchesTo: "cu" }, { id: "desc-acc", text: "Stores the results of calculations temporarily.", matchesTo: "acc" }, { id: "desc-mdr", text: "Temporarily holds data transferred to/from memory.", matchesTo: "mdr" }, { id: "desc-cache", text: "Small, fast memory on the CPU for frequently used data.", matchesTo: "cache" }, { id: "desc-registers", text: "General term for small, fast memory locations inside the CPU.", matchesTo: "registers" },
];

const task3IntroText = "<p class=\\"mb-4 text-gray-700\\">Click on each register below to learn more about its specific function.</p>";
const task3Registers: RegisterInfo[] = [
  { id: "pc", name: "PC", displayName: "Program Counter (PC)", description: cpuLessonKeywords["pc"]?.definition || "Info not found." }, { id: "mar", name: "MAR", displayName: "Memory Address Register (MAR)", description: cpuLessonKeywords["mar"]?.definition || "Info not found." }, { id: "mdr", name: "MDR", displayName: "Memory Data Register (MDR)", description: cpuLessonKeywords["mdr"]?.definition || "Info not found." }, { id: "cir", name: "CIR", displayName: "Current Instruction Register (CIR)", description: cpuLessonKeywords["cir"]?.definition || "Info not found." }, { id: "acc", name: "ACC", displayName: "Accumulator (ACC)", description: cpuLessonKeywords["acc"]?.definition || "Info not found." },
];

const task4IntroText = "<p class=\\"mb-4 text-gray-700\\">Click the buttons to see how the different <keyword data-key=\\"buses\\">buses</keyword> are used for reading from and writing to <keyword data-key=\\"ram\\">RAM</keyword>.</p>";

const realWorldConnectionContent = `
  <p class="text-gray-700">While we talk about components and buses abstractly, they are physical parts of a computer:</p>
  <ul class="list-disc list-inside space-y-2 text-blue-800 pl-4">
      <li><strong class="font-semibold">The CPU Chip:</strong> The <keyword data-key="alu">ALU</keyword>, <keyword data-key="control unit">Control Unit</keyword>, <keyword data-key="cache">Cache</keyword>, and <keyword data-key="registers">Registers</keyword> are all tiny circuits etched onto a single silicon chip – the CPU itself!</li>
      <li><strong class="font-semibold">RAM Modules:</strong> <keyword data-key="ram">RAM</keyword> comes as separate sticks (modules) that plug into slots on the motherboard.</li>
      <li><strong class="font-semibold">The Motherboard:</strong> This is the main circuit board. The CPU plugs into a socket on the motherboard, and the RAM plugs into slots. The <keyword data-key="buses">Buses</keyword> are actually physical pathways (traces) printed onto the surface of the motherboard, connecting the CPU socket to the RAM slots and other components.</li>
  </ul>
  <p class="text-gray-700 mt-3 italic">So, when the CPU fetches an instruction, electrical signals representing the address travel along the physical Address Bus traces on the motherboard to the RAM module, and the data/instruction travels back along the Data Bus traces. The Control Unit sends timing and command signals along the Control Bus traces.</p>
  <p class="text-sm text-gray-600 mt-3 italic">Understanding the FDE cycle and the role of each component helps explain why the layout and connections on a motherboard are designed the way they are!</p>
`;

const mythBustersContent = `
  <div class="space-y-4">
      <div class="myth"><p><strong class="font-semibold text-red-800">Myth 1:</strong> "All registers are the same and just hold temporary data."</p><p class="text-sm text-red-700 mt-1 pl-4"><strong>Reality:</strong> While all <keyword data-key="registers">registers</keyword> are fast memory locations inside the CPU, they have highly specialized roles. The <keyword data-key="pc">PC</keyword> tracks the address of the next instruction, the <keyword data-key="mar">MAR</keyword> holds the address for the current memory access, the <keyword data-key="mdr">MDR</keyword> buffers data or instructions transferred from memory, and the <keyword data-key="acc">ACC</keyword> holds the results of calculations. They are not interchangeable!</p></div>
      <div class="myth border-t border-red-200 pt-4"><p><strong class="font-semibold text-red-800">Myth 2:</strong> "The CPU processes instructions instantly."</p><p class="text-sm text-red-700 mt-1 pl-4"><strong>Reality:</strong> Every instruction must go through the <keyword data-key="fetch-decode-execute cycle">Fetch-Decode-Execute Cycle</keyword>. Each step takes a small but measurable amount of time, limited by factors like the CPU's <keyword data-key="clock speed">clock speed</keyword> and the speed at which data can be transferred between components using the <keyword data-key="buses">buses</keyword>.</p></div>
      <div class="myth border-t border-red-200 pt-4"><p><strong class="font-semibold text-red-800">Myth 3:</strong> "Buses are just simple wires connecting things."</p><p class="text-sm text-red-700 mt-1 pl-4"><strong>Reality:</strong> While they are pathways, <keyword data-key="buses">buses</keyword> are complex communication channels with specific widths (determining how much data can travel simultaneously) and speeds. The <keyword data-key="address bus">Address Bus</keyword>, <keyword data-key="data bus">Data Bus</keyword>, and <keyword data-key="control bus">Control Bus</keyword> each have distinct roles and limitations that significantly affect overall system performance.</p></div>
  </div>
`;

const task5IntroText = "<p class=\\"mb-4 text-gray-700\\">For each scenario, choose the register that is primarily involved.</p>";
const commonRegisterOptions: ScenarioOption[] = [
  { text: "Program Counter (PC)", value: "PC" }, { text: "Memory Address Register (MAR)", value: "MAR" }, { text: "Memory Data Register (MDR)", value: "MDR" }, { text: "Accumulator (ACC)", value: "ACC" },
];
const task5Scenarios: Scenario[] = [
  { id: "scenario1-pc", questionText: "<p class=\\"font-medium mb-2\\">Scenario 1: The CPU is about to fetch the next instruction. Which register holds the *address* of this instruction?</p>", options: commonRegisterOptions, correctAnswerValue: "PC" },
  { id: "scenario2-mdr", questionText: "<p class=\\"font-medium mb-2\\">Scenario 2: An instruction <code class=\\"text-sm bg-gray-200 px-1 rounded\\">ADD 6</code> has just been fetched from memory... Which register temporarily holds this instruction data?</p>", options: commonRegisterOptions, correctAnswerValue: "MDR" },
  { id: "scenario3-acc", questionText: "<p class=\\"font-medium mb-2\\">Scenario 3: The result of <code class=\\"text-sm bg-gray-200 px-1 rounded\\">5 + 3</code> was just calculated by the ALU. Which register is most likely holding the result (8)?</p>", options: commonRegisterOptions, correctAnswerValue: "ACC" }
];

const task6IntroText = "<p class=\\"mb-4 text-gray-700\\">Fill in the missing keywords in the sentences below.</p>";
const task6Sentences: FillBlankSentence[] = [
  { id: "fill-1", fullSentenceStructure: "1. The {blank} decodes instructions and manages the flow of data.", placeholder: "Component", correctAnswers: ["control unit", "cu"] },
  { id: "fill-2", fullSentenceStructure: "2. Arithmetic and logic operations are performed by the {blank}.", placeholder: "Component", correctAnswers: ["alu", "arithmetic logic unit"] },
  { id: "fill-3", fullSentenceStructure: "3. The {blank} holds the address of the memory location to be accessed.", placeholder: "Register", correctAnswers: ["mar", "memory address register"] },
  { id: "fill-4", fullSentenceStructure: "4. Data or instructions fetched from RAM are temporarily stored in the {blank}.", placeholder: "Register", correctAnswers: ["mdr", "memory data register"] },
  { id: "fill-5", fullSentenceStructure: "5. The concept that instructions and data are stored in the same memory is called the {blank}.", placeholder: "Concept", correctAnswers: ["stored program concept", "von neumann architecture"] },
  { id: "fill-6", fullSentenceStructure: "6. The {blank} always contains the memory address of the next instruction to be fetched.", placeholder: "Register", correctAnswers: ["pc", "program counter"] }
];

const task7QuizQuestions: QuizQuestion[] = [
  { id: "quiz-q1", questionText: "What is the main principle of the Von Neumann architecture regarding instructions and data?", options: ["They are stored in separate memory locations", "Only instructions are stored in memory", "Instructions and data are stored in the same memory", "Data is processed directly from input devices"], correctAnswer: "Instructions and data are stored in the same memory", feedbackCorrect: "Correct! This is the Stored Program Concept.", feedbackIncorrect: "Incorrect. The key idea is that instructions and data share the same memory space (RAM)." },
  { id: "quiz-q2", questionText: "Which CPU component decodes instructions?", options: ["ALU", "Cache", "Register", "Control Unit (CU)"], correctAnswer: "Control Unit (CU)", feedbackCorrect: "Correct! The CU interprets instructions.", feedbackIncorrect: "Incorrect. The Control Unit (CU) decodes instructions." },
  { id: "quiz-q3", questionText: "Which register holds the address of the *next* instruction?", options: ["MAR", "MDR", "Accumulator", "Program Counter (PC)"], correctAnswer: "Program Counter (PC)", feedbackCorrect: "Correct! The PC always points to the next instruction.", feedbackIncorrect: "Incorrect. The Program Counter (PC) holds the address of the next instruction." },
  { id: "quiz-q4", questionText: "Which register holds data being transferred between the CPU and RAM?", options: ["PC", "MAR", "MDR", "Accumulator"], correctAnswer: "MDR", feedbackCorrect: "Correct! MDR is the buffer for data/instructions to/from RAM.", feedbackIncorrect: "Incorrect. The Memory Data Register (MDR) holds the data/instruction." },
  { id: "quiz-q5", questionText: "Where are the results of ALU calculations often stored temporarily?", options: ["MAR", "Cache", "PC", "Accumulator"], correctAnswer: "Accumulator", feedbackCorrect: "Correct! The Accumulator holds intermediate results.", feedbackIncorrect: "Incorrect. The Accumulator is commonly used to store results from the ALU." },
  { id: "quiz-q6", questionText: "What is the role of the MAR?", options: ["Hold the instruction being decoded", "Hold the address of the memory location being accessed", "Hold the result of an ALU operation", "Store frequently used data"], correctAnswer: "Hold the address of the memory location being accessed", feedbackCorrect: "Correct! The MAR holds the specific address in RAM for the current fetch or store operation.", feedbackIncorrect: "Incorrect. The Memory Address Register (MAR) holds the memory address the CPU wants to read/write." },
  { id: "quiz-q7", questionText: "True or False: The ALU, CU and Registers are all located within the CPU.", options: ["True", "False"], correctAnswer: "True", feedbackCorrect: "Correct! These are the core internal components of the CPU.", feedbackIncorrect: "Incorrect. The CU, ALU, and Registers are key parts located inside the CPU." },
  { id: "quiz-q8", questionText: "The pathway used to send memory addresses from the CPU to RAM is the...", options: ["Data Bus", "Control Bus", "Address Bus", "System Clock"], correctAnswer: "Address Bus", feedbackCorrect: "Correct! Addresses travel on the Address Bus.", feedbackIncorrect: "Incorrect. Memory addresses are sent via the Address Bus." }
];

const task8IntroText = "<p class=\\"mb-4 text-gray-700\\">Answer these exam-style questions. Use the 'Show Mark Scheme' button to check your understanding against the key points.</p>";
const CHARS_PER_MARK_FOR_ATTEMPT = 20;
const task8ExamQuestions: ExamQuestion[] = [
  { id: "exam-q-pc", questionText: "<h4 class=\\"mb-3 font-medium text-gray-800\\">1. Describe the purpose of the Program Counter (PC) in the fetch-decode-execute cycle. (<span class=\\"marks-value\\">2</span> marks)</h4>", marks: 2, answerPlaceholder: "Type your description here...", charsPerMarkForAttempt: CHARS_PER_MARK_FOR_ATTEMPT, markScheme: `<p><strong>Mark Scheme (PC):</strong></p><ul class="list-disc list-inside ml-4 text-sm"><li>A register (1 mark)</li><li>that holds a single address (1 mark)</li><li>of the next instruction to be fetched/run during the fetch-execute cycle (1 mark)</li></ul><p class="text-xs italic mt-1">(Max 2 marks)</p>` },
  { id: "exam-q-mar-mdr", questionText: "<h4 class=\\"mb-3 font-medium text-gray-800\\">2. Explain the role of the Memory Address Register (MAR) and the Memory Data Register (MDR) when fetching an instruction from RAM. (<span class=\\"marks-value\\">4</span> marks)</h4>", marks: 4, answerPlaceholder: "Explain the roles of both MAR and MDR...", charsPerMarkForAttempt: CHARS_PER_MARK_FOR_ATTEMPT, markScheme: `<p><strong>Mark Scheme (MAR/MDR Fetch):</strong></p><ul class="list-disc list-inside ml-4 text-sm"><li>MAR stores the memory address (1 mark)</li><li>of the instruction/data to be fetched/accessed (1 mark)</li><li>MDR stores the instruction/data (1 mark)</li><li>that has been fetched/read from memory (1 mark)</li></ul><p class="text-xs italic mt-1">(Max 4 marks)</p>` },
  { id: "exam-q-acc", questionText: "<h4 class=\\"mb-3 font-medium text-gray-800\\">3. Describe the purpose of the Accumulator (ACC). (<span class=\\"marks-value\\">2</span> marks)</h4>", marks: 2, answerPlaceholder: "Type your description here...", charsPerMarkForAttempt: CHARS_PER_MARK_FOR_ATTEMPT, markScheme: `<p><strong>Mark Scheme (ACC):</strong></p><ul class="list-disc list-inside ml-4 text-sm"><li>A register used with the ALU (1 mark)</li><li>that stores the result of a process/calculation (1 mark)</li></ul><p class="text-xs italic mt-1">(Max 2 marks)</p>` }
];

const relatedVideosIntroText = "<p class=\\"text-gray-700\\">Watch these videos to reinforce your understanding of CPU components and architecture:</p>";
const relatedVideoEntries: VideoEntry[] = [
  { id: "video1-fde", title: "1.1 The purpose of the CPU - The fetch-execute cycle", embedUrl: "https://www.youtube.com/embed/7Up7DIPkTzo", notesPlaceholder: "Optional: Add any additional notes from this video..." },
  { id: "video2-components", title: "1.1 CPU components and their function", embedUrl: "https://www.youtube.com/embed/hk9LPXzYeT0", notesPlaceholder: "Optional: Add any additional notes from this video..." },
  { id: "video3-vonneumann", title: "Additional Video: CPU Components & FDE Cycle (was 1.1 Von Neumann architecture)", embedUrl: "https://www.youtube.com/embed/KBmoqwVt4Qg", notesPlaceholder: "Optional: Add any additional notes from this video..." }
];

const keyTakeawaysContent = `
  <div class="bg-yellow-50 p-5 rounded-lg border border-yellow-300 space-y-2">
      <ul class="list-disc list-inside space-y-1 text-yellow-800">
          <li><strong class="font-semibold">Von Neumann Architecture:</strong> Defines a computer with a CPU, Memory (holding both instructions and data), and communication pathways called Buses.</li>
          <li><strong class="font-semibold">CPU Components:</strong> Includes the Control Unit (manages operations), ALU (performs calculations/logic), and Registers (fast, temporary storage).</li>
          <li><strong class="font-semibold">Key Registers:</strong><ul class="list-circle list-inside ml-4"><li>PC: Address of the next instruction.</li><li>MAR: Holds the memory address to access.</li><li>MDR: Holds data/instruction transferred to/from memory.</li><li>ACC: Stores results from the ALU.</li></ul></li>
          <li><strong class="font-semibold">Buses:</strong> The Address Bus carries addresses, the Data Bus carries data/instructions, and the Control Bus carries command signals.</li>
      </ul>
  </div>
`;

const whatsNextDescription = `<p class="text-teal-800 font-medium">You now know about the key components inside the CPU and how they relate to the Von Neumann architecture!</p><p class="text-teal-700 mt-2">Next, we'll look at:</p>`;
const whatsNextLinks: WhatsNextLink[] = [
  { text: "How factors like <keyword data-key=\\"clock speed\\">Clock Speed</keyword>, number of <keyword data-key=\\"cores\\">Cores</keyword>, and <keyword data-key=\\"cache\\">Cache</keyword> size affect CPU performance", specReference: "Spec 1.1.2" },
  { text: "<keyword data-key=\\"embedded systems\\">Embedded Systems</keyword>", specReference: "Spec 1.1.3" },
  { text: "Memory and Storage types", specReference: "Spec 1.2" }
];

const extensionActivities: ExtensionActivity[] = [
  { id: "ext1-harvard", title: "1. Harvard Architecture", description: `<p class="text-sm text-gray-700 mb-2">The Von Neumann architecture uses the same memory and buses for both instructions and data. An alternative is the <strong class="text-orange-700">Harvard architecture</strong>, which uses separate memory spaces and buses for instructions and data.</p><p class="text-sm text-gray-700 mb-2">Research Task: What is the main advantage of using separate buses for instructions and data in the Harvard architecture, especially regarding the Fetch-Decode-Execute cycle? Where is this architecture commonly used?</p>`, placeholder: "Advantage of separate buses? Common uses?" },
  { id: "ext2-pipelining", title: "2. Instruction Pipelining", description: `<p class="text-sm text-gray-700 mb-2">Modern CPUs don't usually wait for one instruction to completely finish the FDE cycle before starting the next. They use a technique called <strong class="text-orange-700">pipelining</strong>, where different stages of multiple instructions overlap, like an assembly line.</p><p class="text-sm text-gray-700 mb-2">Research Task: How does pipelining improve CPU throughput (the number of instructions completed per unit of time)? What potential problem, known as a 'hazard', can occur with pipelining?</p>`, placeholder: "How does pipelining help? What's a hazard?" }
];


export const cpuArchitectureLesson: NewWorksheet = {
  id: 'j277-1-1-cpu-architecture',
  title: 'Inside the CPU: Components & Von Neumann Architecture',
  course: 'GCSE Computer Science (J277)',
  unit: 'Topic 1.1.1: CPU Components & Architecture',
  keywordsData: cpuLessonKeywords,
  sections: [
    { id: 's0-lesson-intro', type: 'StaticText', title: 'Welcome & Introduction', isActivity: false, content: introSectionContent } as StaticTextSection,
    { id: 's1-starter', type: 'StarterActivity', title: 'Starter Activity (5 mins)', isActivity: true, introText: '<p class="font-semibold text-yellow-800">Initial Thoughts:</p><p>Before we dive into the CPU\\'s internal parts, what do you *think* these components might do? Don\\'t worry if you\\'re unsure – we\\'ll cover them in this lesson! Just jot down any initial ideas.</p>', questions: starterQuestions } as StarterActivitySection,
    { id: 's2-outcomes', type: 'LessonOutcomes', title: 'Lesson Outcomes', isActivity: false, outcomes: lessonOutcomesContent } as LessonOutcomesSection,
    { id: 's3-task1-dragdrop-cpu', type: 'DiagramLabelDragDrop', title: 'Task 1: Label the CPU Components', isActivity: true, introText: task1IntroText, labels: task1Labels, dropZones: task1DropZones } as DiagramLabelDragDropSection,
    { id: 's4-task2-matching', type: 'MatchingTask', title: 'Task 2: Match the Components & Registers', isActivity: true, introText: task2IntroText, matchItemsTitle: "Component/Register", descriptionItemsTitle: "Description", items: task2MatchItems, descriptions: task2Descriptions } as MatchingTaskSection,
    { id: 's5-task3-register-explorer', type: 'RegisterExplorer', title: 'Task 3: Interactive Register Explorer', isActivity: true, introText: task3IntroText, registers: task3Registers } as RegisterExplorerSection,
    { id: 's6-task4-bus-simulation', type: 'BusSimulation', title: 'Task 4: Bus Simulation', isActivity: true, introText: task4IntroText } as BusSimulationSection,
    { id: 's7-real-world-connection', type: 'StaticText', title: 'Real-World Connection: The Physical CPU & Motherboard', isActivity: false, content: realWorldConnectionContent } as StaticTextSection,
    { id: 's8-myth-busters', type: 'StaticText', title: 'Myth Busters: Common Misconceptions', isActivity: false, content: mythBustersContent } as StaticTextSection,
    { id: 's9-task5-scenarios', type: 'ScenarioQuestion', title: 'Task 5: Register Role Play', isActivity: true, introText: task5IntroText, scenarios: task5Scenarios } as ScenarioQuestionSection,
    { id: 's10-task6-fill-blanks', type: 'FillTheBlanks', title: 'Task 6: Complete the Sentences', isActivity: true, introText: task6IntroText, sentences: task6Sentences } as FillTheBlanksSection,
    { id: 's11-task7-quiz', type: 'MultipleChoiceQuiz', title: 'Task 7: Check Your Knowledge Quiz', isActivity: true, questions: task7QuizQuestions } as MultipleChoiceQuizSection,
    { id: 's12-task8-exam-practice', type: 'ExamQuestions', title: 'Task 8: Exam Practice Questions', isActivity: true, introText: task8IntroText, questions: task8ExamQuestions } as ExamQuestionsSection,
    { id: 's13-related-videos', type: 'VideoPlaceholder', title: 'Related Videos', isActivity: false, introText: relatedVideosIntroText, videos: relatedVideoEntries } as VideoPlaceholderSection,
    { id: 's14-key-takeaways', type: 'StaticText', title: 'Key Takeaways', isActivity: false, content: keyTakeawaysContent } as StaticTextSection,
    { id: 's15-whats-next', type: 'WhatsNext', title: "What's Next?", isActivity: false, description: whatsNextDescription, links: whatsNextLinks } as WhatsNextSection,
    { id: 's16-extension-activities', type: 'ExtensionActivities', title: 'Extension Activities', isActivity: true, activities: extensionActivities } as ExtensionActivitiesSection,
  ],
};
"""
})

# 3. KeywordTooltipWrapper Component
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/keywords/KeywordTooltipWrapper.tsx',
    'content': """// src/components/worksheets-new/keywords/KeywordTooltipWrapper.tsx
import React from 'react';

interface KeywordTooltipWrapperProps {
  keyword: string;
  definition: string;
  children: React.ReactNode;
}

const KeywordTooltipWrapper: React.FC<KeywordTooltipWrapperProps> = ({ definition, children }) => {
  return (
    <span className="keyword"> {/* Ensure .keyword and .keyword .tooltip styles from style.css are applied */}
      {children}
      <span className="tooltip">{definition}</span>
    </span>
  );
};

export default KeywordTooltipWrapper;
"""
})

# 4. Section Display Components (Add all of them here)
# RichTextSectionDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/RichTextSectionDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/RichTextSectionDisplay.tsx
import React, { useMemo } from 'react';
import { StaticTextSection } from '@/types/worksheetNew';
import KeywordTooltipWrapper from '../keywords/KeywordTooltipWrapper';
import DOMPurify from 'isomorphic-dompurify';
import parse, { Element, HTMLReactParserOptions, domToReact } from 'html-react-parser';

interface RichTextSectionProps {
  section: StaticTextSection;
  keywordsData?: Record<string, { definition: string; link?: string }>;
  onCompletedToggle: (completed: boolean) => void;
  isCompleted?: boolean;
}

const RichTextSectionDisplay: React.FC<RichTextSectionProps> = ({
  section,
  keywordsData,
  onCompletedToggle,
  isCompleted,
}) => {
  const processHtml = (htmlString: string) => {
    if (!htmlString) return '';
    const cleanHtml = DOMPurify.sanitize(htmlString, { USE_PROFILES: { html: true } });
    const options: HTMLReactParserOptions = {
      replace: domNode => {
        if (domNode instanceof Element && domNode.tagName === 'keyword') {
          const keywordKey = domNode.attribs['data-key'];
          if (keywordsData && keywordKey && keywordsData[keywordKey]) {
            const children = domNode.children ? domToReact(domNode.children as any[], options) : '';
            return (
              <KeywordTooltipWrapper keyword={keywordKey} definition={keywordsData[keywordKey].definition}>
                {children}
              </KeywordTooltipWrapper>
            );
          }
        }
      },
    };
    return parse(cleanHtml, options);
  };

  const memoizedContent = useMemo(() => processHtml(section.content), [section.content, keywordsData]);

  return (
    <div className="p-1">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{section.title}</h2>
      <div className="prose prose-sm sm:prose max-w-none prose-indigo">{memoizedContent}</div>
      {!section.isActivity && (
        <div className="mt-6 p-3 bg-slate-50 rounded-md">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => onCompletedToggle(e.target.checked)}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-gray-700">I have read and understood this section.</span>
          </label>
        </div>
      )}
    </div>
  );
};
export default RichTextSectionDisplay;
"""
})

# StarterActivitySectionDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/StarterActivitySectionDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/StarterActivitySectionDisplay.tsx
import React from 'react';
import { StarterActivitySection, StarterQuestion, TaskAttempt } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: string}> = ({ children, className, variant, ...props }) => (
  <button className={`px-3 py-1.5 text-xs rounded ${variant === 'danger_ghost' ? 'text-red-600 hover:bg-red-50' : 'bg-gray-200 hover:bg-gray-300'} ${className || ''}`} {...props}>{children}</button>
);

interface StarterActivityProps {
  section: StarterActivitySection;
  onAnswerChange: (questionId: string, value: any, minLengthForAttempt?: number) => void;
  answers: Record<string, TaskAttempt>;
  onResetTask: (questionId: string) => void;
}

const StarterActivitySectionDisplay: React.FC<StarterActivityProps> = ({
  section,
  onAnswerChange,
  answers,
  onResetTask,
}) => {
  const renderQuestion = (question: StarterQuestion) => {
    const answer = answers[question.id] || { value: '', isAttempted: false };
    return (
      <div key={question.id} className="starter-question bg-white p-4 rounded-md border border-yellow-300 shadow-sm">
        <label htmlFor={`starter-${question.id}`} className="block text-sm font-medium text-yellow-700 mb-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.questionText) }} />
        {question.questionType === 'shortAnswer' && (
          <input
            type="text"
            id={`starter-${question.id}`}
            value={answer.value as string || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value, question.minLengthForAttempt)}
            placeholder={question.placeholder || "Your initial thoughts..."}
            className="mt-1 block w-full p-2 border border-yellow-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
          />
        )}
        {question.questionType === 'trueFalse' && (
          <div className="space-y-2 mt-2">
            {[{ label: 'True', value: 'true' }, { label: 'False', value: 'false' }].map(opt => (
              <label key={opt.value} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-yellow-50 cursor-pointer">
                <input
                  type="radio"
                  name={`starter-${section.id}-${question.id}`}
                  value={opt.value}
                  checked={answer.value === opt.value}
                  onChange={(e) => onAnswerChange(question.id, e.target.value, 1)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )}
        <div className="mt-2 text-right">
             <Button onClick={() => onResetTask(question.id)} variant="danger_ghost">Reset</Button>
        </div>
        {answer.isAttempted && <small className="text-green-600 block mt-1 text-xs">Answered.</small>}
      </div>
    );
  };

  return (
    <div className="p-1">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
         <span role="img" aria-label="lightbulb" className="mr-2 text-yellow-500">💡</span>
        {section.title}
      </h2>
      <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-200 space-y-4">
        {section.introText && <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.introText) }} />}
        <div className="space-y-3">
            {section.questions.map(renderQuestion)}
        </div>
      </div>
    </div>
  );
};

export default StarterActivitySectionDisplay;
"""
})

# LessonOutcomesSectionDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/LessonOutcomesSectionDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/LessonOutcomesSectionDisplay.tsx
import React from 'react';
import { LessonOutcomesSection } from '@/types/worksheetNew';

interface LessonOutcomesProps {
  section: LessonOutcomesSection;
  onCompletedToggle: (completed: boolean) => void;
  isCompleted?: boolean;
}

const LessonOutcomesSectionDisplay: React.FC<LessonOutcomesProps> = ({
  section,
  onCompletedToggle,
  isCompleted,
}) => {
  return (
    <div className="p-1">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
        <span role="img" aria-label="target icon" className="mr-2">🎯</span>
        {section.title}
      </h2>
      <div className="bg-green-50 p-5 rounded-lg border border-green-200">
        <p className="font-semibold text-green-800 mb-3">By the end of this lesson, you should be able to:</p>
        <ul className="list-disc list-inside space-y-2 text-green-700 pl-4">
          {section.outcomes.map((outcome, index) => (
            <li key={index}>{outcome}</li>
          ))}
        </ul>
      </div>
      {!section.isActivity && (
        <div className="mt-6 p-3 bg-slate-50 rounded-md">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => onCompletedToggle(e.target.checked)}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-gray-700">I have read and understood this section.</span>
          </label>
        </div>
      )}
    </div>
  );
};

export default LessonOutcomesSectionDisplay;
"""
})

# DiagramLabelDragDropDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/DiagramLabelDragDropDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/DiagramLabelDragDropDisplay.tsx
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
"""
})

# MatchingTaskSectionDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/MatchingTaskSectionDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/MatchingTaskSectionDisplay.tsx
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
"""
})

# RegisterExplorerSectionDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/RegisterExplorerSectionDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/RegisterExplorerSectionDisplay.tsx
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
"""
})

# BusSimulationSectionDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/BusSimulationSectionDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/BusSimulationSectionDisplay.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { BusSimulationSection, StaticTextSection } from '@/types/worksheetNew';
import RichTextSectionDisplay from './RichTextSectionDisplay'; // For parsing introText with keywords
import DOMPurify from 'isomorphic-dompurify';

interface BusSimElements {
  addrPacket: HTMLElement | null; dataPacket: HTMLElement | null; ctrlPacket: HTMLElement | null;
  description: HTMLElement | null; addrBusLine: HTMLElement | null; dataBusLine: HTMLElement | null; ctrlBusLine: HTMLElement | null;
}
type BusSimElementsRequired = Required<BusSimElements>;


const BusSimulationSectionDisplay: React.FC<{ section: BusSimulationSection, keywordsData?: Record<string, {definition: string}> }> = ({ section, keywordsData }) => {
  const simContainerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<BusSimElements | null>(null);
  const busTimeoutRef = useRef<number | undefined>(undefined);

  const setupElements = useCallback(() => {
    if (simContainerRef.current) {
        elementsRef.current = {
            addrPacket: simContainerRef.current.querySelector<HTMLElement>('#bus-packet-address-task4'),
            dataPacket: simContainerRef.current.querySelector<HTMLElement>('#bus-packet-data-task4'),
            ctrlPacket: simContainerRef.current.querySelector<HTMLElement>('#bus-packet-control-task4'),
            description: simContainerRef.current.querySelector<HTMLElement>('#bus-sim-description-task4'),
            addrBusLine: simContainerRef.current.querySelector<HTMLElement>('.bus-sim-address-task4'),
            dataBusLine: simContainerRef.current.querySelector<HTMLElement>('.bus-sim-data-task4'),
            ctrlBusLine: simContainerRef.current.querySelector<HTMLElement>('.bus-sim-control-task4'),
        };
    }
  }, []);

  useEffect(() => {
    setupElements(); // Initial setup
    // Cleanup on unmount
    return () => {
      if (busTimeoutRef.current) {
        clearTimeout(busTimeoutRef.current);
      }
    };
  }, [setupElements]);

  const adaptedResetBusSimulation = useCallback(() => {
    if (!elementsRef.current || !Object.values(elementsRef.current).every(el => el)) return;
    const elements = elementsRef.current as BusSimElementsRequired;

    clearTimeout(busTimeoutRef.current);
    
    const packets = [elements.addrPacket, elements.dataPacket, elements.ctrlPacket];
    packets.forEach(p => {
        if(p) {
            p.style.left = '0px';
            p.classList.remove('show', 'move-right', 'move-left');
            p.style.opacity = '0'; // Ensure hidden
             // Reset base classes
            if (p.id.includes('address')) p.className = 'bus-sim-packet address absolute bg-red-500 text-white text-xs px-2 py-0.5 rounded top-[60px] left-36 opacity-0 transition-all duration-700 ease-in-out whitespace-nowrap';
            if (p.id.includes('data')) p.className = 'bus-sim-packet data absolute bg-blue-600 text-white text-xs px-2 py-0.5 rounded top-1/2 -translate-y-1/2 left-36 opacity-0 transition-all duration-700 ease-in-out whitespace-nowrap';
            if (p.id.includes('control')) p.className = 'bus-sim-packet control absolute bg-green-500 text-white text-xs px-2 py-0.5 rounded bottom-[60px] left-36 opacity-0 transition-all duration-700 ease-in-out whitespace-nowrap';
        }
    });

    const lines = [elements.addrBusLine, elements.dataBusLine, elements.ctrlBusLine];
    lines.forEach(l => l?.classList.remove('active', 'bg-red-500', 'bg-blue-600', 'bg-green-500')); // Remove active colors
    lines.forEach(l => l?.classList.add('bg-slate-300')); // Reset to base color

    if(elements.description) elements.description.textContent = "Click a button to start the simulation.";
  }, []);


  const adaptedSimulateBus = useCallback((operation: 'read' | 'write') => {
    if (!elementsRef.current || !Object.values(elementsRef.current).every(el => el)) {
        console.warn("Bus simulation elements not ready for simulation.");
        const descEl = elementsRef.current?.description;
        if(descEl) descEl.textContent = "Simulation elements not found. Please refresh.";
        return;
    }
    const elements = elementsRef.current as BusSimElementsRequired;
    adaptedResetBusSimulation(); // Reset before starting a new simulation

    const setPacketLeft = (packet: HTMLElement, targetBusLine: HTMLElement) => {
        // Position packet at the start of its bus line relative to the sim container
        const containerRect = simContainerRef.current!.getBoundingClientRect();
        const busRect = targetBusLine.getBoundingClientRect();
        packet.style.left = `${busRect.left - containerRect.left}px`;
    };
    
    const movePacketRight = (packet: HTMLElement, targetBusLine: HTMLElement) => {
        const containerRect = simContainerRef.current!.getBoundingClientRect();
        const busRect = targetBusLine.getBoundingClientRect();
        const endPosition = (busRect.right - containerRect.left) - packet.offsetWidth;
        packet.style.left = `${endPosition}px`;
    };


    if (operation === 'read') {
        elements.addrPacket.textContent = 'Addr: 5';
        elements.ctrlPacket.textContent = 'Read';
        elements.dataPacket.textContent = 'Data: 12';
        elements.description.textContent = "1. CPU places address 5 on Address Bus.";
        elements.addrBusLine.classList.remove('bg-slate-300'); elements.addrBusLine.classList.add('active', 'bg-red-500');
        setPacketLeft(elements.addrPacket, elements.addrBusLine);
        elements.addrPacket.style.opacity = '1'; elements.addrPacket.classList.add('show');

        busTimeoutRef.current = window.setTimeout(() => {
            movePacketRight(elements.addrPacket, elements.addrBusLine);
            elements.description.textContent = "2. Address 5 travels to RAM.";
            busTimeoutRef.current = window.setTimeout(() => {
                elements.addrBusLine.classList.remove('active', 'bg-red-500'); elements.addrBusLine.classList.add('bg-slate-300');
                elements.description.textContent = "3. CPU sends 'Read' signal on Control Bus.";
                elements.ctrlBusLine.classList.remove('bg-slate-300'); elements.ctrlBusLine.classList.add('active', 'bg-green-500');
                setPacketLeft(elements.ctrlPacket, elements.ctrlBusLine);
                elements.ctrlPacket.style.opacity = '1'; elements.ctrlPacket.classList.add('show');
                movePacketRight(elements.ctrlPacket, elements.ctrlBusLine);
                busTimeoutRef.current = window.setTimeout(() => {
                    elements.ctrlBusLine.classList.remove('active', 'bg-green-500'); elements.ctrlBusLine.classList.add('bg-slate-300');
                    elements.description.textContent = "4. RAM places data (12) on Data Bus.";
                    movePacketRight(elements.dataPacket, elements.dataBusLine); // Position at RAM end
                    elements.dataBusLine.classList.remove('bg-slate-300'); elements.dataBusLine.classList.add('active', 'bg-blue-600');
                    elements.dataPacket.style.opacity = '1'; elements.dataPacket.classList.add('show');
                    busTimeoutRef.current = window.setTimeout(() => {
                        elements.description.textContent = "5. Data (12) travels back to CPU.";
                        setPacketLeft(elements.dataPacket, elements.dataBusLine); // Move to CPU end
                        busTimeoutRef.current = window.setTimeout(() => {
                            elements.dataBusLine.classList.remove('active', 'bg-blue-600'); elements.dataBusLine.classList.add('bg-slate-300');
                            elements.description.textContent = "Read cycle complete.";
                        }, 1500);
                    }, 800);
                }, 1500);
            }, 800);
        }, 800);
    } else if (operation === 'write') {
        // Similar logic for write, using setPacketLeft and movePacketRight
        elements.addrPacket.textContent = 'Addr: 7';
        elements.ctrlPacket.textContent = 'Write';
        elements.dataPacket.textContent = 'Data: 99';
        elements.description.textContent = "1. CPU places address 7 on Address Bus.";
        elements.addrBusLine.classList.remove('bg-slate-300'); elements.addrBusLine.classList.add('active', 'bg-red-500');
        setPacketLeft(elements.addrPacket, elements.addrBusLine);
        elements.addrPacket.style.opacity = '1'; elements.addrPacket.classList.add('show');

        busTimeoutRef.current = window.setTimeout(() => {
            movePacketRight(elements.addrPacket, elements.addrBusLine);
            elements.description.textContent = "2. Address 7 travels to RAM.";
            busTimeoutRef.current = window.setTimeout(() => {
                elements.addrBusLine.classList.remove('active', 'bg-red-500'); elements.addrBusLine.classList.add('bg-slate-300');
                elements.description.textContent = "3. CPU places data (99) on Data Bus.";
                elements.dataBusLine.classList.remove('bg-slate-300'); elements.dataBusLine.classList.add('active', 'bg-blue-600');
                setPacketLeft(elements.dataPacket, elements.dataBusLine);
                elements.dataPacket.style.opacity = '1'; elements.dataPacket.classList.add('show');
                busTimeoutRef.current = window.setTimeout(() => {
                    movePacketRight(elements.dataPacket, elements.dataBusLine);
                    elements.description.textContent = "4. Data (99) travels to RAM.";
                    busTimeoutRef.current = window.setTimeout(() => {
                        elements.dataBusLine.classList.remove('active', 'bg-blue-600'); elements.dataBusLine.classList.add('bg-slate-300');
                        elements.description.textContent = "5. CPU sends 'Write' signal on Control Bus.";
                        elements.ctrlBusLine.classList.remove('bg-slate-300'); elements.ctrlBusLine.classList.add('active', 'bg-green-500');
                        setPacketLeft(elements.ctrlPacket, elements.ctrlBusLine);
                        elements.ctrlPacket.style.opacity = '1'; elements.ctrlPacket.classList.add('show');
                        movePacketRight(elements.ctrlPacket, elements.ctrlBusLine);
                        busTimeoutRef.current = window.setTimeout(() => {
                            elements.ctrlBusLine.classList.remove('active', 'bg-green-500'); elements.ctrlBusLine.classList.add('bg-slate-300');
                            elements.description.textContent = "Write cycle complete.";
                        }, 1500);
                    }, 800);
                }, 1500);
            }, 800);
        }, 800);
    }
  }, [adaptedResetBusSimulation]);
  
  const introStaticSection: StaticTextSection = { id: section.id + "-intro", title: "", type: 'StaticText', content: section.introText, isActivity: false };

  return (
    <div className="p-1 task-container">
      <h3 className="text-xl task-title text-indigo-700"><span role="img" aria-label="route icon" className="mr-2">🛣️</span>{section.title}</h3>
      <RichTextSectionDisplay section={introStaticSection} keywordsData={keywordsData} onCompletedToggle={()=>{}} isCompleted={false} />
      <div ref={simContainerRef} className="mt-4">
        <div className="bus-sim-container relative h-52 bg-slate-50 border border-slate-200 rounded-md overflow-hidden mb-4">
            <div className="bus-sim-component bus-sim-cpu absolute left-8 top-1/2 -translate-y-1/2 border-2 border-blue-400 bg-blue-100 text-blue-800 px-6 py-4 rounded-md font-semibold">CPU</div>
            <div className="bus-sim-component bus-sim-ram absolute right-8 top-1/2 -translate-y-1/2 border-2 border-amber-400 bg-amber-100 text-amber-800 px-6 py-4 rounded-md font-semibold">RAM</div>
            <div className="bus-sim-line bus-sim-address-task4 absolute left-32 right-32 h-1.5 bg-slate-300 top-16 rounded-full"></div>
            <div className="bus-sim-line bus-sim-data-task4 absolute left-32 right-32 h-1.5 bg-slate-300 top-1/2 -translate-y-px rounded-full"></div>
            <div className="bus-sim-line bus-sim-control-task4 absolute left-32 right-32 h-1.5 bg-slate-300 bottom-16 rounded-full"></div>
            <div id="bus-packet-address-task4" className="bus-sim-packet address absolute bg-red-500 text-white text-xs px-2 py-0.5 rounded top-[60px] left-36 opacity-0 transition-all duration-700 ease-in-out whitespace-nowrap z-10"></div>
            <div id="bus-packet-data-task4" className="bus-sim-packet data absolute bg-blue-600 text-white text-xs px-2 py-0.5 rounded top-1/2 -translate-y-1/2 left-36 opacity-0 transition-all duration-700 ease-in-out whitespace-nowrap z-10"></div>
            <div id="bus-packet-control-task4" className="bus-sim-packet control absolute bg-green-500 text-white text-xs px-2 py-0.5 rounded bottom-[60px] left-36 opacity-0 transition-all duration-700 ease-in-out whitespace-nowrap z-10"></div>
        </div>
        <div id="bus-sim-description-task4" className="min-h-[40px] bg-indigo-50 border border-indigo-200 p-3 rounded-md mt-4 text-indigo-800 text-sm text-center">Click a button to start the simulation.</div>
      </div>
      <div className="mt-6 text-center space-x-2">
        <button className="sim-button bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded font-medium" onClick={() => adaptedSimulateBus('read')}>Simulate Read from Address 5</button>
        <button className="sim-button bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded font-medium" onClick={() => adaptedSimulateBus('write')}>Simulate Write 99 to Address 7</button>
        <button className="sim-button reset bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium" onClick={adaptedResetBusSimulation}>Reset Simulation</button>
      </div>
    </div>
  );
};
export default BusSimulationSectionDisplay;
"""
})

# ScenarioQuestionDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/ScenarioQuestionDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/ScenarioQuestionDisplay.tsx
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
"""
})

# FillTheBlanksSectionDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/FillTheBlanksSectionDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/FillTheBlanksSectionDisplay.tsx
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
      const isCorrect = sentence.correctAnswers.includes(userAnswer.trim().toLowerCase().replace(/\\.$/, ''));
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
"""
})

# MultipleChoiceQuizDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/MultipleChoiceQuizDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/MultipleChoiceQuizDisplay.tsx
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
"""
})

# ExamQuestionsSectionDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/ExamQuestionsSectionDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/ExamQuestionsSectionDisplay.tsx
import React, { useState, useEffect } from 'react';
import { ExamQuestionsSection, ExamQuestion, TaskAttempt } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';

interface ExamQuestionDisplayProps {
  section: ExamQuestionsSection;
  onAnswerChange: (questionId: string, value: { answerText: string; selfAssessedMarks?: number }, isAttempted: boolean) => void;
  answers: Record<string, TaskAttempt>;
  onResetTask: (questionId?: string) => void;
}

const ExamQuestionsSectionDisplay: React.FC<ExamQuestionDisplayProps> = ({ section, onAnswerChange, answers, onResetTask }) => {
  const [markSchemesVisible, setMarkSchemesVisible] = useState<Record<string, boolean>>({});
  const [showMarkSchemeEnabled, setShowMarkSchemeEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialEnabledState: Record<string, boolean> = {};
    section.questions.forEach(q => {
      const answerText = (answers[q.id]?.value as { answerText: string })?.answerText || '';
      const requiredLength = (q.charsPerMarkForAttempt || 20) * q.marks;
      initialEnabledState[q.id] = answerText.trim().length >= requiredLength;
    });
    setShowMarkSchemeEnabled(initialEnabledState);
  }, [answers, section.questions]);

  const handleAnswerInput = (question: ExamQuestion, answerText: string) => {
    const requiredLength = (question.charsPerMarkForAttempt || 20) * question.marks;
    setShowMarkSchemeEnabled(prev => ({ ...prev, [question.id]: answerText.trim().length >= requiredLength }));
    const currentSelfAssessed = (answers[question.id]?.value as {selfAssessedMarks?: number})?.selfAssessedMarks;
    onAnswerChange(question.id, { answerText, selfAssessedMarks: currentSelfAssessed }, answerText.trim() !== '');
  };

  const handleSelfAssessChange = (questionId: string, marksStr: string) => {
    const answerText = (answers[questionId]?.value as { answerText: string })?.answerText || '';
    const marks = parseInt(marksStr);
    onAnswerChange(questionId, { answerText, selfAssessedMarks: isNaN(marks) ? undefined : marks }, !!answerText.trim());
  };

  const toggleMarkSchemeVisibility = (questionId: string) => setMarkSchemesVisible(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  const handleFullReset = () => { setMarkSchemesVisible({}); setShowMarkSchemeEnabled({}); onResetTask(); };

  return (
    <div className="p-1 task-container">
      <h3 className="text-xl task-title text-indigo-700"><span role="img" aria-label="graduation cap icon" className="mr-2">🎓</span>{section.title}</h3>
      {section.introText && <div className="mb-4 text-gray-700" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.introText) }} />}
      <div className="space-y-6">
        {section.questions.map((q) => {
          const currentAnswer = (answers[q.id]?.value as { answerText: string; selfAssessedMarks?: number }) || { answerText: '', selfAssessedMarks: undefined };
          const isMarkSchemeButtonEnabled = showMarkSchemeEnabled[q.id] || false;
          const requiredLength = (q.charsPerMarkForAttempt || 20) * q.marks;
          const buttonTitle = isMarkSchemeButtonEnabled ? "Show the mark scheme" : `Type at least ${Math.max(0, requiredLength - currentAnswer.answerText.trim().length)} more characters to unlock. (${currentAnswer.answerText.trim().length}/${requiredLength})`;
          return (
            <div key={q.id} className="exam-question mb-6 p-4 bg-white rounded border border-gray-200">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.questionText) }} />
              <textarea value={currentAnswer.answerText} onChange={(e) => handleAnswerInput(q, e.target.value)} placeholder={q.answerPlaceholder || "Type your answer here..."} rows={Math.max(3, q.marks + 1)} className="exam-answer-area w-full p-2 mt-2 border border-gray-300 rounded-md" />
              <div className="exam-controls mt-2 flex items-center space-x-4">
                <div><label htmlFor={`self-assess-${q.id}`} className="text-sm text-gray-600">My predicted marks:</label><input type="number" id={`self-assess-${q.id}`} value={currentAnswer.selfAssessedMarks === undefined ? '' : currentAnswer.selfAssessedMarks} onChange={(e) => handleSelfAssessChange(q.id, e.target.value)} min="0" max={q.marks} className="self-assess-input w-20 p-1 border border-gray-300 rounded ml-1" /></div>
                <button onClick={() => toggleMarkSchemeVisibility(q.id)} disabled={!isMarkSchemeButtonEnabled} title={buttonTitle} className="toggle-mark-scheme-btn px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">{markSchemesVisible[q.id] ? 'Hide' : 'Show'} Mark Scheme</button>
              </div>
              {markSchemesVisible[q.id] && <div className="mark-scheme bg-gray-100 p-3 mt-3 rounded border border-gray-200 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.markScheme) }} />}
            </div>
          );
        })}
      </div>
      <div className="mt-6"><button className="reset-button" onClick={handleFullReset}>Reset Task 8</button></div>
    </div>
  );
};
export default ExamQuestionsSectionDisplay;
"""
})

# VideoPlaceholderSectionDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/VideoPlaceholderSectionDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/VideoPlaceholderSectionDisplay.tsx
import React from 'react';
import { VideoPlaceholderSection, TaskAttempt } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';

interface VideoPlaceholderProps {
  section: VideoPlaceholderSection;
  onAnswerChange: (videoId: string, notes: string, isAttempted: boolean) => void;
  answers: Record<string, TaskAttempt>;
  onCompletedToggle: (completed: boolean) => void;
  isCompleted?: boolean;
}

const VideoPlaceholderSectionDisplay: React.FC<VideoPlaceholderProps> = ({ section, onAnswerChange, answers, onCompletedToggle, isCompleted }) => {
  const handleNotesChange = (videoId: string, notes: string) => onAnswerChange(videoId, notes, notes.trim() !== '');
  return (
    <div className="p-1">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4"><span role="img" aria-label="video icon" className="mr-2">🎬</span>{section.title}</h2>
      {section.introText && <div className="mb-4 text-gray-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.introText) }} />}
      <div className="bg-purple-50 p-5 rounded-lg border border-purple-200 space-y-6">
        {section.videos.map((video) => (
          <div key={video.id} className="video-entry">
            <h4 className="font-semibold text-purple-800 mb-2">{video.title}</h4>
            <div className="aspect-video bg-black rounded-md overflow-hidden mb-2"><iframe width="560" height="315" src={video.embedUrl} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="w-full h-full"></iframe></div>
            <div><textarea value={(answers[video.id]?.value as string) || ''} onChange={(e) => handleNotesChange(video.id, e.target.value)} placeholder={video.notesPlaceholder || "Optional: Add notes here..."} rows={3} className="w-full p-2 border border-purple-300 rounded-md text-sm bg-white focus:ring-purple-500 focus:border-purple-500" /></div>
          </div>
        ))}
      </div>
      {!section.isActivity && (
        <div className="mt-6 p-3 bg-slate-50 rounded-md">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={isCompleted} onChange={(e) => onCompletedToggle(e.target.checked)} className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <span className="text-gray-700">I have viewed the relevant videos.</span>
          </label>
        </div>
      )}
    </div>
  );
};
export default VideoPlaceholderSectionDisplay;
"""
})

# WhatsNextSectionDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/WhatsNextSectionDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/WhatsNextSectionDisplay.tsx
import React from 'react';
import { WhatsNextSection } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';
import Link from 'next/link';
import parse, { Element, HTMLReactParserOptions, domToReact } from 'html-react-parser';
import KeywordTooltipWrapper from '../keywords/KeywordTooltipWrapper';

interface WhatsNextProps {
  section: WhatsNextSection;
  keywordsData?: Record<string, { definition: string; link?: string }>;
  onCompletedToggle: (completed: boolean) => void;
  isCompleted?: boolean;
}

const WhatsNextSectionDisplay: React.FC<WhatsNextProps> = ({ section, keywordsData, onCompletedToggle, isCompleted }) => {
  const processHtmlWithKeywords = (htmlString: string) => {
    if (!htmlString) return '';
    const cleanHtml = DOMPurify.sanitize(htmlString, { USE_PROFILES: { html: true } });
    const options: HTMLReactParserOptions = {
      replace: domNode => {
        if (domNode instanceof Element && domNode.tagName === 'keyword') {
          const keywordKey = domNode.attribs['data-key'];
          if (keywordsData && keywordKey && keywordsData[keywordKey]) {
            const children = domNode.children ? domToReact(domNode.children as any[], options) : '';
            return (<KeywordTooltipWrapper keyword={keywordKey} definition={keywordsData[keywordKey].definition}>{children}</KeywordTooltipWrapper>);
          }
        }
      },
    };
    return parse(cleanHtml, options);
  };

  return (
    <div className="p-1">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">{section.title}</h2>
      <div className="bg-teal-50 p-5 rounded-lg border border-teal-300">
        <div className="prose prose-sm max-w-none prose-teal">{processHtmlWithKeywords(section.description)}</div>
        <ul className="list-disc list-inside space-y-1 text-teal-700 mt-3 pl-4">
          {section.links.map((link, index) => (
            <li key={index}>
              {link.url ? (<Link href={link.url} className="hover:underline hover:text-teal-900">{processHtmlWithKeywords(link.text)}</Link>) : (<span>{processHtmlWithKeywords(link.text)}</span>)}
              {link.specReference && <span className="text-xs italic ml-1">({link.specReference})</span>}
            </li>
          ))}
        </ul>
      </div>
      {!section.isActivity && (
        <div className="mt-6 p-3 bg-slate-50 rounded-md">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={isCompleted} onChange={(e) => onCompletedToggle(e.target.checked)} className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <span className="text-gray-700">I have reviewed the next steps.</span>
          </label>
        </div>
      )}
    </div>
  );
};
export default WhatsNextSectionDisplay;
"""
})

# ExtensionActivitiesSectionDisplay.tsx
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/sections/ExtensionActivitiesSectionDisplay.tsx',
    'content': """// src/components/worksheets-new/sections/ExtensionActivitiesSectionDisplay.tsx
import React from 'react';
import { ExtensionActivitiesSection, TaskAttempt } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';

interface ExtensionActivitiesProps {
  section: ExtensionActivitiesSection;
  onAnswerChange: (activityId: string, notes: string, isAttempted: boolean) => void;
  answers: Record<string, TaskAttempt>;
}

const ExtensionActivitiesSectionDisplay: React.FC<ExtensionActivitiesProps> = ({ section, onAnswerChange, answers }) => {
  const handleNotesChange = (activityId: string, notes: string) => onAnswerChange(activityId, notes, notes.trim() !== '');
  return (
    <div className="p-1">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4"><span role="img" aria-label="puzzle piece icon" className="mr-2">🧩</span>{section.title}</h2>
      {section.introText && <div className="mb-4 text-gray-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.introText) }} />}
      <div className="bg-orange-50 p-5 rounded-lg border border-orange-200 space-y-6">
        {section.activities.map((activity, index) => (
          <div key={activity.id} className={`extension-task ${index > 0 ? 'border-t border-orange-200 pt-4' : ''}`}>
            <h3 className="font-semibold text-orange-800 mb-2">{activity.title}</h3>
            <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activity.description) }} />
            <textarea rows={4} value={(answers[activity.id]?.value as string) || ''} onChange={(e) => handleNotesChange(activity.id, e.target.value)} placeholder={activity.placeholder || "Your research notes..."} className="w-full p-2 mt-2 border border-orange-300 rounded-md bg-white focus:ring-orange-500 focus:border-orange-500 text-sm" />
          </div>
        ))}
      </div>
    </div>
  );
};
export default ExtensionActivitiesSectionDisplay;
"""
})


# 5. Control Components
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/controls/NavigationControls.tsx',
    'content': """// src/components/worksheets-new/controls/NavigationControls.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyle = "px-6 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

interface NavigationControlsProps {
  onBack: () => void;
  onNext: () => void;
  isBackDisabled: boolean;
  isNextDisabled: boolean;
  nextButtonText?: string;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({ onBack, onNext, isBackDisabled, isNextDisabled, nextButtonText = "Next" }) => {
  return (
    <div className="flex justify-between items-center p-4 sm:p-6 bg-gray-100 border-t">
      <Button onClick={onBack} disabled={isBackDisabled} variant="secondary">Back</Button>
      <Button onClick={onNext} disabled={isNextDisabled} variant="primary">{nextButtonText}</Button>
    </div>
  );
};
export default NavigationControls;
"""
})

FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/controls/ActionToolbar.tsx',
    'content': """// src/components/worksheets-new/controls/ActionToolbar.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}
const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
  };
  // @ts-ignore
  return <button className={`${baseStyle} ${variants[variant]} ${className || ''}`} {...props}>{children}</button>;
};

interface ActionToolbarProps {
  onResetAll: () => void;
  onExportPDF: () => void;
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({ onResetAll, onExportPDF }) => {
  return (
    <div className="p-4 bg-gray-50 border-b flex items-center justify-end space-x-3">
      <Button onClick={onExportPDF} variant="ghost">Export to PDF</Button>
      <Button onClick={onResetAll} variant="danger">Reset All Tasks</Button>
    </div>
  );
};
export default ActionToolbar;
"""
})

# 6. NewWorksheetPlayer Component
FILES_TO_CREATE.append({
    'path': 'src/components/worksheets-new/NewWorksheetPlayer.tsx',
    'content': """// src/components/worksheets-new/NewWorksheetPlayer.tsx
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
"""
})

# 7. Example Page using the Player
FILES_TO_CREATE.append({
    'path': 'src/app/(platform)/student/worksheets-new/[worksheetId]/page.tsx',
    'content': """// src/app/(platform)/student/worksheets-new/[worksheetId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NewWorksheetPlayer from '@/components/worksheets-new/NewWorksheetPlayer';
import { NewWorksheet, NewWorksheetStudentProgress } from '@/types/worksheetNew';
import { cpuArchitectureLesson } from '@/data/sampleCpuLessonData';
import useAuthStore from '@/store/authStore';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

const NewWorksheetPage = () => {
  const params = useParams();
  const router = useRouter();
  const worksheetId = params.worksheetId as string;
  const [lessonData, setLessonData] = useState<NewWorksheet | null>(null);
  const [initialProgress, setInitialProgress] = useState<NewWorksheetStudentProgress | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile } = useAuthStore();

  useEffect(() => {
    if (!worksheetId || !userProfile?.uid) {
      // Wait for userProfile to be loaded by AuthProvider, or if explicitly null and not loading, redirect.
      // AuthProvider should handle the primary redirect if user is not logged in at all.
      // This check is more for cases where worksheetId is missing or user becomes null after initial auth check.
      if (!isLoading && !userProfile?.uid) {
          console.log("User not authenticated, redirecting to login.");
          router.push('/login');
      }
      // If worksheetId is missing but user is there, we might still be loading or it's an invalid path.
      // The later checks for lessonData will handle invalid worksheetId.
      return;
    }

    const fetchLessonAndProgress = async () => {
      setIsLoading(true);
      try {
        if (worksheetId === cpuArchitectureLesson.id) {
          setLessonData(cpuArchitectureLesson);
        } else {
          console.error("Lesson not found for ID:", worksheetId);
          setLessonData(null);
        }

        const progressDocRef = doc(db, "studentNewWorksheetProgress", `${userProfile.uid}_${worksheetId}`);
        const progressDocSnap = await getDoc(progressDocRef);
        if (progressDocSnap.exists()) {
          const data = progressDocSnap.data();
          const progressData = {
            ...data,
            lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : new Date(),
            // Ensure sectionStates and answers are properly initialized if they are missing from Firestore
            sectionStates: data.sectionStates || {},
          } as NewWorksheetStudentProgress;
           // Deep merge or ensure answers structure exists for each section
           cpuArchitectureLesson.sections.forEach(sec => {
             if (!progressData.sectionStates[sec.id]) {
               progressData.sectionStates[sec.id] = { isCompleted: false, isAttempted: false, answers: {} };
             } else if (!progressData.sectionStates[sec.id].answers) {
                progressData.sectionStates[sec.id].answers = {};
             }
           });
          setInitialProgress(progressData);
        } else {
          setInitialProgress(undefined); // No existing progress, NewWorksheetPlayer will initialize
        }
      } catch (error) {
        console.error("Error fetching lesson or progress:", error);
        setLessonData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonAndProgress();
  }, [worksheetId, userProfile?.uid, router, isLoading]);

  const handleSaveProgress = async (progress: NewWorksheetStudentProgress) => {
    if (!userProfile?.uid || !lessonData) return;
    try {
      const progressDocRef = doc(db, "studentNewWorksheetProgress", `${userProfile.uid}_${lessonData.id}`);
      const dataToSave = {
        ...progress,
        studentId: userProfile.uid,
        worksheetId: lessonData.id,
        lastUpdated: serverTimestamp()
      };
      await setDoc(progressDocRef, dataToSave, { merge: true });
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl animate-pulse">Loading Lesson...</p></div>;
  }

  if (!lessonData) {
    return <div className="flex flex-col justify-center items-center h-screen"><p className="text-xl text-red-500">Error: Lesson data could not be loaded for ID '{worksheetId}'.</p><button onClick={() => router.push('/student/assignments')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Back to Assignments</button></div>;
  }
  
  if (!userProfile?.uid) {
      return <div className="flex justify-center items-center h-screen"><p className="text-xl text-red-500">User not authenticated. Redirecting...</p></div>;
  }

  return (
    <NewWorksheetPlayer
      worksheetData={lessonData}
      initialProgress={initialProgress}
      onSaveProgress={handleSaveProgress}
      studentId={userProfile.uid}
    />
  );
};

export default NewWorksheetPage;
"""
})

# Remove placeholder for Bus Simulation JS Logic as it's now in the component
# FILES_TO_CREATE.append({ ... public/js/busSimulationLogic.js ... })


# --- Script Logic ---
def create_files():
    """Creates the directory structure and files."""
    for file_info in FILES_TO_CREATE:
        file_path = PROJECT_ROOT / file_info['path']
        print(f"Processing: {file_path}")

        try:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            # print(f"  Ensured directory: {file_path.parent}") # Less verbose
        except Exception as e:
            print(f"  ERROR creating directory {file_path.parent}: {e}")
            continue
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(file_info['content'])
            print(f"  SUCCESS: Created/Overwrote {file_path}")
        except IOError as e:
            print(f"  ERROR writing file {file_path}: {e}")
        except Exception as e:
            print(f"  UNEXPECTED ERROR for file {file_path}: {e}")


if __name__ == "__main__":
    print(f"Project root is set to: {PROJECT_ROOT.resolve()}")
    confirm = input(
        "This script will create/overwrite files in the specified project structure.\\n"
        "Ensure this script is in your Next.js project root, or PROJECT_ROOT is correctly set.\\n"
        "BACKUP ANY EXISTING FILES IN TARGET DIRECTORIES IF NEEDED.\\n"
        "Are you sure you want to continue? (yes/no): "
    )
    if confirm.lower() == 'yes':
        create_files()
        print("\\n--- Script Finished ---")
        print("Next steps:")
        print("1. Review the created files in your project (src/types, src/data, src/components/worksheets-new, src/app/(platform)/student/worksheets-new).")
        print("2. Run 'npm install' or 'yarn install' for: isomorphic-dompurify, html-react-parser, lodash (and @types/lodash if not already present).")
        print("3. CRITICAL: Review and complete the JavaScript logic for:")
        print("   - Task 1: DiagramLabelDragDropDisplay.tsx (checkDiagram function and precise styling/positioning).")
        print("   - Task 4: BusSimulationSectionDisplay.tsx (verify animation timing, packet movements, and bus line active states).")
        print("4. Ensure your global CSS (e.g., from your original style.css) and Tailwind CSS setup correctly style all elements. You may need to manually transfer or adapt specific styles.")
        print("5. Compile and run your Next.js application (e.g., 'npm run dev').")
        print("6. Thoroughly test all components, interactions, responsiveness, progress saving, and PDF export.")
    else:
        print("Operation cancelled by the user.")

