import os

# Define the target file path relative to the project root
# This is a dynamic route for viewing a single worksheet
TARGET_FILE_PATH = "src/app/(platform)/teacher/library/[worksheetId]/page.tsx"

# The complete new content for the file
NEW_PAGE_CONTENT = r"""// src/app/(platform)/teacher/library/[worksheetId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuthStore } from "@/store/authStore";

// Assuming WorksheetComponent and its types are correctly located
import WorksheetComponent from "@/components/worksheets/Worksheet"; 
import type { Worksheet as WorksheetType } from "@/components/worksheets/worksheetTypes";
// Adjust import path for WorksheetType if it's in @/types, e.g.:
// import type { Worksheet as WorksheetType } from "@/types";


interface FetchedWorksheetView extends Omit<WorksheetType, "createdAt"> {
  id: string;
  createdAt?: Date;
}

export default function ViewWorksheetPage() {
  const params = useParams();
  const router = useRouter();
  const worksheetId = params.worksheetId as string; // Get worksheetId from URL
  
  const { user } = useAuthStore();
  const [worksheet, setWorksheet] = useState<FetchedWorksheetView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorksheet = useCallback(async () => {
    if (!user) {
      // setError("You must be logged in to view this worksheet."); // Or let PlatformLayout handle
      setIsLoading(false);
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
  }, [user, worksheetId]);

  useEffect(() => {
    fetchWorksheet();
  }, [fetchWorksheet]);

  if (!user && !isLoading) { // If not loading and still no user
     return (
        <div className="text-center mt-10 p-4">
            <p className="text-gray-600 mb-4">Please log in to view this worksheet.</p>
            <Link href="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Go to Login
            </Link>
        </div>
    );
  }
  
  // The WorksheetComponent itself handles its internal loading, error, and no-data states
  // So we pass these props to it.
  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8">
      <div className="mb-6 px-4 sm:px-0">
        <Link href="/teacher/library" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
          Back to Resource Library
        </Link>
      </div>
      
      {/* Render the WorksheetComponent, passing the fetched worksheet data, loading and error states */}
      <WorksheetComponent worksheet={worksheet} isLoading={isLoading} error={error} />

      {/* Placeholder for "Assign to Class" button - to be added later */}
      {!isLoading && !error && worksheet && (
        <div className="max-w-4xl mx-auto mt-8 p-4 text-center">
            <button 
                onClick={() => alert(`Assign worksheet: ${worksheet.title} - Functionality to be implemented.`)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
            >
                Assign to Class (Coming Soon)
            </button>
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
    # Path for the dynamic route: src/app/(platform)/teacher/library/[worksheetId]/page.tsx
    page_dir = os.path.join(project_root, "src", "app", "(platform)", "teacher", "library", "[worksheetId]")
    absolute_file_path = os.path.join(page_dir, "page.tsx")

    print(f"Creating dynamic worksheet view page at {absolute_file_path}...")
    create_file(absolute_file_path, NEW_PAGE_CONTENT)
    
    print("\nDynamic worksheet view page creation process finished.")
    print(f"Make sure the import paths for 'WorksheetComponent' and 'WorksheetType' in {TARGET_FILE_PATH} are correct.")
    print("Next, you'll need to update the 'TeacherLibraryPage' to link to these dynamic pages.")

if __name__ == "__main__":
    main()
