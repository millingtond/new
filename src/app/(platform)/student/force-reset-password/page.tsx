// src/app/(platform)/student/force-reset-password/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { auth, db } from '@/config/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { LogIn, KeyRound, ShieldCheck, Loader2 } from 'lucide-react'; // Added Loader2 here

export default function ForcePasswordResetPage() {
  const { userProfile, isLoading: authStoreIsLoading, setUserProfile } = useAuthStore();
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState(''); // To re-authenticate if needed, should be the temporary default
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // This page should only be accessible if the user needs to reset their password.
    // If they land here but don't need a reset, or are not a student, redirect.
    // AuthProvider should primarily handle getting them here if needed.
    if (!authStoreIsLoading && userProfile) {
      if (userProfile.role !== 'student' || userProfile.passwordNeedsReset !== true) {
        console.warn("ForcePasswordResetPage: User does not need password reset or is not a student. Redirecting to dashboard.");
        router.replace('/dashboard');
      }
    } else if (!authStoreIsLoading && !userProfile) {
      // If no user at all, redirect to login
      console.warn("ForcePasswordResetPage: No user logged in. Redirecting to login.");
      router.replace('/login');
    }
  }, [userProfile, authStoreIsLoading, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (!userProfile || !auth.currentUser) {
      setError("No authenticated user found. Please log in again.");
      // router.push('/login'); // Optionally force re-login
      return;
    }

    setIsSubmitting(true);

    try {
      // IMPORTANT: The temporary default password should be known to the application here,
      // or you might need to ask the user for it if it's not fixed (but it is fixed in our case).
      // For Firebase's updatePassword, sometimes re-authentication is needed if the action is sensitive.
      // Let's assume the temporary password is the 'currentPassword' for re-authentication.
      // The TEMPORARY_DEFAULT_STUDENT_PASSWORD from your Firebase function should be used here.
      // For security, it's better if this value is not hardcoded directly in the frontend if possible,
      // but for this workflow, the user is *already* logged in with it.

      // For changing password, if the user has recently logged in, re-authentication might not be required.
      // However, explicitly re-authenticating is safer if updatePassword fails due to requiring recent login.
      // The current Firebase user object
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
          setError("Current user session is invalid or email is missing. Please re-login.");
          setIsSubmitting(false);
          return;
      }
      
      // The temporary password should be the one they just used to log in.
      // We'll use the 'currentPassword' state field, which the student would have to type.
      // Alternatively, if it's a fixed known default, you could use it directly, but that's less secure.
      // For this example, let's assume we prompt them for the temporary password again for re-authentication.
      // If your TEMPORARY_DEFAULT_STUDENT_PASSWORD is fixed, you could construct the credential with it.
      // For this form, we'll add an input for 'currentPassword' which is the temporary default.

      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      console.log("ForcePasswordResetPage: Re-authentication successful.");

      // Now update the password
      await updatePassword(currentUser, newPassword);
      console.log("ForcePasswordResetPage: Password updated successfully in Firebase Auth.");

      // Update the passwordNeedsReset flag in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        passwordNeedsReset: false,
      });
      console.log("ForcePasswordResetPage: passwordNeedsReset flag updated in Firestore.");

      // Update userProfile in Zustand store (optional, but good for consistency)
      if (userProfile) {
        useAuthStore.getState().setUserProfile({ ...userProfile, passwordNeedsReset: false });
      }

      setSuccessMessage("Password successfully updated! Redirecting to dashboard...");
      setTimeout(() => {
        router.replace('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error("ForcePasswordResetPage: Error updating password:", err);
      if (err.code === 'auth/wrong-password') {
        setError("The temporary password you entered is incorrect. Please try again.");
      } else if (err.code === 'auth/weak-password') {
        setError("The new password is too weak. Please choose a stronger password (at least 6 characters).");
      } else {
        setError(err.message || "Failed to update password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If auth is still loading or userProfile isn't available yet (and it should be on this page), show loader.
  // The useEffect above will handle redirecting if userProfile is available but doesn't meet criteria.
  if (authStoreIsLoading || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-600 ml-3">Loading password reset page...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <ShieldCheck className="mx-auto h-12 w-auto text-indigo-600" />
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-indigo-800">
          Create Your New Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Welcome, {userProfile?.displayName || userProfile?.username}! Please set a new password for your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Temporary Password
              </label>
              <div className="mt-1">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter the temporary password you received"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="mt-1">
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                <p>{error}</p>
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                <p>{successMessage}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !!successMessage} // Disable if submitting or already successful
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Setting New Password...
                  </>
                ) : (
                  "Set New Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
