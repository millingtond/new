import os

# Define the target file path relative to the project root
TARGET_FILE_PATH = "src/app/(platform)/teacher/library/page.tsx"
BASE_COMPONENTS_DIR = "src/components/worksheets" # For importing WorksheetComponent if needed for preview later

# The complete new content for the file
NEW_PAGE_CONTENT = r"""// src/app/(platform)/teacher/library/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuthStore } from "@/store/authStore";
import type { Worksheet } from "@/components/worksheets/worksheetTypes"; // Assuming types are here or in @/types

// If worksheetTypes.ts is not in @/components/worksheets, adjust the import path
// e.g., import type { Worksheet } from "@/types";

interface FetchedWorksheet extends Omit<Worksheet, "createdAt"> {
  id: string;
  createdAt?: Date; // Firestore Timestamps will be converted to Date objects
}

export default function TeacherLibraryPage() {
  const { user } = useAuthStore();
  const [worksheets, setWorksheets] = useState<FetchedWorksheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorksheets = useCallback(async () => {
    if (!user) {
      // setError("You must be logged in to view the library."); // Or let PlatformLayout handle
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const worksheetsCollectionRef = collection(db, "worksheets");
      // Consider adding orderBy if you have a consistent field like 'title' or 'createdAt'
      const q = query(worksheetsCollectionRef, orderBy("title")); // Example: order by title
      const querySnapshot = await getDocs(q);
      
      const fetchedWorksheets: FetchedWorksheet[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Worksheet; // Cast to the more complete Worksheet type
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
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWorksheets();
  }, [fetchWorksheets]);

  if (isLoading) {
    return <p className="text-center mt-10 p-4 text-gray-600">Loading resource library...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 p-4 text-red-600 bg-red-50 rounded-md">Error: {error}</p>;
  }

  if (!user) {
     return (
        <div className="text-center mt-10 p-4">
            <p className="text-gray-600 mb-4">Please log in to view the resource library.</p>
            <Link href="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Go to Login
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-800">Resource Library</h1>
        <p className="text-gray-600 mt-1">Browse available worksheets and learning materials.</p>
      </header>

      {worksheets.length === 0 && !isLoading && (
        <div className="text-center py-10 px-4 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="mt-3 text-gray-600 text-lg">The resource library is currently empty.</p>
          <p className="text-sm text-gray-500">Sample worksheets can be added using the provided Python script.</p>
        </div>
      )}

      {worksheets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worksheets.map((worksheet) => (
            <div 
              key={worksheet.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
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
                            {worksheet.learningObjectives.slice(0, 3).map((obj, index) => ( // Show first 3 objectives
                                <li key={index}>{obj}</li>
                            ))}
                            {worksheet.learningObjectives.length > 3 && <li>...and more</li>}
                        </ul>
                    </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                {/* Later, this Link could go to a worksheet preview or assignment page */}
                {/* For now, it's a placeholder or could link to a dynamic worksheet view page if we build it next */}
                <button
                  onClick={() => alert(`Preview/Assign for: ${worksheet.title} (ID: ${worksheet.id}) - Functionality to be implemented.`)}
                  className="w-full text-sm bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  View / Assign (Coming Soon)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"""

def create_file(file_path, content):
    """Creates a file with the given content, ensuring directory exists."""
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Successfully created file: {file_path}")
    except IOError as e:
        print(f"Error creating file {file_path}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred while creating {file_path}: {e}")

def main():
    project_root = os.getcwd()
    # Ensure the path is constructed correctly for Next.js app router structure
    # src/app/(platform)/teacher/library/page.tsx
    page_dir = os.path.join(project_root, "src", "app", "(platform)", "teacher", "library")
    absolute_file_path = os.path.join(page_dir, "page.tsx")

    print(f"Creating Teacher Resource Library page at {absolute_file_path}...")
    create_file(absolute_file_path, NEW_PAGE_CONTENT)
    
    print("\nTeacher Resource Library page creation process finished.")
    print(f"Make sure the import path for 'Worksheet' type (e.g., from '@/components/worksheets/worksheetTypes' or '@/types') in {TARGET_FILE_PATH} is correct based on your project structure.")
    print("You will also need to add a link to '/teacher/library' in your teacher's navigation (e.g., in Navbar.tsx or a sidebar).")

if __name__ == "__main__":
    main()
