// /frontend/src/Walls.jsx
import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

// --- 1. Component Tường ---
const WallShape = ({ points, wallTextureProps }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    if (points && points.length > 0) {
      s.moveTo(points[0].x, -points[0].y);
      for (let i = 1; i < points.length; i++) {
        s.lineTo(points[i].x, -points[i].y);
      }
      s.closePath();
    }
    return s;
  }, [points]);

  const extrudeSettings = {
    depth: 2.5,
    bevelEnabled: false
  };

  if (!points || points.length === 0) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial 
        {...wallTextureProps} 
        side={THREE.DoubleSide}
        color="white" // Thêm màu nền trắng để ảnh hiện rõ hơn
      />
    </mesh>
  );
};

// --- 2. Component Sàn nhà ---
const Floor = () => {
  // SỬA: Load đúng tên file bạn đang có
  const textureProps = useTexture({
    // Bạn chỉ có file màu và file độ lồi (disp) cho sàn
    map: '/textures/wood_floor_deck_diff_4k.jpg', 
    // Tạm thời dùng file disp làm bump map để tạo độ sần nhẹ
    bumpMap: '/textures/wood_floor_deck_disp_4k.png', 
  });

  useEffect(() => {
    // Cấu hình lặp lại vân gỗ
    const t = textureProps.map;
    const b = textureProps.bumpMap;
    
    if (t) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(10, 10);
        t.colorSpace = THREE.SRGBColorSpace;
    }
    if (b) {
        b.wrapS = b.wrapT = THREE.RepeatWrapping;
        b.repeat.set(10, 10);
    }
  }, [textureProps]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial {...textureProps} bumpScale={0.1} />
    </mesh>
  );
};

// --- 3. Scene Chính ---
export const SceneContent = ({ wallsData }) => {
  
  // SỬA: Load đúng tên file tường bạn đang có
  const wallTextures = useTexture({
    map: '/textures/grey_plaster_diff_4k.jpg',
    roughnessMap: '/textures/grey_plaster_rough_4k.jpg',
    // Bạn có file 'disp' nhưng thiếu 'norm', tạm thời bỏ qua normal
    // hoặc dùng disp làm bumpMap như sàn cũng được
  });

  useEffect(() => {
    const t = wallTextures.map;
    const r = wallTextures.roughnessMap;
    
    if (t) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(0.5, 0.5);
        t.colorSpace = THREE.SRGBColorSpace;
    }
    if (r) {
        r.wrapS = r.wrapT = THREE.RepeatWrapping;
        r.repeat.set(0.5, 0.5);
    }
  }, [wallTextures]);

  return (
    <group>
      {wallsData.map((wallPoints, index) => (
        <WallShape 
          key={index} 
          points={wallPoints} 
          wallTextureProps={wallTextures} 
        />
      ))}
      <Floor />
    </group>
  );
};