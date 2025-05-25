import os

# --- File Contents ---

types_index_ts_content_addition = """
// Added by create_class_management_files.py
export interface SchoolClass {
  id: string; // Firestore document ID
  className: string;
  teacherId: string;
  studentIds: string[]; // Array of student UIDs
  createdAt: Date; 
}

export type NewClassData = Pick<SchoolClass, 'className' | 'teacherId'>;
"""

firestore_service_ts_additions = """
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
"""

create_class_modal_content = """// src/components/teacher/CreateClassModal.tsx
'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { createClass } from '@/services/firestoreService'; 

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated: (newClassId: string) => void;
}

export default function CreateClassModal({
  isOpen,
  onClose,
  onClassCreated,
}: CreateClassModalProps) {
  const [className, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !className.trim()) {
      setError('Class name is required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const newClassId = await createClass({
        className: className.trim(),
        teacherId: user.uid,
      });
      onClassCreated(newClassId); 
      setClassName(''); 
      onClose(); 
    } catch (err: any) {
      setError(err.message || 'Failed to create class. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700">Create New Class</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
              Class Name
            </label>
            <input
              type="text"
              id="className"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Year 10 Computer Science"
              required
            />
          </div>
          {error && <p className="text-xs text-red-500 mt-2 mb-2 bg-red-50 p-2 rounded-md">{error}</p>}
          <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"""

my_classes_page_content = """// src/app/(platform)/teacher/classes/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { getClassesForTeacher } from '@/services/firestoreService';
import type { SchoolClass } from '@/types';
import CreateClassModal from '@/components/teacher/CreateClassModal'; 

export default function MyClassesPage() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClasses = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedClasses = await getClassesForTeacher(user.uid);
        setClasses(fetchedClasses);
      } catch (err: any) {
        setError(err.message || 'Failed to load classes.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false); // Not logged in, so not loading
      setClasses([]); // Clear classes if no user
    }
  }, [user]);

  useEffect(() => {
    if (user) { // Only fetch if user is available
        fetchClasses();
    } else {
        setIsLoading(false); // Set loading to false if no user
        setClasses([]);
    }
  }, [user, fetchClasses]); // Rerun if user or fetchClasses changes

  const handleClassCreated = (newClassId: string) => {
    fetchClasses(); 
    console.log("New class created with ID:", newClassId);
  };

  if (isLoading && user) { // Show loading only if there's a user and we are actually loading
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600">Loading your classes...</p>
        {/* Spinner Icon */}
        <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mt-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error} Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 mb-3 sm:mb-0">My Classes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out text-sm sm:text-base flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Create New Class
        </button>
      </div>

      {classes.length === 0 && !isLoading && ( // Show no classes message only if not loading
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-3 text-xl font-semibold text-gray-800">No classes yet</h3>
          <p className="mt-2 text-sm text-gray-500">Get started by creating your first class using the button above.</p>
        </div>
      )}

      {classes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {classes.map((schoolClass) => (
            <div key={schoolClass.id} className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1">
              <h2 className="text-lg font-semibold text-indigo-700 truncate mb-1">{schoolClass.className}</h2>
              <p className="text-sm text-gray-600">
                {schoolClass.studentIds.length} student{schoolClass.studentIds.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Created: {new Date(schoolClass.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <Link href={`/teacher/classes/${schoolClass.id}`} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium group flex items-center">
                  View Class 
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClassCreated={handleClassCreated}
      />
    </div>
  );
}
"""
# --- End File Contents ---

def append_to_file(file_path, content_to_append, project_root="."):
    full_path = os.path.join(project_root, file_path)
    try:
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'a', encoding='utf-8') as f:
            f.write(content_to_append)
        print(f"SUCCESS: Appended to file: {full_path}")
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
    print(f"--- Creating Class Management Files ---")
    print(f"Running in project root: {project_root}")

    # File paths
    types_index_file = os.path.join("src", "types", "index.ts")
    firestore_service_file = os.path.join("src", "services", "firestoreService.ts")
    create_class_modal_file = os.path.join("src", "components", "teacher", "CreateClassModal.tsx")
    my_classes_page_file = os.path.join("src", "app", "(platform)", "teacher", "classes", "page.tsx")

    print(f"\nStep 1: Appending Class types to {types_index_file}...")
    # Ensure types directory exists from previous script, or create it
    os.makedirs(os.path.join(project_root, "src", "types"), exist_ok=True)
    if not os.path.exists(os.path.join(project_root, types_index_file)):
        # Create it if it doesn't exist with a basic export
        write_file(types_index_file, "// Main types export file\nexport type {};\n", project_root)
        print(f"Created an initial empty {types_index_file}")
    append_to_file(types_index_file, types_index_ts_content_addition, project_root)

    print(f"\nStep 2: Appending Class service functions to {firestore_service_file}...")
    # Ensure services directory exists
    os.makedirs(os.path.join(project_root, "src", "services"), exist_ok=True)
    if not os.path.exists(os.path.join(project_root, firestore_service_file)):
        # Create it if it doesn't exist with Firebase db import
        initial_service_content = "// Firestore Service Functions\nimport { db } from '@/config/firebase';\n"
        write_file(firestore_service_file, initial_service_content, project_root)
        print(f"Created an initial {firestore_service_file}")
    append_to_file(firestore_service_file, firestore_service_ts_additions, project_root)


    print(f"\nStep 3: Creating CreateClassModal component ({create_class_modal_file})...")
    write_file(create_class_modal_file, create_class_modal_content, project_root)

    print(f"\nStep 4: Creating My Classes page ({my_classes_page_file})...")
    write_file(my_classes_page_file, my_classes_page_content, project_root)
    
    print("\n--- Class Management File Creation Complete ---")
    print("IMPORTANT:")
    print(f"1. Review {types_index_file} and {firestore_service_file} to ensure the new content is correctly appended and imports are satisfied (e.g., 'db' from '@/config/firebase' in firestoreService.ts). You may need to manually adjust imports if the base files were empty or structured differently.")
    print("2. Ensure necessary imports like 'Timestamp' from 'firebase/firestore' and your types from '@/types' are correctly resolved at the top of firestoreService.ts.")
    print("3. After reviewing, restart your dev server ('npm run dev' or 'yarn dev').")
    print("4. Navigate to /teacher/classes (after logging in) to see the new page.")

if __name__ == "__main__":
    main()