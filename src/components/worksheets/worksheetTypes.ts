// src/components/worksheets/worksheetTypes.ts

export interface MultipleChoiceOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: "ShortAnswer" | "StaticContent" | "MultipleChoiceQuestion" | string;
  prompt?: string;
  placeholder?: string;
  htmlContent?: string;
  options?: MultipleChoiceOption[];
  correctAnswerId?: string;
  feedback?: {
    correct?: string;
    incorrect?: string;
    [optionId: string]: string;
  };
}

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  termKey?: string;
  defaultRevealed?: boolean;
}

export interface Blank {
  id: string;
  placeholder?: string;
  size?: number;
}
export type FillInTheBlanksSegment = string | Blank;

export interface OrderSequenceItem {
  id: string;
  content: string;
}

export interface MatchItem {
  id: string;
  content: string;
}

export interface Section {
  id: string;
  title: string;
  type: "Questionnaire" | "StaticContent" | "StaticContentWithKeywords" | "KeywordGlossary" | "DiagramLabelInteractive" | "FillInTheBlanksInteractive" | "Quiz" | "OrderSequenceInteractive" | "MatchingPairsInteractive" | string;
  
  questions?: Question[];
  htmlContent?: string;
  introductionContent?: string;
  termKeys?: string[];
  
  diagramImageUrl?: string;
  diagramAltText?: string;
  hotspots?: Hotspot[];
  
  segments?: FillInTheBlanksSegment[];
  
  orderItems?: OrderSequenceItem[];
  
  matchSetA?: MatchItem[];
  matchSetB?: MatchItem[];
}

export interface Worksheet {
  id: string;
  title: string;
  course?: string;
  unit?: string;
  specReference?: string;
  learningObjectives?: string[];
  keywords?: string[]; 
  keywordsData?: Record<string, string>; 
  sections: Section[];
  createdAt?: any; 
  courseSlug?: string;
  unitSlug?: string;
  courseDisplayName?: string;
  unitDisplayName?: string;
}
