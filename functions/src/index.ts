import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

// --- Helper functions for username and password generation ---
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
  "Scarlet", "Silver", "Teal", "Aqua", "Beige", "Black", "Brown", "Gray", "White", "Yellow",
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
  "Sole", "Sprat", "Stingray", "Sturgeon", "Swordfish", "Trout", "Tuna", "Turbot", "Whiting", "Gnat",
];

function generateUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10; // Random 2-digit number
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
    // Fallback if truly unique username is hard to find quickly
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
  count: number; // Changed from students array to count
}

export const bulkCreateStudents = functions
  .region("europe-west1") // Ensure this is your desired region
  .https.onCall(async (data: BulkCreateStudentsPayload, context: functions.https.CallableContext) => {
    if (!context.auth) {
      functions.logger.error("Authentication Error: User not authenticated.");
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const teacherUid = context.auth.uid;
    const { classId, count } = data; // Destructure count

    if (!classId || typeof count !== 'number' || count <= 0) {
      functions.logger.error("Invalid Argument Error: Missing or invalid classId or count.", data);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid classId or count."
      );
    }
    if (count > 50) { // Max limit
      functions.logger.warn(`Attempt to create ${count} students, exceeding limit of 50.`, { teacherUid, classId });
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
        classNameForEmail = classData.className.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "class";
      }
    } catch (error: unknown) {
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
      password?: string; // To return the generated password
    }> = [];
    const studentCreationPromises = [];

    for (let i = 0; i < count; i++) {
      const username = await generateUniqueUsername();
      const password = generatePassword(); // Generate password

      const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const placeholderEmail = `${username.replace(/[^a-zA-Z0-9]/g, "")}.${classNameForEmail}.${uniqueSuffix}@mgsstudent.system`;

      studentCreationPromises.push(
        auth.createUser({
          email: placeholderEmail,
          emailVerified: false, // Or true if you don't need verification step
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
            createdStudentsInfo.push({ // Add to array to be returned
              uid: userRecord.uid,
              username: username,
              email: placeholderEmail,
              password: password, // Include the generated password
            });
            functions.logger.info(`Successfully created student: ${username} (UID: ${userRecord.uid}) and added to class: ${classId}`);
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
            functions.logger.error(`Failed to create student ${username} (email: ${placeholderEmail}):`, errorCode, errorMessage, error);
            // We don't throw here, just log and let Promise.all handle overall success/failure
            return null; // Indicate failure for this specific student
          })
      );
    }

    try {
      await Promise.all(studentCreationPromises);
    } catch (error: unknown) {
      // This catch might not be strictly necessary if individual promises handle their errors
      // and don't reject the Promise.all, but it's good for overall logging.
      functions.logger.error("Error during Promise.all for student creation (some students might have failed):", error);
    }
    
    // Filter out any nulls from failed creations if necessary, though createdStudentsInfo only gets pushed successful ones.
    if (createdStudentsInfo.length > 0) {
      return {
        success: true,
        message: `${createdStudentsInfo.length} of ${count} students generated successfully.`,
        createdStudents: createdStudentsInfo, // This array now includes passwords
      };
    } else if (count > 0 && createdStudentsInfo.length === 0) {
      throw new functions.https.HttpsError(
        "internal",
        "No students were created. All attempts failed. Check server logs for details."
      );
    } else { // Should not happen if count > 0
      throw new functions.https.HttpsError(
        "invalid-argument",
        "No student data was provided or count was zero."
      );
    }
  });

// You might want to add the resetStudentPassword function here in the future
// For now, focusing on fixing bulkCreateStudents
