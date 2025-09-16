// src/types/tierlist.ts

// Define the structure for a single tier row
export interface Tier {
  id: number;
  tier_level: string;
  dps_characters: any[];
  support_characters: any[];
  def_characters: any[];
}

export interface TierList {
  id: number;
  attributes: {
    game_mode: string;
    title: string;
    tiers: Tier[];
    // The new fields are now removed from here
  };
}

export interface GuideData {
  // --- ADDED: New fields are now here ---
  profile: any[] | null;
  review: any[] | null;
  build_and_teams: any[] | null;
  youtube_url?: string | null;
  // --- END ADDED ---
  credit_name: string;
  criteria: any[];
  roles: any[];
  ratings: any[];
  tags: any[];
}