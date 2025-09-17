// src/components/TierListExtraInfo.tsx
'use client';
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import VideoSection from './VideoSection';
import type { GuideData } from '@/types/tierlist';

const getYouTubeEmbedUrl = (url: string | undefined | null): string | null => {
  if (!url) return null;
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
};

// Helper Component สำหรับแสดงผล HTML
const RawHtmlRenderer = ({ htmlContent }: { htmlContent: string | null }) => {
    if (!htmlContent) {
        return <p>No information available.</p>;
    }
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

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
                    {/* แก้ไขโดยการเพิ่ม `as unknown as string` 
                      เพื่อแปลงชนิดข้อมูลให้ถูกต้อง
                    */}
                    <RawHtmlRenderer htmlContent={profile as unknown as string} />
                </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Review" defaultExpanded={false}>
                 <div className="panel-content-inner">
                    <RawHtmlRenderer htmlContent={review as unknown as string} />
                </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Build & Teams" defaultExpanded={false}>
                 <div className="panel-content-inner">
                    <RawHtmlRenderer htmlContent={build_and_teams as unknown as string} />
                </div>
            </CollapsiblePanel>
            
            {embedUrl && <VideoSection embedUrl={embedUrl} />}

        </div>
    );
};

export default TierListExtraInfo;