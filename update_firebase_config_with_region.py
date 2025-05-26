import os

# --- START: Your Firebase Configuration ---
firebase_config_dict = {
  "apiKey": "AIzaSyD3SIZ4wTAVCU29NUct2UqIOIhj3UeriT4",
  "authDomain": "mgscompscihub2.firebaseapp.com",
  "projectId": "mgscompscihub2",
  "storageBucket": "mgscompscihub2.appspot.com",
  "messagingSenderId": "724174370927",
  "appId": "1:724174370927:web:fdee98faae3a3dd3cef59a"
  # "measurementId": "G-XXXXXXXXXX" # Add if you have one
}
# --- END: Your Firebase Configuration ---

# --- Function Deployment Region ---
# Ensure this matches the region you deployed your function to (e.g., in functions/src/index.ts)
FUNCTION_REGION = "europe-west1" 
# ---

def format_firebase_config_js_object(config_dict):
    items = []
    for key, value in config_dict.items():
        items.append(f'  {key}: "{value}",')
    if items:
        items[-1] = items[-1].rstrip(',') # Remove trailing comma from last item
    return "\\n".join(items)

def create_firebase_ts_content(config_dict, region):
    config_object_str = format_firebase_config_js_object(config_dict)
    
    typescript_content = f"""// src/config/firebase.ts
// This file was generated/updated by a Python script.
// It includes regional configuration for Firebase Functions.

import {{ initializeApp, getApps, getApp }} from "firebase/app";
import {{ getAuth }} from "firebase/auth";
import {{ getFirestore }} from "firebase/firestore";
import {{ getFunctions }} from "firebase/functions"; // Ensure this import is present

// Your web app's Firebase configuration
const firebaseConfig = {{
{config_object_str}
}};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Functions for the specific region your function is deployed to
const functions = getFunctions(app, "{region}"); 

export {{ app, auth, db, functions }};
"""
    return typescript_content

def write_file(file_path, content, project_root="."):
    full_path = os.path.join(project_root, file_path)
    try:
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"SUCCESS: File created/updated: {full_path}")
    except IOError as e:
        print(f"ERROR writing {full_path}: {e}")
    except Exception as e:
        print(f"Unexpected error writing {full_path}: {e}")

def main():
    project_root = os.getcwd()
    print(f"--- Updating Firebase Config with Region for Functions ---")
    print(f"Running in project root: {project_root}")
    
    firebase_ts_path = os.path.join("src", "config", "firebase.ts")
    
    final_firebase_ts_content = create_firebase_ts_content(firebase_config_dict, FUNCTION_REGION)
    write_file(firebase_ts_path, final_firebase_ts_content, project_root)

    print("\\n--- Firebase Config Update Complete ---")
    print(f"The functions instance in '{firebase_ts_path}' is now configured for region: '{FUNCTION_REGION}'.")
    print("Restart your Next.js development server (npm run dev) for changes to take effect.")
    print("Then, try the 'Bulk Add Students' feature again.")

if __name__ == "__main__":
    main()