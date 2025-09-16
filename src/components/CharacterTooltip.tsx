import React from 'react';
import '../app/styles/CharacterTooltip.css'; // Update CSS path

// Define types for the props
interface TooltipProps {
  character: any;
  expertInfo: any;
}

const CharacterTooltip = ({ character, expertInfo }: TooltipProps) => {
  if (!character) {
    return null;
  }

  return (
    <div className="tooltip-container">
      <div className="tooltip-section">
        <h3 className="tooltip-character-name">{character.name}</h3>
      </div>

      {expertInfo.expert_bonus > 0 && expertInfo.expert_tag_description && (
        <div className="tooltip-section">
          <h4>
            Expert Tag: +{expertInfo.expert_bonus}
          </h4>
          <p>{expertInfo.expert_tag_description}</p>
        </div>
      )}

      {expertInfo.condition && (
        <div className="tooltip-section">
          <h4>
            Condition
            <span className="condition-tag">{expertInfo.condition}</span>
          </h4>
          <p>{expertInfo.condition_detail}</p>
        </div>
      )}

      {expertInfo.highlight && (
        <div className="tooltip-section">
          <h4>Highlight</h4>
          <p>{expertInfo.highlight}</p>
        </div>
      )}
    </div>
  );
};

export default CharacterTooltip;