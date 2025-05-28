// src/types/worksheetNew.ts

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
