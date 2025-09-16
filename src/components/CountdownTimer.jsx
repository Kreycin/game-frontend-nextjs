// src/components/CountdownTimer.jsx
import React, { useState, useEffect } from 'react';
import './CountdownTimer.css'; // ตรวจสอบให้แน่ใจว่าไฟล์นี้มีอยู่

const calculateTimeLeft = (targetDate) => {
  const difference = +new Date(targetDate) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

// เพิ่ม prop 'prefixText'
const CountdownTimer = ({ targetDate, prefixText }) => { 
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timerComponents = [];

  // กรองเฉพาะ วัน, ชั่วโมง, นาที (ตามที่คุณระบุในคำขอ)
  const intervalsToShow = ['days', 'hours', 'minutes']; 

  intervalsToShow.forEach((interval) => {
    // แสดงเฉพาะถ้ามีค่า และไม่เป็น undefined/null
    if (timeLeft[interval] !== undefined && timeLeft[interval] !== null) {
      timerComponents.push(
        <span key={interval} className="countdown-item">
          <span className="countdown-value">{String(timeLeft[interval]).padStart(2, '0')}</span>
          <span className="countdown-label">{interval.charAt(0).toUpperCase() + interval.slice(1)}</span>
        </span>
      );
    }
  });

  return (
    <div className="countdown-timer">
      {/* แสดง prefixText ก่อนตัวนับถอยหลัง */}
      {prefixText && <span className="countdown-prefix">{prefixText}</span>} 
      {timerComponents.length ? (
        <div className="countdown-display-values"> {/* เพิ่ม div ครอบตัวเลขเพื่อจัดกลุ่ม */}
          {timerComponents}
        </div>
      ) : (
        <span className="countdown-finished">Time's up!</span>
      )}
    </div>
  );
};

export default CountdownTimer;