// src/data/sampleCpuLessonData.ts
import {
  NewWorksheet,
  StaticTextSection,
  StarterActivitySection, StarterQuestion,
  LessonOutcomesSection,
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
  KeyTakeawaysSection,
} from '@/types/worksheetNew';

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
  "example": { definition: "This is an example tooltip!"}
};

// --- DEFINING SECTIONS AS PER USER'S NEW STRUCTURE ---

const userStarterActivity: StarterActivitySection = {
  id: 's0-starter-activity', // Unique ID for this section
  title: 'Starter Activity - Initial Thoughts:',
  type: 'StarterActivity',
  isActivity: true,
  introText: "<p>Before we dive into the CPU's internal parts, what do you *think* these components might do? Don't worry if you're unsure – we'll cover them in this lesson! Just jot down any initial ideas.</p>",
  questions: [
    { id: 'starter-cu', questionText: '<strong>Control Unit (CU):</strong>&nbsp;What might this control?', questionType: 'shortAnswer', placeholder: 'Your initial thoughts...', minLengthForAttempt: 5 },
    { id: 'starter-alu', questionText: '<strong>ALU (Arithmetic Logic Unit):</strong>&nbsp;What kind of operations might this perform?', questionType: 'shortAnswer', placeholder: 'Your initial thoughts...', minLengthForAttempt: 5 },
    { id: 'starter-registers', questionText: '<strong>Registers (e.g., PC, MAR, MDR):</strong>&nbsp;What could these small memory locations be used for?', questionType: 'shortAnswer', placeholder: 'Your initial thoughts...', minLengthForAttempt: 5 },
    { id: 'starter-buses', questionText: '<strong>Buses (Address, Data, Control):</strong>&nbsp;What might these pathways transfer?', questionType: 'shortAnswer', placeholder: 'Your initial thoughts...', minLengthForAttempt: 5 },
    { id: 'starter-cache', questionText: '<strong>Cache:</strong>&nbsp;Why might the CPU have a small amount of very fast memory built into it?', questionType: 'shortAnswer', placeholder: 'Your initial thoughts...', minLengthForAttempt: 5 },
  ],
};

const userLessonOutcomes: LessonOutcomesSection = {
  id: 's1-lesson-outcomes', // Unique ID
  title: 'Lesson Outcomes',
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

const userIntroduction: StaticTextSection = {
  id: 's2-introduction', // Unique ID
  title: 'Introduction',
  type: 'StaticText',
  isActivity: false, 
  content: `<p>In the previous lesson, we learned that the <keyword data-key="cpu">CPU</keyword> is the 'brain' of the computer and follows the <keyword data-key="fetch-decode-execute cycle">Fetch-Decode-Execute Cycle</keyword>.</p><p>This lesson dives deeper into how the CPU is organised based on the <strong class="font-semibold text-indigo-800"><keyword data-key="von neumann architecture">Von Neumann Architecture</keyword></strong>, and explores the key components inside the CPU, including special memory locations called <keyword data-key="registers">Registers</keyword>, that make the FDE cycle work.</p><p>Complete the tasks below to build your understanding. Hover over <keyword data-key="example">keywords</keyword> for quick definitions!</p>`,
};

const userTaskOneLink: StaticTextSection = {
  id: 's3-task-one-link', // Unique ID
  type: 'StaticText',
  title: 'Task One label the CPU components',
  isActivity: true, 
  content: `
    <p>This task involves labeling a diagram of the CPU components. Click the link below to open the interactive diagram in a new tab/window.</p>
    <p class="mt-4">
      <a 
        href="/standalone-tasks/cpu-diagram-dnd.html" 
        target="_blank" 
        rel="noopener noreferrer"
        class="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Open CPU Diagram Task <i class="fas fa-external-link-alt ml-2"></i>
      </a>
    </p>
    <p class="mt-3 text-sm text-slate-600">After completing the task on the separate page, please return to this lesson page and click "Next" to continue. Your work on the external page will not be automatically saved here, so ensure you understand the concepts before moving on.</p>
  `,
};

// --- SECTIONS FROM PREVIOUS VERSION (TASK 2 ONWARDS) ---
// These are taken from the last good state of the Canvas you provided.
const matchingTaskSection: MatchingTaskSection = {
    id: 's4-task2-matching',
    type: 'MatchingTask',
    title: 'Task 2: Match the Components & Registers',
    isActivity: true,
    introText: "<p class=\"mb-4 text-gray-700\">Match the CPU component or register on the left with its correct description on the right. Click one item from each list to create a pair.</p>",
    matchItemsTitle: "Component/Register",
    descriptionItemsTitle: "Description",
    items: [
        { id: "cu", text: "Control Unit (CU)" }, { id: "alu", text: "ALU" }, { id: "cache", text: "Cache" }, { id: "registers", text: "Registers" }, { id: "pc", text: "Program Counter (PC)" }, { id: "mar", text: "MAR" }, { id: "mdr", text: "MDR" }, { id: "acc", text: "Accumulator" }, { id: "cir", text: "CIR"}
    ],
    descriptions: [
        { id: "desc-mar", text: "Holds the memory address being read from or written to.", matchesTo: "mar" }, { id: "desc-alu", text: "Performs calculations and logical comparisons.", matchesTo: "alu" }, { id: "desc-pc", text: "Holds the address of the next instruction to be fetched.", matchesTo: "pc" }, { id: "desc-cu", text: "Decodes instructions and controls data flow.", matchesTo: "cu" }, { id: "desc-acc", text: "Stores the results of calculations temporarily.", matchesTo: "acc" }, { id: "desc-mdr", text: "Temporarily holds data transferred to/from memory.", matchesTo: "mdr" }, { id: "desc-cache", text: "Small, fast memory on the CPU for frequently used data.", matchesTo: "cache" }, { id: "desc-registers", text: "General term for small, fast memory locations inside the CPU.", matchesTo: "registers" }, { id: "desc-cir", text: "Holds the instruction currently being decoded/executed.", matchesTo: "cir"}
    ]
};

const registerExplorerSection: RegisterExplorerSection = {
    id: 's5-task3-register-explorer',
    type: 'RegisterExplorer',
    title: 'Task 3: Interactive Register Explorer',
    isActivity: true,
    introText: "<p class=\"mb-4 text-gray-700\">Click on each register below to learn more about its specific function.</p>",
    registers: [
      { id: "pc", name: "PC", displayName: "Program Counter (PC)", description: cpuArchKeywords["pc"]?.definition || "Info not found." }, { id: "mar", name: "MAR", displayName: "Memory Address Register (MAR)", description: cpuArchKeywords["mar"]?.definition || "Info not found." }, { id: "mdr", name: "MDR", displayName: "Memory Data Register (MDR)", description: cpuArchKeywords["mdr"]?.definition || "Info not found." }, { id: "cir", name: "CIR", displayName: "Current Instruction Register (CIR)", description: cpuArchKeywords["cir"]?.definition || "Info not found." }, { id: "acc", name: "ACC", displayName: "Accumulator (ACC)", description: cpuArchKeywords["acc"]?.definition || "Info not found." },
    ]
};

const busSimulationConceptualSection: BusSimulationSection = {
    id: 's6-task4-bus-simulation',
    type: 'BusSimulation',
    title: 'Task 4: Bus Simulation (Conceptual)',
    isActivity: false,
    introText: "<p class=\"mb-4 text-gray-700\">This section explains how buses work. An interactive simulation might be added later. Click the buttons to see a conceptual flow.</p>",
};

const realWorldContextSection: StaticTextSection = {
    id: 's7-real-world-connection',
    type: 'StaticText',
    title: 'Real-World Connection: The Physical CPU & Motherboard',
    isActivity: false,
    content: `<p>While we talk about components and buses abstractly, they are physical parts of a computer: The <keyword data-key="cpu">CPU</keyword> itself is a complex microchip, while <keyword data-key="memory">memory</keyword> (RAM) consists of separate modules. These are all connected on a motherboard via physical pathways that act as the <keyword data-key="buses">buses</keyword> we've discussed.</p>`
};

const mythBustersSection: StaticTextSection = {
    id: 's8-myth-busters',
    type: 'StaticText',
    title: 'Myth Busters: Common Misconceptions',
    isActivity: false,
    content: `<div class="space-y-4"><p><strong>Myth 1:</strong> "All registers are the same." <strong>Reality:</strong> Registers like PC, MAR, MDR, ACC, CIR have very specific roles.</p> <p><strong>Myth 2:</strong> "The CPU processes instructions instantly." <strong>Reality:</strong> The Fetch-Decode-Execute Cycle takes time.</p></div>`
};

const scenarioQuestionSection: ScenarioQuestionSection = {
    id: 's9-task5-scenarios',
    type: 'ScenarioQuestion',
    title: 'Task 5: Register Role Play',
    isActivity: true,
    introText: "<p class=\"mb-4 text-gray-700\">For each scenario, choose the register that is primarily involved.</p>",
    scenarios: [
        { id: "scenario1-pc", questionText: "<p class=\"font-medium mb-2\">Scenario 1: The CPU is about to fetch the next instruction. Which register holds the *address* of this instruction?</p>", options: [{text: "PC", value: "PC"}, {text: "MAR", value: "MAR"}, {text: "MDR", value: "MDR"}, {text: "ACC", value: "ACC"}], correctAnswerValue: "PC" },
        { id: "scenario2-mdr", questionText: "<p class=\"font-medium mb-2\">Scenario 2: An instruction <code class=\"text-sm bg-gray-200 px-1 rounded\">ADD 6</code> has just been fetched from memory... Which register temporarily holds this instruction data?</p>", options: [{text: "PC", value: "PC"}, {text: "MAR", value: "MAR"}, {text: "MDR", value: "MDR"}, {text: "ACC", value: "ACC"}], correctAnswerValue: "MDR" },
        { id: "scenario3-acc", questionText: "<p class=\"font-medium mb-2\">Scenario 3: The result of <code class=\"text-sm bg-gray-200 px-1 rounded\">5 + 3</code> was just calculated by the ALU. Which register is most likely holding the result (8)?</p>", options: [{text: "PC", value: "PC"}, {text: "MAR", value: "MAR"}, {text: "MDR", value: "MDR"}, {text: "ACC", value: "ACC"}], correctAnswerValue: "ACC" }
    ]
};

const fillTheBlanksSection: FillTheBlanksSection = {
    id: 's10-task6-fill-blanks',
    type: 'FillTheBlanks',
    title: 'Task 6: Complete the Sentences',
    isActivity: true,
    introText: "<p class=\"mb-4 text-gray-700\">Fill in the missing keywords in the sentences below.</p>",
    sentences: [
      { id: "fill-1", fullSentenceStructure: "1. The {blank} decodes instructions and manages the flow of data.", placeholder: "Component", correctAnswers: ["control unit", "cu"] },
      { id: "fill-2", fullSentenceStructure: "2. Arithmetic and logic operations are performed by the {blank}.", placeholder: "Component", correctAnswers: ["alu", "arithmetic logic unit"] },
      { id: "fill-3", fullSentenceStructure: "3. The {blank} holds the address of the memory location to be accessed.", placeholder: "Register", correctAnswers: ["mar", "memory address register"] },
      { id: "fill-4", fullSentenceStructure: "4. Data or instructions fetched from RAM are temporarily stored in the {blank}.", placeholder: "Register", correctAnswers: ["mdr", "memory data register"] },
      { id: "fill-5", fullSentenceStructure: "5. The concept that instructions and data are stored in the same memory is called the {blank}.", placeholder: "Concept", correctAnswers: ["stored program concept", "von neumann architecture"] },
      { id: "fill-6", fullSentenceStructure: "6. The {blank} always contains the memory address of the next instruction to be fetched.", placeholder: "Register", correctAnswers: ["pc", "program counter"] }
    ]
};

const quizSection: MultipleChoiceQuizSection = {
    id: 's11-task7-quiz',
    type: 'MultipleChoiceQuiz',
    title: 'Task 7: Check Your Knowledge Quiz',
    isActivity: true,
    questions: [
        { id: "quiz-q1", questionText: "What is the main principle of the Von Neumann architecture regarding instructions and data?", options: ["They are stored in separate memory locations", "Only instructions are stored in memory", "Instructions and data are stored in the same memory", "Data is processed directly from input devices"], correctAnswer: "Instructions and data are stored in the same memory", feedbackCorrect: "Correct! This is the Stored Program Concept.", feedbackIncorrect: "Incorrect. The key idea is that instructions and data share the same memory space (RAM)." },
    ]
};

const examQuestionsSection: ExamQuestionsSection = {
    id: 's12-task8-exam-practice',
    type: 'ExamQuestions',
    title: 'Task 8: Exam Practice Questions',
    isActivity: true,
    introText: "<p class=\"mb-4 text-gray-700\">Answer these exam-style questions. Use the 'Show Mark Scheme' button to check your understanding against the key points.</p>",
    questions: [
        { id: 'exam-q-pc', questionText: "<h4 class=\"mb-3 font-medium text-gray-800\">1. Describe the purpose of the Program Counter (PC) in the fetch-decode-execute cycle. (<span class=\"marks-value\">2</span> marks)</h4>", marks: 2, answerPlaceholder: "Type your description here...", minLengthForAttempt: 20, markScheme: `<p><strong>Mark Scheme (PC):</strong></p><ul class="list-disc list-inside ml-4 text-sm"><li>A register (1 mark)</li><li>that holds a single address (1 mark)</li><li>of the next instruction to be fetched/run during the fetch-execute cycle (1 mark)</li></ul><p class="text-xs italic mt-1">(Max 2 marks)</p>` },
    ]
};

const finalScorePlaceholder: StaticTextSection = {
    id: 's13-final-score-placeholder',
    type: 'StaticText',
    title: 'Lesson Score (Summary)',
    isActivity: false,
    content: '<p>Your overall progress and scores for the interactive tasks will be summarized at the end of the lesson when you click "View Summary".</p>'
};

const videoSection: VideoPlaceholderSection = {
    id: 's14-related-videos',
    type: 'VideoPlaceholder',
    title: 'Related Videos',
    isActivity: false,
    introText: "<p class=\"text-gray-700\">Watch these videos to reinforce your understanding of CPU components and architecture:</p>",
    videos: [
        {id: 'vid1-fde-cycle', title: '1.1 The purpose of the CPU - The fetch-execute cycle', embedUrl: 'https://www.youtube.com/embed/7Up7DIPkTzo?si=MgWM102cq8AFetLL', notesPlaceholder: 'Optional: Add any additional notes from this video...'},
    ]
};

const keyTakeawaysSection: KeyTakeawaysSection = {
    id: 's15-key-takeaways',
    type: 'KeyTakeaways',
    title: 'Key Takeaways',
    isActivity: false,
    content: `<ul class="list-disc list-inside space-y-1 text-yellow-800"><li>The <strong>Von Neumann Architecture</strong> uses a single memory space for instructions and data, a CPU, and buses.</li><li>Key CPU components include CU, ALU, Cache, and Registers.</li><li>Key registers include: PC, MAR, MDR, ACC, CIR.</li><li>Buses (Address, Data, Control) are pathways for transferring signals.</li></ul>`
};

const whatsNextSection: WhatsNextSection = {
    id: 's16-next-steps',
    type: 'WhatsNext',
    title: 'What\'s Next?',
    isActivity: false,
    description: `<p class="text-teal-800 font-medium">You now know about the key components inside the CPU and how they relate to the Von Neumann architecture!</p><p class="text-teal-700 mt-2">Next, we'll look at:</p>`,
    links: [
        { text: 'How factors like <keyword data-key="clock speed">Clock Speed</keyword>, number of <keyword data-key="cores">Cores</keyword>, and <keyword data-key="cache">Cache</keyword> size affect CPU performance', specReference: 'Spec 1.1.2', url:'/gcse/j277/1-1-2-cpu-performance'},
    ]
};

const extensionActivitiesSection: ExtensionActivitiesSection = {
    id: 's17-extension-activities',
    type: 'ExtensionActivities',
    title: 'Extension Activities',
    isActivity: true,
    introText: 'Challenge yourself with these activities that go beyond the GCSE specification:',
    activities: [
        {id: 'ext1-harvard', title: 'Harvard Architecture', description: '<p>Research the Harvard architecture and compare its advantages and disadvantages to Von Neumann.</p>', placeholder: "Advantage of separate buses? Common uses?" },
    ]
};

export const cpuArchitectureLesson: NewWorksheet = {
  id: 'j277-1-1-cpu-architecture',
  title: 'Inside the CPU: Components & Von Neumann Architecture',
  course: 'GCSE Computer Science (J277)',
  unit: 'Topic 1.1.1: CPU Components & Architecture',
  keywordsData: cpuArchKeywords,
  sections: [
    userStarterActivity,
    userLessonOutcomes,
    userIntroduction,
    userTaskOneLink,
    // Appending the rest of the tasks from the previous state
    matchingTaskSection,
    registerExplorerSection,
    busSimulationConceptualSection,
    realWorldContextSection,
    mythBustersSection,
    scenarioQuestionSection,
    fillTheBlanksSection,
    quizSection,
    examQuestionsSection,
    finalScorePlaceholder,
    videoSection,
    keyTakeawaysSection,
    whatsNextSection,
    extensionActivitiesSection,
  ],
};
