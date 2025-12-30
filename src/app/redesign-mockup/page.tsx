/* src/app/redesign-mockup/page.tsx */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AnimatedBackground from "@/components/AnimatedBackground";
import './theme.css';

const SKILLS = [
    { id: 1, name: "Thunderclaps & Flash", icon: "⚡", type: "Active", description: "Deals 220% ATK damage to all enemies. 80% chance to inflict [Electrocute].", buffs: ['Electrocute', 'Stun'] },
    { id: 2, name: "Godlike Speed", icon: "💨", type: "Passive", description: "Speed increased by 40%. Immunity to [Slow] effects.", buffs: ['SPD Up', 'CC Immunity'] },
    { id: 3, name: "Sixfold", icon: "⚔️", type: "Active", description: "Single target nuke. Ignores 30% DEF.", buffs: ['DMG Boost', 'Crit Rate Up'] },
    { id: 4, name: "Thunder Breathing", icon: "✨", type: "Passive", description: "Start battle with 2 layers of [Focus].", buffs: ['Focus', 'DEF Ignore'] },
];

const ENHANCEMENTS = [
    { id: "e1", level: 10, effect: "At the start of combat, apply [Negative Charge] to all enemies.", icon: "✧" },
    { id: "e2", level: 20, effect: "Instantly restore 100% HP when entering [Super Meteor] state.", icon: "✦" },
    { id: "e3", level: 30, effect: "Speed +30. Passive trigger requirement reduced to 3 times.", icon: "✧" },
    { id: "e4", level: 40, effect: "Enter [Super Meteor] state immediately at the start of battle.", icon: "❂" },
];

const COMMENTS = [
    { user: "Inosuke", text: "THAT'S MY RIVAL! HAHAHA!", time: "2h ago" },
    { user: "Tanjiro", text: "Zenitsu... you're getting so much stronger.", time: "5h ago" },
    { user: "Nezuko", text: "Mmrph! ✨", time: "1d ago" },
];

const BUFF_DEFINITIONS = {
    'Electrocute': 'Deals continuous Lightning DMG equal to 40% of ATK each turn. Reduces healing received by 20%.',
    'Stun': 'Target cannot take any action. Cooldowns do not recover while stunned.',
    'SPD Up': 'Increases Speed by 40%.',
    'CC Immunity': 'Prevents all control effects (Stun, Freeze, Sleep, Silence).',
    'DMG Boost': 'Increases direct damage dealt by 20%.',
    'Crit Rate Up': 'Increases Critical Hit Chance by 15%.',
    'Focus': 'Increases next attack DMG by 50%. Stacks up to 2 times.',
    'DEF Ignore': 'Attacks bypass a portion of enemy Defense.'
};

const CHARACTERS = [
    {
        id: "zenitsu",
        name: "Zenitsu Agatsuma",
        role: "DPS",
        rarity: "UR",
        element: "⚡",
        elementName: "Thunder",
        level: 270,
        art: "https://res.cloudinary.com/di8bf7ufw/image/upload/v1750761818/Gyokko-UR_Workspace_emhp2w.jpg",
        bg: "https://res.cloudinary.com/di8bf7ufw/image/upload/v1750761818/Gyokko-UR_Workspace_emhp2w.jpg",
        stats: { ATK: "69,554", HP: "690,173", DEF: "2,192", SPD: "2,009" }
    },
    {
        id: "yoriichi",
        name: "Yoriichi Tsugikuni",
        role: "DPS",
        rarity: "UR",
        element: "☀️",
        elementName: "Sun",
        level: 290,
        art: "https://res.cloudinary.com/di8bf7ufw/image/upload/v1765965224/profile_2_7a11b587f6.png",
        bg: "https://res.cloudinary.com/di8bf7ufw/image/upload/v1765965224/profile_2_7a11b587f6.png",
        stats: { ATK: "82,410", HP: "845,200", DEF: "3,105", SPD: "2,400" }
    }
];

export default function MockupPage() {
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [selectedBuff, setSelectedBuff] = useState(null);
    const [showSpecialStats, setShowSpecialStats] = useState(false);
    const [starLevel, setStarLevel] = useState(4);
    const [expandedEnhancements, setExpandedEnhancements] = useState({});
    const [rightPanelWidth, setRightPanelWidth] = useState(600);
    const [selectedCharIdx, setSelectedCharIdx] = useState(0);
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const isResizing = useRef(false);
    const switcherRef = useRef<HTMLDivElement>(null);

    const character = CHARACTERS[selectedCharIdx];

    // Scroll Container Refs for Parallax
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: leftScrollY } = useScroll({ container: leftPanelRef });

    // Parallax Values
    const artY = useTransform(leftScrollY, [0, 1], [0, 150]);
    const bgZoom = useTransform(leftScrollY, [0, 1], [1, 1.1]);
    const bgOpacity = useTransform(leftScrollY, [0, 0.5, 1], [0.7, 0.5, 0.7]);

    // UR Logo scales based on LEFT panel space
    const urScale = Math.max(0.6, 1 + (500 - rightPanelWidth) / 400);
    const urOpacity = Math.min(1, (1000 - rightPanelWidth) / 400);

    // Close switcher when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
                setIsSwitcherOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Unified stop resizing
    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', stopResizing);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', stopResizing);
        document.body.style.userSelect = 'auto';
        document.body.style.cursor = 'default';
    }, []);

    // Resize handler
    const startResizing = useCallback((e: any) => {
        isResizing.current = true;
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', stopResizing);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', stopResizing);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
    }, [stopResizing]);

    const handleMove = useCallback((e: any) => {
        if (!isResizing.current) return;
        let clientX;
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            if (e.cancelable) e.preventDefault();
        } else {
            clientX = e.clientX;
        }
        const newWidth = window.innerWidth - clientX;
        if (newWidth > 560 && newWidth < window.innerWidth * 0.8) {
            setRightPanelWidth(newWidth);
        }
    }, []);

    const toggleEnhancement = (id: number) => {
        setExpandedEnhancements(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const specialStats = [
        { label: "Lifesteal", val: "15%" },
        { label: "Penetration", val: "10%" },
        { label: "CRIT Rate", val: "25%" },
        { label: "CRIT Res", val: "12%" },
        { label: "Debuff Acc", val: "30%" },
        { label: "Debuff Res", val: "20%" },
        { label: "Accuracy", val: "100%" },
        { label: "Dodge", val: "5%" },
        { label: "Healing Amt", val: "0%" },
        { label: "Healing Amt(P)", val: "0%" },
        { label: "Extra DMG", val: "40%" },
        { label: "DMG Res", val: "15%" },
        { label: "CRIT DMG Res", val: "20%" },
        { label: "CRIT DMG", val: "180%" },
    ];

    const stats = Object.entries(character.stats).map(([label, val]) => ({ label, val }));

    return (
        <div className="mockup-body">
            {/* ANIMATED BACKGROUND LAYER */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AnimatedBackground />
            </div>

            <div
                className="mockup-container"
                style={{
                    gridTemplateColumns: `1fr 10px ${rightPanelWidth}px`,
                    backgroundColor: 'transparent',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* PARALLAX BACKGROUND IMAGE */}
                <motion.div
                    className="absolute inset-0 z-0"
                    key={character.bg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: bgOpacity.get() }}
                    transition={{ duration: 0.5 }}
                    style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${character.bg}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        scale: bgZoom,
                        opacity: bgOpacity
                    }}
                />

                {/* LEFT COLUMN */}
                <div className="ds-panel left-column-scroll" ref={leftPanelRef} style={{ position: 'relative', zIndex: 10 }}>
                    <div className="ds-art-frame">
                        <motion.img
                            key={character.art}
                            src={character.art}
                            alt="Character Art"
                            className="ds-art-img"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                        {/* DYNAMIC UR LOGO */}
                        <motion.div
                            style={{
                                position: 'absolute',
                                top: '5%',
                                left: '5%',
                                fontSize: '8rem',
                                fontWeight: 900,
                                color: 'transparent',
                                WebkitTextStroke: '2px #fff',
                                opacity: urOpacity,
                                scale: urScale,
                                filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.5))',
                                pointerEvents: 'none',
                                transformOrigin: 'top left'
                            }}
                        >
                            UR
                        </motion.div>
                    </div>

                    <div className="ds-video-container">
                        <div className="ds-sub-header">Video Showcase</div>
                        <div className="video-placeholder">
                            <span>▶ Play Gameplay Video</span>
                            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Demon Slayer: Eternal Destiny</p>
                        </div>
                    </div>

                    <div className="ds-comment-container">
                        <div className="ds-sub-header">Comments</div>
                        <div className="comment-list">
                            {COMMENTS.map((c, i) => (
                                <div key={i} className="comment-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--ds-red)', fontSize: '0.9rem' }}>{c.user} <span style={{ fontWeight: 'normal', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>• {c.time}</span></div>
                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>{c.text}</div>
                                </div>
                            ))}
                            <div className="comment-input" style={{ marginTop: '1rem' }}>
                                <input type="text" placeholder="Add a comment..." style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* DRAGGABLE DIVIDER */}
                <div
                    className="ds-resizer"
                    onMouseDown={startResizing}
                    onTouchStart={startResizing}
                >
                    <div className="ds-resizer-line"></div>
                    <div className="ds-resizer-handle">⁝</div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="ds-panel right-panel" style={{ '--rw': `${rightPanelWidth}px` } as any}>
                    <div className="ds-level-row">
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                            <span className="ds-role-tag">{character.role}</span>
                            <span className="ds-element-tag">
                                <span className="icon">{character.element}</span>
                                <span className="name">{character.elementName}</span>
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
                                <h1 className="ds-character-name" style={{ margin: 0 }}>{character.name}</h1>
                                <span className="ds-switcher-arrow">{isSwitcherOpen ? '▲' : '▼'}</span>
                            </div>

                            {isSwitcherOpen && (
                                <div className="ds-switcher-dropdown">
                                    {CHARACTERS.map((char, index) => (
                                        <div
                                            key={char.id}
                                            className={`ds-switcher-item ${index === selectedCharIdx ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedCharIdx(index);
                                                setIsSwitcherOpen(false);
                                            }}
                                        >
                                            <span className="ds-switcher-icon">{char.element}</span>
                                            <span className="ds-switcher-name">{char.name}</span>
                                            {index === selectedCharIdx && <span className="ds-switcher-check">✓</span>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="ds-star-badge">19★</div>
                        </div>
                    </div>

                    <div className="ds-section">
                        <div className="ds-section-header">Combat Skills</div>
                        <div className="ds-skill-row">
                            {SKILLS.map(skill => (
                                <div key={skill.id} className="ds-skill-icon-frame" onClick={() => setSelectedSkill(skill)}>
                                    <span style={{ fontSize: '1.5rem' }}>{skill.icon}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="ds-section">
                        <div className="ds-section-header">Basic Attributes</div>
                        <div className="ds-stats-grid">
                            {stats.map((s, idx) => (
                                <div key={idx} className="ds-stat-item">
                                    <span className="label">{s.label}</span>
                                    <span className="val">{s.val}</span>
                                    <span className="spacer"></span>
                                </div>
                            ))}
                            <button
                                className="ds-special-btn"
                                onClick={() => setShowSpecialStats(true)}
                            >
                                Special Stats Detail
                            </button>
                        </div>
                    </div>

                    <div className="ds-section">
                        <div className="ds-section-header">Enhancement Timeline</div>
                        <div className="ds-enhancement-timeline">
                            <div className="ds-enh-item">
                                <div className="ds-enh-lvl">Lv.10</div>
                                <div>
                                    <div className="ds-enh-text">Unlocks [Thunderclap] basic mastery.</div>
                                </div>
                            </div>
                            <div className="ds-enh-item">
                                <div className="ds-enh-lvl">Lv.30</div>
                                <div>
                                    <div className="ds-enh-text">Increases CRIT Rate by 15%.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* POPUPS */}
                {selectedSkill && (
                    <div className="ds-modal-overlay" onClick={() => setSelectedSkill(null)}>
                        <motion.div
                            className="ds-scroll-popup"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <div className="ds-modal-inner">
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '3rem' }}>{selectedSkill.icon}</span>
                                    <div>
                                        <h2 style={{ margin: 0, textTransform: 'uppercase' }}>{selectedSkill.name}</h2>
                                        <div className="ds-modal-subtitle">Type: {selectedSkill.type}</div>
                                    </div>
                                </div>
                                <p className="ds-modal-desc">{selectedSkill.description}</p>

                                {selectedSkill.buffs && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        {selectedSkill.buffs.map((buff, i) => (
                                            <span
                                                key={i}
                                                className="ds-skill-buff-tag interactive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedBuff(buff);
                                                }}
                                            >
                                                {buff} ⓘ
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <button className="ds-modal-close" onClick={() => setSelectedSkill(null)}>Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* NESTED BUFF MODAL */}
                {selectedBuff && (
                    <div className="ds-modal-overlay" style={{ zIndex: 11000 }} onClick={() => setSelectedBuff(null)}>
                        <motion.div
                            className="ds-scroll-popup"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ maxWidth: '400px', padding: '2rem' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="ds-modal-inner">
                                <h3 style={{ textTransform: 'uppercase', color: 'var(--ds-gold)', marginTop: 0 }}>{selectedBuff}</h3>
                                <p style={{ lineHeight: 1.6 }}>{BUFF_DEFINITIONS[selectedBuff] || "No description available."}</p>
                                <button className="ds-modal-close" onClick={() => setSelectedBuff(null)}>Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showSpecialStats && (
                    <div className="ds-modal-overlay" onClick={() => setShowSpecialStats(false)}>
                        <div className="ds-scroll-popup" onClick={e => e.stopPropagation()}>
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
            </div>
        </div>
    );
}

