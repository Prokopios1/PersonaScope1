
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID, // This could be undefined if env var is missing
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID, // Optional
};

let app: FirebaseApp | undefined = undefined;
let db: Firestore | undefined = undefined;

// Only attempt to initialize if the crucial projectId and apiKey are present
if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Firebase initialization failed in getApps().length === 0 block:", e);
      // app remains undefined
    }
  } else {
    app = getApp(); // Assumes getApp() will return a previously initialized app or handle its own errors.
  }

  if (app) {
    try {
      db = getFirestore(app);
    } catch (e) {
      console.error("Failed to get Firestore instance:", e);
      // db remains undefined
    }
  } else if (firebaseConfig.projectId && firebaseConfig.apiKey) {
    // This case might occur if initializeApp failed silently or getApp() didn't return an instance
    // when it was expected to.
    console.error("Firebase app instance is undefined after initialization attempt, though projectId and apiKey were present. Firestore will not be available.");
  }
} else {
  console.error(
    "Firebase configuration error: FIREBASE_PROJECT_ID and/or FIREBASE_API_KEY are missing or undefined in environment variables. Firebase will not be initialized, and 'db' will be undefined."
  );
}

export { app, db }; // app and db can be undefined
