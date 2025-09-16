// src/components/CharacterSheet.tsx
'use client'; // This marks the component as a Client Component

import { useState } from 'react';
import html2canvas from 'html2canvas';
import type { Character, RichTextBlock } from '@/types/character';


// Import child components
import SkillCard from './SkillCard';
import VideoSection from './VideoSection';
import CollapsiblePanel from './CollapsiblePanel';
import StatItem from './StatItem';
import CommentSection from './CommentSection';
import InstallPWAButton from './InstallPWAButton';

// --- TypeScript Interfaces for our data ---

// --- Helper Functions ---
const getStarLevelNumber = (starString: string | null): number => {
  if (!starString) return 0;
  return parseInt(starString.replace('star', ''), 10);
};

const renderRichText = (richTextArray: RichTextBlock[] | undefined) => {
    if (!richTextArray) return null;
    return richTextArray.map((block, index) => (
      <p key={index}>{block.children.map((child: { text: string }) => child.text).join('')}</p>
    ));
};

const getYouTubeEmbedUrl = (url: string | undefined | null): string | null => {
  if (!url) return null;
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
};

// --- The Main Client Component ---
export default function CharacterSheet({ initialCharacter }: { initialCharacter: Character }) {
  
  const [character] = useState(initialCharacter);
  const [selectedStar, setSelectedStar] = useState<string | null>(initialCharacter?.Star_Levels[0]?.Star_Level || null);

  const handleExportAsImage = () => {
    const elementToCapture = document.getElementById('character-sheet-container');
    if (elementToCapture) {
      // Watermark logic remains the same
      const watermark = document.createElement('div');
      watermark.innerText = 'Made by Kreycin';
      // ... (rest of watermark styling)
      elementToCapture.appendChild(watermark);

      html2canvas(elementToCapture, {
        backgroundColor: '#1a1a1a',
        useCORS: true,
        scale: 2,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${character.Name || 'character-sheet'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        elementToCapture.removeChild(watermark);
      }).catch(err => {
        console.error("Error during canvas generation:", err);
        if (elementToCapture.contains(watermark)) {
            elementToCapture.removeChild(watermark);
        }
      });
    }
  };
  
  if (!character) {
    return <div className="loading-state">No character data found.</div>;
  }

  const selectedStarLevelData = character.Star_Levels.find(
    (level) => level.Star_Level === selectedStar
  );

  const currentEnhancements = selectedStarLevelData?.enhancements || [];
  const currentSkillDescriptions = selectedStarLevelData?.skill_descriptions || [];
  
  const mainArtUrl = character.Main_Art?.url;
  const embedUrl = getYouTubeEmbedUrl(character.YouTube_URL);

  return (
    <div className="App">
      <div id="character-sheet-container" key={character.id} className="character-sheet-container">
        <header className="character-header layout-header">
           <div className="name-and-id">
              <h1>{character.Name}</h1>
            </div>
          <div className="tags">
            <span className={`tag-rarity ${character.Rarity}`}>{character.Rarity}</span>
            <span className="tag-role">{character.Role}</span>
            {character.Element && <span className="tag-element">{character.Element}</span>}
          </div>
        </header>

        {mainArtUrl && (<img src={mainArtUrl} alt={character.Name} className="main-character-art layout-art" width={320} height={400} />)}
        
        <CollapsiblePanel title="Main Stats" defaultExpanded={false} className="layout-main-stats">
          <div className="stats-grid">
            <StatItem label="ATK" value={character.ATK} />
            <StatItem label="DEF" value={character.DEF} />
            <StatItem label="HP" value={character.HP} />
            <StatItem label="SPD" value={character.SPD} />
          </div>
        </CollapsiblePanel>
        
        <CollapsiblePanel title="Special" defaultExpanded={false} className="layout-special-stats">
          <div className="stats-grid-special">
            <StatItem label="Lifesteal" value={character.Lifesteal} />
            <StatItem label="Penetration" value={character.Penetration} />
            <StatItem label="CRIT Rate" value={character.CRIT_rate} />
            <StatItem label="CRIT Res" value={character.CRIT_Res} />
            <StatItem label="Debuff Acc" value={character.Debuff_Acc} />
            <StatItem label="Debuff Res" value={character.Debuff_Res} />
            <StatItem label="Accuracy" value={character.Accuracy} />
            <StatItem label="Dodge" value={character.Doge} />
            <StatItem label="Healing Amt" value={character.Healing_Amt} />
            <StatItem label="Healing Amt(P)" value={character.Healing_Amt_P} />
            <StatItem label="Extra DMG" value={character.Extra_DMG} />
            <StatItem label="DMG Res" value={character.DMG_Res} />
            <StatItem label="CRIT DMG Res" value={character.CRIT_DMG_Res} />
            <StatItem label="CRIT DMG" value={character.CRIT_DMG} />
          </div>
        </CollapsiblePanel>

        <div className="layout-skills">
          <div className="star-selector">
              {character.Star_Levels.map((level) => (
              <button
                  key={level.id}
                  className={`star-button ${selectedStar === level.Star_Level ? 'active' : ''}`}
                  onClick={() => setSelectedStar(level.Star_Level)}
              >
                  {getStarLevelNumber(level.Star_Level)}★
              </button>
              ))}
          </div>
          <section className="skills-grid">
            {currentSkillDescriptions.length > 0 ? (
              currentSkillDescriptions.map((skillDesc) => (
                <SkillCard key={skillDesc.id} skillDescription={skillDesc} />
              ))
            ) : (
              <p>No skills available for this star level.</p>
            )}
          </section>
        </div>
        <CollapsiblePanel title="Enhancements" className="layout-enhancements" defaultExpanded={true}>
            <div className="panel-content-inner">
                {currentEnhancements.length > 0 ? (
                    currentEnhancements.map((enh) => {
                    const enhancementIconUrl = enh.Enhancement_Icon?.url;
                    return (
                        <div key={enh.id} className="enhancement-item">
                        {enhancementIconUrl && (
                            <img src={enhancementIconUrl} alt="Enhancement Icon" className="enhancement-icon" />
                        )}
                        <div>{renderRichText(enh.Description)}</div>
                        </div>
                    )
                    })
                ) : (
                    <p>No enhancements for this star level.</p>
                )}
            </div>
        </CollapsiblePanel>
        <VideoSection embedUrl={embedUrl} className="layout-showcase" />
      </div>

      <div className="export-container">
        <button onClick={handleExportAsImage} className="export-button">
          Export as PNG
        </button>
      </div>
      <div className="max-w-4xl mx-auto px-4">
        <CommentSection pageId={`character-${character.id}`} />
      </div>
      <InstallPWAButton />
    </div>
  );
}
