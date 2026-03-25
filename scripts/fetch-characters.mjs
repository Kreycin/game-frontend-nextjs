import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URL ของ Strapi ที่รันบนเครื่อง Local ของคุณ
const STRAPI_URL = 'http://127.0.0.1:1337';
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'characters.json');

async function fetchCharacters() {
  console.log('⏳ กำลังเชื่อมต่อไปยัง Local Strapi (http://127.0.0.1:1337)...');
  console.log('   (กรุณาแน่ใจว่าคุณเปิดรัน Backend Strapi ด้วยคำสั่ง npm run develop อยู่)');

  const query = new URLSearchParams({
    fields: '*',
    'populate[Main_Art][fields][0]': 'url',
    'populate[Main_Art][fields][1]': 'width',
    'populate[Main_Art][fields][2]': 'height',
    'populate[Star_Levels][populate][enhancements][populate][Enhancement_Icon][fields][0]': 'url',
    'populate[Star_Levels][populate][skill_descriptions][populate][skill][populate][Skill_Icon][fields][0]': 'url',
    'populate[Star_Levels][populate][skill_descriptions][populate][skill][populate][effects][populate][Effect_Icon][fields][0]': 'url',
    sort: 'publishedAt:desc',
    'pagination[limit]': '1000' // ดึงทุกตัวละคร (สูงสุด 1000 ตัว)
  }).toString();

  const fetchURL = `${STRAPI_URL}/api/characters?${query}`;

  try {
    const res = await fetch(fetchURL);
    if (!res.ok) {
        throw new Error(`Strapi ตอบกลับด้วย Status: ${res.status}`);
    }
    
    const rawData = await res.json();

    if (!rawData.data || rawData.data.length === 0) {
      console.log('⚠️ ไม่พบตัวละครในฐานข้อมูล Strapi เลย');
      return;
    }

    // แปลงโครงสร้างให้ตรงกับที่โปรเจคต้องการ
    const characters = rawData.data.map(char => {
      const transformedStarLevels = char.Star_Levels?.map(level => ({
        ...level,
        skill_descriptions: level.skill_descriptions?.map(desc => ({
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

    // โหลดข้อมูลเก่าจาก characters.json
    let existingCharacters = [];
    if (fs.existsSync(OUTPUT_FILE)) {
      try {
        const oldData = fs.readFileSync(OUTPUT_FILE, 'utf-8');
        existingCharacters = JSON.parse(oldData);
        console.log(`\n📦 โหลดข้อมูลเก่าสำเร็จ: มีตัวละครเดิม ${existingCharacters.length} ตัว`);
      } catch (e) {
        console.log(`⚠️ ไม่สามารถอ่านไฟล์ข้อมูลเก่าได้ เริ่มต้นใหม่`);
      }
    }

    // รวมข้อมูล (Merge) 
    // ยึดข้อมูลใหม่จาก Strapi เป็นหลัก ข้อมูลเก่าที่ไม่ซ้ำก็เก็บไว้
    const apiNames = new Set(characters.map(c => c.Name?.toLowerCase()));
    const uniqueOldCharacters = existingCharacters.filter(c => !apiNames.has(c.Name?.toLowerCase()));
    
    const mergedCharacters = [...characters, ...uniqueOldCharacters];

    // เรียงลำดับตัวละครใหม่ล่าสุดขึ้นก่อน
    mergedCharacters.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return dateB - dateA; // Newest first
    });

    console.log(`\n✅ พบตัวละครใหม่ใน Strapi: ${characters.length} ตัว`);
    console.log(`✅ ตัวละครเดิมที่เก็บรักษาไว้: ${uniqueOldCharacters.length} ตัว`);
    console.log(`✅ ยอดรวมหลังจากการรวมข้อมูล: ${mergedCharacters.length} ตัว`);

    // บันทึกทับไฟล์ JSON เดิม (แบ็คอัพข้อมูลเก่าบวกข้อมูลใหม่)
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mergedCharacters, null, 2), 'utf-8');

    console.log(`\n🎉 บันทึกข้อมูลเสร็จสิ้น! ลงใน: src/data/characters.json`);
    console.log(`   ขนาดไฟล์: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB`);
    console.log('\n👉 คุณสามารถปิด Backend Strapi และ `git commit` โค้ด Frontend ขึ้นเว็บได้เลยครับ');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
        console.error('\n❌ เชื่อมต่อ Strapi ไม่สำเร็จ!');
        console.error('   คุณลืมเปิด Backend รึเปล่า? กรุณาเข้าไปที่โฟลเดอร์เกม Backend แล้วรันคำสั่ง:');
        console.error('   npm run develop');
    } else {
        console.error('\n❌ เกิดข้อผิดพลาดระหว่างดึงข้อมูล:', error.message);
    }
    process.exit(1);
  }
}

fetchCharacters();
