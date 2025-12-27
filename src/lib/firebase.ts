import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

/**
 * Firebase Client SDK Initialization (Browser-Only)
 *
 * This module safely initializes Firebase only in the browser environment.
 * During SSR/build, all functions return null to prevent initialization errors.
 */

// Cache for initialized services
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

/**
 * Get Firebase configuration from environment variables
 * Supports both NEXT_PUBLIC_* vars and FIREBASE_WEBAPP_CONFIG (Firebase App Hosting)
 */
function getFirebaseConfig() {
  // Server-side or missing config - return null (safe for build)
  if (typeof window === "undefined") {
    return null;
  }

  // Try NEXT_PUBLIC_* environment variables first
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }

  // Fallback: Parse FIREBASE_WEBAPP_CONFIG (provided by Firebase App Hosting)
  try {
    const webappConfig = process.env.FIREBASE_WEBAPP_CONFIG;
    if (webappConfig) {
      const config = JSON.parse(webappConfig);
      return {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      };
    }
  } catch (error) {
    console.warn("[Firebase] Failed to parse FIREBASE_WEBAPP_CONFIG:", error);
  }

  return null;
}

/**
 * Get Firebase App instance (browser-only)
 * Returns null during SSR/build
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (_app) {
    return _app;
  }

  const config = getFirebaseConfig();
  if (!config || !config.apiKey) {
    console.warn("[Firebase] Missing configuration, cannot initialize");
    return null;
  }

  try {
    _app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    return _app;
  } catch (error) {
    console.error("[Firebase] Failed to initialize app:", error);
    return null;
  }
}

/**
 * Get Firebase Auth instance (browser-only)
 * Returns null during SSR/build
 */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (_auth) {
    return _auth;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    _auth = getAuth(app);
    return _auth;
  } catch (error) {
    console.error("[Firebase] Failed to initialize auth:", error);
    return null;
  }
}

/**
 * Get Firebase Firestore instance (browser-only)
 * Returns null during SSR/build
 */
export function getFirebaseDb(): Firestore | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (_db) {
    return _db;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    _db = getFirestore(app);
    return _db;
  } catch (error) {
    console.error("[Firebase] Failed to initialize firestore:", error);
    return null;
  }
}

// Backward compatibility exports (may be null during SSR/build)
export const auth = typeof window !== "undefined" ? getFirebaseAuth() : null;
export const db = typeof window !== "undefined" ? getFirebaseDb() : null;
const app = typeof window !== "undefined" ? getFirebaseApp() : null;

export default app;
