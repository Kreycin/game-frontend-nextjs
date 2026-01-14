'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import {
    isPushSupported,
    getSubscriptionStatus,
    subscribeToPush,
    unsubscribeFromPush,
    registerPushServiceWorker,
} from '@/utils/pushNotifications';

type SubscriptionStatus = 'subscribed' | 'unsubscribed' | 'denied' | 'unsupported' | 'loading';

export default function PushNotificationToggle() {
    const [status, setStatus] = useState<SubscriptionStatus>('loading');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        initPush();
    }, []);

    const initPush = async () => {
        console.log('initPush starting...');

        // Wait for PWA service worker with timeout
        if ('serviceWorker' in navigator) {
            try {
                // Add timeout to prevent hanging forever
                const swReady = navigator.serviceWorker.ready;
                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('SW timeout')), 3000)
                );

                await Promise.race([swReady, timeout]);
                console.log('PWA Service Worker ready for push');
            } catch (e) {
                console.warn('Service worker not ready or timeout:', e);
                // Continue anyway - might still work
            }
        } else {
            console.log('No service worker support');
        }

        // Check subscription status regardless of SW state
        try {
            const currentStatus = await getSubscriptionStatus();
            console.log('Push subscription status:', currentStatus);
            setStatus(currentStatus);
        } catch (e) {
            console.error('Failed to get subscription status:', e);
            setStatus('unsupported');
        }
    };

    const handleToggle = async () => {
        console.log('Push toggle clicked, current status:', status);
        if (isProcessing) {
            console.log('Already processing, ignoring click');
            return;
        }
        setIsProcessing(true);

        try {
            if (status === 'subscribed') {
                console.log('Attempting to unsubscribe...');
                const success = await unsubscribeFromPush();
                console.log('Unsubscribe result:', success);
                if (success) setStatus('unsubscribed');
            } else if (status === 'unsubscribed') {
                console.log('Attempting to subscribe...');
                const success = await subscribeToPush();
                console.log('Subscribe result:', success);
                if (success) setStatus('subscribed');
            } else {
                console.log('Status is not subscribed/unsubscribed, cannot toggle:', status);
            }
        } catch (error) {
            console.error('Toggle error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Don't render if not supported
    if (status === 'unsupported') {
        return null;
    }

    const getIcon = () => {
        if (isProcessing) return <BellRing className="w-5 h-5 animate-pulse" />;
        if (status === 'subscribed') return <Bell className="w-5 h-5" />;
        if (status === 'denied') return <BellOff className="w-5 h-5 text-red-500" />;
        return <BellOff className="w-5 h-5" />;
    };

    const getLabel = () => {
        if (isProcessing) return 'Processing...';
        if (status === 'subscribed') return 'Notifications On';
        if (status === 'denied') return 'Notifications Blocked';
        return 'Enable Notifications';
    };

    const isDisabled = status === 'denied' || isProcessing;

    return (
        <button
            onClick={handleToggle}
            disabled={isDisabled}
            className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all
        ${status === 'subscribed'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : status === 'denied'
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
        ${isProcessing ? 'opacity-70 cursor-wait' : ''}
      `}
            title={status === 'denied' ? 'Please enable notifications in your browser settings' : getLabel()}
        >
            {getIcon()}
            <span className="hidden sm:inline">{getLabel()}</span>
        </button>
    );
}
