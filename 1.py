# This Python script generates the text for your firestore.rules file.
# You can run this script and copy its output, or redirect its output to a file named 'firestore.rules'.

def generate_firestore_rules():
    rules = """rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users Collection:
    // Users can read and write their own profile information.
    // Assumes a 'role' field might exist (e.g., 'student', 'teacher').
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Example: allow admin to read all user profiles (requires admin claim or role check)
      // allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Classes Collection:
    // - Authenticated users can read classes they are part of (either as teacher or student).
    // - Only teachers can create classes.
    // - Only the teacher who owns the class can update or delete it.
    // Assumes 'classes' documents have a 'teacherId' field and a 'studentUserIds' array field.
    match /classes/{classId} {
      allow read: if request.auth != null &&
                    (resource.data.teacherId == request.auth.uid || request.auth.uid in resource.data.studentUserIds);
      allow create: if request.auth != null && request.resource.data.teacherId == request.auth.uid &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
      allow update, delete: if request.auth != null && resource.data.teacherId == request.auth.uid &&
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }

    // New Worksheets Content (if stored in Firestore)
    // - All authenticated users (students and teachers) can read worksheet definitions.
    // - Writing worksheet content should be restricted (e.g., to admins via console/backend function).
    match /newWorksheets/{worksheetId} {
      allow read: if request.auth != null;
      // Example: allow write only by admins (not shown here, typically done via backend)
      // allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Assignments Collection:
    // - Teachers can create, read, update, delete assignments.
    // - Students can read assignments relevant to their class(es).
    // Assumes 'assignments' documents have 'teacherId' and 'classId' fields.
    // Assumes 'users/{userId}' documents have 'classIds' array for students.
    match /assignments/{assignmentId} {
      allow read: if request.auth != null &&
                    ( (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher' &&
                       resource.data.teacherId == request.auth.uid) ||
                      (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student' &&
                       resource.data.classId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.classIds)
                    );
      allow create: if request.auth != null &&
                       request.resource.data.teacherId == request.auth.uid &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
      allow update, delete: if request.auth != null &&
                               resource.data.teacherId == request.auth.uid &&
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }

    // Student Progress for New Worksheets:
    // - Document ID is composite: {userId}_{worksheetId}
    // - Students can only read and write their OWN progress documents.
    match /studentNewWorksheetProgress/{compositeId} {
      function getUserIdFromCompositeId() {
        return compositeId.split('_')[0];
      }
      allow read, write: if request.auth != null && request.auth.uid == getUserIdFromCompositeId();
      // Teachers might need to read student progress. This requires a more complex rule,
      // potentially checking if the teacher owns the class the worksheet was assigned to,
      // and if the student (from compositeId) is in that class.
      // Example (simplified, assuming assignment implies access):
      // allow read: if request.auth != null && (
      //   (request.auth.uid == getUserIdFromCompositeId()) ||
      //   (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher' &&
      //    exists(/databases/$(database)/documents/assignments/{some_assignment_linking_teacher_student_worksheet})) // This part needs careful design
      // );
    }

    // You might have other collections like 'studentOldWorksheetProgress' or 'teacherProfiles'
    // Add rules for them as needed.

  }
}
"""
    return rules

if __name__ == "__main__":
    rules_content = generate_firestore_rules()
    # Print to console
    print("--- Generated Firestore Rules ---")
    print(rules_content)
    print("---------------------------------")

    # Optionally, save to a file
    file_name = "firestore.rules"
    try:
        with open(file_name, 'w') as f:
            f.write(rules_content)
        print(f"SUCCESS: Firestore rules written to '{file_name}' in the current directory.")
        print("You can now use this file with the Firebase CLI or copy its content to the Firebase Console.")
    except IOError as e:
        print(f"ERROR: Could not write rules to file '{file_name}': {e}")

