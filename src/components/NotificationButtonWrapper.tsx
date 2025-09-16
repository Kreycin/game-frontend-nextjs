'use client'; // <-- บอกว่าเป็น Client Component

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ReactNode } from 'react';

export default function NotificationButtonWrapper({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <>
      {/* เนื้อหาหลักของเว็บจะถูกแสดงผลที่นี่ */}
      {children}

      {/* ปุ่ม Notification จะแสดงก็ต่อเมื่อมี user ล็อกอินอยู่ */}
      {user && (
        <Link 
          href="/notifications" 
          style={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            zIndex: 1000, 
            padding: '10px 15px', 
            borderRadius: '50px', 
            border: 'none', 
            background: '#007bff', 
            color: 'white', 
            fontSize: '14px', 
            cursor: 'pointer', 
            textDecoration: 'none' 
          }}
          title="Manage Notifications"
        >
          In-Game Notification 🔔
        </Link>
      )}
    </>
  );
}