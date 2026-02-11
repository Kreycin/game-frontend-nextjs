const qs = require('qs');

const API_URL = 'https://game-backend-wm3t.onrender.com';

async function checkEffect(name) {
    const query = qs.stringify({
        filters: {
            Effect_Name: {
                $eq: name,
            },
        },
        populate: {
            Effect_Icon: { fields: ['url', 'name'] }
        },
    }, { encodeValuesOnly: true });

    console.log(`\n--- Checking Effect: "${name}" ---`);
    try {
        const res = await fetch(`${API_URL}/api/effects?${query}`);
        const data = await res.json();

        if (data.data.length === 0) {
            console.log('No effect found with this name.');
        } else {
            console.log(`Found ${data.data.length} entries:`);
            data.data.forEach(effect => {
                console.log(`ID: ${effect.id}`);
                console.log(`Name: ${effect.Effect_Name}`);
                console.log(`Icon URL: ${effect.Effect_Icon?.url || 'NULL'}`);
                console.log(`Icon Name: ${effect.Effect_Icon?.name || 'NULL'}`);
                console.log('-------------------');
            });
        }
    } catch (error) {
        console.error('Error fetching effect:', error);
    }
}

async function checkCharacter(charName) {
    const query = qs.stringify({
        filters: {
            Name: { $eq: charName }
        },
        populate: {
            Star_Levels: {
                populate: {
                    skill_descriptions: {
                        populate: {
                            skill: {
                                populate: {
                                    effects: {
                                        populate: {
                                            Effect_Icon: { fields: ['url'] }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, { encodeValuesOnly: true });

    console.log(`\n--- Checking Character: "${charName}" ---`);
    try {
        const res = await fetch(`${API_URL}/api/characters?${query}`);
        const data = await res.json();

        if (data.data.length === 0) {
            console.log('No character found.');
        } else {
            const char = data.data[0];
            console.log(`Character ID: ${char.id}`);
            const firstSkill = char.Star_Levels?.[0]?.skill_descriptions?.[0]?.skill;
            if (firstSkill) {
                console.log(`First Skill: ${firstSkill.Skill_Name}`);
                if (firstSkill.effects) {
                    firstSkill.effects.forEach(e => {
                        console.log(`  - Linked Effect ID: ${e.id}`);
                        console.log(`    Name: ${e.Effect_Name}`);
                        console.log(`    Icon: ${e.Effect_Icon?.url}`);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function main() {
    await checkEffect('Lingering Flame');
    await checkEffect('Cinder');
    await checkCharacter('Flame - Tanjiro');
}

main();
