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

  return (
    <div className={`effect-item-in-skill ${isExpanded ? 'expanded' : ''}`}>
      <div className="effect-header-clickable" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="effect-header-in-skill">
          {effectIconUrl && <img src={effectIconUrl} alt={effect.Effect_Name} className="effect-icon-in-skill"/>}
          <span className="effect-name-in-skill">{effect.Effect_Name}</span>
        </div>
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