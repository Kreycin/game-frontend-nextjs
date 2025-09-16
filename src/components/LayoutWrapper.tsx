'use client';
import { useState, useEffect, ReactNode } from 'react';
import SplashScreen from './SplashScreen';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup function to clear the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this effect runs only once

  if (isLoading) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}