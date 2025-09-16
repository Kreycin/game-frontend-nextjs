// src/components/OverlayPage.jsx

import React from 'react';
import CountdownTimer from './CountdownTimer'; // 1. Import ตัวนับเวลาเข้ามา
import './OverlayPage.css';

// 2. รับ props ที่ชื่อ targetDate ที่ส่งมาจาก App.jsx
const OverlayPage = ({ targetDate }) => { 
    console.log('Date received in OverlayPage:', targetDate);
  return (
    <div className="overlay-container">

      {/* ส่วนที่ 1: แสดงตัวนับเวลา */}
      <div className="overlay-header">
        <CountdownTimer 
          targetDate={targetDate} 
          prefixText="A new character is coming in:" // 3. กำหนดข้อความนำหน้าตามที่คุณต้องการ
        />
      </div>

      {/* ส่วนที่ 2: พื้นที่สำหรับรูปภาพ */}
      <div className="overlay-image-container">
        <img 
    src="https://res.cloudinary.com/di8bf7ufw/image/upload/v1750771678/pos_hbabo1.png" 
    alt="Special Event" 
    className="overlay-image" 
  />
        
      </div>

    </div>
  );
};

export default OverlayPage;