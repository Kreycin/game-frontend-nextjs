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

    const [showSpecialStats, setShowSpecialStats] = useState(false);

    // --- Accordion State ---
    const [expandedBuffs, setExpandedBuffs] = useState<Record<string, boolean>>({});
    const toggleBuff = (buffName: string) => {
        setExpandedBuffs(prev => ({ ...prev, [buffName]: !prev[buffName] }));
    };

    // --- Special Stats Data (Real) ---
    const specialStats = [
        { label: "Lifesteal", val: character.Lifesteal || "0%" },
        { label: "Penetration", val: character.Penetration || "0%" },
        { label: "CRIT Rate", val: character.CRIT_rate || "0%" },
        { label: "CRIT Res", val: character.CRIT_Res || "0%" },
        { label: "Debuff Acc", val: character.Debuff_Acc || "0%" },
        { label: "Debuff Res", val: character.Debuff_Res || "0%" },
        { label: "Accuracy", val: character.Accuracy || "0%" },
        { label: "Dodge", val: character.Doge || "0%" },
        { label: "Healing Amt", val: character.Healing_Amt || "0%" },
        { label: "Healing Amt(P)", val: character.Healing_Amt_P || "0%" },
        { label: "Extra DMG", val: character.Extra_DMG || "0%" },
        { label: "DMG Res", val: character.DMG_Res || "0%" },
        { label: "CRIT DMG Res", val: character.CRIT_DMG_Res || "0%" },
        { label: "CRIT DMG", val: character.CRIT_DMG || "0%" },
    ];

    // --- Scroll Parallax Effects ---
    const { scrollY } = useScroll({
        target: leftPanelRef,
        offset: ["start start", "end end"],
    });

    // Parallax: Background moves SLOWLY as we scroll down.
    const backgroundY = useTransform(scrollY, [0, 1000], ["0%", "20%"]);
    const headerOpacity = useTransform(scrollY, [0, 300], [1, 0]);

    // --- Helpers for Data Mapping ---
    const getImageUrl = () => character.Main_Art?.url || "https://placehold.co/400x800/1a1a1a/white?text=No+Image";
    const getElement = () => character.Element || "Unknown";
    const getRole = () => character.Role || "Unknown";

    // Robust YouTube Embed Helper (Parity with Homepage)
    const getYouTubeEmbedUrl = (url: string | undefined | null): string | null => {
        if (!url) return null;
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
    };

    // --- Helper: Mock Buffs based on Element ---
    const getMockBuffs = (elementName: string): string[] => {
        const el = elementName.toLowerCase();
        if (el.includes("thunder") || el.includes("electro") || el.includes("legend")) return ["Electrocute", "Super Conduct"];
        if (el.includes("fire") || el.includes("pyro")) return ["Overload", "Burn"];
        if (el.includes("water") || el.includes("hydro")) return ["Vaporize", "Slow"];
        if (el.includes("ice") || el.includes("cryo")) return ["Freeze", "Shatter"];
        return ["Stun", "Armor Break"]; // Default
    };

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
                type: desc.skill?.Type || desc.skill?.Skill_Type || "Active",
                raw: desc,
                // Use real icon if available (rendered as img), else mock emoji
                icon: desc.skill?.Skill_Icon?.url ? <img src={desc.skill.Skill_Icon.url} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} /> : (idx === 0 ? "⚔️" : idx === 1 ? "⚡" : "💥"),
                buffs: buffs,
                level: desc.skill?.Skill_Level || 1
            };
        }) || [];
    };

    const skills = getSkills();

    // Helper to get Enhancements
    const getEnhancements = () => {
        if (!character.Star_Levels || character.Star_Levels.length === 0) return [];
        return character.Star_Levels[0].enhancements || [];
    };
    const enhancements = getEnhancements();

    // --- Helper: Star Badge Logic ---
    const renderStarBadge = () => (
        <div className="ds-star-badge">
            19★
        </div>
    );

    // --- RESIZER LOGIC ---
    const startResizing = useCallback(() => {
        isResizing.current = true;
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', stopResizing);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend', stopResizing);
    }, []);

    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.body.style.userSelect = 'auto';
        document.body.style.cursor = 'default';
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', stopResizing);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', stopResizing);
    }, []);

    const handleMove = useCallback((e: any) => {
        if (!isResizing.current) return;
        let clientX;
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }

        // Calculate new width for the RIGHT panel dependent on window width
        // Right Panel Width = Window Width - Mouse X - Gap/Resizer width approx
        const newWidth = window.innerWidth - clientX;
        if (newWidth > 400 && newWidth < window.innerWidth * 0.7) {
            setRightPanelWidth(newWidth);
        }
    }, []);

    // Cleanup listeners on unmount
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
                setIsSwitcherOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', stopResizing);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', stopResizing);
        };
    }, [handleMove, stopResizing]);


    return (
        <div className="mockup-body">
            {/* Background Parallax */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${getImageUrl()})`,
                        y: backgroundY,
                        scale: 1.1
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            {/* Main Content Grid with Resizer */}
            <div
                className="mockup-container"
                style={{
                    gridTemplateColumns: `1fr 4px minmax(400px, ${rightPanelWidth}px)` // Dynamic Grid matches Mockup logic
                }}
            >

                {/* --- LEFT COLUMN: Character Art & Media --- */}
                <div className="ds-panel left-column-scroll" ref={leftPanelRef}>
                    <div className="ds-art-frame">
                        <motion.img
                            src={getImageUrl()}
                            alt={character.Name}
                            className="ds-art-img"
                            animate={{
                                y: [0, -15, 0],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 6,
                                ease: "easeInOut"
                            }}
                        />
                        {/* DYNAMIC UR LOGO (Ported from Mockup) */}
                        <motion.div
                            style={{
                                position: 'absolute',
                                top: '5%',
                                left: '5%',
                                fontSize: '8rem',
                                fontWeight: 900,
                                color: 'transparent',
                                WebkitTextStroke: '2px #fff',
                                opacity: Math.min(1, (1000 - rightPanelWidth) / 400),
                                scale: Math.max(0.6, 1 + (500 - rightPanelWidth) / 400),
                                filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.5))',
                                pointerEvents: 'none',
                                transformOrigin: 'top left'
                            }}
                        >
                            UR
                        </motion.div>

                        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4">
                            {/* Duplicate Element Tag Removed */}
                        </div>
                    </div>

                    <div className="ds-video-container">
                        <div className="ds-sub-header">Video Showcase</div>
                        {getYouTubeEmbedUrl(character.YouTube_URL) ? (
                            <div className="video-placeholder" style={{ padding: 0, overflow: 'hidden', aspectRatio: '16/9' }}>
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={getYouTubeEmbedUrl(character.YouTube_URL)!}
                                    title="Character Showcase"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <div className="video-placeholder">
                                <span>No Video Available</span>
                            </div>
                        )}
                    </div>

                    <div className="ds-comment-container">
                        <div className="ds-sub-header">Comments</div>
                        <div className="comment-list">
                            {(character.comments || [1, 2, 3]).map((i: any) => (
                                <div key={i} className="comment-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--ds-red)', fontSize: '0.9rem' }}>User_{typeof i === 'object' ? i.id : i}92 <span style={{ fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>• 2h ago</span></div>
                                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Best build for this cycle is definitely hybrid ATK/EM.</p>
                                </div>
                            ))}
                            <div className="comment-input" style={{ marginTop: '1rem' }}>
                                <input type="text" placeholder="Add a comment..." style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RESIZER --- */}
                <div
                    className="ds-resizer"
                    onMouseDown={startResizing}
                    onTouchStart={startResizing}
                >
                    <div className="ds-resizer-line"></div>
                    <div className="ds-resizer-handle">⁝</div>
                </div>

                {/* --- RIGHT COLUMN: Stats & Skills --- */}
                <div
                    className="ds-panel right-panel"
                    style={{ '--rw': `${rightPanelWidth}px` } as any}
                >
                    <div className="ds-level-row">
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                            <span className="ds-role-tag">{getRole()}</span>
                            <span className="ds-element-tag">
                                <span className="icon">⚡</span>
                                <span className="name">{getElement()}</span>
                            </span>
                        </div>
                    </div>

                    <div className="ds-header-area">
                        <div className="ds-name-stack" ref={switcherRef} style={{ position: 'relative' }}>
                            <div
                                className="ds-character-title-row"
                                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <h1 className="ds-character-name" style={{ margin: 0 }}>{character.Name}</h1>
                                <span className="ds-switcher-arrow">{isSwitcherOpen ? '▲' : '▼'}</span>
                            </div>

                            {isSwitcherOpen && (
                                <div className="ds-switcher-dropdown">
                                    {allCharacters.map((char, index) => (
                                        <div
                                            key={char.id}
                                            className={`ds-switcher-item ${index === selectedCharIdx ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedCharIdx(index);
                                                setIsSwitcherOpen(false);
                                            }}
                                        >
                                            <span className="ds-switcher-icon">{char.Element || "?"}</span>
                                            <span className="ds-switcher-name">{char.Name}</span>
                                            {index === selectedCharIdx && <span className="ds-switcher-check">✓</span>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {renderStarBadge()}
                        </div>
                    </div>

                    {/* Combat Skills */}
                    <div className="ds-section">
                        <div className="ds-section-header">Combat Skills</div>
                        <div className="ds-skill-row">
                            {skills.map((skill, index) => (
                                <div key={index} className="ds-skill-icon-frame" onClick={() => setSelectedSkill(skill)}>
                                    <span style={{ fontSize: '1.5rem' }}>{skill.icon}</span>
                                    <span style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        right: '-5px',
                                        background: 'var(--ds-red)',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--ds-gold)',
                                        zIndex: 10
                                    }}>
                                        Lv.{skill.level}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Basic Attributes (Re-aligned to Mockup Grid) */}
                    <div className="ds-section">
                        <div className="ds-section-header">Basic Attributes</div>
                        <div className="ds-stats-grid">
                            <div className="ds-stat-item">
                                <span className="label">HP</span>
                                <span className="val">{character.HP?.toLocaleString() || "N/A"}</span>
                                <span className="spacer"></span>
                            </div>
                            <div className="ds-stat-item">
                                <span className="label">ATK</span>
                                <span className="val">{character.ATK?.toLocaleString() || "N/A"}</span>
                                <span className="spacer"></span>
                            </div>
                            <div className="ds-stat-item">
                                <span className="label">DEF</span>
                                <span className="val">{character.DEF?.toLocaleString() || "N/A"}</span>
                                <span className="spacer"></span>
                            </div>
                            <div className="ds-stat-item">
                                <span className="label">SPD</span>
                                <span className="val">{character.SPD?.toLocaleString() || "N/A"}</span>
                                <span className="spacer"></span>
                            </div>
                            <button
                                className="ds-special-btn"
                                onClick={() => setShowSpecialStats(true)}
                            >
                                Special Stats Detail
                            </button>
                        </div>
                    </div>

                    {/* Enhancement Timeline (Real Data) */}
                    <div className="ds-section">
                        <div className="ds-section-header">Enhancement Timeline</div>
                        <div className="ds-enhancement-timeline">
                            {enhancements.length > 0 ? enhancements.map((enh: any, i: number) => (
                                <div className="ds-enh-item" key={i}>
                                    <div className="ds-enh-lvl">
                                        {enh.Enhancement_Icon?.url ?
                                            <img src={enh.Enhancement_Icon.url} alt="icon" style={{ width: '80px', height: '80px', minWidth: '80px', objectFit: 'contain', marginTop: '0.2rem' }} />
                                            : <div style={{ width: '80px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--ds-red)' }}>Lv.{((i + 1) * 10)}</div>}
                                    </div>
                                    <div>
                                        <div className="ds-enh-text">
                                            {enh.Description?.map((block: any, bi: number) => (
                                                <span key={bi}>{block.children.map((c: any) => c.text).join("")}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>No enhancements data available.</div>
                            )}
                        </div>
                    </div>

                </div>


                {/* --- MODALS (Kept Functional) --- */}
                <AnimatePresence>
                    {selectedSkill && (
                        <div className="ds-modal-overlay" onClick={() => setSelectedSkill(null)}>
                            <motion.div
                                className="ds-scroll-popup"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    maxWidth: '1000px',
                                    width: '90%',
                                }}
                            >
                                <div className="ds-modal-inner">
                                    <h2 style={{
                                        margin: '0 0 1.5rem 0',
                                        textTransform: 'uppercase',
                                        borderBottom: '1px solid var(--ds-glass-border)',
                                        paddingBottom: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        Skill Detail
                                        <button className="ds-modal-close" style={{ margin: 0, padding: '0.4rem 1.2rem', fontSize: '0.8rem' }} onClick={() => setSelectedSkill(null)}>Close</button>
                                    </h2>

                                    <div className="ds-skill-modal-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', maxHeight: '60vh' }}>
                                        {/* LEFT COLUMN: Skill Details (Preserved & Enhanced) */}
                                        <div className="ds-skill-modal-left" style={{ overflowY: 'auto', paddingRight: '0.5rem', maxHeight: '60vh' }}>
                                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                                <div style={{
                                                    fontSize: '3rem',
                                                    width: '80px',
                                                    height: '80px',
                                                    flexShrink: 0,
                                                    borderRadius: '50%',
                                                    border: '2px solid var(--ds-gold)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                    background: 'rgba(0,0,0,0.3)'
                                                }}>
                                                    {selectedSkill.icon}
                                                </div>
                                                <div>
                                                    <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1.8rem', color: 'var(--ds-text)', wordBreak: 'break-word', lineHeight: 1.1 }}>{selectedSkill.name}</h2>
                                                    <div className="ds-modal-subtitle" style={{ color: 'var(--ds-gold)', fontWeight: 'bold', marginTop: '0.3rem' }}>Type: {selectedSkill.type}</div>
                                                    <div className="ds-modal-subtitle" style={{ color: 'var(--ds-label)', fontSize: '0.9rem' }}>Level: {selectedSkill.level}</div>
                                                </div>
                                            </div>

                                            <div className="ds-section-title" style={{ marginTop: '1rem' }}>Description</div>
                                            <p className="ds-modal-desc" style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>
                                                {selectedSkill.description}
                                            </p>
                                        </div>

                                        {/* RIGHT COLUMN: Buff Accordion List */}
                                        <div className="ds-skill-modal-right" style={{ overflowY: 'auto', paddingRight: '10px', maxHeight: '60vh' }}>
                                            <div className="ds-section-title">Buffs & Effects</div>
                                            <div className="ds-buff-accordion-list">
                                                {selectedSkill.buffs && selectedSkill.buffs.length > 0 ? (
                                                    selectedSkill.buffs.map((buff: any, idx: number) => {
                                                        const isExpanded = expandedBuffs[`${buff.name}-${idx}`];
                                                        return (
                                                            <div
                                                                key={`${buff.name}-${idx}`}
                                                                className={`ds-buff-accordion ${isExpanded ? 'expanded' : ''}`}
                                                            >
                                                                <div
                                                                    className="ds-buff-accordion-header"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleBuff(`${buff.name}-${idx}`);
                                                                    }}
                                                                >
                                                                    <div className="ds-buff-icon-box">
                                                                        {buff.icon ? (
                                                                            <img src={buff.icon} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                        ) : (
                                                                            <span>⚡</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="ds-buff-name">{buff.name}</div>
                                                                    <div className="ds-accordion-arrow">▼</div>
                                                                </div>
                                                                <div className="ds-buff-accordion-content">
                                                                    <div className="ds-buff-desc">
                                                                        {buff.description || "No description available."}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>No specific buffs.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>



                {/* SPECIAL STATS MODAL */}
                <AnimatePresence>
                    {showSpecialStats && (
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
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
