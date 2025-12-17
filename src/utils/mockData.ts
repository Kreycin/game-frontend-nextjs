import { Character, RichTextBlock } from "@/types/character";

// Helper to create rich text with newlines
const createRichText = (text: string): RichTextBlock[] => {
    return text.split('\n').map(line => ({
        type: "paragraph",
        children: [{ text: line.trim() }]
    })).filter(block => block.children[0].text !== "");
};

export const MOCK_CHARACTER: Character = {
    id: 1001,
    Name: "Yoriichi - Sun Halo Crimson Blade",
    Rarity: "UR",
    Role: "DPS",
    Element: "Legend",
    ATK: 51305,
    DEF: 5205,
    HP: 201300,
    SPD: 4215,
    Lifesteal: "15%",
    Penetration: "15%",
    CRIT_rate: "15%",
    CRIT_Res: "15%",
    Debuff_Acc: "15%",
    Debuff_Res: "15%",
    Accuracy: "15%",
    Doge: "15%",
    Healing_Amt: "15%",
    Healing_Amt_P: "15%",
    Extra_DMG: "15%",
    DMG_Res: "15%",
    CRIT_DMG_Res: "15%",
    CRIT_DMG: "15%",
    Main_Art: {
        url: "https://res.cloudinary.com/di8bf7ufw/image/upload/v1765965224/profile_2_7a11b587f6.png"
    },
    YouTube_URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Keep existing placeholder or remove
    Star_Levels: [
        {
            id: 1,
            Star_Level: "19 Star",
            enhancements: [
                {
                    id: 101,
                    Description: createRichText("Unlocks the potential of the Sun Breathing technique, increasing base stats."),
                    Enhancement_Icon: { url: "https://placehold.co/64x64/orange/white?text=Sun" }
                },
                {
                    id: 102,
                    Description: createRichText("Increases CRIT Rate by 15% and CRIT DMG by 30%."),
                    Enhancement_Icon: { url: "https://placehold.co/64x64/red/white?text=Crit" }
                },
                {
                    id: 104,
                    Description: createRichText("Grant Immortality for 1 turn upon taking fatal damage."),
                }
            ],
            skill_descriptions: [
                {
                    id: 201,
                    skill: { name: "Demon Sealing Slash", Skill_Icon: { url: "https://placehold.co/64x64/red/white?text=Slash" }, effects: [] },
                    Description: createRichText(`Release at Turn 1, CD: 2 turn(s)
Deals 320% DMG to all enemies with a 75% base chance to apply [KnockDown] and [Weakness].

If holding [Radiance], deals an additional 320% DMG to all enemies and reduces their [Limit Value] by 10%.

After casting, gain 1 level of [Radiance] and a [Corona] Shield (equal to 150% ATK). If [Radiance] is above 1 level, additionally gain +30% SPD for 2 turns.`),
                },
                {
                    id: 202,
                    skill: { name: "Heart of the Rising Sun", Skill_Icon: { url: "https://placehold.co/64x64/yellow/black?text=Heart" }, effects: [] },
                    Description: createRichText(`Passive Skill
ATK+40%, HP+30%, SPD+40.

At the start of the turn, triggers leader skill [Solar Shine], granting buffs to all allies based on Yoriichi - Sun Halo Crimson Blade Star Level.
- Buffs: Increases ATK, Crit Rate, and Crit DMG for all allies.
- Values: (5-Star: 4%; 9-Star: 6%; 12-Star: 8%; 15-Star: 10%; 17-Star: 12%; 19-Star: 15%).`),
                },
                {
                    id: 203,
                    skill: { name: "Pure Domain", Skill_Icon: { url: "https://placehold.co/64x64/darkred/white?text=Domain" }, effects: [] },
                    Description: createRichText(`Passive Skill
Yoriichi creates a Pure Domain that lasts until the end of the battle.
While in this domain, he is immune to all Control effects.
Whenever an enemy attacks, he applies 1 level of [Destruction] to the attacker.

Before attacking, if holding more than 1 level of [Radiance], restore HP equal to 90% ATK; if more than 2 levels, additionally reduce the target's [Limit Value] by 10%; if more than 3 levels, additionally dispel the target's Shield; if more than 4 levels, apply 1 level of [Destruction] to the enemy with the highest ATK.

After casting the Ultimate skill, if holding 3 or more levels of [Radiance], consume 3 levels to cast [Sun Breathing: Thirteenth Form] Lv.3 again (triggers once per turn and cannot trigger the kill-reset effect).
If he is the only ally remaining on the field, gain 50% Lifesteal and Crit Rate.`),
                },
                {
                    id: 205,
                    skill: { name: "Sun Breathing: Thirteenth Form", Skill_Icon: { url: "https://placehold.co/64x64/gold/black?text=13th" }, effects: [] },
                    Description: createRichText(`Release at Turn 2, CD: 4 turn(s)
Deals 500% ATK DMG to all enemies. This damage is shared among all enemy units and ignores DMG Res, with a maximum limit of 2,000% ATK against a single target.

Applies 1 level of [Destruction] to the enemy with the highest ATK, lasting until the end of the battle and cannot be purged.

If [Radiance] is above 2 levels, deals additional True DMG equal to 30% of the target's Max HP (Maximum: 500% of self ATK).

When casting, if any target dies, this skill is immediately recast without cost.

After casting, if the target holds 20 levels of [Destruction], deals 2 times extra damage. If the target's HP is below 30%, they are instantly executed; this execution ignores all Shields and Buffs held by the target.`),
                },
            ],
        },
    ],
};
