'use client';
import { useState, useEffect } from 'react';

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
  "Tip: iOS — Add this website with Add to Home Screen to receive notifications from us",
  "Tip: Android — Install this website to receive notifications from us",
  "New characters will always be updated — please stay tuned every month",
  "Since the server is limited, we have to shut it down whenever there are no users",
  "We still have many features not yet added—stay tuned for our notifications.",
  "Kreycin is the developer of the website",
  "Lefty is the one who provides the tier lists and character builds",
  "We’re always open to new ideas — contact Kreycin",
];
export default function SplashScreen() {
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [backgroundGif, setBackgroundGif] = useState('');

  useEffect(() => {
    // สุ่ม GIF และข้อความ
    const randomGif = backgroundGifs[Math.floor(Math.random() * backgroundGifs.length)];
    setBackgroundGif(randomGif);

    const messageInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      setCurrentMessage(loadingMessages[randomIndex]);
    }, 5000); // เปลี่ยนข้อความทุก 5 วินาที (ปรับได้)

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className="splash-screen">
      <div 
        className="splash-background" 
        style={{ backgroundImage: `url(${backgroundGif})` }}
      ></div>
      <div className="splash-content">
        {/* <img src="/pwa-512x512.png" alt="App Logo" className="splash-logo" /> */}
        <div className="spinner"></div>
        <p className="splash-message">{currentMessage}</p>
      </div>
    </div>
  );
}