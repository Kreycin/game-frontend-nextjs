"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Character, RichTextBlock } from "@/types/character";
import "./theme.css";

// --- Mock Buff Definitions (Ported from Mockup) ---
const BUFF_DEFINITIONS: Record<string, string> = {
    Electrocute: "Stuns enemies for 1.5s and deals continuous Lightning damage.",
    "Super Conduct": "Reduces enemy Physical Resistance by 40% for 8s.",
    Overload: "Creates an explosion that deals AoE Pyro damage.",
    Vaporize: "Increases damage of the triggering Hydro or Pyro attack.",
    Freeze: "Immobilizes enemies. Shatter frozen enemies for extra Physical damage.",
    Melt: "Increases damage of the triggering Pyro or Cryo attack.",
    Swirl: "Spreads the element involved and deals AoE elemental damage.",
    Crystallize: "Creates an elemental shard that provides a shield.",
    Stun: "Incapacitates the enemy, preventing them from taking action.",
    "Armor Break": "Reduces enemy defense by 20%.",
    Slow: "Reduces movement speed by 30%.",
    Burn: "Deals continuous Pyro damage over time.",
};

interface TestCharacterSheetProps {
    allCharacters: Character[];
}

export default function TestCharacterSheet({ allCharacters }: TestCharacterSheetProps) {
    // --- Enhanced State & Refs ---
    const [selectedCharIdx, setSelectedCharIdx] = useState(0);
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const switcherRef = useRef<HTMLDivElement>(null);

    // Derived Character
    const character = allCharacters[selectedCharIdx] || allCharacters[0];

    const [rightPanelWidth, setRightPanelWidth] = useState(600); // Default width
    const isResizing = useRef(false);
    const leftPanelRef = useRef<HTMLDivElement>(null); // For scroll parallax
    const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
    // Updated State type
    const [selectedBuff, setSelectedBuff] = useState<any | null>(null);

    // ... (rest of state)

    // Extract skills from the first Star Level
    const getSkills = () => {
        if (!character.Star_Levels || character.Star_Levels.length === 0) return [];
        return character.Star_Levels[0].skill_descriptions?.map((desc, idx) => {
            // Safe name accessor (handle capitalized or lowercase)
            const skillName = desc.skill?.Skill_Name || desc.skill?.name || "Unknown Skill";

            // Convert RichTextBlock[] to string
            const description = desc.Description?.map((block: RichTextBlock) => block.children.map((c: any) => c.text).join("")).join("\n") || "";

            // Try to get buffs from API effects (Rich Object)
            let buffs: any[] = [];
            if (desc.skill?.effects && desc.skill.effects.length > 0) {
                buffs = desc.skill.effects.map((e: any) => ({
                    name: e.Effect_Name || e.name || "Unknown Buff",
                    description: e.Description?.map((block: any) => block.children.map((c: any) => c.text).join("")).join("") || "Description unavailable.",
                    icon: e.Effect_Icon?.url || null
                }));
            }

            // FALLBACK: If no buffs from API, try to parse from description [Bound Names]
            if (buffs.length === 0) {
                const bracketMatches = description.match(/\[([a-zA-Z0-9\s]+)\]/g);
                if (bracketMatches) {
                    buffs = bracketMatches.map((m: string) => ({
                        name: m.slice(1, -1),
                        description: BUFF_DEFINITIONS[m.slice(1, -1)] || "Description unavailable.",
                        icon: null
                    })); // Mock object from regex
                } else {
                    // Legacy Mock fallback
                    const mockNames = getMockBuffs(character.Element || "Unknown");
                    buffs = mockNames.map(name => ({
                        name: name,
                        description: BUFF_DEFINITIONS[name] || "Description unavailable.",
                        icon: null
                    }));
                }
            }

            return {
                id: idx,
                name: skillName,
                description: description,
                type: "Active", // Placeholder
                raw: desc,
                // Use real icon if available (rendered as img), else mock emoji
                icon: desc.skill?.Skill_Icon?.url ? <img src={desc.skill.Skill_Icon.url} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} /> : (idx === 0 ? "⚔️" : idx === 1 ? "⚡" : "💥"),
                buffs: buffs,
                level: desc.skill?.Skill_Level || 1
            };
        }) || [];
    };

    // ... (rest of component until Modal)

    {/* Buff Tags */ }
                                    <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {selectedSkill.buffs && selectedSkill.buffs.length > 0 ? (
                                            selectedSkill.buffs.map((buff: any, idx: number) => (
                                                <span
                                                    key={`${buff.name}-${idx}`}
                                                    className="ds-skill-buff-tag interactive"
                                                    style={{ cursor: 'pointer', zIndex: 11002, position: 'relative' }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedBuff(buff);
                                                    }}
                                                >
                                                    {buff.name} ⓘ
                                                </span>
                                            ))
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>No specific buffs.</span>
                                        )}
                                    </div>

                                    <button className="ds-modal-close" onClick={() => setSelectedSkill(null)}>Close</button>
                                </div >
                            </motion.div >
                        </div >
                    )
}
                </AnimatePresence >

    {/* Buff Definition Nested Modal */ }
    <AnimatePresence>
{
    selectedBuff && (
        <div className="ds-modal-overlay" style={{ zIndex: 11000 }} onClick={() => setSelectedBuff(null)}>
            <motion.div
                className="ds-scroll-popup"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ maxWidth: '400px', padding: '2rem' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="ds-modal-inner" style={{ textAlign: 'center' }}>
                    {selectedBuff.icon && (
                        <div style={{ width: '64px', height: '64px', margin: '0 auto 1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--ds-gold)' }}>
                            <img src={selectedBuff.icon} alt={selectedBuff.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}
                    <h3 style={{ textTransform: 'uppercase', color: 'var(--ds-gold)', marginTop: 0 }}>{selectedBuff.name}</h3>
                    <p style={{ lineHeight: 1.6, textAlign: 'left', marginTop: '1rem' }}>
                        {selectedBuff.description}
                    </p>
                    <button className="ds-modal-close" onClick={() => setSelectedBuff(null)}>Close</button>
                </div>
            </motion.div>
        </div>
    )
}
                </AnimatePresence >

    {/* SPECIAL STATS MODAL */ }
    <AnimatePresence>
{
    showSpecialStats && (
        <div className="ds-modal-overlay" onClick={() => setShowSpecialStats(false)}>
            <div className="ds-scroll-popup" onClick={(e) => e.stopPropagation()}>
                <div className="ds-modal-inner">
                    <h2 className="ds-modal-header">Advanced Analytics</h2>
                    <div className="ds-modal-stats-list">
                        {specialStats.map(stat => (
                            <div key={stat.label} className="ds-modal-stat-item">
                                <span className="label">{stat.label}</span>
                                <span className="val">{stat.val}</span>
                                <span className="spacer"></span>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button className="ds-special-btn" onClick={() => setShowSpecialStats(false)}>Back to Stats</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
                </AnimatePresence >

            </div >
        </div >
    );
}
