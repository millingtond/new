import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

// --- Configuration ---
const TEMPORARY_DEFAULT_STUDENT_PASSWORD = "changeme123"; // CHOOSE A SECURE DEFAULT OR MAKE IT AN ENV VAR
const STUDENT_EMAIL_DOMAIN = "mgsstudent.system"; // Define a fixed domain for student system emails

// --- Helper functions for username generation ---
const ADJECTIVES = [
  "Agile", "Bright", "Clever", "Daring", "Eager", "Fancy", "Gentle", "Happy", "Jolly", "Keen",
  "Lively", "Merry", "Noble", "Placid", "Quiet", "Regal", "Sharp", "Tranquil", "Vivid", "Witty",
  "Brave", "Calm", "Chic", "Cool", "Epic", "Fair", "Fine", "Glad", "Grand", "Great",
  "Kind", "Lucky", "Major", "Mint", "Nice", "Prime", "Proud", "Quick", "Rapid", "Smart",
  "Sound", "Spry", "Super", "Swift", "Top", "Vast", "Wise", "Zany", "Zippy", "Alpha",
  "Beta", "Delta", "Gamma", "Omega", "Sigma", "Zeta", "Amber", "Azure", "Blue", "Bronze",
  "Coral", "Crimson", "Denim", "Emerald", "Gold", "Green", "Indigo", "Ivory", "Jade", "Khaki",
  "Lavender", "Lime", "Magenta", "Maroon", "Mauve", "Navy", "Olive", "Orange", "Orchid", "Peach",
  "Perl", "Pink", "Plum", "Purple", "Red", "Rose", "Ruby", "Saffron", "Salmon", "Sapphire",
  "Scarlet", "Silver", "Teal", "Aqua", "Beige", "Black", "Brown", "Gray", "White", "Yellow"
];
const NOUNS = [
  "Ape", "Badger", "Bear", "Cat", "Deer", "Dog", "Elk", "Fox", "Goat", "Hare",
  "Ibex", "Jaguar", "Koala", "Lion", "Lynx", "Mole", "Mouse", "Newt", "Otter", "Panda",
  "Puma", "Rabbit", "Raccoon", "Seal", "Skunk", "Sloth", "Snake", "Tiger", "Viper", "Wolf",
  "Wombat", "Yak", "Zebra", "Ant", "Bee", "Bug", "Fly", "Moth", "Wasp", "Bat",
  "Bird", "Crane", "Crow", "Dove", "Duck", "Eagle", "Egret", "Falcon", "Finch", "Goose",
  "Gull", "Hawk", "Heron", "Ibis", "Jay", "Kestrel", "Kingfisher", "Kite", "Lark", "Loon",
  "Magpie", "Martin", "Meadowlark", "Nighthawk", "Oriole", "Osprey", "Owl", "Parrot", "Pelican", "Penguin",
  "Petrel", "Pigeon", "Plover", "Puffin", "Quail", "Raven", "Robin", "Rook", "Sandpiper", "Sparrow",
  "Starling", "Stork", "Swallow", "Swan", "Swift", "Tern", "Thrush", "Toucan", "Turkey", "Vulture",
  "Warbler", "Woodpecker", "Wren", "Cod", "Crab", "Eel", "Fish", "Fluke", "Hake", "Herring",
  "Ling", "Mackerel", "Perch", "Pike", "Plaice", "Ray", "Salmon", "Sardine", "Shark", "Skate",
  "Sole", "Sprat", "Stingray", "Sturgeon", "Swordfish", "Trout", "Tuna", "Turbot", "Whiting", "Gnat"
];

function generateUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj.toLowerCase()}-${noun.toLowerCase()}${num}`;
}

async function isUsernameUnique(username: string): Promise<boolean> {
  const usersRef = db.collection("users");
  const snapshot = await usersRef.where("username", "==", username).limit(1).get();
  return snapshot.empty;
}

async function generateUniqueUsername(): Promise<string> {
  let username = generateUsername();
  let attempts = 0;
  while (!(await isUsernameUnique(username)) && attempts < 10) {
    username = generateUsername();
    attempts++;
  }
  if (attempts >= 10) {
    return `${username}${Date.now().toString().slice(-4)}`;
  }
  return username;
}

function generatePassword(length: number = 10): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
// --- End of helper functions ---

interface BulkCreateStudentsPayload {
  classId: string;
  count: number;
}

export const bulkCreateStudents = functions
  .region("europe-west1")
  .https.onCall(async (data: BulkCreateStudentsPayload, context: functions.https.CallableContext) => {
    if (!context.auth) {
      functions.logger.error("Authentication Error: User not authenticated.");
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const teacherUid = context.auth.uid;
    const { classId, count } = data;

    if (!classId || typeof count !== "number" || count <= 0) {
      functions.logger.error("Invalid Argument Error: Missing or invalid classId or count.", data);
      throw new functions.https.HttpsError("invalid-argument", "Missing or invalid classId or count.");
    }
    if (count > 50) {
      functions.logger.warn(`Attempt to create ${count} students, exceeding limit of 50.`, { teacherUid, classId });
      throw new functions.https.HttpsError("invalid-argument", "Cannot create more than 50 students at a time.");
    }

    // Class ownership verification logic (remains the same)
    try {
      const classRef = db.collection("classes").doc(classId);
      const classDoc = await classRef.get();
      if (!classDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Class not found.");
      }
      const classData = classDoc.data();
      if (classData?.teacherId !== teacherUid) {
        throw new functions.https.HttpsError("permission-denied", "You do not have permission to add students to this class.");
      }
    } catch (error: unknown) {
      functions.logger.error("Error verifying class ownership for classId " + classId + ":", error);
      if (error instanceof functions.https.HttpsError) throw error;
      let message = "Could not verify class ownership.";
      if (error instanceof Error) { message = error.message; }
      throw new functions.https.HttpsError("internal", message);
    }

    const createdStudentsInfo: Array<{
      uid: string;
      username: string;
      email?: string; // The system email created for Firebase Auth
    }> = [];
    const studentCreationPromises = [];

    for (let i = 0; i < count; i++) {
      const username = await generateUniqueUsername();
      const password = TEMPORARY_DEFAULT_STUDENT_PASSWORD;
      // Simplified placeholder email using the username and a fixed domain
      const placeholderEmail = `${username}@${STUDENT_EMAIL_DOMAIN}`;

      studentCreationPromises.push(
        auth.createUser({
          email: placeholderEmail, // Use the simplified email
          emailVerified: false,
          password: password,
          displayName: username,
          disabled: false,
        })
          .then(async (userRecord) => {
            await db.collection("users").doc(userRecord.uid).set({
              username: username,
              role: "student",
              classIds: admin.firestore.FieldValue.arrayUnion(classId),
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              passwordNeedsReset: true,
              systemEmail: placeholderEmail, // Store the system email for reference if needed
            });
            await db.collection("classes").doc(classId).update({
              studentIds: admin.firestore.FieldValue.arrayUnion(userRecord.uid),
            });
            createdStudentsInfo.push({
              uid: userRecord.uid,
              username: username,
              email: placeholderEmail, // Return the system email created
            });
            functions.logger.info(`Successfully created student: ${username} (UID: ${userRecord.uid}) with email ${placeholderEmail} and temporary password, added to class: ${classId}`);
            return userRecord.uid;
          })
          .catch((error: unknown) => {
            let errorCode = "UNKNOWN_ERROR";
            let errorMessage = "An unknown error occurred during student creation.";
            if (error instanceof Error) {
              errorMessage = error.message;
              if (typeof error === "object" && error !== null && "code" in error) {
                errorCode = String((error as { code: string }).code);
              }
            }
            functions.logger.error(`Failed to create student (intended username ${username}, email: ${placeholderEmail}):`, errorCode, errorMessage, error);
            return null;
          })
      );
    }

    await Promise.all(studentCreationPromises);
    
    if (createdStudentsInfo.length > 0) {
      return {
        success: true,
        message: `${createdStudentsInfo.length} of ${count} students generated successfully. They must reset their password on first login using the temporary default password: "${TEMPORARY_DEFAULT_STUDENT_PASSWORD}".`,
        createdStudents: createdStudentsInfo,
      };
    } else if (count > 0 && createdStudentsInfo.length === 0) {
      throw new functions.https.HttpsError("internal", "No students were created. All attempts failed.");
    } else {
      throw new functions.https.HttpsError("invalid-argument", "No student data was provided or count was zero.");
    }
  });

// resetStudentPassword function (remains the same)
export const resetStudentPassword = functions
  .region("europe-west1")
  .https.onCall(async (data: { studentUid: string }, context: functions.https.CallableContext) => {
    if (!context.auth || !context.auth.uid) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { studentUid } = data;
    if (!studentUid) {
      throw new functions.https.HttpsError("invalid-argument", "studentUid is required.");
    }
    const newPassword = generatePassword();
    try {
      await auth.updateUser(studentUid, { password: newPassword });
      await db.collection("users").doc(studentUid).set({ passwordNeedsReset: false }, { merge: true });
      functions.logger.info(`Password reset successfully for student UID: ${studentUid} by teacher UID: ${context.auth.uid}`);
      return { success: true, message: "Student password reset successfully.", newPassword: newPassword };
    } catch (error: unknown) {
      functions.logger.error(`Error resetting password for student UID ${studentUid}:`, error);
      let message = "Failed to reset student password.";
      if (error instanceof Error) { message = error.message; }
      throw new functions.https.HttpsError("internal", message);
    }
  });

// removeStudentFromClass function (remains the same)
export const removeStudentFromClass = functions
  .region("europe-west1")
  .https.onCall(async (data: { classId: string; studentUid: string }, context: functions.https.CallableContext) => {
    if (!context.auth || !context.auth.uid) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const teacherUid = context.auth.uid;
    const { classId, studentUid } = data;
    if (!classId || !studentUid) {
      throw new functions.https.HttpsError("invalid-argument", "classId and studentUid are required.");
    }
    const classRef = db.collection("classes").doc(classId);
    const studentUserRef = db.collection("users").doc(studentUid);
    try {
      const classDoc = await classRef.get();
      if (!classDoc.exists) { throw new functions.https.HttpsError("not-found", `Class ${classId} not found.`); }
      if (classDoc.data()?.teacherId !== teacherUid) { throw new functions.https.HttpsError("permission-denied", "You do not have permission to modify this class.");}
      const batch = db.batch();
      batch.update(classRef, { studentIds: admin.firestore.FieldValue.arrayRemove(studentUid) });
      batch.update(studentUserRef, { classIds: admin.firestore.FieldValue.arrayRemove(classId) });
      await batch.commit();
      return { success: true, message: "Student removed from class successfully." };
    } catch (error: unknown) {
      functions.logger.error(`Error removing student UID ${studentUid} from class ID ${classId}:`, error);
      if (error instanceof functions.https.HttpsError) throw error;
      let message = "Failed to remove student from class.";
      if (error instanceof Error) { message = error.message; }
      throw new functions.https.HttpsError("internal", message);
    }
  });

// assignWorksheetToClass function (remains the same)
export const assignWorksheetToClass = functions
  .region("europe-west1")
  .https.onCall(async (data: { classId: string; worksheetId: string; worksheetTitle?: string; className?: string }, context: functions.https.CallableContext) => {
    if (!context.auth || !context.auth.uid) {
      throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const teacherUid = context.auth.uid;
    const { classId, worksheetId, worksheetTitle, className } = data;
    if (!classId || !worksheetId) {
      throw new functions.https.HttpsError("invalid-argument", "classId and worksheetId are required.");
    }
    const classRef = db.collection("classes").doc(classId);
    const worksheetRef = db.collection("worksheets").doc(worksheetId);
    let actualWorksheetTitle = worksheetTitle;
    let actualClassName = className;
    try {
      const classDoc = await classRef.get();
      if (!classDoc.exists) { throw new functions.https.HttpsError("not-found", `Class ${classId} not found.`); }
      const classData = classDoc.data();
      if (classData?.teacherId !== teacherUid) { throw new functions.https.HttpsError("permission-denied", "You do not have permission to assign worksheets to this class."); }
      if (!actualClassName && classData?.className) { actualClassName = classData.className; }
      if (!actualWorksheetTitle) {
        const worksheetDoc = await worksheetRef.get();
        if (!worksheetDoc.exists) { throw new functions.https.HttpsError("not-found", `Worksheet ${worksheetId} not found.`); }
        actualWorksheetTitle = worksheetDoc.data()?.title || "Untitled Worksheet";
      }
      const assignmentsRef = db.collection("assignments");
      const existingAssignmentQuery = await assignmentsRef.where("classId", "==", classId).where("worksheetId", "==", worksheetId).limit(1).get();
      if (!existingAssignmentQuery.empty) {
        return { success: true, message: "Worksheet was already assigned to this class.", assignmentId: existingAssignmentQuery.docs[0].id };
      }
      const newAssignmentRef = assignmentsRef.doc();
      await newAssignmentRef.set({
        worksheetId: worksheetId,
        worksheetTitle: actualWorksheetTitle,
        classId: classId,
        className: actualClassName || "Unknown Class",
        teacherId: teacherUid,
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { success: true, message: "Worksheet assigned successfully.", assignmentId: newAssignmentRef.id };
    } catch (error: unknown) {
      functions.logger.error(`Error assigning worksheet ${worksheetId} to class ${classId}:`, error);
      if (error instanceof functions.https.HttpsError) throw error;
      let message = "Failed to assign worksheet.";
      if (error instanceof Error) { message = error.message; }
      throw new functions.https.HttpsError("internal", message);
    }
  });
