// src/components/TierListExtraInfo.tsx
'use client';
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import VideoSection from './VideoSection';
import type { GuideData } from '@/types/tierlist';

// Helper function to render Rich Text from Strapi (re-used)
const BlocksRenderer = ({ blocks }: { blocks: any[] | null }) => {
    // --- FIX: Check if blocks is actually an array ---
    if (!Array.isArray(blocks) || blocks.length === 0) {
        return <p>No information available.</p>;
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


// Main component for the extra info section
const TierListExtraInfo = ({ guideData }: { guideData: GuideData | null }) => {
    if (!guideData) {
        return null;
    }

    const { profile, review, build_and_teams, youtube_url } = guideData;
    const embedUrl = getYouTubeEmbedUrl(youtube_url);

    return (
        <div className="tier-list-extra-info-container">
            <CollapsiblePanel title="Profile" defaultExpanded={false}>
                <div className="panel-content-inner">
                    <BlocksRenderer blocks={profile} />
                </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Review" defaultExpanded={false}>
                 <div className="panel-content-inner">
                    <BlocksRenderer blocks={review} />
                </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Build & Teams" defaultExpanded={false}>
                 <div className="panel-content-inner">
                    <BlocksRenderer blocks={build_and_teams} />
                </div>
            </CollapsiblePanel>
            
            {embedUrl && <VideoSection embedUrl={embedUrl} />}

        </div>
    );
};

export default TierListExtraInfo;