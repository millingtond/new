import os

# Define the target file path relative to the project root
TARGET_FILE_PATH = "src/app/(platform)/teacher/classes/[classId]/page.tsx"

# The complete new content for the file
# Using a raw string (r"""...""") to prevent issues with backslashes/backticks
NEW_FILE_CONTENT = r"""// src/app/(platform)/teacher/classes/[classId]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore'; // Added collection, query, where, getDocs for potential future use
import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import type { SchoolClass, StudentUser } from '@/types'; // Added StudentUser from src/types/index.ts

export default function ClassDetailsPage() {
  const params = useParams();
  const classId = params.classId as string;
  const router = useRouter();
  const { user } = useAuthStore(); // From src/store/authStore.ts
  const userUid = user?.uid; // Extract primitive value for stable dependency

  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null); // Type from src/types/index.ts
  const [isLoading, setIsLoading] = useState(true); // Loading state for class details
  const [error, setError] = useState<string | null>(null);
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);

  // New state for student details (including usernames)
  const [studentDetails, setStudentDetails] = useState<Record<string, Partial<StudentUser>>>({}); // StudentUser from src/types/index.ts
  const [isFetchingStudentDetails, setIsFetchingStudentDetails] = useState(false); // Loading state for student usernames


  const fetchClassDetails = useCallback(async () => {
    if (!userUid || !classId) { // Use stable userUid
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
        if (data.teacherId === userUid) { // Use stable userUid for comparison
          setSchoolClass({
            id: classDocSnap.id,
            className: data.className,
            teacherId: data.teacherId,
            studentIds: data.studentIds || [],
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          });
        } else {
          setError('You do not have permission to view this class.');
          // Consider redirecting if permission error persists: router.push('/teacher/classes');
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
  }, [userUid, classId, router]); // Depend on userUid. router is generally stable.

  useEffect(() => {
    if (userUid && classId) { // Use stable userUid
        fetchClassDetails();
    }
    // No explicit else setLoading(false) needed here if auth is loading,
    // as fetchClassDetails handles its own loading states and won't run if userUid is missing.
  }, [userUid, classId, fetchClassDetails]); // Depend on userUid

  // Create a stable dependency from studentIds for the username fetching effect
  const studentIdsJson = JSON.stringify(schoolClass?.studentIds?.slice().sort()); // Use .slice() to avoid mutating original, then sort

  useEffect(() => {
    const fetchStudentUsernames = async () => {
      if (!schoolClass || !schoolClass.studentIds || schoolClass.studentIds.length === 0) {
        setStudentDetails({}); // Clear details if no students or class
        return;
      }

      setIsFetchingStudentDetails(true);
      try {
        const newStudentDetails: Record<string, Partial<StudentUser>> = {};
        // Usernames are stored in the 'users' collection as per your `bulkCreateStudents` function
        const studentPromises = schoolClass.studentIds.map(async (studentId) => {
          const userDocRef = doc(db, 'users', studentId); // Assuming 'users' collection
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as StudentUser; // Cast to StudentUser type from src/types/index.ts
            newStudentDetails[studentId] = {
              uid: studentId,
              username: userData.username || 'N/A', // Default if username is missing
            };
          } else {
            newStudentDetails[studentId] = { uid: studentId, username: 'Unknown Student' };
          }
        });

        await Promise.all(studentPromises); // Fetch all concurrently
        setStudentDetails(newStudentDetails); // Set state once with all details
      } catch (err) {
        console.error("Error fetching student usernames:", err);
        // Optionally set a specific error state for student usernames
        // setError('Failed to load student usernames.');
      } finally {
        setIsFetchingStudentDetails(false);
      }
    };

    if (schoolClass?.id && schoolClass.studentIds.length > 0) {
      fetchStudentUsernames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolClass?.id, studentIdsJson]); // Depend on class ID and the sorted (and stringified) list of student IDs

  const handleStudentsAdded = () => {
    fetchClassDetails(); // This will refresh class details, which in turn re-triggers username fetching if studentIds change.
  };

  // Main loading state for the page
  if (isLoading && !schoolClass) {
    return <p className="text-center mt-10 p-4">Loading class details...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 p-4 text-red-600 bg-red-50 rounded-md">Error: {error}</p>;
  }

  if (!schoolClass) { // Fallback if class couldn't be loaded for other reasons
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Enrolled Students ({schoolClass.studentIds.length})
          {/* Display loading indicator for usernames if EITHER main page is loading OR student details are fetching */}
          {(isLoading || isFetchingStudentDetails) && schoolClass.studentIds.length > 0 && <span className="text-sm text-gray-500 ml-2">Loading student details...</span>}
        </h2>
        {schoolClass.studentIds.length > 0 ? (
          <div className="overflow-x-auto">
            <ul className="min-w-full divide-y divide-gray-200">
              {schoolClass.studentIds.map(studentId => (
                <li key={studentId} className="px-2 py-3 text-sm text-gray-700 hover:bg-gray-50">
                  {studentDetails[studentId]?.username 
                    ? `Username: ${studentDetails[studentId]?.username}` 
                    : `Student UID: ${studentId}` // Fallback to UID
                  }
                  {/* More specific loading/status indicators per student */}
                  {isFetchingStudentDetails && !studentDetails[studentId] && " (loading username...)"}
                  {!isFetchingStudentDetails && !studentDetails[studentId]?.username && studentDetails[studentId] && " (Username not found)"}
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

      {/* Modal placeholder - ensure BulkAddStudentsModal is implemented */}
      {isAddStudentsModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
              onClick={() => setIsAddStudentsModalOpen(false)}
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
             {/* Replace this placeholder with your actual BulkAddStudentsModal component */}
             <p className="text-sm text-gray-600 mb-3">
               The 'Bulk Add Students' modal component will be implemented here.
               It should call a Firebase function (like `bulkCreateStudents`) to create student accounts.
             </p>
             <p className="text-xs text-gray-500">
                On successful student creation within the modal, ensure `handleStudentsAdded()` is called
                to refresh the class details on this page.
             </p>
             <div className="mt-6 flex justify-end">
               <button 
                 onClick={() => {
                   setIsAddStudentsModalOpen(false);
                   // Potentially call handleStudentsAdded() if the modal performed an action
                   // e.g., if you had a temporary "simulate add" button in the placeholder
                 }} 
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
"""

def main():
    """
    Main function to update the specified file with new content.
    """
    # Get the absolute path to the project root (where the script is run from)
    project_root = os.getcwd()
    absolute_file_path = os.path.join(project_root, TARGET_FILE_PATH)

    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(absolute_file_path), exist_ok=True)
        
        # Write the new content to the file, overwriting it
        with open(absolute_file_path, 'w', encoding='utf-8') as f:
            f.write(NEW_FILE_CONTENT)
        
        print(f"Successfully updated file: {absolute_file_path}")

    except IOError as e:
        print(f"Error writing to file {absolute_file_path}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
