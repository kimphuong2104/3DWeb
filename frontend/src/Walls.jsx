// /frontend/src/Walls.jsx
import React, { useMemo } from 'react';
import * as THREE from 'three';

const WallShape = ({ points }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    if (points && points.length > 0) {
      // Di chuyển bút vẽ đến điểm đầu tiên
      // Lưu ý: Trục Y của ảnh 2D đi xuống, nhưng trục Y của 3D đi lên
      // nên ta cần thêm dấu trừ (-points[0].y) hoặc lật ngược trục sau.
      s.moveTo(points[0].x, -points[0].y);
      
      // Vẽ các đường nối tiếp theo
      for (let i = 1; i < points.length; i++) {
        s.lineTo(points[i].x, -points[i].y);
      }
      
      // SỬA LỖI TẠI ĐÂY:
      s.closePath(); // Đóng kín vòng vẽ để tạo thành đa giác khép kín
    }
    return s;
  }, [points]);

  const extrudeSettings = {
    depth: 2.5, // Chiều cao tường
    bevelEnabled: false // Tắt vát cạnh cho tường vuông vức
  };

  // Nếu không có điểm nào thì không vẽ gì cả
  if (!points || points.length === 0) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color="#a0a0a0" side={THREE.DoubleSide} />
    </mesh>
  );
};

export const SceneContent = ({ wallsData }) => {
  return (
    <group>
      {/* Vẽ danh sách các bức tường */}
      {wallsData.map((wallPoints, index) => (
        <WallShape key={index} points={wallPoints} />
      ))}
      
      {/* Sàn nhà tham chiếu */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#555" />
      </mesh>
    </group>
  );
};