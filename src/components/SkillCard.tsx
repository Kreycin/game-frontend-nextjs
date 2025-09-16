'use client';
import { useState } from 'react';
import CollapsibleEffect from './CollapsibleEffect';
import type { RichTextBlock, SkillDescription } from '@/types/character';

const renderRichText = (richTextArray: RichTextBlock[] | undefined) => {
    if (!richTextArray) return null;
    return richTextArray.map((block, index) => (
      <p key={index}>{block.children.map((child: { text: string }) => child.text).join('')}</p>
    ));
};

const SkillCard = ({ skillDescription }: { skillDescription: SkillDescription }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const baseSkill = skillDescription.skill;

  if (!baseSkill) return null;

  const skillIconUrl = baseSkill.Skill_Icon?.url; // แก้ไขตรงนี้
  const effects = baseSkill.effects || [];

  return (
    <div className={`skill-card-small ${isExpanded ? 'expanded' : ''}`}>
      <div className="skill-card-header-clickable" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="skill-icon-and-name">
          {skillIconUrl && <img src={skillIconUrl} alt={baseSkill.Skill_Name} className="skill-icon-small"/>}
          <h4 className="skill-name-small">{baseSkill.Skill_Name}</h4>
        </div>
        <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </div>

      {baseSkill.Skill_Level && <div className="skill-level-tag">Lv.{baseSkill.Skill_Level}</div>}

      <div className={`skill-details-collapsible ${isExpanded ? 'expanded' : ''}`}>
        <div className="details-inner" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div className="skill-type-small">{baseSkill.Skill_Type}</div>
            <div className="skill-description-small">
                {renderRichText(skillDescription.Description)}
            </div>
            {effects.length > 0 && (
                <div className="effects-list-in-skill">
                    <h5>Effects:</h5>
                    {effects.map((effect: any) => (
                      <CollapsibleEffect key={effect.id} effect={effect} />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SkillCard;