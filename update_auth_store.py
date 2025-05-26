import os

# Define the target file path relative to the project root
TARGET_FILE_PATH = "src/store/authStore.ts"

# The complete new content for the authStore.ts file
# This version includes a userProfile object to store the user and their role.
NEW_AUTH_STORE_CONTENT = r"""// src/store/authStore.ts
import { create } from "zustand";
import { User as FirebaseUser } from "firebase/auth";

// Define a more detailed UserProfile that includes the role
export interface UserProfile extends FirebaseUser {
  role?: "teacher" | "student" | null; // Define possible roles
  // You can add other custom user properties here if needed from your Firestore 'users' document
}

interface AuthState {
  userProfile: UserProfile | null; // Stores the Firebase user object along with custom properties like role
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

    print(f"Updating authStore.ts at {absolute_file_path}...")
    create_or_update_file(absolute_file_path, NEW_AUTH_STORE_CONTENT)
    
    print("\nauthStore.ts update process finished.")
    print("Next, you'll need a script to update AuthProvider.tsx to fetch and use this role.")

if __name__ == "__main__":
    main()
