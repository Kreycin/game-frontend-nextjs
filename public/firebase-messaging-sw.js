// public/firebase-messaging-sw.js

// Import scripts for Firebase
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Your correct Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzvdcPmv3KAySs1SwbHC7AtesAw7HFbKM",
  authDomain: "characterchat-1501e.firebaseapp.com",
  projectId: "characterchat-1501e",
  storageBucket: "characterchat-1501e.appspot.com",
  messagingSenderId: "269692914059",
  appId: "1:269692914059:web:210dec6c8899ca22b9c78e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

/**
 * Use the Firebase-specific onBackgroundMessage handler.
 * This gives you full control over the notification when your app is in the background.
 */
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // IMPORTANT: Read title and body from the 'data' payload,
  // which aligns with the recommended backend fix.
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: '/pwa-192x192.png', // You can customize the icon here
    sound: 'https://res.cloudinary.com/di8bf7ufw/video/upload/v1757847611/titlecard_gz9met.mp3'
  };

  // Display the notification.
  self.registration.showNotification(notificationTitle, notificationOptions);
});