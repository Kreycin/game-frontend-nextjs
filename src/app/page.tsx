// src/app/page.tsx
import { Metadata } from 'next';
import CharacterSheet from "@/components/CharacterSheet";
import CharacterSheetSkeleton from "@/components/CharacterSheetSkeleton";
import type { Character } from '@/types/character';

const API_ENDPOINT = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_API_URL = `${API_ENDPOINT}/api/character-sheet`;

// --- Define type for the fetched data ---

async function getCharacterData(): Promise<Character | null> {
  try {
    console.log("1. Attempting to fetch data from Strapi..."); 
    const response = await fetch(STRAPI_API_URL, { next: { revalidate: 43200 } });
    console.log("2. Strapi responded with status:", response.status);
    if (!response.ok) throw new Error('Failed to fetch character data');

    const json = await response.json();
    const allCharacters = json.data;

    if (allCharacters && allCharacters.length > 0) {
      const latestCharData = allCharacters.sort((a: any, b: any) => 
        new Date(b.attributes.updatedAt).getTime() - new Date(a.attributes.updatedAt).getTime()
      )[0];
      
      const charToDisplay = { id: latestCharData.id, ...latestCharData.attributes };
      
      const getStarLevelNumber = (starString: string | null): number => {
        if (!starString) return 0;
        return parseInt(starString.replace('star', ''), 10);
      };

      const sortedStarLevels = [...charToDisplay.Star_Levels].sort((a, b) => 
        getStarLevelNumber(b.Star_Level) - getStarLevelNumber(a.Star_Level)
      );
      charToDisplay.Star_Levels = sortedStarLevels;
      
      return charToDisplay;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// --- Dynamic Metadata Generation ---
export async function generateMetadata(): Promise<Metadata> {
  const character = await getCharacterData();

  if (!character) {
    return {
      title: 'Character Not Found',
      description: 'Could not load character data.',
    }
  }

  const title = `${character.Name} - Character Sheet | DS Game Hub`;
  const description = `Data, skills, and details for the ${character.Rarity} character: ${character.Name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: 'https://demonslayergamehub.com', // Replace with your actual domain
      siteName: 'Demon Slayer Game Hub',
      images: character.Main_Art?.url ? [character.Main_Art.url] : [],
      type: 'website',
    },
  }
}


// --- The Main Server Component for the Page ---
export default async function HomePage() {
  const characterData = await getCharacterData();

  if (!characterData) {
    return <CharacterSheetSkeleton />;
  }

  // Pass server-fetched data to the client component
  return <CharacterSheet initialCharacter={characterData} />;
}
