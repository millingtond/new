// src/app/(platform)/teacher/classes/[classId]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore'; // Ensure this imports the updated store
import type { SchoolClass, StudentUser } from '@/types';
import BulkAddStudentsModal from '@/components/teacher/BulkAddStudentsModal'; // Ensure this path is correct

export default function ClassDetailsPage() {
  const params = useParams();
  const classId = params.classId as string;
  const router = useRouter();
  // Use userProfile and isLoading from the updated auth store
  const { userProfile, isLoading: authStoreIsLoading } = useAuthStore(); 
  const userUid = userProfile?.uid;

  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true); // Local loading for page data
  const [error, setError] = useState<string | null>(null);
  
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);
  const [studentDetails, setStudentDetails] = useState<Record<string, Partial<StudentUser>>>({});
  const [isFetchingStudentDetails, setIsFetchingStudentDetails] = useState(false);
  const [isProcessingStudentAction, setIsProcessingStudentAction] = useState<Record<string, boolean>>({});
  const [newlyResetPasswordInfo, setNewlyResetPasswordInfo] = useState<{ studentId: string; newPass: string; username: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchClassDetails = useCallback(async () => {
    // This function should only run if userUid and classId are definitely available.
    // The calling useEffect will guard this.
    console.log(`ClassDetailsPage: fetchClassDetails called. UserUID: ${userUid}, ClassID: ${classId}`);
    setIsLoadingPageData(true);
    setError(null);
    setActionError(null);
    setNewlyResetPasswordInfo(null);

    try {
      const classDocRef = doc(db, "classes", classId);
      const classDocSnap = await getDoc(classDocRef);

      if (classDocSnap.exists()) {
        const data = classDocSnap.data();
        if (data.teacherId === userUid) {
          setSchoolClass({
            id: classDocSnap.id,
            className: data.className,
            teacherId: data.teacherId,
            studentIds: data.studentIds || [],
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          });
        } else {
          console.warn("ClassDetailsPage: Permission denied. Teacher ID mismatch.");
          setError("You do not have permission to view this class.");
          // Optionally redirect: router.push("/teacher/classes");
        }
      } else {
        console.warn("ClassDetailsPage: Class document not found.");
        setError("Class not found.");
      }
    } catch (err) {
      console.error("ClassDetailsPage: Error fetching class details:", err);
      setError("Failed to load class details.");
    } finally {
      setIsLoadingPageData(false);
    }
  }, [userUid, classId, router]); // router is stable, userUid and classId are key

  useEffect(() => {
    // Wait for authStore to finish loading and for userProfile to be available.
    // Also ensure classId is present.
    if (!authStoreIsLoading && userProfile?.uid && classId) {
      console.log("ClassDetailsPage: Auth loaded, user available. Fetching class details.");
      fetchClassDetails();
    } else if (!authStoreIsLoading && !userProfile && classId) {
      // If auth is done loading and there's NO user, then set error.
      console.log("ClassDetailsPage: Auth loaded, NO user. Setting auth error.");
      setError("User not authenticated. Please log in.");
      setIsLoadingPageData(false); // Stop page-specific loading
    }
    // If authStoreIsLoading is true, we wait for it to become false.
    // The global loader in AuthProvider or the page's own loader will show.
  }, [authStoreIsLoading, userProfile, classId, fetchClassDetails]);


  // Fetch student usernames when schoolClass data (and its studentIds) is available
  const studentIdsJson = JSON.stringify(schoolClass?.studentIds?.slice().sort());
  useEffect(() => {
    const fetchStudentUsernames = async () => {
      if (!schoolClass || !schoolClass.studentIds || schoolClass.studentIds.length === 0) {
        setStudentDetails({});
        return;
      }
      setIsFetchingStudentDetails(true);
      console.log("ClassDetailsPage: Fetching student usernames for IDs:", schoolClass.studentIds);
      try {
        const newStudentDetails: Record<string, Partial<StudentUser>> = {};
        const studentPromises = schoolClass.studentIds.map(async (studentId) => {
          const userDocRef = doc(db, "users", studentId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as StudentUser;
            newStudentDetails[studentId] = {
              uid: studentId,
              username: userData.username || "N/A",
            };
          } else {
            newStudentDetails[studentId] = { uid: studentId, username: "Unknown Student" };
          }
        });
        await Promise.all(studentPromises);
        setStudentDetails(newStudentDetails);
      } catch (err) {
        console.error("ClassDetailsPage: Error fetching student usernames:", err);
        setActionError("Failed to load some student usernames.");
      } finally {
        setIsFetchingStudentDetails(false);
      }
    };

    if (schoolClass?.id && schoolClass.studentIds.length > 0) {
      fetchStudentUsernames();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolClass?.id, studentIdsJson]); // Depends on schoolClass being loaded

  const handleStudentsAdded = () => {
    console.log("ClassDetailsPage: Students added, refreshing class details.");
    fetchClassDetails();
  };

  const handleResetPassword = async (studentUidToReset: string, studentUsername: string) => {
    setActionError(null);
    setNewlyResetPasswordInfo(null);
    setIsProcessingStudentAction(prev => ({ ...prev, [studentUidToReset]: true }));
    console.log(`ClassDetailsPage: Attempting to reset password for ${studentUsername} (UID: ${studentUidToReset})`);
    try {
      const resetPasswordFn = httpsCallable(functions, "resetStudentPassword");
      const result = (await resetPasswordFn({ studentUid: studentUidToReset })) as { data: { success: boolean; message: string; newPassword?: string } };

      if (result.data.success && result.data.newPassword) {
        setNewlyResetPasswordInfo({ studentId: studentUidToReset, newPass: result.data.newPassword, username: studentUsername });
      } else {
        setActionError(result.data.message || "Failed to reset password.");
      }
    } catch (err: any) {
      console.error("ClassDetailsPage: Error calling resetStudentPassword function:", err);
      setActionError(err.message || "An unexpected error occurred during password reset.");
    } finally {
      setIsProcessingStudentAction(prev => ({ ...prev, [studentUidToReset]: false }));
    }
  };

  const handleRemoveStudent = async (studentUidToRemove: string) => {
    if (!schoolClass) return;
    const studentNameToConfirm = studentDetails[studentUidToRemove]?.username || studentUidToRemove;
    if (!window.confirm(`Are you sure you want to remove student ${studentNameToConfirm} from this class? This action cannot be undone.`)) {
        return;
    }
    setActionError(null);
    setIsProcessingStudentAction(prev => ({ ...prev, [studentUidToRemove]: true }));
    console.log(`ClassDetailsPage: Attempting to remove student ${studentNameToConfirm} (UID: ${studentUidToRemove}) from class ${schoolClass.id}`);
    try {
      const removeStudentFn = httpsCallable(functions, "removeStudentFromClass");
      const result = (await removeStudentFn({ classId: schoolClass.id, studentUid: studentUidToRemove })) as { data: { success: boolean; message: string } };

      if (result.data.success) {
        fetchClassDetails(); // Refetch to get updated student list
      } else {
        setActionError(result.data.message || "Failed to remove student.");
      }
    } catch (err: any) {
      console.error("ClassDetailsPage: Error calling removeStudentFromClass function:", err);
      setActionError(err.message || "An unexpected error occurred while removing student.");
    } finally {
      setIsProcessingStudentAction(prev => ({ ...prev, [studentUidToRemove]: false }));
    }
  };
  
  const exportUsernamesToCSV = () => {
    if (!schoolClass || schoolClass.studentIds.length === 0) {
        alert("No students to export."); // Replace alert with a modal or toast later
        return;
    }
    const headers = ["Username", "StudentUID"];
    const rows = schoolClass.studentIds.map(uid => {
        const username = studentDetails[uid]?.username || "N/A";
        return [username, uid];
    });

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${schoolClass.className}_student_usernames.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show main page loader if either auth is loading globally OR page data is loading locally
  if (authStoreIsLoading || isLoadingPageData) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg text-gray-600">Loading class details...</p>
        </div>
    );
  }

  // If there's an error message (either auth error or data fetch error), display it.
  if (error) {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
            <p className="mt-10 p-4 text-red-600 bg-red-50 rounded-md">{error}</p>
            <Link href="/teacher/classes" className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-800">
                &larr; Back to My Classes
            </Link>
        </div>
    );
  }

  // If no schoolClass data after loading and no error, it implies class not found or permission issue not caught by setError
  if (!schoolClass) {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
            <p className="mt-10 p-4 text-gray-600 bg-gray-50 rounded-md">
                Class data could not be loaded. It might not exist or you may not have permission.
            </p>
            <Link href="/teacher/classes" className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-800">
                &larr; Back to My Classes
            </Link>
        </div>
    );
  }

  // Main content render
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

      {actionError && (
        <div className="my-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          <p><strong>Action Error:</strong> {actionError}</p>
        </div>
      )}

      {newlyResetPasswordInfo && (
        <div className="my-4 p-3 bg-green-100 text-green-800 rounded-md text-sm">
          <p>
            Password for student <strong>{newlyResetPasswordInfo.username}</strong> (UID: {newlyResetPasswordInfo.studentId}) has been reset.
          </p>
          <p>
            New Password: <strong className="font-mono bg-green-200 px-1 rounded">{newlyResetPasswordInfo.newPass}</strong>
          </p>
          <p className="mt-1 text-xs">Please communicate this new password to the student securely. This message will disappear if you refresh or perform another action.</p>
          <button onClick={() => setNewlyResetPasswordInfo(null)} className="mt-2 text-xs text-green-700 hover:underline">Dismiss</button>
        </div>
      )}

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
           <button
            onClick={exportUsernamesToCSV}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center text-sm"
            disabled={!schoolClass || schoolClass.studentIds.length === 0}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            Export Usernames to CSV
          </button>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Enrolled Students ({schoolClass.studentIds.length})
          {(isFetchingStudentDetails) && schoolClass.studentIds.length > 0 && <span className="text-sm text-gray-500 ml-2">Loading student details...</span>}
        </h2>
        {schoolClass.studentIds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student UID</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schoolClass.studentIds.map(studentId => {
                  const studentUsername = studentDetails[studentId]?.username || "Loading...";
                  const processingThisStudent = isProcessingStudentAction[studentId];
                  return (
                    <tr key={studentId} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{studentUsername}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">{studentId}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleResetPassword(studentId, studentUsername === "Loading..." ? studentId : studentUsername)}
                          className="text-yellow-600 hover:text-yellow-800 font-medium disabled:opacity-50"
                          disabled={processingThisStudent || isFetchingStudentDetails || studentUsername === "Loading..."}
                          title="Reset Password"
                        >
                          {processingThisStudent && isProcessingStudentAction[studentId] ? "Resetting..." : "Reset Password"}
                        </button>
                        <button
                          onClick={() => handleRemoveStudent(studentId)}
                          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                          disabled={processingThisStudent || isFetchingStudentDetails}
                          title="Remove from Class"
                        >
                          {processingThisStudent && isProcessingStudentAction[studentId] ? "Removing..." : "Remove"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <p className="mt-3 text-gray-600 text-sm">No students have been added to this class yet. Click "Add Students" to get started.</p>
          </div>
        )}
      </div>

      {schoolClass && (
        <BulkAddStudentsModal
            classId={schoolClass.id}
            className={schoolClass.className}
            isOpen={isAddStudentsModalOpen}
            onClose={() => setIsAddStudentsModalOpen(false)}
            onStudentsAdded={handleStudentsAdded}
        />
    )}
    </div>
  );
}
