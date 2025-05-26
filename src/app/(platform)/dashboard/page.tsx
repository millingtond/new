// src/app/(platform)/dashboard/page.tsx
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter for logout redirection
import { useAuthStore, UserProfile } from '@/store/authStore';
import { auth } from '@/config/firebase'; // Import Firebase auth instance
import { signOut } from 'firebase/auth'; // Import signOut function
import {
  GraduationCap, BookOpen, Users, Trophy, Newspaper, Lightbulb, Settings, LayoutDashboard, UserCircle, LogOut // Added LogOut icon
} from 'lucide-react';

interface HubCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  bgColorClass?: string;
  textColorClass?: string;
  role?: 'teacher' | 'student' | 'all';
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
  // Role-specific cards
  { title: "Manage Classes", description: "View and manage your classes.", href: "/teacher/classes", icon: Settings, bgColorClass: "bg-gray-100", textColorClass: "text-gray-700", role: "teacher" },
  { title: "Resource Library", description: "Browse and assign worksheets.", href: "/teacher/library", icon: LayoutDashboard, bgColorClass: "bg-gray-100", textColorClass: "text-gray-700", role: "teacher" },
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
  const { userProfile, isLoading: authStoreIsLoading, setUserProfile: setProfileInStore } = useAuthStore();
  const userRole = userProfile?.role;
  const router = useRouter();

  useEffect(() => {
    console.log("HubDashboardPage: Mounted/Updated. AuthStoreLoading:", authStoreIsLoading, "UserProfile:", userProfile ? { uid: userProfile.uid, role: userProfile.role, email: userProfile.email } : null);
  }, [userProfile, authStoreIsLoading]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileInStore(null); // Clear user profile in Zustand store
      console.log("HubDashboardPage: User logged out. Redirecting to /login.");
      router.push('/login'); // Redirect to login page
    } catch (error) {
      console.error("HubDashboardPage: Error logging out:", error);
      // Optionally, set an error state to display to the user
    }
  };

  if (authStoreIsLoading || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
         <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-600 ml-3">Loading Dashboard...</p>
      </div>
    );
  }

  if (!userRole) {
    console.error("HubDashboardPage: User role is missing or null even after loading. UserProfile:", userProfile);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
            <h2 className="text-xl font-semibold text-red-600 mb-4">User Role Not Found</h2>
            <p className="text-gray-700 text-center mb-2">
                We could not determine your role. This might be due to incomplete account setup.
            </p>
            <p className="text-sm text-gray-500 text-center">
                Please contact support or try logging out and back in.
            </p>
            <p className="text-xs text-gray-400 mt-2">Logged in as: {userProfile?.email}</p>
            <button
                onClick={handleLogout}
                className="mt-6 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center"
            >
                <LogOut size={18} className="mr-2" />
                Logout
            </button>
        </div>
    );
  }

  const visibleCards = cardData.filter(card => {
    if (card.role === "all") return true;
    return card.role === userRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-10 sm:mb-16 relative">
          <h1 className="text-4xl sm:text-5xl font-bold text-indigo-700 mb-3">
            MGS Computer Science Hub
          </h1>
          <p className="text-lg text-gray-600">
            Navigate to your year group resources or other CS activities.
          </p>
          {/* Logout Button - Positioned top right of the header or page */}
          <button
            onClick={handleLogout}
            className="absolute top-0 right-0 mt-0 mr-0 sm:mt-1 sm:mr-1 bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center shadow-md hover:shadow-lg"
            title="Logout"
          >
            <LogOut size={18} className="mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        <div className="mb-12 p-4 bg-white/80 backdrop-blur-md rounded-lg shadow-md text-center">
          <p className="text-gray-700">
            Welcome, {userProfile.displayName || userProfile.email}! 
            Your role: <span className="font-semibold text-indigo-600">{userRole}</span>.
          </p>
        </div>

        {visibleCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {visibleCards.map((card) => (
              <HubCard key={card.title} {...card} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No sections available for your role ({userRole}).</p>
        )}

        <div className="mt-16 text-center">
          {userRole === "teacher" && (
            <>
              <Link href="/teacher/classes" className="text-indigo-600 hover:text-indigo-800 underline text-sm mx-2">
                Manage My Classes
              </Link>
              <Link href="/teacher/library" className="text-indigo-600 hover:text-indigo-800 underline text-sm mx-2">
                  Resource Library
              </Link>
            </>
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
