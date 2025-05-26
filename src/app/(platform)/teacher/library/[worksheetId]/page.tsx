// src/app/(platform)/teacher/library/[worksheetId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuthStore } from "@/store/authStore";

import WorksheetComponent from "@/components/worksheets/Worksheet"; 
import type { Worksheet as WorksheetType } from "@/components/worksheets/worksheetTypes";
// Import the new modal
import AssignWorksheetModal from "@/components/teacher/AssignWorksheetModal"; 
import { FileText, ChevronLeft, Edit3, Share2, Trash2 } from 'lucide-react'; // Added more icons

interface FetchedWorksheetView extends Omit<WorksheetType, "createdAt"> {
  id: string;
  createdAt?: Date;
}

export default function ViewWorksheetPage() {
  const params = useParams();
  const router = useRouter();
  const worksheetId = params.worksheetId as string;
  
  const { userProfile } = useAuthStore(); // Use userProfile for role checks if needed
  const [worksheet, setWorksheet] = useState<FetchedWorksheetView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the AssignWorksheetModal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchWorksheet = useCallback(async () => {
    if (!userProfile) { // Check if userProfile is available (implies logged in)
      setIsLoading(false);
      // AuthProvider should handle redirect if not logged in
      return;
    }
    if (!worksheetId) {
      setError("Worksheet ID is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const worksheetDocRef = doc(db, "worksheets", worksheetId);
      const worksheetDocSnap = await getDoc(worksheetDocRef);

      if (worksheetDocSnap.exists()) {
        const data = worksheetDocSnap.data() as WorksheetType;
        setWorksheet({
          ...data,
          id: worksheetDocSnap.id,
          createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : undefined,
        });
      } else {
        setError("Worksheet not found.");
      }
    } catch (err) {
      console.error(`Error fetching worksheet ${worksheetId}:`, err);
      setError("Failed to load the worksheet.");
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, worksheetId]);

  useEffect(() => {
    fetchWorksheet();
  }, [fetchWorksheet]);

  const handleWorksheetAssigned = () => {
    // This function will be called by the modal upon successful assignment.
    // You might want to show a success toast/notification here.
    console.log(`Worksheet ${worksheet?.title} assignment process completed (or attempted).`);
    // No need to refetch this page's data, but good to have a callback.
  };

  // If user is not yet determined by AuthProvider, show a generic loading or let AuthProvider handle it.
  // This page assumes AuthProvider has done its job if userProfile is null and isLoading is false.
  if (!userProfile && !isLoading) { 
     return (
        <div className="text-center mt-10 p-4">
            <p className="text-gray-600 mb-4">Please log in to view this worksheet.</p>
            <Link href="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Go to Login
            </Link>
        </div>
    );
  }
  
  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8">
      <div className="mb-6 px-4 sm:px-0 flex justify-between items-center">
        <Link href="/teacher/library" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center group">
          <ChevronLeft className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to Resource Library
        </Link>
        {/* Placeholder for Edit/Delete buttons if worksheet belongs to current teacher */}
      </div>
      
      <WorksheetComponent worksheet={worksheet} isLoading={isLoading} error={error} />

      {!isLoading && !error && worksheet && userProfile?.role === 'teacher' && (
        <div className="max-w-4xl mx-auto mt-8 p-4 text-center">
            <button 
                onClick={() => setIsAssignModalOpen(true)} // Open the modal
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 flex items-center mx-auto"
            >
                <Share2 size={20} className="mr-2" />
                Assign to Class
            </button>
        </div>
      )}

      {/* Render the AssignWorksheetModal */}
      {worksheet && (
        <AssignWorksheetModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          worksheetId={worksheet.id}
          worksheetTitle={worksheet.title}
          // onWorksheetAssigned={handleWorksheetAssigned} // Pass callback if modal needs to notify parent
        />
      )}
    </div>
  );
}
