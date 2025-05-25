// Main types export file
export type {};

// Added by create_class_management_files.py
export interface SchoolClass {
  id: string; // Firestore document ID
  className: string;
  teacherId: string;
  studentIds: string[]; // Array of student UIDs
  createdAt: Date; 
}

export type NewClassData = Pick<SchoolClass, 'className' | 'teacherId'>;

// Added by create_class_details_page.py
export interface StudentUser {
  uid: string; // Firebase Auth UID
  username: string; // e.g., "clever-fox"
  role: 'student';
  classIds: string[]; // List of class IDs the student is enrolled in
}

export interface GeneratedStudentCredential {
  username: string;
  passwordString: string; 
}
