
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const apiKey = process.env.FIREBASE_API_KEY;

console.log("\n\n=======================================================");
console.log("======= CHECKING FIREBASE CONFIG in src/lib/firebase.ts =======");
console.log("=======================================================");
if (!projectId) {
  console.error("❌ ERROR: FIREBASE_PROJECT_ID is NOT SET in your environment.");
  console.error("   Please create a .env.local file in your project root and add:");
  console.error("   FIREBASE_PROJECT_ID=your-firebase-project-id");
} else {
  console.log(`✅ FIREBASE_PROJECT_ID is set to: '${projectId}'`);
}

if (!apiKey) {
  console.error("❌ ERROR: FIREBASE_API_KEY is NOT SET in your environment.");
  console.error("   Please ensure FIREBASE_API_KEY is in your .env.local file.");
} else {
  console.log("✅ FIREBASE_API_KEY is set.");
}
console.log("-------------------------------------------------------\n\n");


const firebaseConfig: FirebaseOptions = {
  apiKey: apiKey,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: projectId,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | undefined = undefined;
let db: Firestore | undefined = undefined;

if (projectId && apiKey) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("✅ Firebase app initialized successfully.");
    } catch (e) {
      console.error("❌ Firebase initialization failed:", e);
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
  }
} else {
  console.error(
    "❌ Firebase not initialized because Project ID or API Key is missing."
  );
}

export { app, db };
