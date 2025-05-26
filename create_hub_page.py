import os

# Define the target file path relative to the project root
# This will be the new central dashboard/hub page
TARGET_FILE_PATH = "src/app/(platform)/dashboard/page.tsx" # Or choose another path like /hub/page.tsx

# The complete new content for the file
NEW_PAGE_CONTENT = r"""// src/app/(platform)/dashboard/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore'; // To potentially customize links based on role
import {
  GraduationCap, BookOpen, Users, Trophy, Newspaper, Lightbulb, ShieldCheck, UserCircle, LogOut, Settings, LayoutDashboard
} from 'lucide-react'; // Using lucide-react for icons

// Define an interface for card data
interface HubCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  bgColorClass?: string; // Optional background color class for the icon container
  textColorClass?: string; // Optional text color class for the icon
  role?: 'teacher' | 'student' | 'all'; // For conditional rendering
}

const cardData: HubCardProps[] = [
  { title: "Year 7", description: "Resources for Year 7 students.", href: "/year/7", icon: GraduationCap, bgColorClass: "bg-blue-100", textColorClass: "text-blue-600", role: "all" },
  { title: "Year 8", description: "Resources for Year 8 students.", href: "/year/8", icon: GraduationCap, bgColorClass: "bg-green-100", textColorClass: "text-green-600", role: "all" },
  { title: "Year 9", description: "Resources for Year 9 students.", href: "/year/9", icon: GraduationCap, bgColorClass: "bg-yellow-100", textColorClass: "text-yellow-600", role: "all" },
  { title: "GCSE", description: "Resources for GCSE students.", href: "/gcse", icon: BookOpen, bgColorClass: "bg-red-100", textColorClass: "text-red-600", role: "all" },
  { title: "A Level", description: "Resources for A Level students.", href: "/a-level", icon: BookOpen, bgColorClass: "bg-purple-100", textColorClass: "text-purple-600", role: "all" },
  { title: "Competitions", description: "Info on computing competitions.", href: "/competitions", icon: Trophy, bgColorClass: "bg-orange-100", textColorClass: "text-orange-600", role: "all" },
  { title: "CS News", description: "Latest updates and articles.", href: "/news", icon: Newspaper, bgColorClass: "bg-teal-100", textColorClass: "text-teal-600", role: "all" },
  { title: "Extracurricular", description: "Clubs and activities.", href: "/extracurricular", icon: Lightbulb, bgColorClass: "bg-pink-100", textColorClass: "text-pink-600", role: "all" },
  // Role-specific cards (examples)
  { title: "Teacher Admin", description: "Manage classes and students.", href: "/teacher/classes", icon: Settings, bgColorClass: "bg-gray-100", textColorClass: "text-gray-600", role: "teacher" },
  { title: "Resource Library", description: "Browse and assign worksheets.", href: "/teacher/library", icon: LayoutDashboard, bgColorClass: "bg-gray-100", textColorClass: "text-gray-600", role: "teacher" },
  { title: "My Assignments", description: "View your assigned work.", href: "/student/assignments", icon: BookOpen, bgColorClass: "bg-sky-100", textColorClass: "text-sky-600", role: "student" },
];

const HubCard: React.FC<HubCardProps> = ({ title, description, href, icon: Icon, bgColorClass = "bg-gray-100", textColorClass = "text-gray-700" }) => {
  return (
    <Link href={href} className="block group">
      <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out h-full flex flex-col items-center text-center transform hover:-translate-y-1">
        <div className={`p-4 rounded-full ${bgColorClass} mb-4 transition-colors group-hover:bg-opacity-80`}>
          <Icon className={`w-8 h-8 ${textColorClass}`} />
        </div>
        <h3 className="text-lg font-semibold text-indigo-700 mb-1 group-hover:text-indigo-800 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">{description}</p>
      </div>
    </Link>
  );
};

export default function HubDashboardPage() {
  const { user } = useAuthStore();
  // Placeholder for user role - you'll need to fetch this from your user data in Firestore
  // For now, we'll assume a 'role' property on the user object or a way to determine it.
  // This is a simplified example. In a real app, you'd fetch user details from Firestore
  // that include their role after authentication.
  const userRole = user?.email?.includes("teacher") ? "teacher" : "student"; // VERY SIMPLISTIC ROLE DETECTION - REPLACE

  const visibleCards = cardData.filter(card => {
    if (card.role === "all") return true;
    return card.role === userRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-10 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-indigo-700 mb-3">
            MGS Computer Science Hub
          </h1>
          <p className="text-lg text-gray-600">
            Navigate to your year group resources or other CS activities.
          </p>
        </header>

        {user && (
          <div className="mb-12 p-4 bg-white/80 backdrop-blur-md rounded-lg shadow-md text-center">
            <p className="text-gray-700">Welcome, {user.displayName || user.email}! Your role is currently detected as: <span className="font-semibold text-indigo-600">{userRole}</span>.</p>
            <p className="text-xs text-gray-500">(Role detection is a placeholder. Implement proper role fetching from Firestore.)</p>
          </div>
        )}


        {visibleCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {visibleCards.map((card) => (
              <HubCard key={card.title} {...card} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No sections available for your role.</p>
        )}

        {/* Example: Links to specific dashboards if they still exist */}
        {/* You might integrate these into the cards or have a separate section */}
        <div className="mt-16 text-center">
          {userRole === "teacher" && (
            <Link href="/teacher/classes" className="text-indigo-600 hover:text-indigo-800 underline text-sm mx-2">
              Manage My Classes
            </Link>
          )}
           {userRole === "teacher" && (
             <Link href="/teacher/library" className="text-indigo-600 hover:text-indigo-800 underline text-sm mx-2">
                Resource Library
            </Link>
          )}
          {userRole === "student" && (
            <Link href="/student/assignments" className="text-indigo-600 hover:text-indigo-800 underline text-sm mx-2">
              View My Assignments
            </Link>
          )}
        </div>
      </div>
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
    # Path for the new hub/dashboard page
    page_dir = os.path.join(project_root, "src", "app", "(platform)", "dashboard")
    absolute_file_path = os.path.join(page_dir, "page.tsx")

    print(f"Creating Hub Dashboard page at {absolute_file_path}...")
    create_file(absolute_file_path, NEW_PAGE_CONTENT)
    
    print("\nHub Dashboard page creation process finished.")
    print(f"Next steps:")
    print(f"1. Review and customize the links and content in {TARGET_FILE_PATH}.")
    print(f"2. Implement proper role fetching for the user (currently uses a placeholder). You'll need to fetch user data from Firestore that includes a 'role' field.")
    print(f"3. Update your login redirection logic in 'src/app/(auth)/login/page.tsx' (and potentially 'src/components/layout/AuthProvider.tsx') to redirect all authenticated users to '/dashboard'.")
    print(f"4. Ensure all links on this hub page (e.g., /year/7, /gcse, /teacher/classes) lead to existing or planned pages.")

if __name__ == "__main__":
    main()
