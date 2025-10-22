"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Component สำหรับโหลดและแสดงโมเดล
function Model(props: any) {
  const { scene } = useGLTF('/mui_posed.glb');
  return <primitive object={scene} {...props} />;
}

// Component สำหรับสร้างพื้นหลัง 2D
function Background() {
  const texture = useTexture('/background.jpg'); // <-- แก้ชื่อไฟล์ตรงนี้ถ้าใช้ชื่ออื่น
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  return <primitive attach="background" object={texture} />;
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
      overflow: 'hidden'
    }}>
      <Canvas camera={{ position: [0, 3, 2.5], fov: 50 }}>
        <Suspense fallback={null}>
          {/* เพิ่มแสงเข้าไปในซีนเพื่อให้โมเดลสว่าง */}
          <ambientLight intensity={1.1} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          
          {/* แสดงโมเดล */}
          <Model 
            scale={1.8} 
            position={[0, -1, 0]} 
            rotation={[0, Math.PI, 0]}
          />
          
          {/* แสดงพื้นหลัง 2D */}
          <Background />

          {/* ลบการจำกัดมุมกล้องออกแล้ว */}
          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}