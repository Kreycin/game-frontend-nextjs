// src/components/TierListTabs.tsx
'use client';
import React, { useState } from 'react';
import VideoSection from './VideoSection';
import type { GuideData } from '@/types/tierlist';

// Helper function to render Rich Text from Strapi (re-used)
const BlocksRenderer = ({ blocks }: { blocks: any[] | null }) => {
    if (!Array.isArray(blocks) || blocks.length === 0) {
        return <p>No information available for this section.</p>;
    }

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

const getYouTubeEmbedUrl = (url: string | undefined | null): string | null => {
  if (!url) return null;
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
};

type TabName = 'profile' | 'review' | 'build_and_teams';

// Main component for the tabs section
const TierListTabs = ({ guideData }: { guideData: GuideData | null }) => {
    const [activeTab, setActiveTab] = useState<TabName | null>(null);

    if (!guideData) {
        return null;
    }

    const handleTabClick = (tabName: TabName) => {
        // If the clicked tab is already active, close it. Otherwise, set it as active.
        setActiveTab(activeTab === tabName ? null : tabName);
    };
    
    const embedUrl = getYouTubeEmbedUrl(guideData.youtube_url);

    const tabs: { id: TabName; label: string }[] = [
        { id: 'profile', label: 'Profile' },
        { id: 'review', label: 'Review' },
        { id: 'build_and_teams', label: 'Build & Teams' },
    ];

    return (
        <div className="tier-list-tabs-container">
            {/* Tab Buttons */}
            <div className="tab-buttons-container">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {activeTab && (
                <div className="tab-content-area">
                    {activeTab === 'profile' && <BlocksRenderer blocks={guideData.profile} />}
                    {activeTab === 'review' && <BlocksRenderer blocks={guideData.review} />}
                    {activeTab === 'build_and_teams' && (
                        <>
                            <BlocksRenderer blocks={guideData.build_and_teams} />
                            {embedUrl && <VideoSection embedUrl={embedUrl} />}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default TierListTabs;