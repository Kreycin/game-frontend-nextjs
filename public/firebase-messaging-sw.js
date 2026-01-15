importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCzvdcPmv3KAySs1SwbHC7AtesAw7HFbKM",
    authDomain: "characterchat-1501e.firebaseapp.com",
    projectId: "characterchat-1501e",
    storageBucket: "characterchat-1501e.firebasestorage.app",
    messagingSenderId: "269692914059",
    appId: "1:269692914059:web:210dec6c8899ca22b9c78e"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification?.title || 'DS Game Hub';
    const notificationOptions = {
        body: payload.notification?.body,
        icon: '/pwa-192x192.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Notification click Received.', event);
    event.notification.close();

    // Open the app or specific URL
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
