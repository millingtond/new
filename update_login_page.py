import os

# Define the target file path relative to the project root
TARGET_FILE_PATH = "src/app/(auth)/login/page.tsx"

# The complete new content for the login page.
# This version redirects to /dashboard after successful login.
NEW_LOGIN_PAGE_CONTENT = r"""// src/app/(auth)/login/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useAuthStore } from "@/store/authStore"; // To check if user is already logged in

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { userProfile, isLoading: authIsLoading, clearAuthError } = useAuthStore();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authIsLoading && userProfile) {
      router.replace("/dashboard"); // Redirect to hub if already logged in
    }
  }, [userProfile, authIsLoading, router]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    clearAuthError(); // Clear any previous global auth errors

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // AuthProvider will handle fetching role and setting userProfile in the store.
      // AuthProvider will also handle redirecting from /login to /dashboard if user becomes authenticated.
      // So, an explicit router.push('/dashboard') here might be redundant if AuthProvider's effect runs quickly,
      // but it can provide a faster perceived navigation.
      // For robustness, we can keep it. AuthProvider's redirect will handle if this one doesn't fire first.
      router.push("/dashboard"); 
    } catch (err: any) {
      console.error("Login Error:", err);
      // More specific error messages based on Firebase error codes
      switch (err.code) {
        case "auth/user-not-found":
          setError("No user found with this email. Please check your email or sign up.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/invalid-email":
          setError("The email address is not valid.");
          break;
        case "auth/too-many-requests":
            setError("Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.");
            break;
        default:
          setError("Failed to log in. Please check your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // If auth is still loading or user is already logged in (and redirect is happening), show minimal UI or loader
  if (authIsLoading || (!authIsLoading && userProfile)) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <p className="text-lg text-gray-600">Loading...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-700">
          Sign in to your account
        </h2>
        {/* Placeholder for link to sign up page if you have one */}
        {/* <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            create a new account
          </Link>
        </p> */}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

            {/* <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#" // Replace with password reset link
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div> */}

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
"""

def create_or_update_file(file_path, content):
    """Creates or updates a file with the given content, ensuring directory exists."""
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Successfully updated file: {file_path}")
    except IOError as e:
        print(f"Error writing to file {file_path}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred while updating {file_path}: {e}")

def main():
    project_root = os.getcwd()
    absolute_file_path = os.path.join(project_root, TARGET_FILE_PATH)

    print(f"Updating Login Page (page.tsx) at {absolute_file_path}...")
    create_or_update_file(absolute_file_path, NEW_LOGIN_PAGE_CONTENT)
    
    print("\nLogin Page (page.tsx) update process finished.")
    print("After successful login, users will now be redirected to '/dashboard'.")
    print("The AuthProvider also contains logic to redirect already logged-in users from '/login' to '/dashboard'.")

if __name__ == "__main__":
    main()
