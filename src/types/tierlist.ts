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
    // Use the new Tier interface
    tiers: Tier[];
  };
}

export interface GuideData {
  credit_name: string;
  criteria: any[];
  roles: any[];
  ratings: any[];
  tags: any[];
}