import React, { useState } from 'react';

// Component แสดงวิดีโอ 2 ตัวในแถวเดียวกัน: Skill Animation และ Showcase
const VideoSection = ({ skillAnimationUrl, showcaseUrl, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // ถ้าไม่มี URL ทั้งสองอัน ไม่ต้องแสดงอะไร
  if (!skillAnimationUrl && !showcaseUrl) {
    return null;
  }

  return (
    <section className={`video-section ${className}`}>
      <div className="video-header-clickable" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Videos</h3>
        <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </div>

      <div className={`video-collapsible-area ${isExpanded ? 'expanded' : ''}`}>
        <div className="dual-video-container">
          {/* Skill Animation Video */}
          <div className="video-item">
            <h4>Skill Animation</h4>
            {skillAnimationUrl ? (
              <div className="video-container">
                <iframe
                  src={skillAnimationUrl}
                  title="Skill Animation"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="video-placeholder">
                <span className="play-icon">▶</span>
                <p>No Video Available</p>
              </div>
            )}
          </div>

          {/* Showcase Video */}
          <div className="video-item">
            <h4>Showcase</h4>
            {showcaseUrl ? (
              <div className="video-container">
                <iframe
                  src={showcaseUrl}
                  title="Showcase"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="video-placeholder">
                <span className="play-icon">▶</span>
                <p>No Video Available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;