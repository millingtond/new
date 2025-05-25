import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

interface StudentCreationData {
  username: string;
  password: string;
}

interface BulkCreateStudentsPayload {
  classId: string;
  students: StudentCreationData[];
}

export const bulkCreateStudents = functions
  .region("europe-west1") // TODO: Set your desired region
  .https.onCall(async (data: BulkCreateStudentsPayload, context: functions.https.CallableContext) => {
    if (!context.auth) {
      functions.logger.error("Authentication Error: User not authenticated.");
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const teacherUid = context.auth.uid;
    const { classId, students } = data;

    if (!classId || !students || !Array.isArray(students) || students.length === 0) {
      functions.logger.error("Invalid Argument Error: Missing or invalid classId or students list.", data);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid classId or students list."
      );
    }
    if (students.length > 50) {
      functions.logger.warn(`Attempt to create ${students.length} students, exceeding limit of 50.`, { teacherUid, classId });
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Cannot create more than 50 students at a time."
      );
    }

    let classNameForEmail = "class";
    try {
      const classRef = db.collection("classes").doc(classId);
      const classDoc = await classRef.get();

      if (!classDoc.exists) {
        functions.logger.error(`Class Not Found Error: classId ${classId} does not exist.`);
        throw new functions.https.HttpsError("not-found", "Class not found.");
      }
      const classData = classDoc.data();
      if (classData?.teacherId !== teacherUid) {
        functions.logger.error(`Permission Denied: Teacher ${teacherUid} attempted to modify class ${classId} owned by ${classData?.teacherId}.`);
        throw new functions.https.HttpsError(
          "permission-denied",
          "You do not have permission to add students to this class."
        );
      }
      if (classData?.className) {
        classNameForEmail = classData.className.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      }
    } catch (error: unknown) { // Corrected: any to unknown
      functions.logger.error("Error verifying class ownership for classId " + classId + ":", error);
      if (error instanceof functions.https.HttpsError) throw error;
      let message = "Could not verify class ownership.";
      if (error instanceof Error) {
        message = error.message;
      }
      throw new functions.https.HttpsError("internal", message);
    }

    const createdStudentsInfo: Array<{
      uid: string;
      username: string;
      email?: string;
      password?: string;
    }> = [];
    const studentCreationPromises = [];

    for (const student of students) {
      const { username, password } = student;

      if (!username || !password) {
        functions.logger.warn("Skipping student due to missing username or password:", { username });
        continue;
      }

      const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const placeholderEmail = `${username.replace(/[^a-zA-Z0-9]/g, "")}.${classNameForEmail}.${uniqueSuffix}@mgsstudent.system`;

      studentCreationPromises.push(
        auth.createUser({
          email: placeholderEmail,
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
            });
            await db.collection("classes").doc(classId).update({
              studentIds: admin.firestore.FieldValue.arrayUnion(userRecord.uid),
            });
            createdStudentsInfo.push({
              uid: userRecord.uid,
              username: username,
              email: placeholderEmail,
              password: password,
            });
            functions.logger.info(`Successfully created student: ${username} (UID: ${userRecord.uid}) and added to class: ${classId}`);
            return userRecord.uid;
          })
          .catch((error: unknown) => { // Corrected: any to unknown
            let errorCode = "UNKNOWN_ERROR";
            let errorMessage = "An unknown error occurred during student creation.";
            if (error instanceof Error) {
              errorMessage = error.message;
              // For Firebase specific errors, they often have a 'code' property
              if (typeof error === "object" && error !== null && "code" in error) {
                errorCode = String((error as { code: string }).code);
              }
            }
            functions.logger.error(`Failed to create student ${username} (email: ${placeholderEmail}):`, errorCode, errorMessage, error);
            return null;
          })
      );
    }

    try {
      await Promise.all(studentCreationPromises);
    } catch (error: unknown) { // Corrected: any to unknown
      functions.logger.error("Error during Promise.all for student creation:", error);
    }

    if (createdStudentsInfo.length > 0) {
      return {
        success: true,
        message: `${createdStudentsInfo.length} of ${students.length} students created successfully.`,
        createdStudents: createdStudentsInfo,
      };
    } else if (students.length > 0 && createdStudentsInfo.length === 0) {
      throw new functions.https.HttpsError(
        "internal",
        "No students were created. All attempts failed. Check server logs for details."
      );
    } else {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "No student data was provided to create."
      );
    }
  });
