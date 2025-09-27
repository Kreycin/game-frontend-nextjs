import CharacterSheet from '@/components/CharacterSheet';
import { Character } from '@/types/character';
import qs from 'qs';

const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://127.0.0.1:1337";

async function getCharacters(): Promise<Character[]> {
  const queryString = qs.stringify({
    populate: {
      Main_Art: { fields: ['url', 'width', 'height'] },
      Star_Levels: {
        populate: {
          enhancements: { populate: { Enhancement_Icon: { fields: ['url'] } } },
          skill_descriptions: true,
        },
      },
    },
  }, { encodeValuesOnly: true });

  const fetchURL = `${STRAPI_API_URL}/api/characters?${queryString}`;

  try {
    const res = await fetch(fetchURL, { next: { revalidate: 3600 } }); // เปลี่ยนกลับมาใช้ cache revalidate

    if (!res.ok) {
      console.error("Failed to fetch characters from Strapi:", await res.text());
      return [];
    }

    const rawData = await res.json();
    if (!rawData.data) return [];

    const characters = rawData.data.map((char: any) => {
      const attributes = char?.attributes || {};
      return {
        id: char.id,
        ...attributes,
        Main_Art: attributes.Main_Art?.data?.attributes || null,
        Star_Levels: attributes.Star_Levels?.map((level: any) => ({
          ...level,
          enhancements: level.enhancements?.data?.map((enh: any) => ({
            id: enh.id, ...enh.attributes, Enhancement_Icon: enh.attributes.Enhancement_Icon?.data?.attributes || null
          })) || [],
          skill_descriptions: level.skill_descriptions?.data?.map((skill: any) => ({
              id: skill.id, ...skill.attributes, Skill_Icon: skill.attributes.skill_icon?.data?.attributes || null
          })) || []
        })) || [],
        Name: attributes.Name || `Character #${char.id}`,
        Rarity: attributes.Rarity || 'N/A',
        Role: attributes.Role || 'N/A',
        Element: attributes.Element || null,
        ATK: attributes.ATK || 0,
        DEF: attributes.DEF || 0,
        HP: attributes.HP || 0,
        SPD: attributes.SPD || 0,
      };
    });
    
    console.log(`Successfully fetched and transformed ${characters.length} characters.`);
    return characters;

  } catch (error) {
    console.error("An error occurred while fetching characters:", error);
    return [];
  }
}


// ----- Page Component (Final Version) -----
export default async function CharacterPage({ params }: { params: { id: string } }) {
  // ไม่ต้อง await params ตรงนี้
  const { id: characterId } = params; 
  const allCharacters = await getCharacters();

  if (!allCharacters || allCharacters.length === 0) {
    return <div>Could not load character data from the server.</div>;
  }

  return (
    <main>
      <CharacterSheet
        allCharacters={allCharacters}
        characterId={characterId}
      />
    </main>
  );
}

// Optional: For build-time optimization
export async function generateStaticParams() {
    const characters = await getCharacters();
    return characters.map((character) => ({
        id: character.id.toString(),
    }));
}