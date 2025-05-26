import os

# --- File Contents ---

firestore_service_ts_student_details_addition = """
// Added by update_class_details_for_usernames.py
// Ensure 'db' and 'StudentUser' type are imported above in the actual file
// import { db } from '@/config/firebase';
// import type { StudentUser } from '@/types';
// Import doc and getDoc from firestore, aliasing getDoc if it conflicts
// import { doc, getDoc as getFirestoreDoc } from 'firebase/firestore';


export const getStudentDetailsBatch = async (
  studentUids: string[]
): Promise<StudentUser[]> => {
  if (!studentUids || studentUids.length === 0) {
    return [];
  }
  // Assuming 'db' is your Firestore instance, imported elsewhere in the file
  // Assuming 'StudentUser' type is imported elsewhere
  // Assuming 'doc' and 'getFirestoreDoc' (as getDoc) are imported from 'firebase/firestore'

  const userPromises = studentUids.map(uid => {
    const userDocRef = doc(db, 'users', uid);
    return getFirestoreDoc(userDocRef);
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
"""

class_details_page_with_usernames_content = """// src/app/(platform)/teacher/classes/[classId]/page.tsx
// This file was updated by update_class_details_for_usernames.py
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc as getFirestoreDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import type { SchoolClass, StudentUser } from '@/types';
import BulkAddStudentsModal from '@/components/teacher/BulkAddStudentsModal';
import { getStudentDetailsBatch } from '@/services/firestoreService';

export default function ClassDetailsPage() {
  const params = useParams();
  const classId = params.classId as string;
  const { user } = useAuthStore();

  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<StudentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);

  const fetchClassDetailsAndStudents = useCallback(async () => {
    if (!user || !classId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const classDocRef = doc(db, 'classes', classId);
      const classDocSnap = await getFirestoreDoc(classDocRef);

      if (classDocSnap.exists()) {
        const data = classDocSnap.data();
        if (data.teacherId === user.uid) {
          const fetchedClass = {
            id: classDocSnap.id,
            className: data.className,
            teacherId: data.teacherId,
            studentIds: data.studentIds || [],
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          };
          setSchoolClass(fetchedClass);

          if (fetchedClass.studentIds.length > 0) {
            setIsLoadingStudents(true);
            const studentDetails = await getStudentDetailsBatch(fetchedClass.studentIds);
            setEnrolledStudents(studentDetails);
            setIsLoadingStudents(false);
          } else {
            setEnrolledStudents([]);
          }
        } else {
          setError('You do not have permission to view this class.');
        }
      } else {
        setError('Class not found.');
      }
    } catch (err) {
      console.error("Error fetching class details or students:", err);
      setError('Failed to load class details or student information.');
    } finally {
      setIsLoading(false);
    }
  }, [user, classId]);

  useEffect(() => {
    if (user && classId) {
      fetchClassDetailsAndStudents();
    } else if (!user && !isLoading) {
      setIsLoading(false);
      setSchoolClass(null);
      setEnrolledStudents([]);
    }
  }, [user, classId, fetchClassDetailsAndStudents, isLoading]);

  const handleStudentsAdded = () => {
    fetchClassDetailsAndStudents(); 
  };

  if (isLoading) {
    return <p className="text-center mt-10 p-4">Loading class details...</p>;
  }
  if (error) {
    return <p className="text-center mt-10 p-4 text-red-600 bg-red-50 rounded-md">Error: {error}</p>;
  }
  if (!schoolClass) {
    return <p className="text-center mt-10 p-4">Class not found or access denied.</p>;
  }

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-xl">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <Link href="/teacher/classes" className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block transition-colors">
          &larr; Back to My Classes
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700">{schoolClass.className}</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Created: {schoolClass.createdAt.toLocaleDateString()} | Students: {enrolledStudents.length > 0 ? enrolledStudents.length : schoolClass.studentIds.length}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Class Management</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsAddStudentsModalOpen(true)}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center text-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
            Add Students
          </button>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Enrolled Students ({isLoadingStudents ? 'Loading...' : enrolledStudents.length})
        </h2>
        {isLoadingStudents && <p className="text-sm text-gray-500">Loading student list...</p>}
        {!isLoadingStudents && enrolledStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <ul className="min-w-full divide-y divide-gray-200">
              {enrolledStudents.map(student => (
                <li key={student.uid} className="px-2 py-3 text-sm text-gray-700 hover:bg-gray-50 flex justify-between items-center">
                  <span>{student.username || `Student (UID: ${student.uid})`}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          !isLoadingStudents && <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <p className="mt-3 text-gray-600 text-sm">No students have been added to this class yet.</p>
          </div>
        )}
      </div>

      {isAddStudentsModalOpen && schoolClass && (
        <BulkAddStudentsModal
          isOpen={isAddStudentsModalOpen}
          onClose={() => setIsAddStudentsModalOpen(false)}
          classId={classId}
          className={schoolClass.className} 
          onStudentsAdded={handleStudentsAdded}
        />
      )}
    </div>
  );
}
"""

# --- End File Contents ---

def append_to_file(file_path, content_to_append, project_root="."):
    full_path = os.path.join(project_root, file_path)
    try:
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'a+', encoding='utf-8') as f: 
            f.seek(0) 
            existing_content = f.read()
            key_part_of_addition = ""
            stripped_addition = content_to_append.strip()
            if stripped_addition:
                first_meaningful_line = next((line for line in stripped_addition.splitlines() if line.strip() and not line.strip().startswith("//")), None)
                if first_meaningful_line:
                    key_part_of_addition = first_meaningful_line.strip()
            
            if key_part_of_addition and key_part_of_addition not in existing_content:
                f.write("\\n" + stripped_addition + "\\n")
                print(f"SUCCESS: Appended to file: {full_path}")
            elif not key_part_of_addition:
                 print(f"INFO: Content to append to {full_path} is empty or only comments. Skipping.")
            else:
                print(f"INFO: Content likely already exists in {full_path} (key part: '{key_part_of_addition}'). Skipping append.")
    except FileNotFoundError:
        write_file(file_path, "// Created by script\\n" + content_to_append.strip() + "\\n", project_root)
    except IOError as e:
        print(f"ERROR appending to {full_path}: {e}")

def write_file(file_path, content, project_root="."):
    full_path = os.path.join(project_root, file_path)
    try:
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"SUCCESS: File created/updated: {full_path}")
    except IOError as e:
        print(f"ERROR writing {full_path}: {e}")

def main():
    project_root = os.getcwd()
    print(f"--- Updating Class Details Page for Usernames & Firestore Service ---")
    
    firestore_service_file = os.path.join("src", "services", "firestoreService.ts")
    class_details_page_file = os.path.join("src", "app", "(platform)", "teacher", "classes", "[classId]", "page.tsx")

    print(f"\\nStep 1: Appending getStudentDetailsBatch function to {firestore_service_file}...")
    # Ensure services directory exists and file has basic imports if it's new
    os.makedirs(os.path.join(project_root, "src", "services"), exist_ok=True)
    initial_service_content = ""
    if not os.path.exists(os.path.join(project_root, firestore_service_file)):
        initial_service_content = """// Firestore Service Functions
import { db } from '@/config/firebase';
import type { NewClassData, SchoolClass, StudentUser } from '@/types'; // Ensure all types are imported
import { doc, getDoc as getFirestoreDoc } from 'firebase/firestore'; // Import necessary firestore items
// Other existing imports should be preserved by the append logic
"""
        write_file(firestore_service_file, initial_service_content, project_root)
        print(f"INFO: Created an initial {firestore_service_file} as it was missing.")
    append_to_file(firestore_service_file, firestore_service_ts_student_details_addition, project_root)

    print(f"\\nStep 2: Updating Class Details page ({class_details_page_file}) to fetch and display usernames...")
    write_file(class_details_page_file, class_details_page_with_usernames_content, project_root)
    
    print("\\n--- File Updates Complete ---")
    print("IMPORTANT:")
    print(f"1. Review {firestore_service_file} to ensure the new 'getStudentDetailsBatch' function is correctly appended and all necessary imports (like 'db', 'StudentUser', 'doc', 'getDoc as getFirestoreDoc') are present and correct at the top of the file. You might need to manually consolidate imports.")
    print("2. After reviewing and ensuring imports are correct, restart your dev server ('npm run dev').")
    print("3. Navigate to a class details page. It should now attempt to load and display student usernames instead of just UIDs.")

if __name__ == "__main__":
    main()