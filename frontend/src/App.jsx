// /frontend/src/App.jsx
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import axios from 'axios';
import { SceneContent } from './Walls';

function App() {
  const [walls, setWalls] = useState([]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Gọi API Python
      const res = await axios.post('http://localhost:8001/process-image', formData);
      setWalls(res.data.walls);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Nút upload đơn giản */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <input type="file" onChange={handleUpload} />
      </div>

      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Environment preset="city" /> {/* Ánh sáng môi trường cho đẹp */}
        
        {/* Component hiển thị tường */}
        <SceneContent wallsData={walls} />
        
        <OrbitControls /> {/* Cho phép xoay camera */}
      </Canvas>
    </div>
  );
}

export default App;