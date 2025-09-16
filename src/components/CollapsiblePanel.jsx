import React, { useState } from 'react';

// Component "กล่องวิเศษ" ที่ใช้ซ้ำได้
const CollapsiblePanel = ({ title, children, defaultExpanded = false, className = '' }) => {
  // สร้าง state 'isExpanded' ของตัวเอง เพื่อจัดการการเปิด/ปิด
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    // เพิ่ม class 'expanded' เมื่อถูกเปิด
    <div className={`collapsible-panel ${isExpanded ? 'expanded' : ''} ${className}`}>
      {/* ทำให้ส่วนหัวทั้งหมดกดได้ */}
      <div className="panel-header-clickable" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>{title}</h3>
        <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </div>
      {/* ส่วนเนื้อหาที่จะเปิด/ปิด */}
      <div className="panel-content-collapsible">
        {children}
      </div>
    </div>
  );
};

export default CollapsiblePanel;