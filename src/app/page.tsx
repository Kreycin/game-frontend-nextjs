import { Metadata } from 'next';
import TestCharacterSheet from "@/app/test/TestCharacterSheet";
import CharacterSheetSkeleton from "@/components/CharacterSheetSkeleton";
import Navbar from "@/components/Navbar";
import type { Character } from '@/types/character';
import qs from 'qs';

const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';

import { MOCK_CHARACTER } from "@/utils/mockData";

async function getCharacters(): Promise<Character[]> {
  const queryString = qs.stringify({
    fields: ['*'],
    populate: {
      Main_Art: { fields: ['url', 'width', 'height'] },
      Star_Levels: {
        populate: {
          enhancements: {
            populate: { Enhancement_Icon: { fields: ['url'] } }
          },
          skill_descriptions: {
            populate: {
              skill: {
                populate: {
                  Skill_Icon: {
                    fields: ['url']
                  },
                  effects: {
                    populate: '*'
                  }
                }
              }
            }
          },
        },
      },
    },
    sort: ['publishedAt:desc'],
  }, { encodeValuesOnly: true });

  const fetchURL = `${STRAPI_API_URL}/api/characters?${queryString}`;

  try {
    const res = await fetch(fetchURL, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.warn(`Failed to fetch characters from Strapi found at ${STRAPI_API_URL}. Using Mock Data.`);
      return [MOCK_CHARACTER];
    }
    const rawData = await res.json();
    if (!rawData.data || rawData.data.length === 0) {
      console.warn("Strapi returned no data. Using Mock Data.");
      return [MOCK_CHARACTER];
    }

    const characters = rawData.data.map((char: any) => {
      const transformedStarLevels = char.Star_Levels?.map((level: any) => ({
        ...level,
        skill_descriptions: level.skill_descriptions?.map((desc: any) => ({
          ...desc,
          skill: desc.skill ? {
            ...desc.skill,
            Skill_Icon: desc.skill.Skill_Icon || null,
            effects: desc.skill.effects || []
          } : null,
        })) || [],
      })) || [];

      return {
        ...char,
        id: char.id,
        Main_Art: char.Main_Art || null,
        Star_Levels: transformedStarLevels,
      };
    });

    console.log(`Successfully transformed ${characters.length} characters with deep skill and effect data.`);
    return characters;

  } catch (error) {
    console.error("An error occurred while fetching characters. Using Mock Data.", error);
    return [MOCK_CHARACTER];
  }
}

// --- Dynamic Metadata Generation (สำหรับ SEO) ---
export async function generateMetadata(): Promise<Metadata> {
  const characters = await getCharacters();
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
  const allCharacters = await getCharacters();

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