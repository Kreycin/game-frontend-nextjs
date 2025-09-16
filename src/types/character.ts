// src/types/character.ts

// This is our single source of truth for what a "Character" is.

export interface RichTextBlock {
  type: string;
  children: { text: string }[];
}

export interface Enhancement {
  id: number;
  Description: RichTextBlock[];
  Enhancement_Icon?: { url: string };
}

export interface SkillDescription {
  id: number;
  skill: any; // Using 'any' for now as the skill structure is complex
  Description: RichTextBlock[];
}

export interface StarLevel {
  id: number;
  Star_Level: string;
  enhancements: Enhancement[];
  skill_descriptions: SkillDescription[];
}

export interface Character {
  id: number;
  Name: string;
  Rarity: string;
  Role: string;
  Element?: string;
  ATK: number;
  DEF: number;
  HP: number;
  SPD: number;
  Lifesteal: string;
  Penetration: string;
  CRIT_rate: string;
  CRIT_Res: string;
  Debuff_Acc: string;
  Debuff_Res: string;
  Accuracy: string;
  Doge: string;
  Healing_Amt: string;
  Healing_Amt_P: string;
  Extra_DMG: string;
  DMG_Res: string;
  CRIT_DMG_Res: string;
  CRIT_DMG: string;
  Main_Art?: { url: string };
  YouTube_URL?: string;
  Star_Levels: StarLevel[];
}