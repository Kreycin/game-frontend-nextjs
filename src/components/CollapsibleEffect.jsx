"use client";
import React, { useState } from 'react';

// Helper function to get the full image URL from Cloudinary
const getFullImageUrl = (url) => {
  if (!url) return null;
  // Since Cloudinary provides a full URL, we just return it.
  return url;
};

// Helper function to render Rich Text from Strapi
const renderRichText = (richTextArray) => {
  if (!richTextArray) return null;
  return richTextArray.map((block, index) => (
    <p key={index}>{block.children.map(child => child.text).join('')}</p>
  ));
};


const CollapsibleEffect = ({ effect }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const effectIconUrl = getFullImageUrl(effect.Effect_Icon?.url);

  // DEBUG: Check what data we are receiving
  console.log('Rendering Effect:', effect.Effect_Name, 'Type:', effect.Effect_Type, 'Undispellable:', effect.Is_Undispellable);

  // Determine class based on effect type
  let effectClass = '';
  if (effect.Effect_Type === 'Buff') effectClass = 'effect-buff';
  else if (effect.Effect_Type === 'Debuff') effectClass = 'effect-debuff';

  return (
    <div className={`effect-item-in-skill ${effectClass} ${isExpanded ? 'expanded' : ''}`}>
      <div className="effect-header-clickable" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="effect-header-in-skill">
          {effectIconUrl && <img src={effectIconUrl} alt={effect.Effect_Name} className="effect-icon-in-skill" />}
          <span className="effect-name-in-skill">{effect.Effect_Name}</span>
          {effect.Is_Undispellable && (
            <span title="Undispellable" style={{
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '4px',
              padding: '0 0.25rem',
              marginLeft: '0.5rem',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              color: 'rgba(255, 193, 7, 0.8)',
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              letterSpacing: '0.05em'
            }}>
              Undispellable
            </span>
          )}
        </div>
        {effect.Turn_Duration && (
          <span className="effect-duration-tag">{effect.Turn_Duration}</span>
        )}

        <span className={`toggle-icon-small ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </div>

      <div className={`effect-details-collapsible ${isExpanded ? 'expanded' : ''}`}>
        <div className="effect-description-in-skill">
          {renderRichText(effect.Description)}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleEffect;