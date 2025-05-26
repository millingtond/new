// src/app/(platform)/teacher/library/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link"; 
import { useRouter } from "next/navigation"; 
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuthStore } from "@/store/authStore"; // Ensure this imports the updated store
import type { Worksheet } from "@/components/worksheets/worksheetTypes"; 
import { Loader2, AlertCircle, BookOpen, Search, ChevronLeft } from "lucide-react"; // Added icons

interface FetchedWorksheet extends Omit<Worksheet, "createdAt"> {
  id: string;
  createdAt?: Date; 
}

export default function TeacherLibraryPage() {
  const { userProfile, isLoading: authStoreIsLoading } = useAuthStore(); // Use userProfile and authStoreIsLoading
  const router = useRouter();
  const [worksheets, setWorksheets] = useState<FetchedWorksheet[]>([]);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true); // Local loading for page data
  const [error, setError] = useState<string | null>(null);

  const fetchWorksheets = useCallback(async () => {
    // This function should only run if userProfile is available and is a teacher
    if (!userProfile?.uid || userProfile.role !== "teacher") {
      setIsLoadingPageData(false);
      if (userProfile && userProfile.role !== "teacher") {
          setError("Access denied. This page is for teachers only.");
      }
      // If !userProfile, AuthProvider should handle redirect, or the main loader will show.
      return;
    }
    setIsLoadingPageData(true);
    setError(null);
    try {
      const worksheetsCollectionRef = collection(db, "worksheets");
      const q = query(worksheetsCollectionRef, orderBy("title"));
      const querySnapshot = await getDocs(q);
      
      const fetchedWorksheets: FetchedWorksheet[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Worksheet;
        fetchedWorksheets.push({
          ...data,
          id: doc.id,
          createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : undefined,
        });
      });
      setWorksheets(fetchedWorksheets);
    } catch (err) {
      console.error("Error fetching worksheets:", err);
      setError("Failed to load worksheets from the library.");
    } finally {
      setIsLoadingPageData(false);
    }
  }, [userProfile]); // Depend on userProfile

  useEffect(() => {
    // Wait for global auth loading to finish AND userProfile to be available
    if (!authStoreIsLoading && userProfile) {
      if (userProfile.role === "teacher") {
        fetchWorksheets();
      } else {
        // If user is not a teacher, show access denied and stop page loading
        setError("Access denied. This page is for teachers only.");
        setIsLoadingPageData(false);
      }
    } else if (!authStoreIsLoading && !userProfile) {
      // If auth is done loading and there's no user, AuthProvider should have redirected to login.
      // But as a fallback, set error.
      setError("User not authenticated. Please log in.");
      setIsLoadingPageData(false);
    }
    // If authStoreIsLoading is true, the main loader below will show.
  }, [authStoreIsLoading, userProfile, fetchWorksheets]);

  const handleViewWorksheet = (worksheetId: string) => {
    router.push(`/teacher/library/${worksheetId}`);
  };

  // Show loader if global auth is loading OR page data is loading
  if (authStoreIsLoading || isLoadingPageData) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-600 mr-3" />
            <p className="text-lg text-gray-600">Loading resource library...</p>
        </div>
    );
  }

  // If error, display error message
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
  
  // This case should ideally be handled by AuthProvider redirecting non-teachers or unauth users.
  if (!userProfile || userProfile.role !== "teacher") {
     return (
        <div className="text-center mt-10 p-4">
            <p className="text-gray-600 mb-4">Access denied or not logged in.</p>
            <Link href="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Go to Login
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-center mb-2">
            <Search className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-800">Resource Library</h1>
        </div>
        <p className="text-gray-600 mt-1 text-sm">Browse available worksheets and learning materials.</p>
         <div className="mt-4">
            <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center group">
                <ChevronLeft className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" />
                Back to Dashboard
            </Link>
        </div>
      </header>

      {worksheets.length === 0 && (
        <div className="text-center py-10 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-white shadow">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Library is Empty</h2>
          <p className="mt-1 text-sm text-gray-500">
            No worksheets found. You can add sample worksheets using the provided Python script.
          </p>
        </div>
      )}

      {worksheets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worksheets.map((worksheet) => (
            <div 
              key={worksheet.id} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <div className="p-6 flex-grow">
                <h2 className="text-xl font-semibold text-indigo-700 mb-2">{worksheet.title}</h2>
                {worksheet.course && (
                  <p className="text-xs text-gray-500 mb-1">
                    <span className="font-medium">Course:</span> {worksheet.course}
                  </p>
                )}
                {worksheet.unit && (
                  <p className="text-xs text-gray-500 mb-3">
                    <span className="font-medium">Unit:</span> {worksheet.unit}
                  </p>
                )}
                {worksheet.learningObjectives && worksheet.learningObjectives.length > 0 && (
                    <div className="mb-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Objectives:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-500 max-h-20 overflow-y-auto">
                            {worksheet.learningObjectives.slice(0, 3).map((obj, index) => (
                                <li key={index}>{obj}</li>
                            ))}
                            {worksheet.learningObjectives.length > 3 && <li>...and more</li>}
                        </ul>
                    </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => handleViewWorksheet(worksheet.id)}
                  className="w-full text-sm bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  View Worksheet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
