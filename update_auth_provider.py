import os

# Define the target file path relative to the project root
TARGET_FILE_PATH = "src/components/layout/AuthProvider.tsx"

# The complete new content for the AuthProvider.tsx file
# This version fetches the user's role from Firestore and updates the authStore.
NEW_AUTH_PROVIDER_CONTENT = r"""// src/components/layout/AuthProvider.tsx
"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter }
from "next/navigation"; // Import useRouter
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { useAuthStore, UserProfile } from "@/store/authStore"; // Import UserProfile type from store

// Define a type for the children prop
interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { setUserProfile, setLoading, userProfile, isLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter(); // Initialize router

  // This local loading state can be useful if you want to show a global app loader
  // until the initial auth check (including role fetch) is complete.
  const [isInitialAuthCheckComplete, setIsInitialAuthCheckComplete] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true); // Set loading true at the start of auth check
      if (firebaseUser) {
        try {
          // User is signed in, fetch their custom data including role
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let userRole: "teacher" | "student" | null = null;
          let additionalUserData = {}; // For any other custom fields you might store

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            userRole = data?.role || null;
            // Example: if you store other fields like 'fullName' in the user doc
            // additionalUserData = { fullName: data?.fullName };
            if (!userRole) {
                console.warn(`User UID: ${firebaseUser.uid} document exists but missing 'role' field.`);
            }
          } else {
            // This case should ideally not happen for logged-in users if your user creation process is robust.
            // If it does, it means a user is authenticated with Firebase Auth,
            // but their corresponding document in the 'users' collection is missing.
            console.warn(`No user document found in Firestore for UID: ${firebaseUser.uid}. Role will be null.`);
            // You might want to create a default user document here or log them out.
            // For now, we'll proceed with a null role.
          }
          
          const profile: UserProfile = {
            ...firebaseUser, // Spread all properties from FirebaseUser
            uid: firebaseUser.uid, // Ensure uid is explicitly part of UserProfile if not directly on FirebaseUser type in some contexts
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            isAnonymous: firebaseUser.isAnonymous,
            metadata: firebaseUser.metadata,
            providerData: firebaseUser.providerData,
            refreshToken: firebaseUser.refreshToken,
            tenantId: firebaseUser.tenantId,
            delete: firebaseUser.delete,
            getIdToken: firebaseUser.getIdToken,
            getIdTokenResult: firebaseUser.getIdTokenResult,
            reload: firebaseUser.reload,
            toJSON: firebaseUser.toJSON,
            // Add custom properties
            role: userRole,
            ...additionalUserData,
          };
          setUserProfile(profile);

        } catch (error) {
            console.error("Error fetching user role:", error);
            // Set user profile with Firebase user but null role in case of error fetching role
            const fallbackProfile: UserProfile = {
                ...firebaseUser,
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName,
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL,
                emailVerified: firebaseUser.emailVerified,
                isAnonymous: firebaseUser.isAnonymous,
                metadata: firebaseUser.metadata,
                providerData: firebaseUser.providerData,
                refreshToken: firebaseUser.refreshToken,
                tenantId: firebaseUser.tenantId,
                delete: firebaseUser.delete,
                getIdToken: firebaseUser.getIdToken,
                getIdTokenResult: firebaseUser.getIdTokenResult,
                reload: firebaseUser.reload,
                toJSON: firebaseUser.toJSON,
                role: null, // Fallback role
            };
            setUserProfile(fallbackProfile);
            useAuthStore.getState().setError("Failed to fetch user details.");
        } finally {
            setLoading(false);
            setIsInitialAuthCheckComplete(true);
        }
      } else {
        // User is signed out
        setUserProfile(null);
        setLoading(false);
        setIsInitialAuthCheckComplete(true);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setUserProfile, setLoading]); // Dependencies for onAuthStateChanged setup


  // Optional: Redirection logic based on auth state and current path
  // This can be more sophisticated depending on your app's needs.
  useEffect(() => {
    if (!isInitialAuthCheckComplete) return; // Wait for initial auth check

    const publicPaths = ["/login", "/signup"]; // Add any other public paths
    const isPublicPath = publicPaths.includes(pathname);

    if (!userProfile && !isPublicPath && !pathname.startsWith("/_next/")) {
      // If user is not logged in and trying to access a protected page
      router.push("/login");
    } else if (userProfile && isPublicPath) {
      // If user is logged in and on a public page (like login), redirect to dashboard
      router.push("/dashboard"); // Or your main app page after login
    }
  }, [userProfile, isInitialAuthCheckComplete, pathname, router]);


  // Show a global loader until the initial authentication check (including role fetch) is complete.
  // This prevents flashes of content or incorrect redirects.
  if (!isInitialAuthCheckComplete && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <p className="text-lg text-gray-600">Loading application...</p>
        {/* You can add a spinner icon here */}
      </div>
    );
  }

  return <>{children}</>;
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

    print(f"Updating AuthProvider.tsx at {absolute_file_path}...")
    create_or_update_file(absolute_file_path, NEW_AUTH_PROVIDER_CONTENT)
    
    print("\nAuthProvider.tsx update process finished.")
    print("This AuthProvider now fetches the user's role from Firestore and stores it in useAuthStore.")
    print("It also includes basic redirection logic and an initial app loading state.")
    print("Next, you'll need to update your login page to redirect to '/dashboard'.")

if __name__ == "__main__":
    main()
