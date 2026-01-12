"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Users, Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

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
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: "start",
        slidesToScroll: 1
    });

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

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

    return (
        <div className="relative">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                Other Characters
            </h2>

            {/* Carousel Container */}
            <div className="relative group">
                {/* Navigation Buttons */}
                <motion.button
                    onClick={scrollPrev}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:border-gold/50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <ChevronLeft className="w-5 h-5 text-white" />
                </motion.button>

                <motion.button
                    onClick={scrollNext}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:border-gold/50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <ChevronRight className="w-5 h-5 text-white" />
                </motion.button>

                {/* Carousel */}
                <div className="overflow-hidden rounded-2xl px-2" ref={emblaRef}>
                    <div className="flex gap-4">
                        {characters.filter(c => c.id !== currentCharacterId).map((character, index) => (
                            <motion.button
                                key={character.id}
                                className="flex-shrink-0 w-[140px] lg:w-[160px] text-left group/item"
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: index * 0.08, ...springTransition }}
                                onClick={() => onSelectCharacter(character)}
                            >
                                <div className="relative overflow-hidden rounded-xl border-2 border-white/10 hover:border-gold/50 transition-all duration-300 bg-black/30">
                                    {/* Character Thumbnail */}
                                    <div className="relative h-[180px] lg:h-[200px] overflow-hidden">
                                        <motion.img
                                            src={character.thumbnail}
                                            alt={character.name}
                                            className="w-full h-full object-cover object-top"
                                            whileHover={{ scale: 1.1 }}
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

                                        {/* Hover Effect */}
                                        <motion.div
                                            className="absolute inset-0 bg-gold/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"
                                        />
                                    </div>

                                    {/* Character Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <h3 className="text-sm font-bold text-white truncate mb-1">
                                            {character.name.split(' - ')[0]}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/30 text-accent">
                                                {character.element}
                                            </span>
                                            <span className="text-xs text-white/60">
                                                {character.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* View Button Overlay */}
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-xl"
                                    initial={false}
                                >
                                    <motion.span
                                        className="px-4 py-2 rounded-full bg-gold text-black font-bold text-sm flex items-center gap-2"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Star className="w-4 h-4" />
                                        View
                                    </motion.span>
                                </motion.div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Character Count */}
            <div className="flex justify-center mt-4">
                <span className="text-xs text-white/50">
                    {characters.length - 1} other characters available
                </span>
            </div>
        </div>
    );
};
