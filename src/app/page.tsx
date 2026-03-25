import { Metadata } from 'next';
import TestCharacterSheet from "@/app/test/TestCharacterSheet";
import CharacterSheetSkeleton from "@/components/CharacterSheetSkeleton";
import Navbar from "@/components/Navbar";
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

// --- Dynamic Metadata Generation (สำหรับ SEO) ---
export async function generateMetadata(): Promise<Metadata> {
  const characters = getCharacters();
  if (!characters || characters.length === 0) {
    return { title: 'Character Not Found' };
  }
  const character = characters[0];
  const title = `${character.Name} - DS Game Hub`;
  const description = `Data, skills, and details for the ${character.Rarity} character: ${character.Name}`;
  return {
    title,
    description,
    openGraph: {
      title, description, images: character.Main_Art?.url ? [character.Main_Art.url] : [],
    },
  };
}

// --- Page Component สำหรับหน้าแรก ---
export default async function HomePage() {
  const allCharacters = getCharacters();

  if (!allCharacters || allCharacters.length === 0) {
    return (
      <main className="relative min-h-screen">
        <Navbar />
        <CharacterSheetSkeleton />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <TestCharacterSheet allCharacters={allCharacters} />
    </main>
  );
}