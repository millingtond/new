// src/components/teacher/AssignWorksheetModal.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '@/config/firebase'; // db might not be needed if getClassesForTeacher is robust
import { useAuthStore } from '@/store/authStore';
import { getClassesForTeacher } from '@/services/firestoreService'; // Assuming this service exists
import type { SchoolClass } from '@/types'; // Or from worksheetTypes if defined there
import { X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface AssignWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  worksheetId: string;
  worksheetTitle: string;
}

export default function AssignWorksheetModal({
  isOpen,
  onClose,
  worksheetId,
  worksheetTitle,
}: AssignWorksheetModalProps) {
  const { userProfile } = useAuthStore();
  const [teacherClasses, setTeacherClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTeacherClasses = useCallback(async () => {
    if (!userProfile?.uid || !isOpen) { // Only fetch if modal is open and user is logged in
      setTeacherClasses([]);
      return;
    }
    setIsLoadingClasses(true);
    setError(null);
    try {
      const classes = await getClassesForTeacher(userProfile.uid);
      setTeacherClasses(classes);
      if (classes.length > 0) {
        // setSelectedClassId(classes[0].id); // Optionally pre-select the first class
      } else {
        setError("You don't have any classes to assign this worksheet to. Please create a class first.");
      }
    } catch (err) {
      console.error("Error fetching teacher's classes:", err);
      setError("Failed to load your classes. Please try again.");
    } finally {
      setIsLoadingClasses(false);
    }
  }, [userProfile?.uid, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchTeacherClasses();
      // Reset states when modal opens
      setSelectedClassId('');
      setError(null);
      setSuccessMessage(null);
      setIsAssigning(false);
    }
  }, [isOpen, fetchTeacherClasses]);

  const handleAssign = async () => {
    if (!selectedClassId) {
      setError("Please select a class to assign the worksheet to.");
      return;
    }
    if (!worksheetId || !userProfile?.uid) {
      setError("Missing worksheet information or user not authenticated.");
      return;
    }

    setIsAssigning(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const assignFunction = httpsCallable(functions, 'assignWorksheetToClass');
      const selectedClass = teacherClasses.find(c => c.id === selectedClassId);
      const result = (await assignFunction({
        classId: selectedClassId,
        worksheetId: worksheetId,
        worksheetTitle: worksheetTitle, // Denormalized data
        className: selectedClass?.className, // Denormalized data
      })) as { data: { success: boolean; message: string; assignmentId?: string } };

      if (result.data.success) {
        setSuccessMessage(result.data.message || `Worksheet '${worksheetTitle}' assigned successfully to ${selectedClass?.className || 'the selected class'}.`);
        // Optionally, you could close the modal after a short delay or keep it open
        // setTimeout(() => {
        //   onClose();
        // }, 3000);
      } else {
        setError(result.data.message || "Failed to assign worksheet.");
      }
    } catch (err: any) {
      console.error("Error calling assignWorksheetToClass function:", err);
      setError(err.message || "An unexpected error occurred during assignment.");
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-indigo-700">Assign Worksheet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
            disabled={isAssigning}
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-1">
          You are assigning: <strong className="text-indigo-600">{worksheetTitle}</strong>
        </p>
        <p className="text-xs text-gray-500 mb-4">
          (Worksheet ID: {worksheetId})
        </p>

        {isLoadingClasses && (
          <div className="flex items-center justify-center my-6">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-2" />
            <p className="text-gray-500">Loading your classes...</p>
          </div>
        )}

        {!isLoadingClasses && teacherClasses.length > 0 && (
          <div className="mb-4">
            <label htmlFor="classSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Select Class:
            </label>
            <select
              id="classSelect"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setError(null); // Clear error when selection changes
                setSuccessMessage(null); // Clear success message
              }}
              className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-gray-100"
              disabled={isAssigning}
            >
              <option value="" disabled>-- Select a class --</option>
              {teacherClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className} (ID: {cls.id.substring(0,6)}...)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error and Success Messages */}
        {error && (
          <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-start">
            <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
            <div>
                <p className="font-medium">Assignment Error!</p>
                <p>{error}</p>
            </div>
          </div>
        )}
        {successMessage && (
          <div className="my-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 flex items-start">
            <CheckCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
             <div>
                <p className="font-medium">Success!</p>
                <p>{successMessage}</p>
            </div>
          </div>
        )}
        
        {teacherClasses.length === 0 && !isLoadingClasses && !error && (
             <p className="text-sm text-gray-500 text-center py-4">No classes available to assign to.</p>
        )}


        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={isAssigning}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all text-sm flex items-center justify-center disabled:opacity-70"
            disabled={isAssigning || isLoadingClasses || !selectedClassId || teacherClasses.length === 0}
          >
            {isAssigning ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Assigning...
              </>
            ) : (
              "Assign to Selected Class"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
