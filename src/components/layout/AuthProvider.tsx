// src/components/layout/AuthProvider.tsx
"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { useAuthStore, UserProfile } from "@/store/authStore"; // UserProfile now includes passwordNeedsReset and classIds

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { setUserProfile, userProfile, isLoading: authStoreIsLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    console.log("AuthProvider: Component has mounted (client-side).");
  }, []);

  useEffect(() => {
    console.log("AuthProvider: Setting up onAuthStateChanged listener.");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log(`AuthProvider: onAuthStateChanged fired. User UID: ${firebaseUser ? firebaseUser.uid : "null"}`);
      useAuthStore.getState().setLoading(true);

      if (firebaseUser) {
        try {
          console.log(`AuthProvider: User detected (UID: ${firebaseUser.uid}). Fetching role, passwordNeedsReset, and classIds...`);
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let userRole: "teacher" | "student" | null = null;
          let passwordNeedsReset: boolean | null = null;
          let classIds: string[] | undefined = undefined; // Initialize as undefined

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userRole = userData?.role || null;
            passwordNeedsReset = userData?.passwordNeedsReset === true; 
            if (userRole === "student") { // Only fetch classIds for students
                classIds = userData?.classIds || []; // Default to empty array if not present
            }

            if (!userRole) {
              console.warn(`AuthProvider: User UID: ${firebaseUser.uid} document exists but is missing the 'role' field.`);
            } else {
              console.log(`AuthProvider: Role fetched for UID ${firebaseUser.uid}: ${userRole}`);
            }
            console.log(`AuthProvider: passwordNeedsReset flag for UID ${firebaseUser.uid}: ${passwordNeedsReset}`);
            if (userRole === "student") {
                console.log(`AuthProvider: classIds for student UID ${firebaseUser.uid}:`, classIds);
            }
          } else {
            console.warn(`AuthProvider: No user document found in Firestore for UID: ${firebaseUser.uid}. Role, passwordNeedsReset, and classIds will be null/undefined.`);
          }
          
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
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
            role: userRole,
            passwordNeedsReset: passwordNeedsReset,
            classIds: classIds, // Add classIds to the profile
          };
          console.log("AuthProvider: Setting user profile in store:", profile);
          setUserProfile(profile);
        } catch (error) {
          console.error("AuthProvider: Error fetching user details (role/passwordNeedsReset/classIds):", error);
          const fallbackProfile: UserProfile = {
            uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName, photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified, isAnonymous: firebaseUser.isAnonymous, metadata: firebaseUser.metadata,
            providerData: firebaseUser.providerData, refreshToken: firebaseUser.refreshToken, tenantId: firebaseUser.tenantId,
            delete: firebaseUser.delete, getIdToken: firebaseUser.getIdToken, getIdTokenResult: firebaseUser.getIdTokenResult,
            reload: firebaseUser.reload, toJSON: firebaseUser.toJSON,
            role: null,
            passwordNeedsReset: null,
            classIds: undefined, // Fallback
          };
          console.log("AuthProvider: Setting fallback user profile in store due to error:", fallbackProfile);
          setUserProfile(fallbackProfile);
          useAuthStore.getState().setError("Failed to fetch user details.");
        }
      } else {
        console.log("AuthProvider: No user detected (signed out). Setting user profile to null.");
        setUserProfile(null);
      }
    });
    return () => {
      console.log("AuthProvider: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Redirection logic (remains the same as previous version with passwordNeedsReset handling)
  useEffect(() => {
    if (!hasMounted || authStoreIsLoading) {
      return; 
    }

    const publicPaths = ["/login", "/signup"];
    const forceResetPath = "/student/force-reset-password";
    
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    const isForceResetPath = pathname.startsWith(forceResetPath);
    
    if (pathname.startsWith("/_next/") || pathname.includes("/static/") || pathname.includes(".")) {
      return;
    }

    console.log(`AuthProvider (Redirect Check): Path: ${pathname}, IsPublic: ${isPublicPath}, IsForceReset: ${isForceResetPath}, UserLoggedIn: ${!!userProfile}, UserRole: ${userProfile?.role}, PasswordNeedsReset: ${userProfile?.passwordNeedsReset}, AuthStoreLoading: ${authStoreIsLoading}, HasMounted: ${hasMounted}`);

    if (userProfile) {
      if (userProfile.role === "student" && userProfile.passwordNeedsReset === true) {
        if (!isForceResetPath) {
          console.log(`AuthProvider (Redirect Action): Student ${userProfile.uid} needs password reset. Redirecting to ${forceResetPath}. Current path: ${pathname}`);
          router.replace(forceResetPath);
          return; 
        }
      } else if (isPublicPath || pathname === "/") {
        console.log(`AuthProvider (Redirect Action): User IS logged in (UID: ${userProfile.uid}, Role: ${userProfile.role}), on PUBLIC or ROOT path (${pathname}). Redirecting to /dashboard.`);
        router.replace("/dashboard");
      }
    } else {
      if (!isPublicPath && !isForceResetPath) {
        console.log(`AuthProvider (Redirect Action): User is NOT logged in, on PROTECTED path (${pathname}). Redirecting to /login.`);
        router.replace("/login");
      }
    }
  }, [userProfile, authStoreIsLoading, hasMounted, pathname, router]);

  if (!hasMounted || authStoreIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-600 ml-3">Loading MGS CS Hub...</p>
      </div>
    );
  }

  return <>{children}</>;
}
