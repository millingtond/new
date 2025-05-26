import os

# Define the target file path relative to the project root
TARGET_FILE_PATH = "src/app/(platform)/gcse/page.tsx"

# The complete new content for the GCSE category page
NEW_GCSE_PAGE_CONTENT = r"""// src/app/(platform)/gcse/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react'; // Example icons

// Placeholder for GCSE topics/units
// In a real application, this data might come from Firestore or a config file.
const gcseTopics = [
  { id: "j277-1-1", title: "Unit 1.1: Systems Architecture", description: "CPU, memory, storage, and computer architecture.", href: "/gcse/j277/unit-1-1" },
  { id: "j277-1-2", title: "Unit 1.2: Memory & Storage", description: "Primary storage, secondary storage, units, binary, data capacity.", href: "/gcse/j277/unit-1-2" },
  { id: "j277-1-3", title: "Unit 1.3: Computer Networks, Connections & Protocols", description: "Wired and wireless networks, topologies, IP addressing, protocols.", href: "/gcse/j277/unit-1-3" },
  { id: "j277-1-4", title: "Unit 1.4: Network Security", description: "Threats to networks and methods to protect them.", href: "/gcse/j277/unit-1-4" },
  { id: "j277-1-5", title: "Unit 1.5: Systems Software", description: "Operating systems, utility software.", href: "/gcse/j277/unit-1-5" },
  { id: "j277-1-6", title: "Unit 1.6: Ethical, Legal, Cultural & Environmental Concerns", description: "Impact of digital technology.", href: "/gcse/j277/unit-1-6" },
  { id: "j277-2-1", title: "Unit 2.1: Algorithms", description: "Computational thinking, searching and sorting algorithms.", href: "/gcse/j277/unit-2-1" },
  { id: "j277-2-2", title: "Unit 2.2: Programming Fundamentals", description: "Variables, data types, control structures, subroutines.", href: "/gcse/j277/unit-2-2" },
  // Add more topics as needed
];

export default function GcsePage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-center mb-2">
            <BookOpen className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-800">
              GCSE Computer Science Resources
            </h1>
        </div>
        <p className="text-gray-600 mt-1">
          Browse topics and units for the GCSE curriculum. Click on a topic to view related worksheets and materials.
        </p>
        <div className="mt-4">
            <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center">
                <ChevronRight className="w-4 h-4 transform rotate-180 mr-1" />
                Back to Main Hub
            </Link>
        </div>
      </header>

      {gcseTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gcseTopics.map((topic) => (
            <Link href={topic.href} key={topic.id} className="block group">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col justify-between transform hover:-translate-y-1">
                <div>
                  <h2 className="text-lg font-semibold text-indigo-700 mb-2 group-hover:text-indigo-800 transition-colors">
                    {topic.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4 group-hover:text-gray-600 transition-colors">
                    {topic.description}
                  </p>
                </div>
                <div className="mt-auto text-right">
                    <span className="text-sm text-indigo-500 group-hover:text-indigo-700 font-medium inline-flex items-center">
                        View Topic <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No GCSE topics available at the moment.</p>
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
    # Path for the new GCSE page: src/app/(platform)/gcse/page.tsx
    page_dir = os.path.join(project_root, "src", "app", "(platform)", "gcse")
    absolute_file_path = os.path.join(page_dir, "page.tsx")

    print(f"Creating GCSE category page at {absolute_file_path}...")
    create_file(absolute_file_path, NEW_GCSE_PAGE_CONTENT)
    
    print("\nGCSE category page creation process finished.")
    print(f"Ensure the 'GCSE' card on your Hub Dashboard page ('src/app/(platform)/dashboard/page.tsx') links to '/gcse'.")
    print("The links for individual topics on this GCSE page (e.g., '/gcse/j277/unit-1-1') are placeholders and will need corresponding dynamic pages created next.")

if __name__ == "__main__":
    main()
