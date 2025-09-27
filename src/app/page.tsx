import { Metadata } from 'next';
import CharacterSheet from "@/components/CharacterSheet";
import CharacterSheetSkeleton from "@/components/CharacterSheetSkeleton";
import type { Character } from '@/types/character';
import qs from 'qs';

const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';

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
                  // ----- นี่คือส่วนที่เพิ่มเข้ามา -----
                  effects: { // 1. เจาะเข้าไปใน relation "effects"
                    populate: '*' // 2. สั่งให้ดึงข้อมูลทั้งหมดของ effect ออกมาด้วย
                  }
                  // ---------------------------------
                }
              }
            }
          },
        },
      },
    },
  }, { encodeValuesOnly: true });

  const fetchURL = `${STRAPI_API_URL}/api/characters?${queryString}`;

  try {
    const res = await fetch(fetchURL, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error("Failed to fetch characters from Strapi:", await res.text());
      return [];
    }
    const rawData = await res.json();
    if (!rawData.data) return [];

    // โค้ดส่วนแปลงข้อมูลนี้ถูกต้องแล้ว และจะจัดการกับ effects ที่ได้มาใหม่โดยอัตโนมัติ
    const characters = rawData.data.map((char: any) => {
      const transformedStarLevels = char.Star_Levels?.map((level: any) => ({
        ...level,
        skill_descriptions: level.skill_descriptions?.map((desc: any) => ({
          ...desc,
          skill: desc.skill ? {
            ...desc.skill,
            Skill_Icon: desc.skill.Skill_Icon || null,
            effects: desc.skill.effects || [] // ตรวจสอบให้แน่ใจว่า effects ถูกส่งต่อไป
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
    console.error("An error occurred while fetching characters:", error);
    return [];
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
    return <CharacterSheetSkeleton />;
  }
  const firstCharacterId = allCharacters[0].id.toString();
  return (
    <main>
      <CharacterSheet
        allCharacters={allCharacters}
        characterId={firstCharacterId}
      />
    </main>
  );
}