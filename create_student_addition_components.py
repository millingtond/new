import os

# --- File Contents ---

# This variable needs to be accessible by the main function
types_index_ts_additions = """
// Added by create_student_addition_components.py
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
"""

credential_generator_content = """// src/utils/credentialGenerator.ts
const adjectives = [
  'Agile', 'Bright', 'Clever', 'Quick', 'Sharp', 'Wise', 'Swift', 'Keen', 'Calm', 'Brave',
  'Eager', 'Exact', 'Fair', 'Fine', 'Glad', 'Grand', 'Great', 'Happy', 'Jolly', 'Kind',
  'Lively', 'Lone', 'Lucid', 'Major', 'Merry', 'Neat', 'Noble', 'Prime', 'Proud', 'Ready',
  'Regal', 'Solid', 'Sound', 'Stark', 'Super', 'Topaz', 'True', 'Valid', 'Vivid', 'Warm'
];
const nouns = [
  'Ant', 'Ape', 'Bat', 'Bear', 'Bee', 'Bird', 'Boar', 'Bug', 'Cat', 'Cod',
  'Cow', 'Crab', 'Crow', 'Cub', 'Deer', 'Dog', 'Dove', 'Duck', 'Elk', 'Emu',
  'Fish', 'Flea', 'Fly', 'Fox', 'Frog', 'Gnat', 'Goat', 'Grub', 'Hawk', 'Hen',
  'Ibex', 'Jay', 'Lamb', 'Lion', 'Lark', 'Mole', 'Moth', 'Mule', 'Newt', 'Owl',
  'Pig', 'Puma', 'Pup', 'Ram', 'Rat', 'Seal', 'Slug', 'Snail', 'Swan', 'Tiger',
  'Toad', 'Trout', 'Wolf', 'Worm', 'Yak', 'Zebra'
];

export function generateTwoWordUsername(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 90) + 10;
  return `${adj.toLowerCase()}-${noun.toLowerCase()}${randomNumber}`;
}

export function generateStrongPassword(length: number = 10): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  if (!/\\d/.test(password)) password += Math.floor(Math.random() * 10);
  if (!/[A-Z]/.test(password)) password += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  if (!/[a-z]/.test(password)) password += String.fromCharCode(97 + Math.floor(Math.random() * 26));
  return password.slice(0, length);
}
"""

bulk_add_students_modal_content = """// src/components/teacher/BulkAddStudentsModal.tsx
'use client';

import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase';
import { generateTwoWordUsername, generateStrongPassword } from '@/utils/credentialGenerator';
import type { GeneratedStudentCredential } from '@/types';

interface BulkAddStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  onStudentsAdded: () => void;
}

export default function BulkAddStudentsModal({
  isOpen,
  onClose,
  classId,
  className,
  onStudentsAdded,
}: BulkAddStudentsModalProps) {
  const [numberOfStudents, setNumberOfStudents] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<GeneratedStudentCredential[]>([]);

  const handleAddStudents = async () => {
    if (numberOfStudents <= 0 || numberOfStudents > 50) {
      setError('Please enter a number between 1 and 50.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedCredentials([]);

    try {
      const studentsToCreate = [];
      for (let i = 0; i < numberOfStudents; i++) {
        studentsToCreate.push({
          username: generateTwoWordUsername(),
          password: generateStrongPassword(),
        });
      }
      
      const bulkCreateStudentsFn = httpsCallable(functions, 'bulkCreateStudents');
      const result = await bulkCreateStudentsFn({
        classId,
        students: studentsToCreate,
      });

      // @ts-ignore
      const { success, createdStudents, message } = result.data as any;

      if (success && createdStudents) {
        setGeneratedCredentials(createdStudents.map((student: any) => ({
            username: student.username,
            passwordString: student.password 
        })));
        onStudentsAdded();
      } else {
        setError(message || 'Failed to create students.');
      }
    } catch (err: any) {
      console.error('Error calling bulkCreateStudents function:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCredentialsToClipboard = () => {
    const credentialsText = generatedCredentials
      .map(cred => `Username: ${cred.username}\\tPassword: ${cred.passwordString}`)
      .join('\\n');
    navigator.clipboard.writeText(credentialsText)
      .then(() => alert('Credentials copied to clipboard!'))
      .catch(err => console.error('Failed to copy credentials:', err));
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
    >
      <div 
        className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700">
            Add Students to '{className}'
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>

        {!generatedCredentials.length ? (
          <>
            <div className="mb-4">
              <label htmlFor="numberOfStudents" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Students to Add (1-50)
              </label>
              <input
                type="number"
                id="numberOfStudents"
                value={numberOfStudents}
                onChange={(e) => setNumberOfStudents(parseInt(e.target.value, 10))}
                min="1"
                max="50"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                type="button"
                onClick={handleAddStudents}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate Credentials'}
              </button>
            </div>
          </>
        ) : (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Generated Credentials:</h3>
            <p className="text-sm text-gray-600 mb-3">
              Please distribute these credentials to your students. This list will not be shown again.
            </p>
            <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generatedCredentials.map((cred, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 font-mono">{cred.username}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 font-mono">{cred.passwordString}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="button"
                onClick={copyCredentialsToClipboard}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                Copy to Clipboard
              </button>
              <button
                type="button"
                onClick={() => { setGeneratedCredentials([]); onClose(); }}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Done & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"""

# firebase_config_update_needed is just a comment string, not used by this script directly
# It's a reminder for manual update which was covered.

class_details_page_updated_content = """// src/app/(platform)/teacher/classes/[classId]/page.tsx
// This file was updated by create_student_addition_components.py
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import type { SchoolClass } from '@/types';
import BulkAddStudentsModal from '@/components/teacher/BulkAddStudentsModal'; // Ensure this is imported

export default function ClassDetailsPage() {
  const params = useParams();
  const classId = params.classId as string;
  const router = useRouter(); // Keep if needed for other actions
  const { user } = useAuthStore();

  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);

  const fetchClassDetails = useCallback(async () => {
    if (!user || !classId) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const classDocRef = doc(db, 'classes', classId);
      const classDocSnap = await getDoc(classDocRef);

      if (classDocSnap.exists()) {
        const data = classDocSnap.data();
        if (data.teacherId === user.uid) {
          setSchoolClass({
            id: classDocSnap.id,
            className: data.className,
            teacherId: data.teacherId,
            studentIds: data.studentIds || [],
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          });
        } else {
          setError('You do not have permission to view this class.');
        }
      } else {
        setError('Class not found.');
      }
    } catch (err) {
      console.error("Error fetching class details:", err);
      setError('Failed to load class details.');
    } finally {
      setIsLoading(false);
    }
  }, [user, classId]); 

  useEffect(() => {
    if (user && classId) {
        fetchClassDetails();
    } else if (!user) {
        setIsLoading(false);
    }
  }, [user, classId, fetchClassDetails]);

  const handleStudentsAdded = () => {
    fetchClassDetails(); 
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
          Created: {schoolClass.createdAt.toLocaleDateString()} | Students: {schoolClass.studentIds.length}
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Enrolled Students ({schoolClass.studentIds.length})</h2>
        {schoolClass.studentIds.length > 0 ? (
          <div className="overflow-x-auto">
            <ul className="min-w-full divide-y divide-gray-200">
              {schoolClass.studentIds.map(studentId => (
                <li key={studentId} className="px-2 py-3 text-sm text-gray-700 hover:bg-gray-50">
                  Student UID: {studentId} {/* We will replace this with fetched usernames later */}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <p className="mt-3 text-gray-600 text-sm">No students have been added to this class yet. Click "Add Students" to get started.</p>
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
            # A simple check to avoid exact duplication if script is run multiple times
            # This checks if the first significant line of the addition is already present
            key_part_of_addition = ""
            stripped_addition = content_to_append.strip()
            if stripped_addition: # Ensure content_to_append is not empty
                first_meaningful_line = next((line for line in stripped_addition.splitlines() if line.strip() and not line.strip().startswith("//")), None)
                if first_meaningful_line:
                    key_part_of_addition = first_meaningful_line.strip()
            
            if key_part_of_addition and key_part_of_addition not in existing_content:
                f.write("\n" + stripped_addition + "\n")
                print(f"SUCCESS: Appended to file: {full_path}")
            elif not key_part_of_addition:
                 print(f"INFO: Content to append to {full_path} is empty or only comments. Skipping.")
            else:
                print(f"INFO: Content likely already exists in {full_path} (key part: '{key_part_of_addition}'). Skipping append for this block.")
    except FileNotFoundError:
        write_file(file_path, "// Created by script\n" + content_to_append.strip() + "\n", project_root)
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
    print(f"--- Creating Student Addition Components & Updating Files ---")
    
    # File paths - ensure these variables match what's used below
    types_index_file_path = os.path.join("src", "types", "index.ts") # Renamed variable
    credential_generator_file_path = os.path.join("src", "utils", "credentialGenerator.ts") # Renamed variable
    bulk_add_modal_file_path = os.path.join("src", "components", "teacher", "BulkAddStudentsModal.tsx") # Renamed variable
    class_details_page_file_path = os.path.join("src", "app", "(platform)", "teacher", "classes", "[classId]", "page.tsx") # Renamed variable

    print(f"\nStep 1: Appending StudentUser and GeneratedStudentCredential types to {types_index_file_path}...")
    # Ensure types directory exists
    os.makedirs(os.path.join(project_root, "src", "types"), exist_ok=True)
    # Check if types/index.ts exists, if not create it with a basic valid export
    initial_types_content = "// Main types export file\nexport type {};\n"
    if not os.path.exists(os.path.join(project_root, types_index_file_path)):
        write_file(types_index_file_path, initial_types_content, project_root)
        print(f"INFO: Created an initial empty {types_index_file_path} as it was missing.")
    append_to_file(types_index_file_path, types_index_ts_additions, project_root) # Now types_index_ts_additions is defined

    print(f"\nStep 2: Creating credential generator utility ({credential_generator_file_path})...")
    write_file(credential_generator_file_path, credential_generator_content, project_root)

    print(f"\nStep 3: Creating BulkAddStudentsModal component ({bulk_add_modal_file_path})...")
    write_file(bulk_add_modal_file_path, bulk_add_students_modal_content, project_root)

    print(f"\nStep 4: Updating Class Details page ({class_details_page_file_path}) to use the modal...")
    os.makedirs(os.path.dirname(os.path.join(project_root, class_details_page_file_path)), exist_ok=True)
    write_file(class_details_page_file_path, class_details_page_updated_content, project_root)
    
    print("\n--- File Creation for Student Addition Components Complete ---")
    print("\nACTION REQUIRED (MANUAL STEP for src/config/firebase.ts):")
    print("The BulkAddStudentsModal uses Firebase Functions. You need to update 'src/config/firebase.ts':")
    print("1. Add the import: import { getFunctions } from 'firebase/functions';")
    print("2. Initialize functions: const functions = getFunctions(app);")
    print("3. Add 'functions' to the export: export { app, auth, db, functions };")
    
    print("\nNEXT MAJOR STEP (Firebase Cloud Function - if not already done):")
    print("Ensure your Firebase Cloud Function named 'bulkCreateStudents' is deployed.")
    
    print("\nAfter manual update to firebase.ts and deploying the cloud function (if needed):")
    print("1. Restart your dev server ('npm run dev').")
    print("2. Navigate to a class details page (e.g., /teacher/classes/<classId>).")
    print("3. Click 'Add Students'. The modal should appear.")
    print("4. Attempting to generate credentials will call the cloud function.")

if __name__ == "__main__":
    main()