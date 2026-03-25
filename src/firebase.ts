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

// Initialize App safely (prevents crashes during Next.js build if env vars are missing)
const canInitFirebase = typeof window !== 'undefined' && firebaseConfig.apiKey;
const app: FirebaseApp = !getApps().length && canInitFirebase 
  ? initializeApp(firebaseConfig) 
  : (getApps().length ? getApp() : {} as FirebaseApp);

// Initialize Services safely
const db: Firestore = canInitFirebase ? getFirestore(app) : {} as Firestore;
const auth = canInitFirebase ? getAuth(app) : {} as ReturnType<typeof getAuth>;

let messaging: Messaging | null = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { app, db, auth, messaging };
