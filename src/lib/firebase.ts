import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

function initializeFirebase() {
    console.log('=======================================================');
    console.log('======= CHECKING FIREBASE CONFIG in src/lib/firebase.ts =======');
    console.log('=======================================================');

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const apiKey = process.env.FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
        console.error('❌ ERROR: Firebase environment variables not set.');
        console.error('Please ensure FIREBASE_PROJECT_ID and FIREBASE_API_KEY are in your .env.local file.');
        console.log('FIREBASE_PROJECT_ID:', projectId ? `SET (value: ${projectId})` : 'NOT SET');
        console.log('FIREBASE_API_KEY:', apiKey ? 'SET' : 'NOT SET');
        console.log('=======================================================');
        return { app: null, db: null };
    }
    
    console.log(`✅ Firebase Project ID: ${projectId}`);
    
    try {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        const db = getFirestore(app);
        console.log('✅ Firebase SDK initialized successfully.');
        console.log('=======================================================');
        return { app, db };
    } catch (error) {
        console.error('❌ ERROR: Firebase initialization failed.', error);
        console.log('=======================================================');
        return { app: null, db: null };
    }
}

const { app, db } = initializeFirebase();

export { app, db };
