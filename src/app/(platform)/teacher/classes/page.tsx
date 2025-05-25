// src/app/(platform)/teacher/classes/page.tsx
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
