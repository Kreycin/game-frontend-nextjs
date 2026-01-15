'use client';
import { useState, useEffect, ReactNode } from 'react';
import SplashScreen from './SplashScreen';

import { onMessageListener } from '@/utils/pushNotifications';
import NotificationToast, { NotificationPayload } from './NotificationToast';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationPayload | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2000 milliseconds = 2 seconds

    // Setup foreground message listener
    const unsubscribe = onMessageListener((payload) => {
      setNotification(payload);
    });

    // Cleanup function to clear the timer if the component unmounts
    return () => {
      clearTimeout(timer);
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe(); // Unsubscribe from onMessage
      }
    };
  }, []); // Empty dependency array means this effect runs only once

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <>
      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
      />
      {children}
    </>
  );
}