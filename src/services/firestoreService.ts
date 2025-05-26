// Firestore Service Functions
import { db } from '@/config/firebase';
import type { NewClassData, SchoolClass, StudentUser } from '@/types'; // Import necessary types

// Added by create_class_management_files.py
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  doc, // Import doc
  getDoc, // Import getDoc
} from 'firebase/firestore';

const classesCollection = collection(db, 'classes');

export const createClass = async (
  classData: NewClassData
): Promise<string> => {
  try {
    const docRef = await addDoc(classesCollection, {
      ...classData,
      studentIds: [], 
      createdAt: serverTimestamp(), 
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating class:', error);
    throw new Error('Failed to create class.');
  }
};

export const getClassesForTeacher = async (
  teacherId: string
): Promise<SchoolClass[]> => {
  try {
    const q = query(classesCollection, where('teacherId', '==', teacherId));
    const querySnapshot = await getDocs(q);
    const classes: SchoolClass[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      classes.push({
        id: doc.id,
        className: data.className,
        teacherId: data.teacherId,
        studentIds: data.studentIds || [],
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      } as SchoolClass); 
    });
    // Optional: sort classes by creation date or name
    classes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Newest first
    return classes;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw new Error('Failed to fetch classes.');
  }
};
// Added by update_class_details_for_usernames.py
export const getStudentDetailsBatch = async (
  studentUids: string[]
): Promise<StudentUser[]> => {
  if (!studentUids || studentUids.length === 0) {
    return [];
  }

  const userPromises = studentUids.map(uid => {
    const userDocRef = doc(db, 'users', uid);
    return getDoc(userDocRef); // Use getDoc directly
  });

  try {
    const userDocSnaps = await Promise.all(userPromises);
    const studentDetails: StudentUser[] = [];
    userDocSnaps.forEach(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        studentDetails.push({
          uid: docSnap.id,
          username: data.username,
          role: data.role, // Assuming role is stored
          classIds: data.classIds || [], // Assuming classIds are stored
        } as StudentUser); // Use type assertion if data structure is guaranteed
      } else {
        console.warn(`Student document with UID ${docSnap.id} not found.`);
      }
    });
    return studentDetails;
  } catch (error) {
    console.error("Error fetching student details batch:", error);
    throw new Error("Failed to fetch student details.");
  }
};