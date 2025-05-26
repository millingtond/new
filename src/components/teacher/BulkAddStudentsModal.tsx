// src/components/teacher/BulkAddStudentsModal.tsx
'use client';

import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase'; // Assuming 'functions' is exported from your firebase config
// StudentUser might not be needed here if we only display what's returned

interface BulkAddStudentsModalProps {
  classId: string;
  className: string;
  isOpen: boolean;
  onClose: () => void;
  onStudentsAdded: () => void; // Callback to refresh class list
}

// This interface matches the `password` field returned by your updated Firebase function
interface CreatedStudentInfoFromFunction {
  uid: string;
  username: string;
  email?: string;
  password?: string; // This is the plain text password returned by the function
}

export default function BulkAddStudentsModal({
  classId,
  className,
  isOpen,
  onClose,
  onStudentsAdded,
}: BulkAddStudentsModalProps) {
  const [numberOfStudents, setNumberOfStudents] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdStudentsInfo, setCreatedStudentsInfo] = useState<CreatedStudentInfoFromFunction[] | null>(null);

  const handleNumberOfStudentsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const count = parseInt(event.target.value, 10);
    setNumberOfStudents(count > 0 ? count : 1);
    setCreatedStudentsInfo(null); // Clear previous results when input changes
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setCreatedStudentsInfo(null);

    if (numberOfStudents <= 0) {
      setError('Please enter a valid number of students to create.');
      setIsLoading(false);
      return;
    }
    if (numberOfStudents > 50) { // Max limit
        setError('Cannot create more than 50 students at a time.');
        setIsLoading(false);
        return;
    }

    try {
      // Ensure your Firebase function 'bulkCreateStudents' is updated
      // to accept 'count' and generate usernames/passwords.
      const bulkCreateStudentsFn = httpsCallable(functions, 'bulkCreateStudents');
      const result = (await bulkCreateStudentsFn({
        classId,
        count: numberOfStudents, // Sending count instead of student details
      })) as { data: { success: boolean; message: string; createdStudents: CreatedStudentInfoFromFunction[] } };

      if (result.data.success) {
        setCreatedStudentsInfo(result.data.createdStudents || []); // Display generated credentials
        onStudentsAdded(); // Refresh class list on the parent page
        setNumberOfStudents(1); // Reset form
        // Modal remains open for the teacher to copy credentials
      } else {
        setError(result.data.message || 'Failed to create students.');
      }
    } catch (err: unknown) {
      console.error('Error calling bulkCreateStudents function:', err);
      let errorMessage = 'An unexpected error occurred while creating students.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
        errorMessage = (err as { message: string }).message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!createdStudentsInfo || createdStudentsInfo.length === 0) return;

    const headers = ['Username', 'Password', 'System Email (Optional)'];
    const rows = createdStudentsInfo.map(student => [
      student.username,
      student.password, // Including password as this is for immediate export after generation
      student.email || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${className}_student_credentials.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={() => { // Click on overlay
        if (!isLoading) { // Prevent closing while loading
            onClose();
            setCreatedStudentsInfo(null);
            setError(null);
            setNumberOfStudents(1);
        }
      }}
    >
      <div
        className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700">
            Add Students to &apos;{className}&apos;
          </h2>
          <button
            onClick={() => {
                if (!isLoading) {
                    onClose();
                    setCreatedStudentsInfo(null);
                    setError(null);
                    setNumberOfStudents(1);
                }
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
            disabled={isLoading}
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
              Enter the number of student accounts to generate. Usernames and passwords will be automatically created.
            </p>
            <div>
              <label htmlFor="numberOfStudents" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Students
              </label>
              <input
                type="number"
                name="numberOfStudents"
                id="numberOfStudents"
                value={numberOfStudents}
                onChange={handleNumberOfStudentsChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                placeholder="e.g., 30"
                min="1"
                max="50" // Consistent with function limit
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm my-4 bg-red-50 p-3 rounded-md">{error}</p>}

            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                    if (!isLoading) {
                        onClose();
                        setCreatedStudentsInfo(null);
                        setError(null);
                        setNumberOfStudents(1);
                    }
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
                  'Generate Accounts'
                )}
              </button>
            </div>
          </form>
        ) : (
          // Display created student credentials
          <div>
            <h3 className="text-lg font-medium text-green-700 mb-2">Student Accounts Generated!</h3>
            <p className="text-sm text-gray-600 mb-1">
              The following student accounts have been created. Please copy these credentials or export them to CSV.
            </p>
            <p className="text-xs text-red-600 mb-4">
              This is your only opportunity to see and export these passwords.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-md border border-gray-200 mb-4">
              {createdStudentsInfo.map((student, index) => (
                <div key={student.uid || index} className="text-sm p-2 border-b border-gray-200 last:border-b-0">
                  <p><strong>Username:</strong> {student.username}</p>
                  <p><strong>Password:</strong> {student.password}</p>
                  {student.email && <p><small>System Email: {student.email}</small></p>}
                </div>
              ))}
            </div>
            {error && <p className="mt-4 text-red-600 text-sm bg-red-50 p-2 rounded-md">{error}</p>}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                onClick={exportToCSV}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
                disabled={!createdStudentsInfo || createdStudentsInfo.length === 0}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                Export to CSV
              </button>
              <button
                onClick={() => {
                  onClose();
                  setCreatedStudentsInfo(null);
                  setError(null);
                  setNumberOfStudents(1);
                }}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
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
