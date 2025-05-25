// src/app/(platform)/teacher/classes/[classId]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import type { SchoolClass } from '@/types';
// import BulkAddStudentsModal from '@/components/teacher/BulkAddStudentsModal';

export default function ClassDetailsPage() {
  const params = useParams();
  const classId = params.classId as string;
  const router = useRouter();
  const { user } = useAuthStore();

  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);

  const fetchClassDetails = useCallback(async () => {
    if (!user || !classId) {
        setIsLoading(false); // Not enough info to load
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
          // router.push('/teacher/classes');
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
  }, [user, classId, router]);

  useEffect(() => {
    if (user && classId) { // Only fetch if user and classId are available
        fetchClassDetails();
    } else if (!user) { // If no user, likely means they logged out or auth is still loading
        setIsLoading(false); // Stop loading indicator
        // Optionally redirect or show an appropriate message if not handled by PlatformLayout
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
          {/* <button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center text-sm">
            Assign Worksheet
          </button> */}
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

      {/* Modal placeholder - we will build the actual BulkAddStudentsModal component next */}
      {isAddStudentsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
             onClick={() => setIsAddStudentsModalOpen(false)} // Close on overlay click
        >
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md" 
               onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-indigo-700">Add Students to '{schoolClass.className}'</h2>
                <button 
                    onClick={() => setIsAddStudentsModalOpen(false)} 
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    aria-label="Close modal"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
            </div>
            <p className="text-sm text-gray-600">The 'Bulk Add Students' modal component will be implemented here in the next step.</p>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setIsAddStudentsModalOpen(false)} 
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                Close Placeholder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
