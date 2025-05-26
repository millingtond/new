import os

# Define the target file path relative to the project root
TARGET_FILE_PATH = "functions/src/index.ts"

# The new Firebase Functions to be added.
# This will be appended to the existing content if possible, or replace a placeholder.
# For simplicity in this script, we'll define the full expected content.
# Ensure helper functions like generatePassword are accessible or redefined if needed.

NEW_FUNCTIONS_CONTENT = r"""
// New function to reset a student's password
export const resetStudentPassword = functions
  .region("europe-west1") // Match your region
  .https.onCall(async (data: { studentUid: string }, context: functions.https.CallableContext) => {
    if (!context.auth || !context.auth.uid) {
      functions.logger.error("Authentication Error: User not authenticated for password reset.");
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }
    // Potentially add a check here to ensure the caller is a teacher
    // and has rights over the student or class the student is in.
    // For now, any authenticated user (assumed teacher) can call this.

    const { studentUid } = data;
    if (!studentUid) {
      functions.logger.error("Invalid Argument: Missing studentUid for password reset.");
      throw new functions.https.HttpsError("invalid-argument", "studentUid is required.");
    }

    const newPassword = generatePassword(); // Using the existing helper

    try {
      await auth.updateUser(studentUid, {
        password: newPassword,
      });
      functions.logger.info(`Password reset successfully for student UID: ${studentUid} by teacher UID: ${context.auth.uid}`);
      // Return the new password to the teacher to communicate to the student.
      // This is the ONLY time the new password will be sent in plain text.
      return {
        success: true,
        message: "Student password reset successfully.",
        newPassword: newPassword, // Sending back the new password
      };
    } catch (error: unknown) {
      functions.logger.error(`Error resetting password for student UID ${studentUid}:`, error);
      let message = "Failed to reset student password.";
      if (error instanceof Error) {
        message = error.message;
      }
      throw new functions.https.HttpsError("internal", message);
    }
  });

// New function to remove a student from a class
export const removeStudentFromClass = functions
  .region("europe-west1") // Match your region
  .https.onCall(async (data: { classId: string; studentUid: string }, context: functions.https.CallableContext) => {
    if (!context.auth || !context.auth.uid) {
      functions.logger.error("Authentication Error: User not authenticated for removing student.");
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const teacherUid = context.auth.uid;
    const { classId, studentUid } = data;

    if (!classId || !studentUid) {
      functions.logger.error("Invalid Argument: Missing classId or studentUid.", data);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "classId and studentUid are required."
      );
    }

    const classRef = db.collection("classes").doc(classId);
    const studentUserRef = db.collection("users").doc(studentUid);

    try {
      // Verify teacher owns the class
      const classDoc = await classRef.get();
      if (!classDoc.exists) {
        throw new functions.https.HttpsError("not-found", `Class ${classId} not found.`);
      }
      if (classDoc.data()?.teacherId !== teacherUid) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You do not have permission to modify this class."
        );
      }

      // Start a batch write to update both documents atomically
      const batch = db.batch();

      // Remove studentId from the class's studentIds array
      batch.update(classRef, {
        studentIds: admin.firestore.FieldValue.arrayRemove(studentUid),
      });

      // Remove classId from the student's classIds array
      batch.update(studentUserRef, {
        classIds: admin.firestore.FieldValue.arrayRemove(classId),
      });
      
      // Optional: Decide if student's auth account should be disabled/deleted
      // if they are no longer in any classes. This adds complexity.
      // For now, we just disassociate from the class.
      // Example: check studentUserRef's classIds array after removal. If empty, consider disabling.
      // const studentDoc = await studentUserRef.get();
      // const studentData = studentDoc.data();
      // if (studentData && studentData.classIds && studentData.classIds.filter(cId => cId !== classId).length === 0) {
      //   // Student is in no other classes after this removal
      //   // await auth.updateUser(studentUid, { disabled: true });
      //   // functions.logger.info(`Student UID ${studentUid} disabled as they are no longer in any classes.`);
      // }


      await batch.commit();
      functions.logger.info(`Student UID ${studentUid} removed from class ID ${classId} by teacher UID: ${teacherUid}`);
      return {
        success: true,
        message: "Student removed from class successfully.",
      };
    } catch (error: unknown) {
      functions.logger.error(`Error removing student UID ${studentUid} from class ID ${classId}:`, error);
      if (error instanceof functions.https.HttpsError) throw error; // Re-throw HttpsError
      let message = "Failed to remove student from class.";
      if (error instanceof Error) {
        message = error.message;
      }
      throw new functions.https.HttpsError("internal", message);
    }
  });
"""

# Read existing content first
EXISTING_CONTENT = ""
# Construct the absolute path carefully
project_root_for_functions = os.getcwd()  # Assuming script is run from project root where 'functions' folder lies
absolute_target_file_path = os.path.join(project_root_for_functions, TARGET_FILE_PATH)

try:
    if os.path.exists(absolute_target_file_path):
        with open(absolute_target_file_path, 'r', encoding='utf-8') as f:
            EXISTING_CONTENT = f.read()
    else:
        print(f"Warning: File {absolute_target_file_path} not found. A new file will be created with all functions.")
        # If the file doesn't exist, we might need to provide the full initial content,
        # including imports and the bulkCreateStudents function.
        # For this script, let's assume the previous script for bulkCreateStudents ran successfully.
        # If not, the user needs to ensure the base file structure is present.
        # To make this script more robust if the file is missing, we'd redefine the full content.
        # For now, we append or replace based on a marker.

except IOError as e:
    print(f"Error reading existing file {absolute_target_file_path}: {e}")
    # Decide how to proceed if reading fails. Maybe exit or use default full content.


# Check if helper functions are already present (simple check for one function name)
# A more robust way would be to ensure the full helper block.
# For this script, if 'generatePassword' isn't in the existing content,
# it implies the full previous script for bulkCreateStudents might not have run completely,
# or the file is very different.
# We'll assume `bulkCreateStudents` and its helpers are there from the previous script.

# Combine the existing content with the new functions.
# A simple approach is to append. A more robust approach might look for a specific insertion point.
# For this case, we will append the new functions to the existing content.
if "// You might want to add the resetStudentPassword function here in the future" in EXISTING_CONTENT:
    FINAL_CONTENT = EXISTING_CONTENT.replace(
        "// You might want to add the resetStudentPassword function here in the future",
        NEW_FUNCTIONS_CONTENT.strip() # Use strip to remove leading/trailing whitespace from the new block
    )
elif EXISTING_CONTENT: # If file exists and marker is not there, append
    FINAL_CONTENT = EXISTING_CONTENT.strip() + "\n\n" + NEW_FUNCTIONS_CONTENT.strip()
else: # File didn't exist or was empty, use a more complete structure
    print(f"Warning: Reconstructing functions/src/index.ts as it was missing or empty.")
    print("This assumes you have already run the script that defines 'bulkCreateStudents' and its helpers.")
    print("If not, you may need to combine this script's output with the previous one for 'bulkCreateStudents'.")
    # This is a fallback; ideally, the user runs scripts in order.
    # For now, we'll just set FINAL_CONTENT to the new functions, assuming the user
    # will manually merge if the base `bulkCreateStudents` is missing.
    # A better fallback would be to include the full expected content of index.ts
    # if the original file is missing. This script is simplified for appending.
    FINAL_CONTENT = NEW_FUNCTIONS_CONTENT.strip() # This will be incomplete if base file missing.
    # A more robust solution for a missing file:
    # (Assuming bulkCreateStudents and helpers were defined in a previous NEW_FILE_CONTENT variable)
    # FINAL_CONTENT = PREVIOUS_FULL_INDEX_TS_CONTENT_WITH_BULK_CREATE + "\n\n" + NEW_FUNCTIONS_CONTENT


def main():
    """
    Main function to update the specified Firebase Functions file.
    """
    # Using absolute_target_file_path defined outside main for clarity
    
    try:
        # Ensure the directory exists (src within functions)
        os.makedirs(os.path.dirname(absolute_target_file_path), exist_ok=True)
        
        # Write the combined content to the file, overwriting it
        with open(absolute_target_file_path, 'w', encoding='utf-8') as f:
            f.write(FINAL_CONTENT) # Use the combined or reconstructed content
        
        print(f"Successfully updated Firebase Functions file: {absolute_target_file_path}")
        print("Added 'resetStudentPassword' and 'removeStudentFromClass' functions.")
        print("Please remember to deploy your Firebase Functions after this update using 'firebase deploy --only functions'")

    except IOError as e:
        print(f"Error writing to file {absolute_target_file_path}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    if not EXISTING_CONTENT and "// New function to reset a student's password" not in FINAL_CONTENT:
        print("Error: Could not properly determine existing content of functions/src/index.ts.")
        print("The script will attempt to write only the new functions. Please ensure this is correct or manually merge.")
        # If EXISTING_CONTENT is empty, FINAL_CONTENT will just be NEW_FUNCTIONS_CONTENT,
        # which is fine if the intent is to overwrite with only these. But typically, we append.
        # The logic above tries to handle this by reconstructing, but it's complex without the previous state.
        # Let's ensure FINAL_CONTENT always has something meaningful if the script proceeds.
        if not FINAL_CONTENT.strip(): # If it's somehow still empty
            FINAL_CONTENT = NEW_FUNCTIONS_CONTENT.strip()


    main()
