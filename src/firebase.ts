// src/firebase.ts
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, Messaging } from "firebase/messaging";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_NOTI_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_NOTI_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_NOTI_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_NOTI_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_NOTI_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_NOTI_FIREBASE_APP_ID,
};

// Initialize App and Firestore (Safe for Server & Client)
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db: Firestore = getFirestore(app);

// Lazy-loaded Messaging instance to prevent server-side execution
let messaging: Messaging | null = null;

const getMessagingInstance = (): Messaging | null => {
    // Check if we are in a browser environment before initializing messaging
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
        if (!messaging) {
            messaging = getMessaging(app);
        }
        return messaging;
    }
    return null; // Return null on the server
}

// Function to get FCM Token (Client-side only)
const getFcmToken = async (): Promise<string | null> => {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) {
    console.log("Cannot initialize Firebase Messaging on the server.");
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_NOTI_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.error("NEXT_PUBLIC_NOTI_FIREBASE_VAPID_KEY is not set in .env.local file!");
    return null;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        const token = await getToken(messagingInstance, { vapidKey });
        if (token) {
          console.log('FCM Token received:', token);
          return token;
        }
    }
    console.warn('Notification permission not granted.');
    return null;
  } catch (err) {
    console.error('An error occurred while retrieving token:', err);
    return null;
  }
};

export { db, getFcmToken };
