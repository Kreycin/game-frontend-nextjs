import { Metadata } from 'next';
import TestCharacterSheet from "./TestCharacterSheet";
import CharacterSheetSkeleton from "@/components/CharacterSheetSkeleton";
import type { Character } from '@/types/character';
import { getStaticCharacters } from '@/data/staticCharacters';

function getCharacters(): Character[] {
    const characters = getStaticCharacters();

    // Sort by publishedAt (newest first)
    characters.sort((a, b) => {
        const dateA = new Date((a as any).publishedAt || (a as any).createdAt || 0).getTime();
        const dateB = new Date((b as any).publishedAt || (b as any).createdAt || 0).getTime();
        return dateB - dateA;
    });

    return characters;
}

export async function generateMetadata(): Promise<Metadata> {
    const characters = getCharacters();
    const character = characters[0];
    return {
        title: `${character.Name} - Premium Test`,
        description: `Testing real data integration for ${character.Name}`,
    };
}

export default async function TestPage() {
    const allCharacters = getCharacters();

    if (!allCharacters || allCharacters.length === 0) {
        return <CharacterSheetSkeleton />;
    }

    return (
        <TestCharacterSheet
            allCharacters={allCharacters}
        />
    );
}
