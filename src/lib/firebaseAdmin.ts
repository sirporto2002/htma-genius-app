import * as admin from "firebase-admin";

/**
 * Firebase Admin SDK Initialization
 *
 * Safely initializes Firebase Admin for server-side Firestore access.
 * Handles multiline private keys from environment variables (Vercel-compatible).
 */

// Validate required environment variables
const requiredEnvVars = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

// Check for missing credentials
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(
    `[Firebase Admin] Missing required environment variables: ${missingVars.join(
      ", "
    )}`
  );
  console.error(
    "[Firebase Admin] Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment variables."
  );
}

// Prepare service account credentials
const serviceAccount: admin.ServiceAccount = {
  projectId: requiredEnvVars.projectId || "",
  clientEmail: requiredEnvVars.clientEmail || "",
  // Convert escaped newlines (\\n) to actual newlines (\n) for multiline private keys
  // This is critical for Vercel and other platforms that store keys as single-line strings
  privateKey: requiredEnvVars.privateKey?.replace(/\\n/g, "\n") || "",
};

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  try {
    // Validate credentials before initialization
    if (
      !serviceAccount.projectId ||
      !serviceAccount.clientEmail ||
      !serviceAccount.privateKey
    ) {
      throw new Error(
        "Firebase Admin credentials are incomplete. Check environment variables."
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    console.log(
      "[Firebase Admin] Successfully initialized with project:",
      serviceAccount.projectId
    );
  } catch (error) {
    console.error("[Firebase Admin] Initialization failed:", error);
    if (error instanceof Error) {
      console.error("[Firebase Admin] Error message:", error.message);
      console.error("[Firebase Admin] Error stack:", error.stack);
    }
    // Re-throw to prevent silent failures in production
    throw error;
  }
} else {
  console.log(
    "[Firebase Admin] Already initialized, reusing existing instance."
  );
}

// Export the initialized admin instance
export { admin };
