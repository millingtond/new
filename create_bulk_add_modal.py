import os

# Define the target file path relative to the project root
TARGET_FILE_PATH = "src/components/teacher/BulkAddStudentsModal.tsx"

# The complete new content for the file
NEW_FILE_CONTENT = r"""// src/components/teacher/BulkAddStudentsModal.tsx
'use client';

import React, { useState }
from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase'; // Assuming 'functions' is exported from your firebase config
import type { StudentUser, GeneratedStudentCredential } from '@/types'; // Ensure these types are appropriate

interface StudentInput {
  username: string;
  password?: string; // Make password optional if function generates it, or required if teacher sets it
                     // Based on your current function, teacher provides it.
  passwordString: string; // Explicitly for teacher input
}

interface BulkAddStudentsModalProps {
  classId: string;
  className: string;
  isOpen: boolean;
  onClose: () => void;
  onStudentsAdded: () => void; // Callback to refresh class list
}

interface CreatedStudentInfo {
  uid: string;
  username: string;
  email?: string;
  password?: string; // This is returned by your Firebase function
}

export default function BulkAddStudentsModal({
  classId,
  className,
  isOpen,
  onClose,
  onStudentsAdded,
}: BulkAddStudentsModalProps) {
  const [students, setStudents] = useState<StudentInput[]>([
    { username: '', passwordString: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdStudentsInfo, setCreatedStudentsInfo] = useState<CreatedStudentInfo[] | null>(null);

  const handleStudentInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const values = [...students];
    if (event.target.name === 'username') {
      values[index].username = event.target.value;
    } else if (event.target.name === 'password') {
      values[index].passwordString = event.target.value;
    }
    setStudents(values);
    setCreatedStudentsInfo(null); // Clear previous results when input changes
  };

  const handleAddStudentField = () => {
    setStudents([...students, { username: '', passwordString: '' }]);
  };

  const handleRemoveStudentField = (index: number) => {
    const values = [...students];
    values.splice(index, 1);
    setStudents(values);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setCreatedStudentsInfo(null);

    const studentsToCreate = students
      .filter(s => s.username.trim() !== '' && s.passwordString.trim() !== '')
      .map(s => ({ username: s.username.trim(), password: s.passwordString.trim() }));

    if (studentsToCreate.length === 0) {
      setError('Please add at least one student with a username and password.');
      setIsLoading(false);
      return;
    }
    if (studentsToCreate.length > 50) {
        setError('Cannot create more than 50 students at a time.');
        setIsLoading(false);
        return;
    }

    try {
      const bulkCreateStudentsFn = httpsCallable(functions, 'bulkCreateStudents');
      const result = (await bulkCreateStudentsFn({
        classId,
        students: studentsToCreate,
      })) as { data: { success: boolean; message: string; createdStudents: CreatedStudentInfo[] } }; // Cast to expected return type

      if (result.data.success) {
        setCreatedStudentsInfo(result.data.createdStudents || []); // This is where credentials are made available
        onStudentsAdded(); // Refresh class list on the parent page
        setStudents([{ username: '', passwordString: '' }]); // Reset form for next potential batch
                                                           // Or you might want to keep them until modal closes
        // Do not close modal automatically, let teacher view credentials
      } else {
        setError(result.data.message || 'Failed to create students.');
      }
    } catch (err: any) {
      console.error('Error calling bulkCreateStudents function:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={() => {
        onClose();
        setCreatedStudentsInfo(null); // Clear results when closing
        setError(null);
      }}
    >
      <div
        className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700">
            Add Students to '{className}'
          </h2>
          <button
            onClick={() => {
              onClose();
              setCreatedStudentsInfo(null); // Clear results when closing
              setError(null);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>

        {!createdStudentsInfo ? (
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-gray-600 mb-4">
              Enter the username and password for each student. The Firebase function expects you to provide these.
            </p>
            {students.map((student, index) => (
              <div key={index} className="flex items-center gap-2 mb-3 p-2 border rounded-md">
                <div className="flex-grow">
                  <label htmlFor={`username-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id={`username-${index}`}
                    value={student.username}
                    onChange={(e) => handleStudentInputChange(index, e)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    placeholder="e.g., clever-fox"
                    required
                  />
                </div>
                <div className="flex-grow">
                  <label htmlFor={`password-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="text" // Keep as text for teacher to see what they are typing
                    name="password"
                    id={`password-${index}`}
                    value={student.passwordString}
                    onChange={(e) => handleStudentInputChange(index, e)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>
                {students.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStudentField(index)}
                    className="p-2 text-red-500 hover:text-red-700 mt-5"
                    aria-label="Remove student"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddStudentField}
              className="text-sm text-indigo-600 hover:text-indigo-800 mb-4"
            >
              + Add Another Student
            </button>

            {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-2 rounded-md">{error}</p>}

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setCreatedStudentsInfo(null);
                  setError(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all text-sm flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Create Accounts'
                )}
              </button>
            </div>
          </form>
        ) : (
          // Display created student credentials
          <div>
            <h3 className="text-lg font-medium text-green-700 mb-2">Students Created Successfully!</h3>
            <p className="text-sm text-gray-600 mb-4">
              The following student accounts have been created. Please copy these credentials and distribute them securely to your students. This is your only opportunity to see the passwords.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-md">
              {createdStudentsInfo.map((student, index) => (
                <div key={index} className="text-sm p-2 border-b border-gray-200">
                  <p><strong>Username:</strong> {student.username}</p>
                  <p><strong>Password:</strong> {student.password}</p> {/* Displaying the password */}
                  {student.email && <p><small>System Email: {student.email}</small></p>}
                </div>
              ))}
            </div>
             {error && <p className="mt-4 text-red-600 text-sm bg-red-50 p-2 rounded-md">{error}</p>} {/* For messages like 'x of y created' */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  onClose();
                  setCreatedStudentsInfo(null); // Clear results when closing
                  setError(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Done (Close)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"""

def main():
    """
    Main function to create the specified file with new content.
    """
    project_root = os.getcwd()
    absolute_file_path = os.path.join(project_root, TARGET_FILE_PATH)

    try:
        os.makedirs(os.path.dirname(absolute_file_path), exist_ok=True)
        with open(absolute_file_path, 'w', encoding='utf-8') as f:
            f.write(NEW_FILE_CONTENT)
        print(f"Successfully created file: {absolute_file_path}")
    except IOError as e:
        print(f"Error writing to file {absolute_file_path}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
