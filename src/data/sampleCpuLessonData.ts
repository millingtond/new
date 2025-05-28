// src/data/sampleCpuLessonData.ts
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

const task1IntroText = "<p class=\"mb-4 text-gray-700\">Drag the labels from the bank below onto the correct component boxes in the diagram. Hover over the <i class=\"fas fa-circle-question text-gray-500\"></i> icons for hints!</p>";
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


const task2IntroText = "<p class=\"mb-4 text-gray-700\">Match the CPU component or register on the left with its correct description on the right. Click one item from each list to create a pair.</p>";
const task2MatchItems: MatchItem[] = [
  { id: "cu", text: "Control Unit (CU)" }, { id: "alu", text: "ALU" }, { id: "cache", text: "Cache" }, { id: "registers", text: "Registers" }, { id: "pc", text: "Program Counter (PC)" }, { id: "mar", text: "MAR" }, { id: "mdr", text: "MDR" }, { id: "acc", text: "Accumulator" },
];
const task2Descriptions: MatchDescriptionItem[] = [
  { id: "desc-mar", text: "Holds the memory address being read from or written to.", matchesTo: "mar" }, { id: "desc-alu", text: "Performs calculations and logical comparisons.", matchesTo: "alu" }, { id: "desc-pc", text: "Holds the address of the next instruction to be fetched.", matchesTo: "pc" }, { id: "desc-cu", text: "Decodes instructions and controls data flow.", matchesTo: "cu" }, { id: "desc-acc", text: "Stores the results of calculations temporarily.", matchesTo: "acc" }, { id: "desc-mdr", text: "Temporarily holds data transferred to/from memory.", matchesTo: "mdr" }, { id: "desc-cache", text: "Small, fast memory on the CPU for frequently used data.", matchesTo: "cache" }, { id: "desc-registers", text: "General term for small, fast memory locations inside the CPU.", matchesTo: "registers" },
];

const task3IntroText = "<p class=\"mb-4 text-gray-700\">Click on each register below to learn more about its specific function.</p>";
const task3Registers: RegisterInfo[] = [
  { id: "pc", name: "PC", displayName: "Program Counter (PC)", description: cpuLessonKeywords["pc"]?.definition || "Info not found." }, { id: "mar", name: "MAR", displayName: "Memory Address Register (MAR)", description: cpuLessonKeywords["mar"]?.definition || "Info not found." }, { id: "mdr", name: "MDR", displayName: "Memory Data Register (MDR)", description: cpuLessonKeywords["mdr"]?.definition || "Info not found." }, { id: "cir", name: "CIR", displayName: "Current Instruction Register (CIR)", description: cpuLessonKeywords["cir"]?.definition || "Info not found." }, { id: "acc", name: "ACC", displayName: "Accumulator (ACC)", description: cpuLessonKeywords["acc"]?.definition || "Info not found." },
];

const task4IntroText = "<p class=\"mb-4 text-gray-700\">Click the buttons to see how the different <keyword data-key=\"buses\">buses</keyword> are used for reading from and writing to <keyword data-key=\"ram\">RAM</keyword>.</p>";

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

const task5IntroText = "<p class=\"mb-4 text-gray-700\">For each scenario, choose the register that is primarily involved.</p>";
const commonRegisterOptions: ScenarioOption[] = [
  { text: "Program Counter (PC)", value: "PC" }, { text: "Memory Address Register (MAR)", value: "MAR" }, { text: "Memory Data Register (MDR)", value: "MDR" }, { text: "Accumulator (ACC)", value: "ACC" },
];
const task5Scenarios: Scenario[] = [
  { id: "scenario1-pc", questionText: "<p class=\"font-medium mb-2\">Scenario 1: The CPU is about to fetch the next instruction. Which register holds the *address* of this instruction?</p>", options: commonRegisterOptions, correctAnswerValue: "PC" },
  { id: "scenario2-mdr", questionText: "<p class=\"font-medium mb-2\">Scenario 2: An instruction <code class=\"text-sm bg-gray-200 px-1 rounded\">ADD 6</code> has just been fetched from memory... Which register temporarily holds this instruction data?</p>", options: commonRegisterOptions, correctAnswerValue: "MDR" },
  { id: "scenario3-acc", questionText: "<p class=\"font-medium mb-2\">Scenario 3: The result of <code class=\"text-sm bg-gray-200 px-1 rounded\">5 + 3</code> was just calculated by the ALU. Which register is most likely holding the result (8)?</p>", options: commonRegisterOptions, correctAnswerValue: "ACC" }
];

const task6IntroText = "<p class=\"mb-4 text-gray-700\">Fill in the missing keywords in the sentences below.</p>";
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

const task8IntroText = "<p class=\"mb-4 text-gray-700\">Answer these exam-style questions. Use the 'Show Mark Scheme' button to check your understanding against the key points.</p>";
const CHARS_PER_MARK_FOR_ATTEMPT = 20;
const task8ExamQuestions: ExamQuestion[] = [
  { id: "exam-q-pc", questionText: "<h4 class=\"mb-3 font-medium text-gray-800\">1. Describe the purpose of the Program Counter (PC) in the fetch-decode-execute cycle. (<span class=\"marks-value\">2</span> marks)</h4>", marks: 2, answerPlaceholder: "Type your description here...", charsPerMarkForAttempt: CHARS_PER_MARK_FOR_ATTEMPT, markScheme: `<p><strong>Mark Scheme (PC):</strong></p><ul class="list-disc list-inside ml-4 text-sm"><li>A register (1 mark)</li><li>that holds a single address (1 mark)</li><li>of the next instruction to be fetched/run during the fetch-execute cycle (1 mark)</li></ul><p class="text-xs italic mt-1">(Max 2 marks)</p>` },
  { id: "exam-q-mar-mdr", questionText: "<h4 class=\"mb-3 font-medium text-gray-800\">2. Explain the role of the Memory Address Register (MAR) and the Memory Data Register (MDR) when fetching an instruction from RAM. (<span class=\"marks-value\">4</span> marks)</h4>", marks: 4, answerPlaceholder: "Explain the roles of both MAR and MDR...", charsPerMarkForAttempt: CHARS_PER_MARK_FOR_ATTEMPT, markScheme: `<p><strong>Mark Scheme (MAR/MDR Fetch):</strong></p><ul class="list-disc list-inside ml-4 text-sm"><li>MAR stores the memory address (1 mark)</li><li>of the instruction/data to be fetched/accessed (1 mark)</li><li>MDR stores the instruction/data (1 mark)</li><li>that has been fetched/read from memory (1 mark)</li></ul><p class="text-xs italic mt-1">(Max 4 marks)</p>` },
  { id: "exam-q-acc", questionText: "<h4 class=\"mb-3 font-medium text-gray-800\">3. Describe the purpose of the Accumulator (ACC). (<span class=\"marks-value\">2</span> marks)</h4>", marks: 2, answerPlaceholder: "Type your description here...", charsPerMarkForAttempt: CHARS_PER_MARK_FOR_ATTEMPT, markScheme: `<p><strong>Mark Scheme (ACC):</strong></p><ul class="list-disc list-inside ml-4 text-sm"><li>A register used with the ALU (1 mark)</li><li>that stores the result of a process/calculation (1 mark)</li></ul><p class="text-xs italic mt-1">(Max 2 marks)</p>` }
];

const relatedVideosIntroText = "<p class=\"text-gray-700\">Watch these videos to reinforce your understanding of CPU components and architecture:</p>";
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
  { text: "How factors like <keyword data-key=\"clock speed\">Clock Speed</keyword>, number of <keyword data-key=\"cores\">Cores</keyword>, and <keyword data-key=\"cache\">Cache</keyword> size affect CPU performance", specReference: "Spec 1.1.2" },
  { text: "<keyword data-key=\"embedded systems\">Embedded Systems</keyword>", specReference: "Spec 1.1.3" },
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
    { id: 's1-starter', type: 'StarterActivity', title: 'Starter Activity (5 mins)', isActivity: true, introText: '<p class="font-semibold text-yellow-800">Initial Thoughts:</p><p>Before we dive into the CPU\'s internal parts, what do you *think* these components might do? Don\'t worry if you\'re unsure – we\'ll cover them in this lesson! Just jot down any initial ideas.</p>', questions: starterQuestions } as StarterActivitySection,
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
