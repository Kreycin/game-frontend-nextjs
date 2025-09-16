// src/components/TierListClientPage.tsx
'use client';
import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import CharacterIcon from './CharacterIcon';
import TierListTabs from './TierListTabs'; // Make sure you have created and imported this
import type { TierList, GuideData, Tier } from '@/types/tierlist';

// --- Helper Component for Rich Text ---
const BlocksRenderer = ({ blocks }: { blocks: any[] | null }) => {
    if (!Array.isArray(blocks) || blocks.length === 0) return null;

    return blocks.map((block, index) => {
        switch (block.type) {
            case 'paragraph':
                return (
                    <p key={`block-${index}`} className="guide-paragraph">
                        {block.children.map((child: any, childIndex: number) => {
                            let content = child.text;
                            if (child.bold) content = <strong>{content}</strong>;
                            if (child.italic) content = <em>{content}</em>;
                            if (child.underline) content = <u>{content}</u>;
                            if (child.code) content = <code>{content}</code>;
                            return <React.Fragment key={`child-${childIndex}`}>{content}</React.Fragment>;
                        })}
                    </p>
                );
            case 'list':
                const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
                return (
                    <ListTag key={`block-${index}`} className="guide-list">
                        {block.children.map((listItem: any, listIndex: number) => (
                            <li key={`list-item-${listIndex}`}>
                                {listItem.children.map((child: any, childIndex: number) => {
                                    let content = child.text;
                                    if (child.bold) content = <strong>{content}</strong>;
                                    if (child.italic) content = <em>{content}</em>;
                                    if (child.underline) content = <u>{content}</u>;
                                    if (child.code) content = <code>{content}</code>;
                                    return <React.Fragment key={`list-child-${childIndex}`}>{content}</React.Fragment>;
                                })}
                            </li>
                        ))}
                    </ListTag>
                );
            default:
                return <p key={`block-${index}`}>Unsupported block type: {block.type}</p>;
        }
    });
};

// --- Helper Component for Guide Section ---
const TierListGuide = ({ guideData }: { guideData: GuideData | null }) => {
    if (!guideData) return null;
    const { criteria, roles, ratings, tags } = guideData;

    return (
        <div className="guide-container">
            <div className="guide-grid">
                <div className="guide-section">
                    <h3>Criteria</h3>
                    <BlocksRenderer blocks={criteria} />
                </div>
                <div className="guide-section">
                    <h3>Roles</h3>
                    <BlocksRenderer blocks={roles} />
                </div>
                <div className="guide-section">
                    <h3>Ratings</h3>
                    <BlocksRenderer blocks={ratings} />
                </div>
                <div className="guide-section">
                    <h3>Tags</h3>
                    <BlocksRenderer blocks={tags} />
                </div>
            </div>
        </div>
    );
};

// --- Helper Component for the Tier List Table ---
const TierListDisplay = ({ list }: { list: TierList | undefined }) => {
    if (!list || !list.attributes || !list.attributes.tiers) {
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>No Tier List data found for this mode.</div>;
    }
    const tierNameMapping: { [key: string]: string } = { 'T0': 'Apex', 'T0.5': 'Meta', 'T1': 'Meta', 'T1.5': 'Viable', 'T2': 'Viable', 'T3': 'Niche', 'T4': 'Niche', 'T5': 'Forgotten' };
    const tierColorMapping: { [key: string]: string } = { 'T0': '#e82934', 'T0.5': '#fa4550', 'T1': '#d69b56', 'T1.5': '#d69b56', 'T2': '#f2cc8b', 'T3': '#fffcae', 'T4': '#fff574', 'T5': '#a2d2ff' };
    const groupDividerColorMapping: { [key: string]: string } = { 'Apex': '#e82934', 'Meta': '#d69b56', 'Viable': '#f2cc8b', 'Niche': '#fffcae', 'Forgotten': '#a2d2ff' };

    const sortedTiers = [...list.attributes.tiers].sort((a, b) => parseFloat(a.tier_level.replace('T', '')) - parseFloat(b.tier_level.replace('T', '')));

    const groupedTiers = sortedTiers.reduce((acc, tier) => { 
        const groupName = tierNameMapping[tier.tier_level] || 'Unknown'; 
        if (!acc[groupName]) { acc[groupName] = []; } 
        acc[groupName].push(tier); 
        return acc; 
    }, {} as { [key: string]: Tier[] });

    return (
        <div id="tier-list-table" className="tier-table-wrapper">
            <header className="tier-table-header">
                <div />
                <div className="role-header dps"><span>⚔️ DPS</span></div>
                <div className="role-header support"><span>⭐ SUPPORT</span></div>
                <div className="role-header def"><span>🛡️ DEF</span></div>
            </header>
            <main>
                {Object.entries(groupedTiers).map(([groupName, tiersInGroup]) => (
                    <div className="tier-group" key={groupName}>
                        <div className="tier-group-header" style={{ color: groupDividerColorMapping[groupName] }}>
                            <span>✧ {groupName} CHARACTERS ✧</span>
                        </div>
                        {tiersInGroup.map((tier) => (
                            <div className="tier-row-grid" key={tier.id}>
                                <div className="tier-header-cell" style={{ backgroundColor: tierColorMapping[tier.tier_level] }}>
                                    <div className="tier-level-text">{tier.tier_level}</div>
                                </div>
                                <div className="character-cell">
                                    <div className="characters-grid">
                                        {tier.dps_characters.map((charData: any) => <CharacterIcon key={charData.id} characterData={charData} />)}
                                    </div>
                                </div>
                                <div className="character-cell">
                                    <div className="characters-grid">
                                        {tier.support_characters.map((charData: any) => <CharacterIcon key={charData.id} characterData={charData} />)}
                                    </div>
                                </div>
                                <div className="character-cell">
                                    <div className="characters-grid">
                                        {tier.def_characters.map((charData: any) => <CharacterIcon key={charData.id} characterData={charData} />)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </main>
        </div>
    );
};

// --- FIX: Added interface definition for the component's props ---
interface TierListClientPageProps {
  initialTierLists: TierList[];
  initialGuideData: GuideData | null;
}

// --- Main Client Component ---
export default function TierListClientPage({ initialTierLists, initialGuideData }: TierListClientPageProps) {
  const [tierLists] = useState(initialTierLists);
  const [guideData] = useState(initialGuideData);
  const [selectedMode, setSelectedMode] = useState<string | null>(() => {
    if (tierLists && tierLists.length > 0) {
      // --- FIX: Added type for parameter 'l' ---
      const defaultList = tierLists.find((l: TierList) => l.attributes.game_mode === 'mode 5v5') || tierLists[0];
      return defaultList.attributes.game_mode;
    }
    return null;
  });

  const handleExportAsPng = () => {
    const elementToCapture = document.getElementById('tier-list-table');
    if (elementToCapture) {
        html2canvas(elementToCapture, {
            allowTaint: true,
            useCORS: true,
            scale: 2,
            backgroundColor: '#1a1a1a',
        }).then(canvas => {
            const link = document.createElement('a');
            // --- FIX: Added type for parameter 'list' ---
            const activeList = tierLists.find((list: TierList) => list.attributes.game_mode === selectedMode);
            const fileName = activeList ? `${activeList.attributes.title}-tier-list.png` : 'tier-list.png';
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }
  };

  // --- FIX: Added type for parameter 'list' ---
  const activeTierList = tierLists.find((list: TierList) => list.attributes.game_mode === selectedMode);
  // --- FIX: Added type for parameter 'list' ---
  const availableModes = tierLists.map((list: TierList) => list.attributes.game_mode);

  return (
    <div style={{ padding: '0 2rem 2rem 2rem' }}>
      <div className="star-selector" style={{ maxWidth: '400px', margin: '1rem auto' }}>
        {/* --- FIX: Added type for parameter 'mode' --- */}
        {availableModes.map((mode: string) => (
          <button key={mode} className={`star-button ${selectedMode === mode ? 'active' : ''}`} onClick={() => setSelectedMode(mode)}>
            {mode.replace(/mode /i, '').toUpperCase()}
          </button>
        ))}
      </div>

      {tierLists.length > 0 ? <TierListDisplay list={activeTierList} /> : <div style={{ textAlign: 'center', marginTop: '2rem' }}>No Tier Lists have been created yet.</div>}

      {/* This component will display the new tabs */}
      <TierListTabs guideData={guideData} />

      {guideData?.credit_name && (
          <div className="guide-credit">
              <p>Tier List by: <strong>{guideData.credit_name}</strong></p>
          </div>
      )}

      <TierListGuide guideData={guideData} />

      <div className="export-container">
        <button onClick={handleExportAsPng} className="export-button">
          Export as PNG
        </button>
      </div>
    </div>
  );
}