import { Metadata } from 'next';
import TestCharacterSheet from "@/app/test/TestCharacterSheet";
import CharacterSheetSkeleton from "@/components/CharacterSheetSkeleton";
import Navbar from "@/components/Navbar";
import type { Character } from '@/types/character';
import qs from 'qs';
import { USE_STATIC_CHARACTERS, getStaticCharacters } from '@/data/staticCharacters';

const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';

import { MOCK_CHARACTER } from "@/utils/mockData";

// Force dynamic rendering to ensure fresh data and avoid caching issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCharacters(): Promise<Character[]> {
  // 🚀 HYBRID APPROACH: Static + API data combined
  // Static data = recovered characters that were lost
  // API data = new characters created in Strapi

  const staticChars = USE_STATIC_CHARACTERS ? getStaticCharacters() : [];
  console.log(`Loaded ${staticChars.length} static characters`);

  // Fetch from API
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
                    populate: {
                      Effect_Icon: { fields: ['url'] }
                    }
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

  let apiCharacters: Character[] = [];

  try {
    // Add timeout to prevent build hanging when Render backend is sleeping
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const res = await fetch(fetchURL, {
      cache: 'no-store', // Disable caching completely
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const rawData = await res.json();
      if (rawData.data && rawData.data.length > 0) {
        apiCharacters = rawData.data.map((char: any) => {
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
        console.log(`Fetched ${apiCharacters.length} characters from API`);
      }
    }
  } catch (error) {
    console.warn("Could not fetch from API, using static data only", error);
  }

  // 🔀 MERGE: API + Static with deduplication by Name
  // API characters come first (newest additions), then static fallback data
  const apiNames = new Set(apiCharacters.map(c => c.Name?.toLowerCase()));
  const uniqueStaticChars = staticChars.filter(c => !apiNames.has(c.Name?.toLowerCase()));

  // Combine: API first (already sorted by publishedAt:desc from query), then static
  const allCharacters = [...apiCharacters, ...uniqueStaticChars];

  // Sort all by publishedAt (newest first)
  allCharacters.sort((a, b) => {
    const dateA = new Date((a as any).publishedAt || (a as any).createdAt || 0).getTime();
    const dateB = new Date((b as any).publishedAt || (b as any).createdAt || 0).getTime();
    return dateB - dateA; // Newest first
  });

  console.log(`Total characters: ${allCharacters.length} (${apiCharacters.length} from API + ${uniqueStaticChars.length} static)`);

  // Fallback to mock if nothing available
  if (allCharacters.length === 0) {
    console.warn("No characters available. Using Mock Data.");
    return [MOCK_CHARACTER];
  }


  return allCharacters;
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
      <TestCharacterSheet allCharacters={allCharacters} debugApiUrl={STRAPI_API_URL} />
    </main>
  );
}