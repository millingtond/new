// src/app/(platform)/gcse/[course]/[unit]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import type { Worksheet } from '@/components/worksheets/worksheetTypes'; // Or from @/types
import { BookText, ChevronLeft, ListChecks } from 'lucide-react';

interface FetchedWorksheetForTopic extends Omit<Worksheet, "createdAt"> {
  id: string;
  createdAt?: Date;
}

export default function GcseTopicPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  // Extract course and unit slugs from URL params
  // Ensure these names match the folder names in your route: [course] and [unit]
  const courseSlug = params.course as string;
  const unitSlug = params.unit as string;

  const [worksheets, setWorksheets] = useState<FetchedWorksheetForTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicTitle, setTopicTitle] = useState<string>(""); // To display a more readable title

  const fetchWorksheetsForTopic = useCallback(async () => {
    if (!user || !courseSlug || !unitSlug) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    
    // Attempt to create a more readable title from slugs (can be improved)
    const formattedCourse = courseSlug.toUpperCase();
    const formattedUnit = unitSlug.replace(/-/g, " ").replace("unit ", "Unit ");
    setTopicTitle(`${formattedCourse} - ${formattedUnit}`);

    try {
      const worksheetsCollectionRef = collection(db, "worksheets");
      // Query based on courseSlug and unitSlug fields in your Firestore documents
      const q = query(
        worksheetsCollectionRef,
        where("courseSlug", "==", courseSlug), // Assumes 'courseSlug' field exists
        where("unitSlug", "==", unitSlug),     // Assumes 'unitSlug' field exists
        orderBy("title") // Optional: order by worksheet title
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedWorksheets: FetchedWorksheetForTopic[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Worksheet;
        fetchedWorksheets.push({
          ...data,
          id: doc.id,
          createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : undefined,
        });
      });
      setWorksheets(fetchedWorksheets);
      if (fetchedWorksheets.length === 0) {
        console.log(`No worksheets found for courseSlug: ${courseSlug}, unitSlug: ${unitSlug}`);
      }
    } catch (err) {
      console.error(`Error fetching worksheets for ${courseSlug}/${unitSlug}:`, err);
      setError(`Failed to load worksheets for this topic.`);
    } finally {
      setIsLoading(false);
    }
  }, [user, courseSlug, unitSlug]);

  useEffect(() => {
    fetchWorksheetsForTopic();
  }, [fetchWorksheetsForTopic]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <svg className="animate-spin h-8 w-8 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-600">Loading worksheets for {topicTitle || "topic"}...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center mt-10 p-4 text-red-600 bg-red-50 rounded-md">Error: {error}</p>;
  }

  if (!user) {
     return (
        <div className="text-center mt-10 p-4">
            <p className="text-gray-600 mb-4">Please log in to view these worksheets.</p>
            <Link href="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Go to Login
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 pb-4 border-b border-gray-200">
        <Link href="/gcse" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center mb-3 group">
            <ChevronLeft className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" />
            Back to GCSE Topics
        </Link>
        <div className="flex items-center">
            <ListChecks className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-indigo-800">
              {topicTitle || "Topic Worksheets"}
            </h1>
        </div>
        <p className="text-gray-500 mt-1 text-sm">
            Showing worksheets for course: {courseSlug}, unit: {unitSlug}.
        </p>
      </header>

      {worksheets.length === 0 && !isLoading && (
        <div className="text-center py-10 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-white shadow">
          <BookText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-3 text-gray-600 text-lg">No worksheets found for this specific topic.</p>
          <p className="text-sm text-gray-500">Please check back later or ensure worksheets are tagged correctly in Firestore with courseSlug: '{courseSlug}' and unitSlug: '{unitSlug}'.</p>
        </div>
      )}

      {worksheets.length > 0 && (
        <div className="space-y-4">
          {worksheets.map((worksheet) => (
            <div 
              key={worksheet.id} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-indigo-700 mb-1">{worksheet.title}</h2>
                {worksheet.unit && ( // Display the full unit name if available
                  <p className="text-xs text-gray-500 mb-2">
                    <span className="font-medium">Unit:</span> {worksheet.unit}
                  </p>
                )}
                {worksheet.learningObjectives && worksheet.learningObjectives.length > 0 && (
                    <p className="text-xs text-gray-600 line-clamp-2"> {/* line-clamp for brief description */}
                        {worksheet.learningObjectives.join(" ")}
                    </p>
                )}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
                <Link
                  href={`/teacher/library/${worksheet.id}`} // Links to the full worksheet view page
                  className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  View Worksheet
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
