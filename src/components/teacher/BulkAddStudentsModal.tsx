// src/components/teacher/BulkAddStudentsModal.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { getClassesForTeacher } from '@/services/firestoreService';
import type { SchoolClass, GeneratedStudentCredential } from '@/types'; 
import { X, CheckCircle, AlertTriangle, Loader2, Eye } from 'lucide-react'; // Added Eye icon

interface BulkAddStudentsModalProps {
  classId: string;
  className: string;
  isOpen: boolean;
  onClose: () => void;
  onStudentsAdded: () => void;
}

interface CreatedStudentInfoFromFunction {
  uid: string;
  username: string;
  email?: string;
  password?: string; 
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

  useEffect(() => {
    if (isOpen) {
      setNumberOfStudents(1);
      setError(null);
      setCreatedStudentsInfo(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleNumberOfStudentsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const count = parseInt(event.target.value, 10);
    setNumberOfStudents(count > 0 ? count : 1);
    setCreatedStudentsInfo(null); 
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setCreatedStudentsInfo(null);
    console.log("BulkAddStudentsModal: handleSubmit called. Number of students:", numberOfStudents);

    if (numberOfStudents <= 0) {
      setError('Please enter a valid number of students to create.');
      setIsLoading(false);
      return;
    }
    if (numberOfStudents > 50) {
        setError('Cannot create more than 50 students at a time.');
        setIsLoading(false);
        return;
    }

    try {
      const bulkCreateStudentsFn = httpsCallable(functions, 'bulkCreateStudents');
      console.log("BulkAddStudentsModal: Calling 'bulkCreateStudents' Firebase function with payload:", { classId, count: numberOfStudents });
      
      const result = (await bulkCreateStudentsFn({
        classId,
        count: numberOfStudents,
      })) as { data: { success: boolean; message: string; createdStudents?: CreatedStudentInfoFromFunction[] } }; 

      console.log("BulkAddStudentsModal: Firebase function result received:", result);

      if (result.data.success && result.data.createdStudents && result.data.createdStudents.length > 0) {
        console.log("BulkAddStudentsModal: Success! Setting createdStudentsInfo with data (passwords should be here):", JSON.stringify(result.data.createdStudents, null, 2));
        setCreatedStudentsInfo(result.data.createdStudents);
        onStudentsAdded(); 
      } else if (result.data.success && (!result.data.createdStudents || result.data.createdStudents.length === 0)) {
        console.warn("BulkAddStudentsModal: Function reported success but no student data was returned or array was empty.");
        setError(result.data.message || "Students created, but credential details were not returned. Please check server logs.");
        setCreatedStudentsInfo([]); 
        onStudentsAdded();
      }
      else {
        console.error("BulkAddStudentsModal: Firebase function reported failure or unexpected data.", result.data);
        setError(result.data.message || "Failed to create students. No details returned.");
      }
    } catch (err: any) {
      console.error("BulkAddStudentsModal: Error calling bulkCreateStudents function:", err);
      setError(err.message || "An unexpected error occurred while creating students.");
    } finally {
      setIsLoading(false);
      console.log("BulkAddStudentsModal: handleSubmit finished.");
    }
  };

  const exportToCSV = () => {
    if (!createdStudentsInfo || createdStudentsInfo.length === 0) {
        setError("No student credentials available to export.");
        return;
    }
    console.log("BulkAddStudentsModal: Exporting to CSV:", createdStudentsInfo);

    const headers = ['Username', 'Password', 'System Email (Optional)'];
    const rows = createdStudentsInfo.map(student => [
      `"${student.username.replace(/"/g, '""')}"`, 
      `"${(student.password || 'N/A').replace(/"/g, '""')}"`,
      `"${(student.email || '').replace(/"/g, '""')}"`
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
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
      className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={() => {
        if (!isLoading) {
            onClose();
        }
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
                if (!isLoading) {
                    onClose();
                }
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {!createdStudentsInfo ? (
          <form onSubmit={handleSubmit}>
            {/* ... form content as before ... */}
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
                className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="e.g., 30"
                min="1"
                max="50"
                required
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-red-600 text-sm my-4 bg-red-50 p-3 rounded-md">{error}</p>}

            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                    if (!isLoading) {
                        onClose();
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
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Generating...
                  </>
                ) : (
                  'Generate Accounts'
                )}
              </button>
            </div>
          </form>
        ) : (
          // Display created student credentials
          <div>
            {console.log("BulkAddStudentsModal: RENDERING SUCCESS VIEW. createdStudentsInfo:", createdStudentsInfo)}
            <div className="p-4 bg-yellow-100 text-yellow-900 rounded-md mb-4 border border-yellow-300 flex items-center">
                <Eye size={20} className="mr-3 flex-shrink-0" />
                <div>
                    <p className="font-bold text-lg">IMPORTANT: Student Credentials Below!</p>
                    <p className="text-sm">This is your ONLY chance to see and export these passwords.</p>
                </div>
            </div>
            <h3 className="text-xl font-semibold text-green-700 mb-2">Student Accounts Generated!</h3>
            {createdStudentsInfo.length > 0 ? (
              <>
                <p className="text-sm text-gray-700 mb-1">
                  The following student accounts have been created. Please copy these credentials or export them to CSV.
                </p>
                
                <div className="space-y-3 max-h-60 overflow-y-auto bg-gray-50 p-4 rounded-md border border-gray-200 mb-4 shadow-inner">
                  {createdStudentsInfo.map((student, index) => (
                    <div key={student.uid || index} className="text-sm p-3 bg-white rounded shadow border border-gray-200">
                      <p><strong>Username:</strong> <span className="font-mono text-indigo-700">{student.username}</span></p>
                      <p><strong>Password:</strong> <span className="font-mono text-red-600">{student.password || <span className="text-gray-500 italic">Not Provided</span>}</span></p>
                      {student.email && <p className="text-xs text-gray-500 mt-1">System Email: {student.email}</p>}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md border border-yellow-200 mb-4">
                No student accounts were successfully generated with full details, or credential details were not returned. Please check any error messages or server logs.
              </p>
            )}
            {error && <p className="mt-4 text-red-600 text-sm bg-red-50 p-2 rounded-md">{error}</p>}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                onClick={exportToCSV}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
                disabled={!createdStudentsInfo || createdStudentsInfo.length === 0 || isLoading}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                Export to CSV
              </button>
              <button
                onClick={() => {
                    if (!isLoading) {
                        onClose();
                    }
                }}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
                disabled={isLoading}
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
