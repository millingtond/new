// src/store/authStore.ts
import { create } from "zustand";
import { User as FirebaseUser } from "firebase/auth";

// Define a more detailed UserProfile that includes the role and passwordNeedsReset flag
export interface UserProfile extends FirebaseUser {
  role?: "teacher" | "student" | null; // Define possible roles
  passwordNeedsReset?: boolean | null; // Flag for students needing to reset password
  classIds?: string[]; // Array of class IDs the student is enrolled in
  // You can add other custom user properties here if needed from your Firestore 'users' document
  // For example, if you store 'systemEmail' in Firestore for students:
  // systemEmail?: string; 
}

interface AuthState {
  userProfile: UserProfile | null; // Stores the Firebase user object along with custom properties
  isLoading: boolean;
  error: string | null;
  setUserProfile: (profile: UserProfile | null) => void; // Action to set the detailed user profile
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuthError: () => void; // Action to clear any auth-related errors
}

export const useAuthStore = create<AuthState>((set) => ({
  userProfile: null,
  isLoading: true, // Initially true until auth state is checked
  error: null,
  setUserProfile: (profile) => set({ userProfile: profile, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clearAuthError: () => set({ error: null }),
}));
