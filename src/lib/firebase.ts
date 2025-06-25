
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

console.log("\n\n--- CHECKING FIREBASE CONFIG in src/lib/firebase.ts ---");
console.log(`- Project ID from env: ${firebaseConfig.projectId || 'NOT SET (Check FIREBASE_PROJECT_ID in .env.local)'}`);
console.log(`- API Key from env: ${firebaseConfig.apiKey ? 'SET' : 'NOT SET (Check FIREBASE_API_KEY in .env.local)'}`);
console.log("------------------------------------------------------\n\n");

let app: FirebaseApp | undefined = undefined;
let db: Firestore | undefined = undefined;

// Only attempt to initialize if the essential variables are present
if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("✅ Firebase app initialized successfully.");
    } catch (e) {
      console.error("❌ Firebase initialization failed in getApps().length === 0 block:", e);
    }
  } else {
    app = getApp();
    console.log("✅ Firebase app retrieved using getApp().");
  }

  if (app) {
    try {
      db = getFirestore(app);
      console.log("✅ Firestore 'db' instance obtained successfully.");
    } catch (e) {
      console.error("❌ Failed to get Firestore 'db' instance:", e);
    }
  } else {
    console.error("❌ Firebase app instance is undefined after initialization attempt. Firestore 'db' will be undefined.");
  }
} else {
  console.error(
    "❌ Critical Firebase configuration error: 'projectId' and/or 'apiKey' are missing or undefined. Firebase will not be initialized, and 'db' will be undefined."
  );
}

export { app, db };
