"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Star, Search, Filter, ChevronRight } from "lucide-react";

export interface CharacterPreview {
    id: number;
    name: string;
    element: string;
    role: string;
    rarity: string;
    thumbnail: string;
}

interface CharacterGalleryProps {
    characters: CharacterPreview[];
    currentCharacterId: number;
    onSelectCharacter: (character: CharacterPreview) => void;
}

export const CharacterGallery: React.FC<CharacterGalleryProps> = ({
    characters,
    currentCharacterId,
    onSelectCharacter
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [selectedRarity, setSelectedRarity] = useState<string | null>(null);

    const springTransition = {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity.toLowerCase()) {
            case 'ur': return 'from-amber-400 via-yellow-300 to-amber-500';
            case 'ssr': return 'from-purple-400 via-pink-300 to-purple-500';
            case 'sr': return 'from-blue-400 via-cyan-300 to-blue-500';
            default: return 'from-gray-400 via-gray-300 to-gray-500';
        }
    };

    const getRarityBorder = (rarity: string) => {
        switch (rarity.toLowerCase()) {
            case 'ur': return 'border-amber-400/50 hover:border-amber-400';
            case 'ssr': return 'border-purple-400/50 hover:border-purple-400';
            case 'sr': return 'border-blue-400/50 hover:border-blue-400';
            default: return 'border-gray-400/50 hover:border-gray-400';
        }
    };

    // Get unique elements and rarities for filters
    const elements = [...new Set(characters.map(c => c.element))];
    const rarities = [...new Set(characters.map(c => c.rarity))];

    // Filter characters
    const filteredCharacters = characters.filter(character => {
        const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesElement = !selectedElement || character.element === selectedElement;
        const matchesRarity = !selectedRarity || character.rarity === selectedRarity;
        return matchesSearch && matchesElement && matchesRarity;
    });

    return (
        <div className="relative">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Character Database
                <span className="text-sm font-normal text-white/60 ml-2">
                    ({filteredCharacters.length} characters)
                </span>
            </h2>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                        type="text"
                        placeholder="Search characters..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl glass border border-white/10 focus:border-gold/50 bg-black/20 text-white placeholder:text-white/40 focus:outline-none transition-colors"
                    />
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 mr-4">
                        <Filter className="w-4 h-4 text-white/50" />
                        <span className="text-xs text-white/50 uppercase tracking-wider">Filters:</span>
                    </div>

                    {/* Element Filters */}
                    {elements.map(element => (
                        <motion.button
                            key={element}
                            onClick={() => setSelectedElement(selectedElement === element ? null : element)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedElement === element
                                    ? 'bg-primary text-white'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {element}
                        </motion.button>
                    ))}

                    <div className="w-px h-6 bg-white/10 mx-2" />

                    {/* Rarity Filters */}
                    {rarities.map(rarity => (
                        <motion.button
                            key={rarity}
                            onClick={() => setSelectedRarity(selectedRarity === rarity ? null : rarity)}
                            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${selectedRarity === rarity
                                    ? `bg-gradient-to-r ${getRarityColor(rarity)} text-black`
                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {rarity}
                        </motion.button>
                    ))}

                    {(selectedElement || selectedRarity || searchTerm) && (
                        <motion.button
                            onClick={() => {
                                setSelectedElement(null);
                                setSelectedRarity(null);
                                setSearchTerm("");
                            }}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            Clear All
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Character Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredCharacters.map((character, index) => {
                        const isCurrentCharacter = character.id === currentCharacterId;

                        return (
                            <motion.button
                                key={character.id}
                                className={`text-left group relative ${isCurrentCharacter ? 'ring-2 ring-gold ring-offset-2 ring-offset-black rounded-xl' : ''}`}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                transition={{ delay: index * 0.03, ...springTransition }}
                                onClick={() => !isCurrentCharacter && onSelectCharacter(character)}
                                disabled={isCurrentCharacter}
                            >
                                <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 bg-black/30 ${isCurrentCharacter
                                        ? 'border-gold opacity-75'
                                        : getRarityBorder(character.rarity)
                                    }`}>
                                    {/* Character Thumbnail */}
                                    <div className="relative h-[160px] sm:h-[180px] overflow-hidden">
                                        <motion.img
                                            src={character.thumbnail}
                                            alt={character.name}
                                            className="w-full h-full object-cover object-top"
                                            whileHover={!isCurrentCharacter ? { scale: 1.1 } : {}}
                                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                        {/* Rarity Badge */}
                                        <motion.span
                                            className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-black bg-gradient-to-r ${getRarityColor(character.rarity)} text-black`}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {character.rarity}
                                        </motion.span>

                                        {/* Current Character Badge */}
                                        {isCurrentCharacter && (
                                            <motion.span
                                                className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold bg-gold text-black"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                            >
                                                Current
                                            </motion.span>
                                        )}

                                        {/* Hover Effect */}
                                        {!isCurrentCharacter && (
                                            <motion.div
                                                className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            />
                                        )}
                                    </div>

                                    {/* Character Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <h3 className="text-sm font-bold text-white truncate mb-1">
                                            {character.name.split(' - ')[0]}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/30 text-primary">
                                                {character.element}
                                            </span>
                                            <span className="text-xs text-white/60">
                                                {character.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* View Button Overlay */}
                                {!isCurrentCharacter && (
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                                        initial={false}
                                    >
                                        <motion.span
                                            className="px-4 py-2 rounded-full bg-gold text-black font-bold text-sm flex items-center gap-2"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Star className="w-4 h-4" />
                                            View
                                            <ChevronRight className="w-4 h-4" />
                                        </motion.span>
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredCharacters.length === 0 && (
                <motion.div
                    className="flex flex-col items-center justify-center py-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Search className="w-12 h-12 text-white/40 mb-4" />
                    <p className="text-white/60">No characters found matching your filters</p>
                    <motion.button
                        onClick={() => {
                            setSelectedElement(null);
                            setSelectedRarity(null);
                            setSearchTerm("");
                        }}
                        className="mt-4 px-4 py-2 rounded-full text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Clear Filters
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
};
