// src/utils/pushNotifications.ts
import { messaging } from '@/firebase';
import { getToken, onMessage } from 'firebase/messaging';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const TOPIC_NAME = 'news';

export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
    try {
        // next-pwa handles registration, just return it
        const registration = await navigator.serviceWorker.ready;
        return registration;
    } catch (error) {
        console.error('Failed to get SW registration:', error);
        return null;
    }
}

export function isPushSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function getSubscriptionStatus(): Promise<'subscribed' | 'unsubscribed' | 'denied' | 'unsupported'> {
    if (!isPushSupported()) return 'unsupported';
    if (Notification.permission === 'denied') return 'denied';

    // Check if we have a token saved in localStorage (simple check for topic sub)
    const savedToken = localStorage.getItem('fcm_token');
    return savedToken ? 'subscribed' : 'unsubscribed';
}

export async function subscribeToPush(): Promise<boolean> {
    if (!messaging || !VAPID_PUBLIC_KEY) {
        console.error('Messaging not initialized or VAPID key missing');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return false;

        const token = await getToken(messaging, {
            vapidKey: VAPID_PUBLIC_KEY
        });

        if (token) {
            console.log('FCM Token:', token);
            // In a real app, you send this token to your server to subscribe to a topic
            // For now, we simulate success and save to local storage
            // TODO: Call API to subscribe token to 'news' topic
            // await subscribeTokenToTopic(token, TOPIC_NAME);

            localStorage.setItem('fcm_token', token);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to subscribe:', error);
        return false;
    }
}

export async function unsubscribeFromPush(): Promise<boolean> {
    try {
        // For FCM, we typically just delete the token locally
        // or call API to unsubscribe from topic
        const token = localStorage.getItem('fcm_token');
        if (token) {
            // TODO: Call API to unsubscribe token from 'news' topic
            // await unsubscribeTokenFromTopic(token, TOPIC_NAME);

            // Note: deleteToken(messaging) invalidates it, but we might just want to 
            // remove from topic. For now, simple local clear.
            localStorage.removeItem('fcm_token');
        }
        return true;
    } catch (error) {
        console.error('Failed to unsubscribe:', error);
        return false;
    }
}

export const onMessageListener = (callback: (payload: any) => void) => {
    if (messaging) {
        return onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);
            callback(payload);
        });
    }
    return null; // Return null if messaging not supported
};
