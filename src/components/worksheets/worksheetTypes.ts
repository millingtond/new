// Basic types for worksheet rendering - ensure these align with your main types in @/types/index.ts

export interface MatchItem {
  id: string; // Unique ID for this matchable item
  content: string; // HTML content or text for the item
}

export interface OrderSequenceItem {
  id: string; // Unique ID for the item (e.g., "step1", "step2")
  content: string; // HTML content or text for the item
}

export interface MultipleChoiceOption {
  id: string; // Unique ID for this option (e.g., "opt1", "opt2")
  text: string; // The text content of the option
}

export interface Blank {
  id: string; // Unique ID for this blank within the section
  placeholder?: string; // Placeholder text for the input field
  size?: number; // Optional: suggested size for the input field (e.g., character width)
  // correctAnswer?: string; // For potential future auto-grading, not used for rendering initially
}

// A segment can be a simple string (text) or a Blank object
export type FillInTheBlanksSegment = string | Blank;

export interface Hotspot {
  id: string; // Unique ID for the hotspot
  x: number; // Percentage from the left (0-100)
  y: number; // Percentage from the top (0-100)
  label: string; // The text of the label to display
  termKey?: string; // Optional: if the label is a keyword defined in keywordsData
  defaultRevealed?: boolean; // If the hotspot label should be visible by default
}

export interface Question {
  id: string;
  "ShortAnswer" | "StaticContent" | "MultipleChoiceQuestion" | string; // Allow other types for future
  prompt?: string;
  placeholder?: string;
  htmlContent?: string; // Used by StaticContent question type

  // Fields specific to MultipleChoiceQuestion
  options?: MultipleChoiceOption[];
  correctAnswerId?: string; // The ID of the correct MultipleChoiceOption
  feedback?: { // Optional feedback for each option or general feedback
    correct?: string; // General feedback if correct
    incorrect?: string; // General feedback if incorrect (or specific per option)
    [optionId: string]: string; // Specific feedback for a given optionId
  }; // Used by StaticContent and StaticContentWithKeywords
  
  // Fields specific to KeywordGlossary
  introductionContent?: string; 
  termKeys?: string[];

  // Fields specific to DiagramLabelInteractive
  diagramImageUrl?: string;
  diagramAltText?: string;
  hotspots?: Hotspot[];

  // Fields for FillInTheBlanksInteractive
  segments?: FillInTheBlanksSegment[]; // Array of text strings and Blank objects

  // Fields for OrderSequenceInteractive
  orderItems?: OrderSequenceItem[];

  // Fields for MatchingPairsInteractive
  matchSetA?: MatchItem[]; 
  matchSetB?: MatchItem[]; // Array of text strings and Blank objects

  // You might add other section-specific props here as needed for future types
  // For example, for DiagramLabelInteractive, FillInTheBlanksInteractive etc.
  // diagramUrl?: string;
  // labels?: Array<{ id: string; x: number; y: number; text?: string; termKey?: string }>;
  // fillInData?: Array<{ before: string; after?: string; placeholder: string; id: string }>;
  // quizData?: any; // Define more specifically later
  // Add other question-specific fields as needed, e.g., options for multiple choice
}

export interface Section {
  id: string;
  title: string;
  type: "Questionnaire" | "StaticContent" | "StaticContentWithKeywords" | "KeywordGlossary" | "DiagramLabelInteractive" | "FillInTheBlanksInteractive" | "Quiz" | "OrderSequenceInteractive" | "MatchingPairsInteractive" | string; // Allow other types
  questions?: Question[];
  htmlContent?: string; // Used by StaticContent question type

  // Fields specific to MultipleChoiceQuestion
  options?: MultipleChoiceOption[];
  correctAnswerId?: string; // The ID of the correct MultipleChoiceOption
  feedback?: { // Optional feedback for each option or general feedback
    correct?: string; // General feedback if correct
    incorrect?: string; // General feedback if incorrect (or specific per option)
    [optionId: string]: string; // Specific feedback for a given optionId
  }; // Used by StaticContent and StaticContentWithKeywords
  
  // Fields specific to KeywordGlossary
  introductionContent?: string; 
  termKeys?: string[];

  // Fields specific to DiagramLabelInteractive
  diagramImageUrl?: string;
  diagramAltText?: string;
  hotspots?: Hotspot[];

  // Fields for FillInTheBlanksInteractive
  segments?: FillInTheBlanksSegment[]; // Array of text strings and Blank objects

  // Fields for OrderSequenceInteractive
  orderItems?: OrderSequenceItem[];

  // Fields for MatchingPairsInteractive
  matchSetA?: MatchItem[]; 
  matchSetB?: MatchItem[]; // Array of text strings and Blank objects

  // You might add other section-specific props here as needed for future types
  // For example, for DiagramLabelInteractive, FillInTheBlanksInteractive etc.
  // diagramUrl?: string;
  // labels?: Array<{ id: string; x: number; y: number; text?: string; termKey?: string }>;
  // fillInData?: Array<{ before: string; after?: string; placeholder: string; id: string }>;
  // quizData?: any; // Define more specifically later
}

export interface Worksheet {
  id: string; // Firestore document ID
  title: string;
  course?: string;
  unit?: string;
  specReference?: string;
  learningObjectives?: string[];
    keywords?: string[]; // These are general keywords for the worksheet metadata
  
  // Add keywordsData for the interactive keyword tooltips
  keywordsData?: Record<string, string>; // e.g., { "cpu": "Central Processing Unit..." }
  
  sections: Section[];
  createdAt?: any; // Firestore Timestamp or Date
}
