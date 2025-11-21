// /frontend/src/Walls.jsx
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

// --- 1. Component Tường ---
const WallShape = ({ points, wallTexture }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    if (points && points.length > 0) {
      // Đảo chiều Y để khớp hệ tọa độ màn hình và 3D
      s.moveTo(points[0].x, -points[0].y);
      for (let i = 1; i < points.length; i++) {
        s.lineTo(points[i].x, -points[i].y);
      }
      s.closePath();
    }
    return s;
  }, [points]);

  // Load textures
  const diffuseUrl = wallTexture?.diffuse || '/textures/walls/grey_plaster_diff_4k.jpg';
  const roughnessUrl = wallTexture?.roughness || '/textures/walls/grey_plaster_rough_4k.jpg';
  
  // Dùng try-catch hoặc fallback nếu load lỗi (trong thực tế Three Fiber tự handle)
  const diffuseMap = useLoader(THREE.TextureLoader, diffuseUrl);
  const roughnessMap = useLoader(THREE.TextureLoader, roughnessUrl);

  useMemo(() => {
    [diffuseMap, roughnessMap].forEach(tex => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        // Tăng repeat lên để vân tường nhỏ mịn hơn, nhìn thật hơn với tường mỏng
        tex.repeat.set(1, 1); 
      }
    });
  }, [diffuseMap, roughnessMap]);

  const extrudeSettings = {
    depth: 2.5, // Chiều cao tường
    bevelEnabled: false // Tắt bevel để góc tường sắc cạnh, vuông vức
  };

  if (!points || points.length < 3) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial 
        map={diffuseMap}
        roughnessMap={roughnessMap}
        color="#ffffff"
        roughness={0.8}
        side={THREE.DoubleSide} // Render cả 2 mặt để tránh lỗi visual nếu normal bị ngược
      />
    </mesh>
  );
};

// --- 2. Component Sàn nhà ---
const Floor = ({ floorTexture }) => {
  const diffuseUrl = floorTexture?.diffuse || '/textures/floors/wood_floor_deck_diff_4k.jpg';
  const normalUrl = floorTexture?.normal;
  
  const diffuseMap = useLoader(THREE.TextureLoader, diffuseUrl);
  const normalMap = normalUrl ? useLoader(THREE.TextureLoader, normalUrl) : null;

  useMemo(() => {
    if (diffuseMap) {
      diffuseMap.wrapS = diffuseMap.wrapT = THREE.RepeatWrapping;
      diffuseMap.repeat.set(10, 10);
    }
    if (normalMap) {
      normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
      normalMap.repeat.set(10, 10);
    }
  }, [diffuseMap, normalMap]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        map={diffuseMap}
        normalMap={normalMap}
        color="#dddddd"
        roughness={0.8}
      />
    </mesh>
  );
};

// --- 3. Scene Chính ---
export const SceneContent = ({ wallsData, wallTexture, floorTexture }) => {
  return (
    <group>
      {wallsData.map((wall, index) => {
        const points = Array.isArray(wall) ? wall : wall.points;
        // Kiểm tra dữ liệu rác
        if (!points || points.length < 3) return null; 
        
        return (
          <WallShape 
            key={index} 
            points={points} 
            wallTexture={wallTexture}
          />
        );
      })}
      <Floor floorTexture={floorTexture} />
    </group>
  );
};