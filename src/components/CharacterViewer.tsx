"use client"; // สำคัญมาก! สำหรับ Next.js App Router

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

// Component สำหรับโหลดและแสดงโมเดล
function Model(props: any) {
  // Path ไปยังไฟล์ .glb ของคุณที่อยู่ในโฟลเดอร์ public
  const { scene } = useGLTF('/mitsuri_posed.glb');
  return <primitive object={scene} {...props} />;
}

// Component หลักสำหรับ Viewer
export default function CharacterViewer() {
  return (
    <div style={{
      width: '100%',
      height: '600px',
      marginTop: '2rem',
      marginBottom: '2rem',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#1a202c'
    }}>
      <Canvas camera={{ position: [0, 1, 3.5], fov: 50 }}>
        <Suspense fallback={null}>
          {/* เพิ่มแสงเข้าไปในซีน */}
          <ambientLight intensity={2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          
          {/* แสดงโมเดล - เพิ่ม rotation ตรงนี้ */}
          <Model 
            scale={1.2} 
            position={[0, 0, 0]} 
          />
          
          {/* เปิดให้ผู้ใช้หมุนดูโมเดลได้ */}
          <OrbitControls enableZoom={true} enablePan={true} />
        </Suspense>
      </Canvas>
    </div>
  );
}