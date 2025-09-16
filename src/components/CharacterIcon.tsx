'use client';
import { useState } from 'react';
import CharacterTooltip from './CharacterTooltip';

// Define the type for the props
interface CharacterIconProps {
  characterData: any; // Using 'any' for now to keep it simple
}

const CharacterIcon = ({ characterData }: CharacterIconProps) => {
  const [isHovering, setIsHovering] = useState(false);

  if (!characterData || !characterData.tier_list_character) {
    return null;
  }

  const character = characterData.tier_list_character;
  const expertInfo = characterData;

  // Use the helper function to format the URL
  const imageUrl = character.icon?.url 
    ? character.icon.url 
    : 'https://via.placeholder.com/80'; // Fallback image

  return (
    <div 
      className="character-icon-container"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className={`character-image-wrapper ${isHovering ? 'hovering' : ''}`}>
        <img 
          src={imageUrl} 
          alt={character.name} 
          className="character-icon-image"
        />

        {character.description && (
          <div className="character-desc-overlay">
            {character.description}
          </div>
        )}

        {expertInfo.condition && (
          <img 
            src="/condition-icon.png" 
            alt="Condition Tag" 
            className="character-condition-icon" 
          />
        )}

        {expertInfo.expert_bonus > 0 && (
          <img 
            src="/expert-icon.png" 
            alt="Expert Tag" 
            className="expert-icon" 
          />
        )}

        <CharacterTooltip character={character} expertInfo={expertInfo} />
      </div>
    </div>
  );
};

export default CharacterIcon;