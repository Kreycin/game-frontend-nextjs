// src/app/tier-list/page.tsx
import TierListClientPage from '@/components/TierListClientPage';
import type { TierList, GuideData } from '@/types/tierlist';

const API_ENDPOINT = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const TIER_LIST_API_URL = `${API_ENDPOINT}/api/public-tier-lists`;
const GUIDE_API_URL = `${API_ENDPOINT}/api/tier-list-guide`;

// Helper to safely parse JSON strings or handle plain text
const parseRichText = (text: string | any[] | null | undefined): any[] | null => {
  if (!text) return null;
  // If it's already an array/object, return it
  if (typeof text === 'object') return text;
  
  try {
    // If it's a string, try to parse it
    return JSON.parse(text);
  } catch (error) {
    // If parsing fails, it's likely plain text. Wrap it for the renderer.
    console.warn("Could not parse Rich Text string, treating as plain text:", text);
    return [{ type: 'paragraph', children: [{ type: 'text', text: String(text) }] }];
  }
};


async function getTierListData() {
  try {
    const [tierListsRes, guideRes] = await Promise.all([
      fetch(TIER_LIST_API_URL, { next: { revalidate: 43200 } }),
      fetch(GUIDE_API_URL, { next: { revalidate: 43200 } })
    ]);

    if (!tierListsRes.ok || !guideRes.ok) {
      throw new Error('Failed to fetch tier list data');
    }

    const tierListsJson = await tierListsRes.json();
    const guideJson = await guideRes.json();

    // --- FIX: Use guideJson.data directly, as there is no .attributes layer ---
    const guideData = guideJson.data ? guideJson.data : null;

    // Parse all rich text fields from strings to JSON objects
    if (guideData) {
      guideData.criteria = parseRichText(guideData.criteria);
      guideData.roles = parseRichText(guideData.roles);
      guideData.ratings = parseRichText(guideData.ratings);
      guideData.tags = parseRichText(guideData.tags);
      guideData.profile = parseRichText(guideData.profile);
      guideData.review = parseRichText(guideData.review);
      guideData.build_and_teams = parseRichText(guideData.build_and_teams);
    }

    return {
      tierLists: tierListsJson.data as TierList[],
      guideData: guideData as GuideData | null
    };
  } catch (error) {
    console.error("Error fetching tier list data:", error);
    return { tierLists: [], guideData: null };
  }
}

export default async function TierListPage() {
  const { tierLists, guideData } = await getTierListData();

  if (!tierLists || tierLists.length === 0) {
    return <div className="loading-state">Could not load Tier List data.</div>;
  }

  return <TierListClientPage initialTierLists={tierLists} initialGuideData={guideData} />;
}