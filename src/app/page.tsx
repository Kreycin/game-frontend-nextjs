import { Metadata } from 'next';
import CharacterSheet from "@/components/CharacterSheet";
import CharacterSheetSkeleton from "@/components/CharacterSheetSkeleton";
import type { Character } from '@/types/character';
import qs from 'qs';

const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';

// --- Page Component สำหรับหน้าแรก ---
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
import AnimatedBackground from "@/components/AnimatedBackground";
import { MotionDiv } from "@/components/MotionWrapper"; // We need a client wrapper for motion since page is server component

export default async function HomePage() {
  const allCharacters = await getCharacters();
  // if (!allCharacters || allCharacters.length === 0) {
  //   return <CharacterSheetSkeleton />;
  // }
  // Commenting out explicit loading state return to allow background to show even if empty, 
  // but logically if empty we might still want skeleton. 
  // Let's keep existing logic but wrapped.

  const content = (allCharacters && allCharacters.length > 0) ? (
    <CharacterSheet
      allCharacters={allCharacters}
      characterId={allCharacters[0].id.toString()}
    />
  ) : (
    <CharacterSheetSkeleton />
  );

  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        {content}
      </MotionDiv>
    </main>
  );
}