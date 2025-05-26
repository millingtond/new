// src/app/(auth)/login/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useAuthStore } from "@/store/authStore";

const STUDENT_EMAIL_DOMAIN = "mgsstudent.system"; // Used to construct student email for Firebase Auth

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState(""); // Changed state name for clarity
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { userProfile, isLoading: authStoreIsLoading, clearAuthError } = useAuthStore();

  useEffect(() => {
    if (!authStoreIsLoading && userProfile) {
      console.log("LoginPage: User is already logged in. Redirecting to /dashboard.");
      router.replace("/dashboard");
    }
  }, [userProfile, authStoreIsLoading, router]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // This is important
    setIsLoading(true);
    setError(null);
    clearAuthError();

    let finalEmailToAuth = emailOrUsername.trim();
    // If the input doesn't look like an email, assume it's a student username
    // and append the defined student email domain.
    if (!finalEmailToAuth.includes("@")) {
      finalEmailToAuth = `${finalEmailToAuth}@${STUDENT_EMAIL_DOMAIN}`;
      console.log(`LoginPage: Input treated as username. Constructed email for Firebase: ${finalEmailToAuth}`);
    } else {
      console.log(`LoginPage: Input treated as full email: ${finalEmailToAuth}`);
    }

    try {
      await signInWithEmailAndPassword(auth, finalEmailToAuth, password);
      console.log("LoginPage: signInWithEmailAndPassword successful.");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("LoginPage: Login Error - Code:", err.code, "Message:", err.message);
      let friendlyErrorMessage = "Failed to log in. Please check your credentials and try again.";
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/invalid-credential":
          friendlyErrorMessage = "Invalid username/email or password. Please check your credentials.";
          break;
        case "auth/wrong-password":
          friendlyErrorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          friendlyErrorMessage = "The email address format used for login is not valid (according to Firebase)."; // Clarified error source
          break;
        case "auth/too-many-requests":
          friendlyErrorMessage = "Access to this account has been temporarily disabled due to many failed login attempts. You can try again later or reset your password.";
          break;
        case "auth/network-request-failed":
          friendlyErrorMessage = "Network error. Please check your internet connection and try again.";
          break;
      }
      setError(friendlyErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authStoreIsLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <p className="text-lg text-gray-600">Checking authentication status...</p>
        </div>
    );
  }
  if (userProfile) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <p className="text-lg text-gray-600">Redirecting to dashboard...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-700">
          Sign in to MGS CS Hub
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin} noValidate> 
            <div>
              <label
                htmlFor="emailOrUsername"
                className="block text-sm font-medium text-gray-700"
              >
                Email address or Username
              </label>
              <div className="mt-1">
                <input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text" 
                  autoComplete="username" 
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="teacher@example.com or student-username"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    "Sign in"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
