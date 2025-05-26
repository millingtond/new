// src/app/(platform)/teacher/classes/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // useRouter might be needed for navigation
import { useAuthStore } from '@/store/authStore';
import { getClassesForTeacher } from '@/services/firestoreService'; // Your service function
import type { SchoolClass } from '@/types'; // Your SchoolClass type
import CreateClassModal from '@/components/teacher/CreateClassModal'; // Your modal component
import { PlusCircle, BookOpen, Users, ChevronRight, FolderOpen, Loader2 } from 'lucide-react';

export default function TeacherClassesPage() {
  const { userProfile } = useAuthStore();
  const router = useRouter();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClasses = useCallback(async () => {
    if (!userProfile?.uid) {
      // setError("You need to be logged in to view classes."); // Or let AuthProvider handle
      setIsLoading(false); // Stop loading if no user
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedClasses = await getClassesForTeacher(userProfile.uid);
      setClasses(fetchedClasses);
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(err.message || "Failed to load classes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userProfile?.uid]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleClassCreated = (newClassId: string) => {
    console.log("New class created with ID:", newClassId, "Refreshing classes list...");
    fetchClasses(); // Re-fetch classes to update the list
    // Optionally, you could navigate to the new class details page:
    // router.push(`/teacher/classes/${newClassId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-3" />
        <p className="text-lg text-gray-600">Loading your classes...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center mt-10 p-4 text-red-600 bg-red-50 rounded-md">Error: {error}</p>;
  }
  
  if (!userProfile) { // Should be handled by AuthProvider, but as a fallback
    return (
        <div className="text-center mt-10 p-4">
            <p className="text-gray-600 mb-4">Please log in to manage your classes.</p>
            <Link href="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Go to Login
            </Link>
        </div>
    );
  }


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-800">My Classes</h1>
            <p className="text-gray-600 mt-1 text-sm">Manage your student groups and assign work.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center text-sm"
        >
          <PlusCircle size={20} className="mr-2" />
          Create New Class
        </button>
      </header>

      {classes.length === 0 ? (
        <div className="text-center py-10 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-white shadow">
          <FolderOpen className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">No classes yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first class using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Link href={`/teacher/classes/${cls.id}`} key={cls.id} className="block group">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden h-full flex flex-col">
                <div className="p-6 flex-grow">
                  <div className="flex items-center mb-3">
                    <BookOpen size={24} className="text-indigo-500 mr-3 flex-shrink-0" />
                    <h2 className="text-xl font-semibold text-indigo-700 truncate group-hover:text-indigo-800 transition-colors">
                      {cls.className}
                    </h2>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <Users size={14} className="mr-1.5" />
                    <span>{cls.studentIds?.length || 0} Students</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Created: {cls.createdAt ? new Date(cls.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                  {/* Add more details like number of assignments, etc. later */}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center">
                    <span className="text-sm text-indigo-600 group-hover:text-indigo-700 font-medium">
                        View Class
                    </span>
                    <ChevronRight size={18} className="ml-1 text-indigo-600 group-hover:text-indigo-700 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClassCreated={handleClassCreated} // Pass the callback here
      />
    </div>
  );
}
