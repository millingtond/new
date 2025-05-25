// Firestore Service Functions
import { db } from '@/config/firebase';

// Added by create_class_management_files.py
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp, // Import Timestamp
} from 'firebase/firestore';
// Ensure db and your types are imported above in the actual file
// import { db } from '@/config/firebase'; 
// import type { NewClassData, SchoolClass } from '@/types'; 

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
