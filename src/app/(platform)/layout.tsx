// src/app/(platform)/layout.tsx
"use client";

import React from 'react';
import Navbar from "@/components/layout/Navbar";
// We no longer need useAuthStore, useRouter, or useEffect for redirection logic here,
// as AuthProvider (which wraps this layout via RootLayout) will handle it.

interface PlatformLayoutProps {
  children: React.ReactNode;
}

export default function PlatformLayout({ children }: PlatformLayoutProps) {
  // AuthProvider is now the main gatekeeper for authentication.
  // If this PlatformLayout component is rendered, it means AuthProvider
  // has determined that the user is authenticated and can access platform routes.
  // The global loading screen during initial auth check is also handled by AuthProvider.

  return (
    <div className="h-full bg-slate-100 flex flex-col">
      {/* Navbar can still use useAuthStore internally if it needs userProfile for display */}
      <Navbar /> 
      <main className="flex-grow md:pt-20 pt-16 h-full">
        {children}
      </main>
      {/* You could add a platform-specific footer here if needed */}
    </div>
  );
}
