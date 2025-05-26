// src/app/(platform)/student/assignments/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthStore, UserProfile } from '@/store/authStore'; // UserProfile includes classIds
import { BookOpenCheck, ListTodo, AlertCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

interface Assignment {
  id: string; // Firestore document ID of the assignment
  worksheetId: string;
  worksheetTitle: string;
  classId: string;
  className: string;
  teacherId: string; 
  assignedAt: Date;
}

// Explicitly type userProfile for this component for clarity with classIds
interface StudentUserProfileWithClasses extends UserProfile {
    classIds?: string[]; 
}


export default function StudentAssignmentsPage() {
  const { userProfile, isLoading: authIsLoading } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use a typed version of userProfile for better type safety within this component
  const studentUserProfile = userProfile as StudentUserProfileWithClasses | null;

  const fetchAssignments = useCallback(async () => {
    if (!studentUserProfile?.uid || studentUserProfile.role !== "student") {
      setIsLoadingAssignments(false);
      // setError("User is not a student or not logged in."); // This should be handled by AuthProvider ideally
      return;
    }
    
    if (!studentUserProfile.classIds || studentUserProfile.classIds.length === 0) {
      console.log("StudentAssignmentsPage: Student has no classIds or is not enrolled in any classes.");
      setError("You are not currently enrolled in any classes, or class information is missing from your profile.");
      setAssignments([]); // Ensure assignments are cleared
      setIsLoadingAssignments(false);
      return;
    }

    setIsLoadingAssignments(true);
    setError(null);
    console.log("StudentAssignmentsPage: Fetching assignments for student UID:", studentUserProfile.uid, "Class IDs:", studentUserProfile.classIds);

    try {
      // Firestore 'in' queries are limited to 30 items in the array.
      // If a student could be in more than 30 classes (unlikely for this app),
      // you'd need to batch these queries. For now, assuming <30 classes.
      if (studentUserProfile.classIds.length > 30) {
          console.warn("Student is in more than 30 classes, Firestore 'in' query might be an issue.");
          // Implement batching if this becomes a reality
      }

      const assignmentsQuery = query(
        collection(db, "assignments"),
        where("classId", "in", studentUserProfile.classIds)
        // orderBy("assignedAt", "desc") // You can add ordering if needed
      );
      
      const querySnapshot = await getDocs(assignmentsQuery);
      const fetchedAssignments: Assignment[] = [];
      querySnapshot.forEach((docSnap) => { // Renamed doc to docSnap to avoid conflict
        const data = docSnap.data();
        fetchedAssignments.push({
          id: docSnap.id,
          worksheetId: data.worksheetId,
          worksheetTitle: data.worksheetTitle || "Untitled Worksheet",
          classId: data.classId,
          className: data.className || "Unknown Class",
          teacherId: data.teacherId,
          assignedAt: (data.assignedAt as Timestamp)?.toDate ? (data.assignedAt as Timestamp).toDate() : new Date(),
        });
      });
      
      // Sort by assignedAt date client-side if not done by Firestore, newest first
      fetchedAssignments.sort((a, b) => b.assignedAt.getTime() - a.assignedAt.getTime());

      setAssignments(fetchedAssignments);
      console.log("StudentAssignmentsPage: Fetched assignments:", fetchedAssignments);

    } catch (err) {
      console.error("StudentAssignmentsPage: Error fetching assignments:", err);
      setError("Failed to load your assignments. Please try again.");
    } finally {
      setIsLoadingAssignments(false);
    }
  }, [studentUserProfile]); // Depend on the typed studentUserProfile

  useEffect(() => {
    // Only fetch if auth is not loading and user profile (with role and classIds) is available
    if (!authIsLoading && studentUserProfile && studentUserProfile.role === "student") {
      fetchAssignments();
    } else if (!authIsLoading && (!studentUserProfile || studentUserProfile.role !== "student")) {
        // If auth is done, but no user, or user is not a student
        setIsLoadingAssignments(false); 
        if (!studentUserProfile) {
            setError("Please log in to view your assignments.");
        } else {
            // This case should ideally be handled by redirecting non-students away from this page
            // via AuthProvider or a layout check.
            setError("This page is for students only."); 
        }
    }
  }, [authIsLoading, studentUserProfile, fetchAssignments]);


  if (authIsLoading || (isLoadingAssignments && !error) ) { // Show loader if global auth is loading OR local assignments are loading (and no error yet)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
         <Loader2 className="animate-spin h-8 w-8 text-indigo-600 mr-3" />
        <p className="text-lg text-gray-600">Loading your assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
             <div className="my-4 p-4 bg-red-50 text-red-700 rounded-md shadow flex items-center justify-center max-w-lg mx-auto">
                <AlertCircle size={24} className="mr-3 flex-shrink-0"/> 
                <p className="text-left">{error}</p>
            </div>
            <Link href="/dashboard" className="mt-6 inline-block text-sm text-indigo-600 hover:text-indigo-800">
                &larr; Back to Dashboard
            </Link>
        </div>
    );
  }
  
  // This check should ideally be handled by AuthProvider redirecting non-students
  if (!studentUserProfile || studentUserProfile.role !== "student") {
     return (
        <div className="text-center mt-10 p-4">
            <p className="text-gray-600 mb-4">Access denied. This page is for students.</p>
            <Link href="/dashboard" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Go to Dashboard
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 pb-4 border-b border-gray-200">
         <div className="flex items-center mb-2">
            <ListTodo className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-800">
              My Assignments
            </h1>
        </div>
        <p className="text-gray-600 mt-1 text-sm">Here are the worksheets assigned to your classes.</p>
         <div className="mt-4">
            <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center group">
                <ChevronLeft className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" />
                Back to Dashboard
            </Link>
        </div>
      </header>

      {assignments.length === 0 && (
        <div className="text-center py-10 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-white shadow">
          <BookOpenCheck className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">No assignments yet!</h2>
          <p className="mt-1 text-sm text-gray-500">
            Your teacher hasn't assigned any worksheets to your classes, or check back later.
          </p>
        </div>
      )}

      {assignments.length > 0 && (
        <div className="space-y-6">
          {assignments.map((assignment) => (
            <div 
              key={assignment.id} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-grow">
                        <h2 className="text-xl font-semibold text-indigo-700 group-hover:text-indigo-800 transition-colors mb-1">
                            {assignment.worksheetTitle}
                        </h2>
                        <p className="text-xs text-gray-500">
                            Assigned for: <span className="font-medium">{assignment.className}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                            Assigned on: {assignment.assignedAt.toLocaleDateString()}
                        </p>
                    </div>
                    {/* Updated Link to point to the new student worksheet view page */}
                    <Link
                      href={`/student/worksheets/${assignment.worksheetId}?assignmentId=${assignment.id}`}
                      className="mt-2 sm:mt-0 text-sm bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center whitespace-nowrap self-start sm:self-center"
                    >
                      Open Worksheet <ChevronRight size={18} className="ml-1.5" />
                    </Link>
                </div>
                {/* Future: Add status indicator, e.g., "Not Started", "In Progress", "Submitted", "Graded" */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
