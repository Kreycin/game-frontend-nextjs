'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import {
    isPushSupported,
    getSubscriptionStatus,
    subscribeToPush,
    unsubscribeFromPush,
} from '@/utils/pushNotifications';

type SubscriptionStatus = 'subscribed' | 'unsubscribed' | 'denied' | 'unsupported' | 'loading';

export default function PushNotificationToggle() {
    const [status, setStatus] = useState<SubscriptionStatus>('loading');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        const currentStatus = await getSubscriptionStatus();
        setStatus(currentStatus);
    };

    const handleToggle = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            if (status === 'subscribed') {
                const success = await unsubscribeFromPush();
                if (success) setStatus('unsubscribed');
            } else if (status === 'unsubscribed') {
                const success = await subscribeToPush();
                if (success) setStatus('subscribed');
            }
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
