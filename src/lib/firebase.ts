
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID, // Optional
};

// Log the Firebase configuration values the app is seeing
console.log("Firebase Config Being Used by src/lib/firebase.ts:");
console.log("FIREBASE_API_KEY:", process.env.FIREBASE_API_KEY ? "SET" : "NOT SET");
console.log("FIREBASE_AUTH_DOMAIN:", process.env.FIREBASE_AUTH_DOMAIN ? "SET" : "NOT SET");
console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID || "NOT SET");
console.log("FIREBASE_STORAGE_BUCKET:", process.env.FIREBASE_STORAGE_BUCKET ? "SET" : "NOT SET");
console.log("FIREBASE_MESSAGING_SENDER_ID:", process.env.FIREBASE_MESSAGING_SENDER_ID ? "SET" : "NOT SET");
console.log("FIREBASE_APP_ID:", process.env.FIREBASE_APP_ID ? "SET" : "NOT SET");

let app: FirebaseApp | undefined = undefined;
let db: Firestore | undefined = undefined;

if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase app initialized successfully.");
    } catch (e) {
      console.error("Firebase initialization failed in getApps().length === 0 block:", e);
    }
  } else {
    app = getApp();
    console.log("Firebase app retrieved using getApp().");
  }

  if (app) {
    try {
      db = getFirestore(app);
      console.log("Firestore 'db' instance obtained successfully.");
    } catch (e) {
      console.error("Failed to get Firestore 'db' instance:", e);
    }
  } else {
    console.error("Firebase app instance is undefined after initialization attempt. Firestore 'db' will be undefined.");
  }
} else {
  console.error(
    "Critical Firebase configuration error: FIREBASE_PROJECT_ID and/or FIREBASE_API_KEY are missing or undefined in environment variables. Firebase will not be initialized, and 'db' will be undefined."
  );
}

export { app, db };
