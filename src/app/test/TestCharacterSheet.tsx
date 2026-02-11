"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Character, RichTextBlock } from "@/types/character";
import { CharacterGallery, CharacterPreview } from "@/components/CharacterGallery";
import CommentSection from "@/components/CommentSection";
import { useTheme, themes, Theme } from "@/hooks/use-theme";
import {
    ChevronDown, Play, X, Heart, Zap, Star, Sparkles,
    Target, Eye, Shield, Sword, Palette
} from "lucide-react";

// --- Mock Buff Definitions ---
const BUFF_DEFINITIONS: Record<string, string> = {
    Electrocute: "Stuns enemies for 1.5s and deals continuous Lightning damage.",
    "Super Conduct": "Reduces enemy Physical Resistance by 40% for 8s.",
    Overload: "Creates an explosion that deals AoE Pyro damage.",
    Vaporize: "Increases damage of the triggering Hydro or Pyro attack.",
    Freeze: "Immobilizes enemies. Shatter frozen enemies for extra Physical damage.",
    Melt: "Increases damage of the triggering Pyro or Cryo attack.",
    Swirl: "Spreads the element involved and deals AoE elemental damage.",
    Stun: "Incapacitates the enemy, preventing them from taking action.",
    "Armor Break": "Reduces enemy defense by 20%.",
    Slow: "Reduces movement speed by 30%.",
    Burn: "Deals continuous Pyro damage over time.",
};

interface TestCharacterSheetProps {
    allCharacters: Character[];
    debugApiUrl?: string; // --- DEBUG ---
}

export default function TestCharacterSheet({ allCharacters, debugApiUrl }: TestCharacterSheetProps) {
    const [selectedCharIdx, setSelectedCharIdx] = useState(0);
    const character = allCharacters[selectedCharIdx] || allCharacters[0];

    const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
    const [showSpecialStats, setShowSpecialStats] = useState(false);
    const { theme, setTheme } = useTheme();
    const [themeOpen, setThemeOpen] = useState(false);

    // --- Debug Logging ---
    useEffect(() => {
        if (debugApiUrl) {
            console.log("%c--- DEBUG: API Connection ---", "background: #ff0000; color: #fff; font-size: 20px; font-weight: bold;");
            console.log(`CONNECTED TO: %c${debugApiUrl}`, "font-weight: bold; color: yellow; font-size: 16px;");
        }

        if (allCharacters && allCharacters.length > 0) {
            console.log("%c--- DEBUG: Frontend Received Characters ---", "background: #222; color: #bada55; padding: 4px; font-weight: bold;");
            const char = allCharacters[0];
            console.log(`Character: ${char.Name} (ID: ${char.id})`);

            // Log effects from first skill as sample
            const firstSkill = char.Star_Levels?.[0]?.skill_descriptions?.[0]?.skill;
            if (firstSkill?.effects) {
                console.log("Effects Sample (First Skill):", firstSkill.effects.map((e: any) => ({
                    name: e.Effect_Name,
                    icon_url: e.Effect_Icon?.url,
                    full_obj: e
                })));
            } else {
                console.log("No effects found in first skill");
            }
        }
    }, [allCharacters]);

    // --- Helper Functions ---
    const getImageUrl = () => character.Main_Art?.url || "https://placehold.co/400x800/1a1a1a/white?text=No+Image";
    const getElement = () => character.Element || "Unknown";
    const getRole = () => character.Role || "Unknown";

    const getYouTubeEmbedUrl = (url: string | undefined | null): string | null => {
        if (!url) return null;
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
    };

    const getMockBuffs = (elementName: string): string[] => {
        const el = elementName.toLowerCase();
        if (el.includes("thunder") || el.includes("electro") || el.includes("legend")) return ["Electrocute", "Super Conduct"];
        if (el.includes("fire") || el.includes("pyro")) return ["Overload", "Burn"];
        if (el.includes("water") || el.includes("hydro")) return ["Vaporize", "Slow"];
        if (el.includes("ice") || el.includes("cryo")) return ["Freeze"];
        return ["Stun", "Armor Break"];
    };

    const getSkills = () => {
        if (!character.Star_Levels || character.Star_Levels.length === 0) return [];
        return character.Star_Levels[0].skill_descriptions?.map((desc, idx) => {
            const skillName = desc.skill?.Skill_Name || desc.skill?.name || "Unknown Skill";
            const description = desc.Description?.map((block: RichTextBlock) =>
                block.children.map((c: any) => c.text).join("")
            ).join("\n") || "";

            let buffs: any[] = [];
            if (desc.skill?.effects && desc.skill.effects.length > 0) {
                buffs = desc.skill.effects.map((e: any) => ({
                    name: e.Effect_Name || e.name || "Unknown Buff",
                    description: e.Description?.map((block: any) =>
                        block.children.map((c: any) => c.text).join("")
                    ).join("") || "Description unavailable.",
                    icon: e.Effect_Icon?.url || null,
                    type: e.Effect_Type || 'Buff',
                    duration: e.Turn_Duration || null,
                    undispellable: e.Is_Undispellable || false
                }));
            }

            if (buffs.length === 0) {
                const bracketMatches = description.match(/\[([a-zA-Z0-9\s]+)\]/g);
                if (bracketMatches) {
                    buffs = bracketMatches.map((m: string) => ({
                        name: m.slice(1, -1),
                        description: BUFF_DEFINITIONS[m.slice(1, -1)] || "Description unavailable.",
                        icon: null
                    }));
                }
            }

            return {
                id: idx,
                name: skillName,
                description,
                type: desc.skill?.Type || desc.skill?.Skill_Type || "Active",
                icon: desc.skill?.Skill_Icon?.url,
                buffs,
                level: desc.skill?.Skill_Level || 1
            };
        }) || [];
    };

    const skills = getSkills();

    const getEnhancements = () => {
        if (!character.Star_Levels || character.Star_Levels.length === 0) return [];
        return character.Star_Levels[0].enhancements || [];
    };
    const enhancements = getEnhancements();

    const specialStats = [
        { label: "Lifesteal", val: character.Lifesteal || "0%", icon: Heart },
        { label: "Penetration", val: character.Penetration || "0%", icon: Target },
        { label: "CRIT Rate", val: character.CRIT_rate || "0%", icon: Zap },
        { label: "CRIT Res", val: character.CRIT_Res || "0%", icon: Shield },
        { label: "Debuff Acc", val: character.Debuff_Acc || "0%", icon: Target },
        { label: "Debuff Res", val: character.Debuff_Res || "0%", icon: Shield },
        { label: "Accuracy", val: character.Accuracy || "0%", icon: Eye },
        { label: "Dodge", val: character.Doge || "0%", icon: Zap },
        { label: "Healing Amt", val: character.Healing_Amt || "0%", icon: Heart },
        { label: "Healing Amt(P)", val: character.Healing_Amt_P || "0%", icon: Heart },
        { label: "Extra DMG", val: character.Extra_DMG || "0%", icon: Sword },
        { label: "DMG Res", val: character.DMG_Res || "0%", icon: Shield },
        { label: "CRIT DMG Res", val: character.CRIT_DMG_Res || "0%", icon: Shield },
        { label: "CRIT DMG", val: character.CRIT_DMG || "0%", icon: Sparkles },
    ];

    // Convert characters for gallery
    const galleryCharacters: CharacterPreview[] = allCharacters.map(char => ({
        id: char.id || 0,
        name: char.Name || "Unknown",
        element: char.Element || "Unknown",
        role: char.Role || "Unknown",
        rarity: "UR",
        thumbnail: char.Main_Art?.url || "https://placehold.co/200x300"
    }));

    // Animation variants
    const springTransition = {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        mass: 0.8
    };

    const smoothEase = [0.22, 1, 0.36, 1] as const;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.15,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.6, ease: smoothEase }
        }
    };

    const skillHoverVariants = {
        rest: { scale: 1, y: 0 },
        hover: {
            scale: 1.15,
            y: -8,
            transition: springTransition
        },
        tap: { scale: 0.92, transition: { duration: 0.1 } }
    };

    return (
        <div className="min-h-screen themed-bg">
            {/* Parallax Background */}
            <div className="fixed inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center scale-110"
                    style={{ backgroundImage: `url(${getImageUrl()})` }}
                />
                <div className="absolute inset-0 themed-gradient-overlay" />
                <div className="absolute inset-0 themed-surface-overlay backdrop-blur-sm" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 pt-20 pb-20">


                <motion.div
                    className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Hero Section - Character Art & Info */}
                    <motion.div
                        className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-12"
                        variants={itemVariants}
                    >
                        {/* Character Art */}
                        <div className="relative flex justify-center lg:sticky lg:top-24">
                            {/* UR Badge */}
                            <motion.div
                                className="absolute top-0 left-4 lg:left-0 z-10"
                                initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ delay: 0.4, type: "spring", stiffness: 150, damping: 12 }}
                            >
                                <motion.span
                                    className="text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 drop-shadow-[0_0_30px_rgba(255,215,0,0.5)] inline-block"
                                    style={{ WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}
                                    animate={{
                                        textShadow: [
                                            "0 0 20px rgba(255,215,0,0.5)",
                                            "0 0 40px rgba(255,215,0,0.8)",
                                            "0 0 20px rgba(255,215,0,0.5)"
                                        ]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    UR
                                </motion.span>
                            </motion.div>

                            {/* Character Image with floating animation and particles */}
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: [0, -12, 0], scale: 1 }}
                                transition={{
                                    opacity: { duration: 0.8, ease: smoothEase },
                                    scale: { duration: 0.8, ease: smoothEase },
                                    y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.8 }
                                }}
                            >
                                {/* Flame Particles */}
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 rounded-full pointer-events-none"
                                        style={{
                                            background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(255,200,50,0.9)' : 'rgba(255,100,0,0.9)'} 0%, transparent 70%)`,
                                            left: `${20 + Math.random() * 60}%`,
                                            bottom: `${10 + Math.random() * 20}%`,
                                        }}
                                        animate={{
                                            y: [0, -200 - Math.random() * 150],
                                            x: [0, (Math.random() - 0.5) * 100],
                                            scale: [0, 1.5, 0],
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 2 + Math.random() * 2,
                                            repeat: Infinity,
                                            delay: i * 0.3,
                                            ease: "easeOut"
                                        }}
                                    />
                                ))}

                                {/* Spark Particles */}
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={`spark-${i}`}
                                        className="absolute w-1 h-1 bg-yellow-300 rounded-full pointer-events-none"
                                        style={{
                                            left: `${30 + Math.random() * 40}%`,
                                            top: `${20 + Math.random() * 60}%`,
                                        }}
                                        animate={{
                                            scale: [0, 1, 0],
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 1.5 + Math.random(),
                                            repeat: Infinity,
                                            delay: i * 0.4,
                                            ease: "easeInOut"
                                        }}
                                    />
                                ))}

                                {/* Character Image */}
                                <motion.img
                                    src={getImageUrl()}
                                    alt={character.Name}
                                    className="relative z-10 max-h-[60vh] lg:max-h-[80vh] w-auto object-contain drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]"
                                    whileHover={{ scale: 1.02, transition: springTransition }}
                                />
                            </motion.div>
                        </div>

                        {/* Character Info Panel */}
                        <motion.div
                            className="glass backdrop-blur-xl rounded-3xl p-6 lg:p-8 space-y-6"
                            variants={itemVariants}
                        >
                            {/* Tags */}
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-accent to-primary text-foreground font-bold text-sm border-2 border-gold shadow-lg">
                                    {getRole()}
                                </span>
                                <span className="px-4 py-2 rounded-full bg-white/5 border border-gold/50 text-gold font-semibold text-sm flex items-center gap-2">
                                    {getElement()}
                                </span>
                            </div>

                            {/* Character Name */}
                            <div className="text-center lg:text-left">
                                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent leading-tight">
                                    {character.Name}
                                </h1>
                                <div className="mt-3 inline-flex items-center gap-2 bg-gold/90 text-black px-4 py-1.5 rounded-full font-bold">
                                    <Star className="w-4 h-4 fill-current" />
                                    19★
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

                            {/* Skills Section */}
                            <div>
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    Skills
                                </h2>
                                <div className="grid grid-cols-4 gap-4 lg:gap-6">
                                    {skills.map((skill, index) => (
                                        <motion.button
                                            key={index}
                                            onClick={() => setSelectedSkill(skill)}
                                            className="relative group flex flex-col items-center"
                                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200, damping: 15 }}
                                            variants={skillHoverVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="relative">
                                                    <motion.div
                                                        className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-3 border-gold bg-gradient-to-br from-white/10 to-black/40 backdrop-blur-md overflow-hidden shadow-lg"
                                                        whileHover={{ boxShadow: "0 0 25px rgba(255, 215, 0, 0.5)" }}
                                                    >
                                                        {skill.icon ? (
                                                            <img src={skill.icon} alt={skill.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-2xl">⚔️</div>
                                                        )}
                                                    </motion.div>
                                                    <motion.span
                                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-primary text-foreground text-[10px] lg:text-xs font-bold px-2 py-0.5 rounded-full border border-gold shadow-md whitespace-nowrap"
                                                    >
                                                        Lv.{skill.level}
                                                    </motion.span>
                                                </div>
                                                <span className="text-xs lg:text-sm font-medium text-foreground/70 text-center max-w-[70px] lg:max-w-[90px] truncate">
                                                    {skill.name}
                                                </span>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Basic Attributes */}
                            <div>
                                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    Basic Attributes
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "HP", value: character.HP, color: "text-red-400" },
                                        { label: "ATK", value: character.ATK, color: "text-orange-400" },
                                        { label: "DEF", value: character.DEF, color: "text-blue-400" },
                                        { label: "SPD", value: character.SPD, color: "text-yellow-400" }
                                    ].map((stat, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="bg-white/5 rounded-xl p-4 border border-white/10 transition-colors duration-300"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + idx * 0.08, type: "spring", stiffness: 150, damping: 20 }}
                                            whileHover={{ scale: 1.03, y: -3, borderColor: "rgba(255, 215, 0, 0.5)" }}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-foreground/60 uppercase tracking-wider">{stat.label}</span>
                                            </div>
                                            <span className="text-xl lg:text-2xl font-bold text-foreground">
                                                {stat.value?.toLocaleString() || "N/A"}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                <button
                                    className="w-full mt-4 py-3 rounded-xl bg-white/5 border border-gold/50 text-gold font-bold uppercase tracking-wider hover:bg-gold/10 hover:border-gold transition-all duration-300 flex items-center justify-center gap-2"
                                    onClick={() => setShowSpecialStats(true)}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    View Special Stats
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Enhancement Timeline */}
                    <motion.div
                        className="glass backdrop-blur-xl rounded-3xl p-6 lg:p-8 mb-12"
                        variants={itemVariants}
                    >
                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-accent to-gold rounded-full" />
                            Enhancement
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            {enhancements.length > 0 ? enhancements.map((enh: any, i: number) => (
                                <motion.div
                                    key={i}
                                    className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300"
                                    initial={{ opacity: 0, x: -30, y: 10 }}
                                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: i * 0.12, type: "spring", stiffness: 120, damping: 18 }}
                                    whileHover={{ x: 10, borderColor: "rgba(255, 215, 0, 0.5)", backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                                >
                                    <motion.div className="flex-shrink-0" whileHover={{ scale: 1.1, rotate: 5 }}>
                                        {enh.Enhancement_Icon?.url ? (
                                            <img src={enh.Enhancement_Icon.url} alt="Enhancement" className="w-16 h-16 lg:w-20 lg:h-20 object-contain" />
                                        ) : (
                                            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-accent/20 to-gold/20 flex items-center justify-center text-accent font-bold text-lg">
                                                +{(i + 1) * 10}
                                            </div>
                                        )}
                                    </motion.div>
                                    <div className="flex-1">
                                        <p className="text-sm lg:text-base text-foreground/90 leading-relaxed">
                                            {enh.Description?.map((block: any, bi: number) => (
                                                <span key={bi} className="block">{block.children.map((c: any) => c.text).join("")}</span>
                                            ))}
                                        </p>
                                    </div>
                                </motion.div>
                            )) : (
                                <p className="text-foreground/50 col-span-2 text-center py-8">
                                    No enhancements data available.
                                </p>
                            )}
                        </div>
                    </motion.div>



                    {/* Videos Section - Skill Animation & Showcase */}
                    <motion.div
                        className="glass backdrop-blur-xl rounded-3xl p-6 lg:p-8 mb-12"
                        variants={itemVariants}
                    >
                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-accent to-gold rounded-full" />
                            Videos
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Skill Animation Video */}
                            <div>
                                <h3 className="text-lg font-semibold text-gold mb-3">Skill Animation</h3>
                                {getYouTubeEmbedUrl(character.YouTube_URL) ? (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-gold/50 shadow-2xl">
                                        <iframe
                                            className="absolute inset-0 w-full h-full"
                                            src={getYouTubeEmbedUrl(character.YouTube_URL)!}
                                            title="Skill Animation"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-video rounded-2xl bg-black/50 border-2 border-gold/30 flex flex-col items-center justify-center gap-4">
                                        <Play className="w-12 h-12 text-gold/50" />
                                        <span className="text-foreground/50">No Video Available</span>
                                    </div>
                                )}
                            </div>

                            {/* Showcase Video */}
                            <div>
                                <h3 className="text-lg font-semibold text-gold mb-3">Showcase</h3>
                                {getYouTubeEmbedUrl((character as any).Showcase_URL) ? (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-gold/50 shadow-2xl">
                                        <iframe
                                            className="absolute inset-0 w-full h-full"
                                            src={getYouTubeEmbedUrl((character as any).Showcase_URL)!}
                                            title="Showcase"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-video rounded-2xl bg-black/50 border-2 border-gold/30 flex flex-col items-center justify-center gap-4">
                                        <Play className="w-12 h-12 text-gold/50" />
                                        <span className="text-foreground/50">No Video Available</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Character Gallery */}
                    <motion.div
                        className="glass backdrop-blur-xl rounded-3xl p-6 lg:p-8 mb-12"
                        variants={itemVariants}
                    >
                        <CharacterGallery
                            characters={galleryCharacters}
                            currentCharacterId={character.id || 0}
                            onSelectCharacter={(char) => {
                                const idx = allCharacters.findIndex(c => c.id === char.id);
                                if (idx !== -1) setSelectedCharIdx(idx);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    </motion.div>

                    {/* Comments Section */}
                    <motion.div
                        className="glass backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/10"
                        variants={itemVariants}
                    >
                        <CommentSection pageId={`character-${character.id || 'default'}`} />
                    </motion.div>
                </motion.div>
            </div>

            {/* Skill Modal */}
            <AnimatePresence mode="wait">
                {selectedSkill && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 themed-surface-overlay backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: smoothEase }}
                        onClick={() => setSelectedSkill(null)}
                    >
                        <motion.div
                            className="glass rounded-3xl p-6 lg:p-8 max-w-lg w-full border border-gold/50 shadow-2xl max-h-[85vh] overflow-y-auto"
                            initial={{ scale: 0.85, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0, y: 30 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.8 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <h2 className="text-2xl font-bold text-foreground">Skill Detail</h2>
                                <button onClick={() => setSelectedSkill(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                                    <X className="w-5 h-5 text-foreground/60" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 rounded-full border-2 border-gold bg-black/30 overflow-hidden flex-shrink-0">
                                    {selectedSkill.icon ? (
                                        <img src={selectedSkill.icon} alt={selectedSkill.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">⚔️</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">{selectedSkill.name}</h3>
                                    <div className="flex gap-3 mt-1 text-sm text-gold">
                                        <span>Type: {selectedSkill.type}</span>
                                        <span>Level: {selectedSkill.level}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                                <h4 className="text-xs uppercase tracking-wider text-foreground/50 mb-2">Description</h4>
                                <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{selectedSkill.description}</p>
                            </div>

                            {/* Effects Section (Combined Buffs & Debuffs) */}
                            {selectedSkill.buffs && selectedSkill.buffs.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs uppercase tracking-wider text-gold mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-gold"></span>
                                        Effects
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedSkill.buffs.map((effect: any, idx: number) => (
                                            <motion.div
                                                key={idx}
                                                className={`p-3 rounded-xl flex items-start gap-3 border transition-colors ${effect.type === 'Buff' ? 'bg-green-500/10 border-green-500/30' :
                                                    effect.type === 'Debuff' ? 'bg-red-500/10 border-red-500/30' :
                                                        'bg-white/5 border-white/10'
                                                    }`}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                            >
                                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gold/50 flex items-center justify-center bg-black/30">
                                                    {effect.icon ? (
                                                        <img
                                                            src={effect.icon}
                                                            alt={effect.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "https://res.cloudinary.com/di8bf7ufw/image/upload/v1736416010/ui_icon_default_buff.png";
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="text-lg">✨</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-semibold text-foreground flex items-center gap-2">
                                                            {effect.name}
                                                            {effect.undispellable && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 tracking-wide">
                                                                    Undispellable
                                                                </span>
                                                            )}
                                                            {effect.duration && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-foreground/70 border border-white/10">
                                                                    {effect.duration}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{effect.description || effect.effect}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-primary text-foreground font-bold border border-gold"
                                onClick={() => setSelectedSkill(null)}
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Special Stats Modal */}
            <AnimatePresence mode="wait">
                {showSpecialStats && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 themed-surface-overlay backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: smoothEase }}
                        onClick={() => setShowSpecialStats(false)}
                    >
                        <motion.div
                            className="glass rounded-3xl p-6 lg:p-8 max-w-2xl w-full border border-gold/50 shadow-2xl max-h-[85vh] overflow-y-auto"
                            initial={{ scale: 0.85, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0, y: 30 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.8 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <h2 className="text-2xl font-bold text-foreground">Special Stats</h2>
                                <button onClick={() => setShowSpecialStats(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                                    <X className="w-5 h-5 text-foreground/60" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {specialStats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        transition={{ delay: index * 0.04, type: "spring", stiffness: 200, damping: 20 }}
                                        whileHover={{ borderColor: "rgba(255, 215, 0, 0.4)", x: 5 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <stat.icon className="w-4 h-4 text-gold" />
                                            <span className="text-sm text-foreground/60">{stat.label}</span>
                                        </div>
                                        <span className="font-bold text-foreground">{stat.val}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <button
                                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-accent to-primary text-foreground font-bold border border-gold"
                                onClick={() => setShowSpecialStats(false)}
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
