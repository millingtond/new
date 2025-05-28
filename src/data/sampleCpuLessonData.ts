// src/data/sampleCpuLessonData.ts
import {
  NewWorksheet,
  StaticTextSection,
  StarterActivitySection, StarterQuestion,
  LessonOutcomesSection,
  DiagramLabelDragDropSection, DraggableLabelItem, DropZoneConfig, // Keep for other potential D&D tasks
  MatchingTaskSection, MatchItem, MatchDescriptionItem,
  RegisterExplorerSection, RegisterInfo,
  BusSimulationSection, // This will be used for the embedded diagram task
  ScenarioQuestionSection, Scenario, ScenarioOption,
  FillTheBlanksSection, FillBlankSentence,
  MultipleChoiceQuizSection, QuizQuestion,
  ExamQuestionsSection, ExamQuestion,
  VideoPlaceholderSection, VideoEntry,
  WhatsNextSection, WhatsNextLink,
  ExtensionActivitiesSection, ExtensionActivity,
  KeyTakeawaysSection,
} from '@/types/worksheetNew';

// Define keywords that will be used throughout the lesson
export const cpuArchKeywords = {
  "cpu": { definition: "Central Processing Unit: The primary component of a computer that executes instructions. Often called the 'brain' of the computer." },
  "von neumann architecture": { definition: "A computer architecture that uses a single address space for both instructions and data. Instructions are fetched, decoded, and executed sequentially." },
  "memory": { definition: "A component that stores data and program instructions for use by the CPU. Usually refers to RAM (Random Access Memory)." },
  "buses": { definition: "Sets of parallel wires that connect components of a computer system, allowing data and control signals to be transmitted between them." },
  "control unit": { definition: "A component of the CPU that directs and coordinates most of the operations in the computer. It fetches instructions from memory and decodes them." },
  "alu": { definition: "Arithmetic Logic Unit: A component of the CPU that performs arithmetic operations (addition, subtraction, etc.) and logical operations (AND, OR, NOT, comparisons)." },
  "cache": { definition: "A small, fast type of memory that stores frequently accessed data and instructions to speed up CPU processing." },
  "registers": { definition: "Small, high-speed storage locations directly within the CPU used to temporarily hold data and instructions during processing." },
  "pc": { definition: "Program Counter: A register in the CPU that holds the memory address of the next instruction to be executed." },
  "mar": { definition: "Memory Address Register: A CPU register that holds the memory address of the data or instruction to be fetched from or written to memory." },
  "mdr": { definition: "Memory Data Register: A CPU register that temporarily stores data being transferred to or from memory. It acts as a buffer." },
  "cir": { definition: "Current Instruction Register: A CPU register that holds the instruction currently being decoded and executed." },
  "acc": { definition: "Accumulator: A register in the CPU in which intermediate arithmetic and logic results are stored." },
  "address bus": { definition: "A bus that carries memory addresses from the CPU to other components such as primary storage and input/output devices. It is unidirectional." },
  "data bus": { definition: "A bus that carries data between the CPU and other components. It is bidirectional." },
  "control bus": { definition: "A bus that carries control signals from the CPU to direct and coordinate the activities of other components. It is bidirectional." },
  "fetch-decode-execute cycle": { definition: "The fundamental process by which a CPU operates: fetching an instruction from memory, decoding it to understand the required action, and then executing that action." },
};

// --- Define all your sections here as constants ---

const introSection: StaticTextSection = {
  id: 's0-cpu-arch-intro',
  title: 'Introduction: The Heart of the Computer',
  type: 'StaticText',
  isActivity: false,
  content: `<p>Welcome to our exploration of the <keyword data-key="cpu">CPU</keyword> and the Von Neumann architecture! The CPU is the 'brain' of the computer, responsible for processing instructions and performing calculations. This lesson will break down its core components and how they work together based on the foundational Von Neumann design.</p>`,
};

const starterActivity: StarterActivitySection = {
  id: 's1-cpu-arch-starter',
  title: 'Warm-Up: What Do You Already Know?',
  type: 'StarterActivity',
  isActivity: true,
  introText: '<p>Before we dive in, let\'s see what you already know about the CPU and its components. Don\'t worry if you\'re not sure – this is just to get you thinking!</p>',
  questions: [
    { id: 'starter-q1', questionText: 'In one sentence, what do you think the main job of a CPU is?', questionType: 'shortAnswer', placeholder: 'e.g., Thinking, calculating...', minLengthForAttempt: 10 },
    { id: 'starter-q2', questionText: 'Have you heard of "Von Neumann Architecture" before? If so, what do you think it might be?', questionType: 'shortAnswer', placeholder: 'Any ideas?', minLengthForAttempt: 5 },
    { id: 'starter-q3', questionText: 'Name any part of a CPU you might have heard of.', questionType: 'shortAnswer', placeholder: 'e.g., A core, a clock...', minLengthForAttempt: 3 },
    { id: 'starter-q4', questionText: 'What is "memory" in a computer typically used for?', questionType: 'shortAnswer', placeholder: 'e.g., Storing files, running programs...', minLengthForAttempt: 10 },
  ],
};

const lessonOutcomes: LessonOutcomesSection = {
  id: 's2-cpu-arch-outcomes',
  title: 'Today\'s Learning Objectives',
  type: 'LessonOutcomes',
  isActivity: false,
  outcomes: [
    "Describe the main components of the Von Neumann architecture (CPU, Memory, Buses).",
    "Identify the key components within the CPU: Control Unit (CU), Arithmetic Logic Unit (ALU), Cache, and Registers.",
    "Explain the specific function of the CU and the ALU.",
    "Name and describe the purpose of key CPU registers: PC, MAR, MDR, ACC, CIR.",
    "Explain the purpose of the Address Bus, Data Bus, and Control Bus in transferring data and signals.",
  ],
};

// Section for the embedded Diagram Labeling Task
// Using BusSimulationSection type because it has an iframeUrl property.
// You might consider creating a more generic "EmbeddedContentSection" type in the future.
const embeddedDiagramLabelTask: BusSimulationSection = { // Changed type
  id: 's3-task1-diagram-label-embed', // New unique ID
  type: 'BusSimulation', // Re-using this type for its iframeUrl capability
  title: 'Task 1: Label the CPU Components (Interactive Diagram)',
  isActivity: true, // Mark as activity; completion might be manual or iframe communication (advanced)
  introText: "<p>The following diagram is an interactive task. Please complete it in the embedded window. Your progress within this specific embedded task might not be automatically saved with the rest of the worksheet unless specifically designed to communicate back.</p>",
  iframeUrl: "/simulations/cpu-diagram-task/index.html", // <<<< IMPORTANT: Update this path
  // Removed: labels, dropZones as they are for the React DND
};


const matchingTaskSection: MatchingTaskSection = { 
    id: 's4-matching-task',
    type: 'MatchingTask',
    title: 'Task 2: Match Components to Descriptions',
    isActivity: true,
    introText: 'Match the component/register with its correct description.',
    matchItemsTitle: 'Component/Register',
    descriptionItemsTitle: 'Description',
    items: [
        { id: 'match-cu', text: 'Control Unit' }, { id: 'match-alu', text: 'ALU' },
        { id: 'match-pc', text: 'Program Counter (PC)' }, { id: 'match-mar', text: 'MAR'},
        { id: 'match-mdr', text: 'MDR'}, { id: 'match-acc', text: 'Accumulator'}, { id: 'match-cir', text: 'CIR'}
    ],
    descriptions: [
        { id: 'desc-cu', text: 'Decodes instructions and manages data flow.', matchesTo: 'match-cu'},
        { id: 'desc-alu', text: 'Performs calculations and logical comparisons.', matchesTo: 'match-alu'},
        { id: 'desc-pc', text: 'Holds the address of the next instruction.', matchesTo: 'match-pc'},
        { id: 'desc-mar', text: 'Holds the memory address to be accessed.', matchesTo: 'match-mar'},
        { id: 'desc-mdr', text: 'Temporarily holds data/instructions from/to memory.', matchesTo: 'match-mdr'},
        { id: 'desc-acc', text: 'Stores intermediate results of ALU operations.', matchesTo: 'match-acc'},
        { id: 'desc-cir', text: 'Holds the current instruction being processed.', matchesTo: 'match-cir'},
    ]
};

const registerExplorerSection: RegisterExplorerSection = { 
    id: 's5-register-explorer',
    type: 'RegisterExplorer',
    title: 'Task 3: Explore the Registers',
    isActivity: true, 
    introText: 'Click on each register to learn more about its function.',
    registers: [
        {id: 'reg-pc', name: 'PC', displayName: 'Program Counter (PC)', description: cpuArchKeywords['pc']?.definition || "Definition not found."},
        {id: 'reg-mar', name: 'MAR', displayName: 'Memory Address Register (MAR)', description: cpuArchKeywords['mar']?.definition || "Definition not found."},
        {id: 'reg-mdr', name: 'MDR', displayName: 'Memory Data Register (MDR)', description: cpuArchKeywords['mdr']?.definition || "Definition not found."},
        {id: 'reg-acc', name: 'ACC', displayName: 'Accumulator (ACC)', description: cpuArchKeywords['acc']?.definition || "Definition not found."},
        {id: 'reg-cir', name: 'CIR', displayName: 'Current Instruction Register (CIR)', description: cpuArchKeywords['cir']?.definition || "Definition not found."},
    ]
};

// Conceptual Bus Explanation (was BusSimulationSection, now simpler StaticText or keep as non-iframe BusSimulation)
const busExplanationSection: StaticTextSection = { // Changed to StaticText for simplicity if no simulation
    id: 's6-bus-explanation', // Renamed from s6-bus-simulation to avoid confusion
    type: 'StaticText',
    title: 'Understanding Buses (Conceptual)',
    isActivity: false, 
    content: `<p>Three main pathways, or <keyword data-key="buses">buses</keyword>, connect the CPU and Memory:</p>
        <ul class="list-disc list-inside ml-4">
            <li>The <strong class="font-semibold"><keyword data-key="address bus">Address Bus</keyword></strong> carries memory addresses from the CPU to Memory. It's like the postal address telling where data should go or come from. It is unidirectional (CPU to Memory).</li>
            <li>The <strong class="font-semibold"><keyword data-key="data bus">Data Bus</keyword></strong> carries the actual data or instruction between the CPU and Memory. This is like the mail truck carrying the package. It is bidirectional.</li>
            <li>The <strong class="font-semibold"><keyword data-key="control bus">Control Bus</keyword></strong> carries command and control signals from the CPU to manage and synchronize activities of other components (e.g., memory read/write signals, clock signals). It is bidirectional.</li>
        </ul>`,
};

const realWorldContextSection: StaticTextSection = {
    id: 's7-real-world',
    type: 'StaticText',
    title: 'Real-World Context: Inside Your Computer',
    isActivity: false,
    content: `<p>The Von Neumann architecture isn't just a theoretical model; it's the fundamental design behind almost every computer, smartphone, and tablet you use. The <keyword data-key="cpu">CPU</keyword> itself is a complex microchip, while <keyword data-key="memory">memory</keyword> (RAM) consists of separate modules. These are all connected on a motherboard via physical pathways that act as the <keyword data-key="buses">buses</keyword> we've discussed.</p>`
};

const mythBustersSection: StaticTextSection = {
    id: 's8-myth-busters',
    type: 'StaticText',
    title: 'Myth Busters!',
    isActivity: false,
    content: `<ul class="list-disc list-inside space-y-2">
                <li><strong>Myth:</strong> The CPU does everything instantly. <br/><strong>Reality:</strong> Every instruction goes through the <keyword data-key="fetch-decode-execute cycle">Fetch-Decode-Execute cycle</keyword>, which takes a small but measurable amount of time.</li>
                <li><strong>Myth:</strong> All registers are the same. <br/><strong>Reality:</strong> Registers like the <keyword data-key="pc">PC</keyword>, <keyword data-key="mar">MAR</keyword>, <keyword data-key="mdr">MDR</keyword>, <keyword data-key="acc">ACC</keyword>, and <keyword data-key="cir">CIR</keyword> have very specific, distinct roles.</li>
              </ul>`
};

const examQuestionsSection: ExamQuestionsSection = { 
    id: 's9-exam-practice',
    type: 'ExamQuestions',
    title: 'Task 5: Exam Practice',
    isActivity: true,
    introText: 'Answer these exam-style questions to test your understanding.',
    questions: [
        { id: 'exam-q1', questionText: 'Describe the role of the Program Counter (PC) in the Von Neumann architecture. (2 marks)', marks: 2, answerPlaceholder: 'Your answer...', minLengthForAttempt: 20, markScheme: '<ul><li>Holds the memory address (1 mark)</li><li>Of the <strong>next</strong> instruction to be fetched (1 mark)</li></ul>' },
        { id: 'exam-q2', questionText: 'Explain the purpose of the Address Bus. (2 marks)', marks: 2, answerPlaceholder: 'Your answer...', minLengthForAttempt: 20, markScheme: '<ul><li>Carries memory addresses (1 mark)</li><li>From the CPU to main memory (or other components) / Unidirectional (1 mark)</li></ul>' },
        { id: 'exam-q3', questionText: 'State two components of the CPU and briefly describe the function of each. (4 marks)', marks: 4, answerPlaceholder: 'Component 1 + Function, Component 2 + Function...', minLengthForAttempt: 40, markScheme: '<ul><li>E.g., Control Unit (1): Fetches, decodes instructions / Manages FDE cycle (1).</li><li>ALU (1): Performs arithmetic/logical operations (1).</li><li>(Accept Cache or Registers with appropriate functions)</li></ul>' },
    ]
};

const videoSection: VideoPlaceholderSection = { 
    id: 's10-videos',
    type: 'VideoPlaceholder',
    title: 'Related Videos',
    isActivity: false, 
    introText: 'Watch these videos to deepen your understanding:',
    videos: [
        {id: 'vid1', title: 'The CPU and Von Neumann Architecture', embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', notesPlaceholder: 'Your notes for video 1...'},
        {id: 'vid2', title: 'CPU Registers Explained', embedUrl: 'https://www.youtube.com/embed/oHg5SJYRHA0', notesPlaceholder: 'Your notes for video 2...'},
    ]
};

const keyTakeawaysSection: KeyTakeawaysSection = { 
    id: 's11-takeaways',
    type: 'KeyTakeaways', 
    title: 'Key Takeaways',
    isActivity: false,
    content: `<ul class="list-disc list-inside space-y-1">
                <li>The <strong>Von Neumann Architecture</strong> uses a single memory space for instructions and data, a CPU, and buses.</li>
                <li>The <strong>CPU</strong> contains the <keyword data-key="control unit">Control Unit</keyword> (manages operations), <keyword data-key="alu">ALU</keyword> (calculations/logic), <keyword data-key="cache">Cache</keyword> (fast memory), and <keyword data-key="registers">Registers</keyword> (temporary storage).</li>
                <li>Key registers include: <strong>PC</strong> (next instruction address), <strong>MAR</strong> (memory address to access), <strong>MDR</strong> (data buffer for memory), <strong>ACC</strong> (ALU results), <strong>CIR</strong> (current instruction).</li>
                <li><strong>Buses</strong> (Address, Data, Control) are pathways for transferring addresses, data, and control signals.</li>
              </ul>`
};

const whatsNextSection: WhatsNextSection = { 
    id: 's12-whats-next',
    type: 'WhatsNext',
    title: 'What\'s Next?',
    isActivity: false,
    description: '<p>Now that you understand the fundamental architecture of the CPU, we will move on to explore factors affecting its performance and how CPUs are used in different types of computer systems.</p>',
    links: [
        { text: 'CPU Performance Factors (Clock Speed, Cores, Cache)', specReference: 'J277 1.1.2', url: '/gcse/j277/1-1-2-cpu-performance'},
        { text: 'Embedded Systems', specReference: 'J277 1.1.3', url: '/gcse/j277/1-1-3-embedded-systems'},
    ]
};

const extensionActivitiesSection: ExtensionActivitiesSection = { 
    id: 's13-extension',
    type: 'ExtensionActivities',
    title: 'Extension Activities (Beyond GCSE)',
    isActivity: true,
    introText: 'Challenge yourself with these activities that explore concepts beyond the GCSE specification:',
    activities: [
        {id: 'ext1', title: 'Harvard Architecture vs. Von Neumann', description: 'Research the Harvard architecture. What are its key differences from Von Neumann, and what are its advantages and common use cases (e.g., in DSPs)?', placeholder: 'Your research notes on Harvard architecture...'},
        {id: 'ext2', title: 'Instruction Pipelining', description: 'Investigate how instruction pipelining works in modern CPUs to improve throughput. What are pipeline hazards?', placeholder: 'Your notes on pipelining and hazards...'},
    ]
};


// --- Assemble and Export the Main Lesson Object ---
export const cpuArchitectureLesson: NewWorksheet = {
  id: 'j277-1-1-cpu-architecture', 
  title: 'Inside the CPU: Components & Von Neumann Architecture',
  course: 'GCSE Computer Science (J277)',
  unit: 'Topic 1.1.1: CPU Components & Architecture',
  keywordsData: cpuArchKeywords,
  sections: [
    introSection,
    starterActivity,
    lessonOutcomes,
    embeddedDiagramLabelTask, // Replaced diagramLabelSection with the embedded version
    matchingTaskSection,
    registerExplorerSection,
    busExplanationSection, // Using the simpler static text explanation for buses
    realWorldContextSection,
    mythBustersSection,
    examQuestionsSection,
    videoSection,
    keyTakeawaysSection,
    whatsNextSection,
    extensionActivitiesSection,
  ],
};
