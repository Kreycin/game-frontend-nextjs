// src/utils/pushNotifications.ts
// Utility functions for push notification subscription

const API_ENDPOINT = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/**
 * Convert URL-safe base64 to Uint8Array for applicationServerKey
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Register the push notification service worker
 */
export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
        console.log('Service workers not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/push-sw.js', {
            scope: '/'
        });
        console.log('Push SW registered:', registration.scope);
        return registration;
    } catch (error) {
        console.error('Push SW registration failed:', error);
        return null;
    }
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(): Promise<'subscribed' | 'unsubscribed' | 'denied' | 'unsupported'> {
    if (!isPushSupported()) {
        return 'unsupported';
    }

    if (Notification.permission === 'denied') {
        return 'denied';
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return subscription ? 'subscribed' : 'unsubscribed';
    } catch {
        return 'unsubscribed';
    }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<boolean> {
    if (!isPushSupported() || !VAPID_PUBLIC_KEY) {
        console.error('Push not supported or VAPID key missing');
        return false;
    }

    try {
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return false;
        }

        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;

        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
        });

        // Send subscription to backend
        const response = await fetch(`${API_ENDPOINT}/api/push-subscriptions/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
                    auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
                },
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save subscription');
        }

        console.log('Successfully subscribed to push notifications');
        return true;
    } catch (error) {
        console.error('Failed to subscribe:', error);
        return false;
    }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
    if (!isPushSupported()) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            return true; // Already unsubscribed
        }

        // Unsubscribe locally
        await subscription.unsubscribe();

        // Remove from backend
        await fetch(`${API_ENDPOINT}/api/push-subscriptions/unsubscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                endpoint: subscription.endpoint,
            }),
        });

        console.log('Successfully unsubscribed from push notifications');
        return true;
    } catch (error) {
        console.error('Failed to unsubscribe:', error);
        return false;
    }
}
