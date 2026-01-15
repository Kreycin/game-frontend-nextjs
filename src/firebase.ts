import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, Messaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_NOTI_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_NOTI_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_NOTI_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_NOTI_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_NOTI_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_NOTI_FIREBASE_APP_ID,
};

// Initialize App
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
const db: Firestore = getFirestore(app);
const auth = getAuth(app);

let messaging: Messaging | null = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { app, db, auth, messaging };
