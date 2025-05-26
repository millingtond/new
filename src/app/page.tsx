// src/app/page.tsx
"use client";

import React from 'react';
// No need for useRouter or useAuthStore here for redirection,
// as AuthProvider should handle redirects from the root path.

export default function HomePage() {
  // This page will typically only be seen briefly, or if AuthProvider's
  // redirection logic has a slight delay or specific conditions.
  // AuthProvider should redirect unauthenticated users to /login
  // and authenticated users to /dashboard when they hit the root path.
  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-700">Loading MGS Computer Science Hub...</p>
        <p className="text-sm text-gray-500 mt-2">You will be redirected shortly.</p>
      </div>
    </div>
  );
}
