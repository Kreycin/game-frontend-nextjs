'use client';

import React, { useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';

export interface NotificationPayload {
    notification?: {
        title?: string;
        body?: string;
        image?: string;
    };
    data?: any;
}

interface NotificationToastProps {
    notification: NotificationPayload | null;
    onClose: () => void;
}

export default function NotificationToast({ notification, onClose }: NotificationToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for animation to finish before clearing data
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification && !isVisible) return null;

    return (
        <div
            className={`fixed top-4 right-4 z-[100] transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                }`}
        >
            <div className="glass bg-gray-900/90 border border-blue-500/30 text-white p-4 rounded-xl shadow-flame max-w-sm w-full flex gap-4 items-start relative overflow-hidden backdrop-blur-md">
                {/* Glow Effect */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500"></div>

                <div className="bg-blue-500/20 p-2 rounded-full flex-shrink-0">
                    <Bell className="w-6 h-6 text-blue-400" />
                </div>

                <div className="flex-1 mr-2">
                    <h4 className="font-bold text-lg text-blue-100 mb-1">
                        {notification?.notification?.title || 'New Notification'}
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        {notification?.notification?.body}
                    </p>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
