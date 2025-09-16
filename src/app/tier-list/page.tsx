import TierListClientPage from '@/components/TierListClientPage';
import type { TierList, GuideData } from '@/types/tierlist';

const API_ENDPOINT = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const TIER_LIST_API_URL = `${API_ENDPOINT}/api/public-tier-lists`;
const GUIDE_API_URL = `${API_ENDPOINT}/api/tier-list-guide`;

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

    return {
      tierLists: tierListsJson.data as TierList[],
      guideData: guideJson.data as GuideData | null
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