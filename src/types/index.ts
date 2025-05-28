// src/types/index.ts
import { Timestamp } from 'firebase/firestore'; 
import type { User as FirebaseUser } from 'firebase/auth'; 

export interface StudentMatchPair {
  itemAId: string;
  itemBId: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'teacher' | 'student' | 'admin' | null;
  classIds?: string[];
  passwordNeedsReset?: boolean | null; 
  systemEmail?: string; 
  createdAt?: Timestamp;
  
  photoURL?: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  metadata?: FirebaseUser['metadata']; 
  providerData?: FirebaseUser['providerData'];
}

export interface ClassData {
  id: string;
  className: string;
  teacherId: string;
  studentIds: string[];
  createdAt: Timestamp;
}

export interface Assignment {
  id: string;
  worksheetId: string;
  worksheetTitle: string;
  classId: string;
  className: string;
  teacherId: string; 
  assignedAt: Timestamp;
  dueDate?: Timestamp;
}

export interface StudentProgressData {
  id?: string; 
  studentId: string;
  worksheetId: string;
  assignmentId: string; 
  teacherId?: string; 
  lastUpdated: Timestamp;
  status: 'not-started' | 'in-progress' | 'submitted' | 'graded';
  questionnaireAnswers?: Record<string, Record<string, string>>; 
  diagramLabelProgress?: Record<string, string[]>; 
  fillInTheBlanksProgress?: Record<string, Record<string, string>>; 
  quizProgress?: Record<string, Record<string, string | null>>; 
  orderSequenceProgress?: Record<string, string[]>; 
  matchingPairsProgress?: Record<string, StudentMatchPair[]>; 
  score?: string | number; 
  teacherFeedback?: string;
}

export type { 
    Worksheet, 
    Section, 
    Question, 
    MultipleChoiceOption, 
    Hotspot, 
    Blank, 
    FillInTheBlanksSegment,
    OrderSequenceItem,
    MatchItem
} from '../components/worksheets/worksheetTypes';
