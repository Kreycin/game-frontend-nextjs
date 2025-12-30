import { Metadata } from 'next';
import TestCharacterSheet from "./TestCharacterSheet";
import CharacterSheetSkeleton from "@/components/CharacterSheetSkeleton";
import type { Character } from '@/types/character';
import qs from 'qs';
import { MOCK_CHARACTER } from "@/utils/mockData";

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

    console.log("--- DEBUG: /test Route Fetching ---");
    console.log("API URL:", STRAPI_API_URL);
    console.log("Full Fetch URL:", fetchURL);

    try {
        const res = await fetch(fetchURL, { next: { revalidate: 0 } }); // Disable cache for testing

        console.log("Fetch Response Status:", res.status);

        if (!res.ok) {
            console.warn(`Failed to fetch characters from Strapi. Status: ${res.status} ${res.statusText}`);
            return [MOCK_CHARACTER as unknown as Character];
        }
        const rawData = await res.json();

        if (!rawData.data || rawData.data.length === 0) {
            console.warn("Strapi returned no data (empty array). Using Mock Data.");
            return [MOCK_CHARACTER as unknown as Character];
        }

        console.log(`Successfully fetched ${rawData.data.length} characters.`);

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

        return characters;
    } catch (error) {
        console.error("Error fetching characters:", error);
        return [MOCK_CHARACTER as unknown as Character];
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const characters = await getCharacters();
    const character = characters[0];
    return {
        title: `${character.Name} - Premium Test`,
        description: `Testing real data integration for ${character.Name}`,
    };
}

export default async function TestPage() {
    const allCharacters = await getCharacters();

    if (!allCharacters || allCharacters.length === 0) {
        return <CharacterSheetSkeleton />;
    }

    return (
        <TestCharacterSheet
            allCharacters={allCharacters}
        />
    );
}
