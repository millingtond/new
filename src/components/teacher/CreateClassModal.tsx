// src/components/teacher/CreateClassModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { createClass } from '@/services/firestoreService'; // Assuming this is your service function
import type { NewClassData } from '@/types'; // Or wherever NewClassData is defined
import { X, Loader2 } from 'lucide-react';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated: (newClassId: string) => void; // Callback after class is created
}

export default function CreateClassModal({ isOpen, onClose, onClassCreated }: CreateClassModalProps) {
  const [className, setClassName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile } = useAuthStore();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setClassName(""); // Clear previous class name
      setError(null);   // Clear previous errors
      setIsLoading(false); // Reset loading state
    }
  }, [isOpen]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setClassName(newName);
    // Clear "Class name is required" error as soon as user starts typing a valid name
    if (newName.trim()) {
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    if (!userProfile?.uid) {
      setError("You must be logged in to create a class.");
      return;
    }

    const trimmedClassName = className.trim();
    if (!trimmedClassName) {
      setError("Class name is required.");
      return;
    }

    setIsLoading(true);
    try {
      const newClassData: NewClassData = {
        className: trimmedClassName,
        teacherId: userProfile.uid,
        // studentIds and createdAt will be handled by the createClass service/function
      };
      const newClassId = await createClass(newClassData);
      onClassCreated(newClassId); // Notify parent component
      onClose(); // Close modal on success
    } catch (err: any) {
      console.error("Error creating class:", err);
      setError(err.message || "Failed to create class. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-indigo-700">Create New Class</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="classNameInput" className="block text-sm font-medium text-gray-700 mb-1">
              Class Name
            </label>
            <input
              type="text"
              id="classNameInput" // Changed id to avoid conflict with state variable name
              value={className}
              onChange={handleInputChange} // Use the dedicated handler
              className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="e.g., Year 10 Computer Science"
              disabled={isLoading}
              required // Basic HTML5 validation
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all text-sm flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                "Create Class"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
