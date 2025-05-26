// Basic types for worksheet rendering - ensure these align with your main types in @/types/index.ts

export interface Question {
  id: string;
  type: "ShortAnswer" | "StaticContent" | string; // Allow other types for future
  prompt?: string;
  placeholder?: string;
  htmlContent?: string;
  // Add other question-specific fields as needed, e.g., options for multiple choice
}

export interface Section {
  id: string;
  title: string;
  type: "Questionnaire" | "StaticContent" | string; // Allow other types
  questions?: Question[];
  htmlContent?: string;
}

export interface Worksheet {
  id: string; // Firestore document ID
  title: string;
  course?: string;
  unit?: string;
  specReference?: string;
  learningObjectives?: string[];
  keywords?: string[];
  sections: Section[];
  createdAt?: any; // Firestore Timestamp or Date
}
