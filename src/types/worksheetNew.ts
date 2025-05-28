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
  isCompleted?: boolean; // For non-activity sections, user marks as read
  isAttempted?: boolean; // For activity sections, if any part has been interacted with
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
  options?: string[]; // For multipleChoice
  placeholder?: string; // For shortAnswer
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
  outcomes: string[]; // Array of outcome strings
  isActivity: false;
}

export interface DraggableLabelItem {
  id: string; // Unique ID for the draggable label, e.g., "label-pc"
  text: string; // Text displayed on the label, e.g., "PC"
  dataLabel: string; // The underlying correct identifier, e.g., "pc" (matches a dataCorrect value in DropZoneConfig)
}

export interface DropZoneConfig {
  id: string; // Unique ID for the drop zone, e.g., "drop-zone-registers"
  title?: string; // Optional title displayed on the drop zone itself (e.g., "Registers")
  correctLabels: string[]; // Array of `dataLabel`s from DraggableLabelItem that are correct for this zone
  hint?: string; // Hint text to display on hover
  allowMultiple: boolean; // Whether this zone can accept multiple draggable items
  maxItems?: number; // Optional: if allowMultiple is true, max number of items
  // Styling and positioning should ideally be handled by CSS targeting the `id` or dedicated classes.
  // However, inline styles can be an option for very specific dynamic positioning if necessary.
  style?: React.CSSProperties; 
  className?: string; // Additional CSS classes for styling the drop zone
  placeholderText?: string; // Text to show when the zone is empty (e.g., "Drop registers here")
}

export interface DiagramLabelDragDropSection extends BaseSection {
  type: 'DiagramLabelDragDrop';
  introText: string; // HTML content for introduction
  diagramImageUrl?: string; // Optional URL for a background diagram image
  dropZones: DropZoneConfig[]; // Configuration for each droppable area
  labels: DraggableLabelItem[]; // All available draggable labels
  isActivity: true;
}
// Answer structure for DiagramLabelDragDrop in student progress:
// progress.sectionStates[section.id].answers will be:
// { [dropZoneId: string]: { placedLabelIds: string[], isCorrect?: boolean } }
// where placedLabelIds is an array of DraggableLabelItem.id

export interface MatchItem {
  id: string; 
  text: string; 
}

export interface MatchDescriptionItem {
  id: string; 
  text: string; 
  matchesTo: string; // The id of the MatchItem it correctly matches
}

export interface MatchingTaskSection extends BaseSection {
  type: 'MatchingTask';
  introText: string;
  matchItemsTitle: string; 
  descriptionItemsTitle: string; 
  items: MatchItem[];
  descriptions: MatchDescriptionItem[];
  isActivity: true;
}

export interface RegisterInfo {
  id: string; 
  name: string; 
  displayName: string; 
  description: string;
}

export interface RegisterExplorerSection extends BaseSection {
  type: 'RegisterExplorer';
  introText: string;
  registers: RegisterInfo[];
  isActivity: true; 
}

export interface BusSimulationSection extends BaseSection {
  type: 'BusSimulation';
  introText: string;
  isActivity: true; // Or false if it's purely demonstrative with no student input to save
  // Potentially add iframeUrl or other config if embedding an external simulation
  iframeUrl?: string;
}

export interface ScenarioOption {
  text: string;
  value: string; 
}

export interface Scenario {
  id: string; 
  questionText: string; 
  options: ScenarioOption[];
  correctAnswerValue: string; 
}

export interface ScenarioQuestionSection extends BaseSection {
  type: 'ScenarioQuestion';
  introText: string;
  scenarios: Scenario[];
  isActivity: true;
}

export interface FillBlankSentence {
  id: string; 
  leadingText?: string; 
  trailingText?: string; 
  placeholder: string; 
  correctAnswers: string[]; 
  fullSentenceStructure?: string; 
}

export interface FillTheBlanksSection extends BaseSection {
  type: 'FillTheBlanks';
  introText: string;
  sentences: FillBlankSentence[];
  isActivity: true;
}

export interface QuizQuestion {
  id: string; 
  questionText: string;
  options: string[];
  correctAnswer: string; 
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface MultipleChoiceQuizSection extends BaseSection {
  type: 'MultipleChoiceQuiz';
  questions: QuizQuestion[];
  isActivity: true;
}

export interface ExamQuestion {
  id: string; 
  questionText: string; 
  marks: number; 
  answerPlaceholder?: string;
  markScheme: string; 
  charsPerMarkForAttempt?: number; 
  minLengthForAttempt?: number; 
}

export interface ExamQuestionsSection extends BaseSection {
  type: 'ExamQuestions';
  introText?: string;
  questions: ExamQuestion[];
  isActivity: true;
}

export interface VideoEntry {
  id: string; 
  title: string; 
  embedUrl: string; 
  notesPlaceholder?: string; 
}

export interface VideoPlaceholderSection extends BaseSection {
  type: 'VideoPlaceholder';
  introText?: string; 
  videos: VideoEntry[];
  isActivity: false; // Viewing is passive, notes are optional self-study.
                     // If notes become a graded/tracked activity, set to true.
}

export interface KeyTakeawaysSection extends BaseSection { 
  type: 'KeyTakeaways';
  content: string; // HTML content for RichTextSectionDisplay
  isActivity: false;
}

export interface WhatsNextLink {
  text: string; 
  url?: string; 
  specReference?: string; 
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

export interface NewWorksheetStudentProgress {
  worksheetId: string;
  studentId: string;
  currentSectionIndex: number;
  sectionStates: Record<string, { // Keyed by section.id
    isCompleted: boolean; // For non-activities: marked as read. For activities: all parts are correct/done.
    isAttempted?: boolean; // True if any part of an activity section has been interacted with.
    answers?: Record<string, TaskAttempt | any>; // Keyed by question/item.id within a section. 'any' for complex answers.
                                              // For DiagramLabelDragDrop, this would be:
                                              // { [dropZoneId: string]: { placedLabelIds: string[], isCorrect?: boolean } }
  }>;
  overallStatus: 'not-started' | 'in-progress' | 'completed';
  lastUpdated: Date; // Firestore Timestamp will be converted to Date on load
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
  | KeyTakeawaysSection 
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
  id: string; // e.g., j277-1-1-cpu-architecture
  title: string;
  course: string; // e.g., GCSE Computer Science (J277)
  unit: string; // e.g., Topic 1.1.1: CPU Components & Architecture
  sections: WorksheetSection[];
  keywordsData?: Record<string, { definition: string; link?: string }>; // Optional global keywords for the worksheet
}
