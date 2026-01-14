/**
 * Static Character Data - Stored directly in frontend
 * ข้อมูลตัวละครที่เก็บถาวรใน frontend ไม่ต้อง fetch จาก backend
 */

import type { Character } from '@/types/character';
import charactersData from './characters.json';

// Flag to enable/disable static data (set to false to use API instead)
export const USE_STATIC_CHARACTERS = true;

/**
 * Get all characters from static data
 * Returns the same structure as API would return
 */
export function getStaticCharacters(): Character[] {
    return charactersData as Character[];
}

/**
 * Get a single character by documentId
 */
export function getStaticCharacterById(documentId: string): Character | undefined {
    return charactersData.find((char: any) => char.documentId === documentId) as Character | undefined;
}

/**
 * Get a single character by name (partial match)
 */
export function getStaticCharacterByName(name: string): Character | undefined {
    const lowerName = name.toLowerCase();
    return charactersData.find((char: any) =>
        char.Name?.toLowerCase().includes(lowerName)
    ) as Character | undefined;
}
