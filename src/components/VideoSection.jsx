import React, { useState } from 'react';

// Component ใหม่สำหรับจัดการส่วนวิดีโอโดยเฉพาะ
const VideoSection = ({ embedUrl, className = '' }) => {
  // สร้าง state 'isExpanded' ของตัวเอง เพื่อจัดการการเปิด/ปิด
  const [isExpanded, setIsExpanded] = useState(true);

  // ถ้าไม่มี URL ก็ไม่ต้องแสดงอะไรเลย
  if (!embedUrl) {
    return null;
  }

  return (
    <section className={`video-section ${className}`}>
      {/* ทำให้ส่วนหัวทั้งหมดกดได้ */}
      <div className="video-header-clickable" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Showcase</h3>
        <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </div>

      {/* ส่วนนี้จะแสดงก็ต่อเมื่อ isExpanded เป็น true */}
      <div className={`video-collapsible-area ${isExpanded ? 'expanded' : ''}`}>
        <div className="video-container">
          <iframe
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;