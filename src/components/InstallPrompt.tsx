'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check for iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // Check if running in standalone mode (already installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) return;

        // Handle standard install prompt (Chrome/Android)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Optional: Logic to show iOS hint could go here
        // For now we focus on the standard prompt

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setIsVisible(false);
        }
        setDeferredPrompt(null);
    };

    if (!isVisible && !isIOS) return null;
    // Note: For this iteration, we only show for non-iOS or if we decide to implement a generic banner later. 
    // currently isVisible is only true on beforeinstallprompt, which doesn't fire on iOS.
    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-auto px-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="glass bg-gray-900/90 border border-gold/30 p-3 rounded-full shadow-flame flex items-center gap-4 backdrop-blur-md">
                <div className="bg-gold/20 p-2 rounded-full">
                    <Download className="w-5 h-5 text-gold" />
                </div>

                <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Install App</span>
                    <span className="text-xs text-gray-300">Add to Home Screen</span>
                </div>

                <button
                    onClick={handleInstallClick}
                    className="bg-gold/90 hover:bg-gold text-black px-4 py-1.5 rounded-full text-sm font-bold transition-all"
                >
                    Install
                </button>

                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-white p-1"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
