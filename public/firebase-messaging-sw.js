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

// -- 2. จัดการ Push Notification ที่เข้ามา --
self.addEventListener('push', (event) => {
  const payload = event.data.json();
  const notificationTitle = payload.notification.title;

  // --- 3. ตั้งค่าการแจ้งเตือน (เพิ่มแค่เสียง) ---
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png',
    
    // --- นี่คือส่วนที่เพิ่มเข้ามาสำหรับเสียง ---
    sound: '/sounds/titlecard.mp3' // <-- ระบุ Path ไปยังไฟล์เสียง
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// จัดการ Event เมื่อผู้ใช้คลิกที่การแจ้งเตือน
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/'; // ตรวจสอบ data ก่อนใช้งาน
  event.waitUntil(clients.openWindow(urlToOpen));
});