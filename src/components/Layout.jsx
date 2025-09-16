// src/components/Layout.jsx

import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const backgroundGifs = [
  'https://res.cloudinary.com/di8bf7ufw/image/upload/v1757866921/Demon_Slayer_GIF_hp1phc.gif',
  'https://res.cloudinary.com/di8bf7ufw/image/upload/v1757866922/Demonslayer_Kimetsunoyaiba_GIF_by_KonnichiwaFestival_d3pltd.gif',
  'https://res.cloudinary.com/di8bf7ufw/image/upload/v1757866922/gif-2_zm1eyw.gif',
  'https://res.cloudinary.com/di8bf7ufw/image/upload/v1757866922/gif_q6kglz.gif',
  'https://res.cloudinary.com/di8bf7ufw/image/upload/v1757866923/Kimetsu_No_Yaiba_Fight_GIF_by_iQiyi_gbctmk.gif',
  'https://res.cloudinary.com/di8bf7ufw/image/upload/v1757866923/Demonslayer_Zenitsu_GIF_a7tutn.gif',
  'https://res.cloudinary.com/di8bf7ufw/image/upload/v1757869588/200_d9sx3t.gif',
  'https://res.cloudinary.com/di8bf7ufw/image/upload/v1757869588/giphy_3_mhjuaj.gif',
  'https://res.cloudinary.com/di8bf7ufw/image/upload/v1757869589/giphy_4_klcnem.gif',
  'https://res.cloudinary.com/di8bf7ufw/image/upload/v1757869589/giphy_2_kmaoj1.gif',
  'https://res.cloudinary.com/di8bf7ufw/image/upload/v1757869589/giphy_dbsf7d.gif',
];
const loadingMessages = [
  "Connecting to database...",
  "Polishing character sheets...",
  "Almost there, hang tight!",
  "Waking the server up",
  "Tip: iOS — Add this website with Add to Home Screen to receive notifications from us",
  "Tip: Android — Install this website to receive notifications from us",
  "New characters will always be updated — please stay tuned every month",
  "Since the server is limited, we have to shut it down whenever there are no users",
  "We still have many features not yet added—stay tuned for our notifications.",
  "Kreycin is the developer of the website",
  "Lefty is the one who provides the tier lists and character builds",
  "We’re always open to new ideas — contact Kreycin",




];

const Layout = () => {
  const { user } = useAuth();

  // --- คัดลอก State และ useEffect มาจาก App.jsx ---
  const [isServerWaking, setIsServerWaking] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [countdown, setCountdown] = useState(45);
  const [backgroundGif, setBackgroundGif] = useState('');

  useEffect(() => {
    // ตรรกะการปลุกเซิร์ฟเวอร์ทั้งหมดจะอยู่ที่นี่
    const randomGif = backgroundGifs[Math.floor(Math.random() * backgroundGifs.length)];
    setBackgroundGif(randomGif);

    let countdownInterval;
    let messageInterval;

    const startCountdown = () => {
      if (countdownInterval) return;
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setIsServerWaking(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      messageInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * loadingMessages.length);
        setCurrentMessage(loadingMessages[randomIndex]);
      }, 5000);
    };
    
    const wakeUpServer = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
      if (!backendUrl) {
        console.error("VITE_BACKEND_URL is not set! Starting cold start sequence as a fallback.");
        startCountdown();
        return;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const response = await fetch(`${backendUrl}/api/health-check`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) {
          console.log("Server is warm. Skipping splash screen.");
          setIsServerWaking(false);
        } else {
          console.log("Server responded with an error. Starting countdown.");
          startCountdown();
        }
      } catch (e) {
        console.log("Server is cold or unreachable. Starting countdown.");
        startCountdown();
      }
    };

    wakeUpServer();

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (messageInterval) clearInterval(messageInterval);
    };
  }, []);
  // --- สิ้นสุดส่วนที่คัดลอก ---

  // --- [แก้ไข] ตรรกะการแสดงผลหลัก ---
  if (isServerWaking) {
    // ถ้าเซิร์ฟเวอร์กำลังตื่น, แสดง Splash Screen
    return (
      <div className="splash-screen">
        <div 
          className="splash-background" 
          style={{ backgroundImage: `url(${backgroundGif})` }}
        ></div>
        <div className="splash-content">
          <img src="/pwa-512x512.png" alt="App Logo" className="splash-logo" />
          <div className="spinner"></div>
          <p className="splash-message">{currentMessage}</p>
          <p className="splash-countdown">{countdown}</p>
        </div>
      </div>
    );
  }

  // ถ้าเซิร์ฟเวอร์ตื่นแล้ว, แสดง Layout ปกติ (Navbar + หน้าเพจปัจจุบัน)
  return (
    <>
      {user && (
         <Link 
            to="/notifications" 
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
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;