import React, { useState, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';

// --- PHẦN 1: CSS STYLES (Được nhúng trực tiếp để chạy ổn định) ---
const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; overflow: hidden; }
  .app-container { width: 100vw; height: 100vh; position: relative; background-color: #f0f4f8; }
  
  /* Header */
  .header {
    position: absolute; top: 0; left: 0; width: 100%; height: 70px; padding: 0 24px;
    display: flex; align-items: center; justify-content: space-between; z-index: 100;
    background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  }
  .logo { display: flex; align-items: center; gap: 12px; color: #2563eb; }
  .logo h1 { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
  
  /* Upload */
  .upload-section { display: flex; align-items: center; gap: 16px; }
  .upload-button {
    display: flex; align-items: center; gap: 8px; background-color: #2563eb; color: white;
    padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer;
    transition: all 0.2s ease; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  }
  .upload-button:hover { background-color: #1d4ed8; transform: translateY(-1px); }
  input[type="file"] { display: none; }
  .file-name { font-size: 0.875rem; color: #64748b; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  
  /* Panels */
  .info-panel { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; pointer-events: none; }
  .info-content {
    background: white; padding: 40px; border-radius: 16px; text-align: center;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); max-width: 480px; width: 90vw; border: 1px solid #e2e8f0;
  }
  .info-icon { color: #2563eb; margin-bottom: 20px; }
  .info-content h2 { color: #1e293b; margin-bottom: 12px; font-size: 1.5rem; }
  .info-content p { color: #64748b; margin-bottom: 24px; line-height: 1.5; }
  .info-content ul { text-align: left; list-style: none; background: #f8fafc; padding: 20px; border-radius: 8px; }
  .info-content li { color: #475569; margin-bottom: 8px; font-size: 0.9rem; }
  
  .controls-info {
    position: absolute; bottom: 24px; left: 24px; z-index: 10;
    background: rgba(255, 255, 255, 0.9); padding: 16px; border-radius: 12px;
    backdrop-filter: blur(4px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    display: flex; flex-direction: column; gap: 8px; border: 1px solid rgba(255, 255, 255, 0.5);
  }
  .control-item { display: flex; align-items: center; gap: 10px; font-size: 0.875rem; color: #475569; font-weight: 500; }
  .control-icon { font-size: 1.1rem; }
  
  /* Loading */
  .loading-overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(4px);
    z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  }
  .spinner {
    width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid #2563eb;
    border-radius: 50%; animation: spin 1s linear infinite;
  }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  .canvas { width: 100% !important; height: 100% !important; outline: none; }
`;

// --- PHẦN 2: LOGIC 3D (Trước đây là Walls.jsx) ---

// Component Tường
const WallShape = ({ points }) => {
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

  const extrudeSettings = { depth: 2.5, bevelEnabled: false };

  if (!points || points.length === 0) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial 
        color="#e5e7eb" 
        roughness={0.7}
        metalness={0.1}
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
};

// Component Sàn nhà
const Floor = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#f8fafc" 
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
};

// Scene Chính chứa Tường và Sàn
const SceneContent = ({ wallsData }) => {
  return (
    <group>
      {wallsData.map((wallPoints, index) => (
        <WallShape key={index} points={wallPoints} />
      ))}
      <Floor />
    </group>
  );
};

// --- PHẦN 3: APP COMPONENT CHÍNH ---

function App() {
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  // Inject Styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:8001/process-image', formData);
      setWalls(res.data.walls);
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối Backend! Đảm bảo uvicorn đang chạy ở cổng 8001.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <h1>3D Floor Plan Viewer</h1>
        </div>
        
        <div className="upload-section">
          <label htmlFor="file-upload" className="upload-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {loading ? 'Đang xử lý...' : 'Upload Mặt Bằng'}
          </label>
          <input id="file-upload" type="file" accept="image/*" onChange={handleUpload} disabled={loading} />
          {fileName && <span className="file-name">{fileName}</span>}
        </div>
      </header>

      {/* Info Panel */}
      {walls.length === 0 && !loading && (
        <div className="info-panel">
          <div className="info-content">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="info-icon">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h2>Chưa có mô hình 3D</h2>
            <p>Upload ảnh mặt bằng để bắt đầu visualize trong không gian 3D</p>
            <ul>
              <li>✓ Hỗ trợ định dạng: PNG, JPG</li>
              <li>✓ Tường màu đen, nền màu trắng</li>
            </ul>
          </div>
        </div>
      )}

      {/* Controls Info */}
      {walls.length > 0 && (
        <div className="controls-info">
          <div className="control-item"><span className="control-icon">🖱️</span><span>Trái: Xoay</span></div>
          <div className="control-item"><span className="control-icon">🔄</span><span>Scroll: Zoom</span></div>
          <div className="control-item"><span className="control-icon">👆</span><span>Phải: Di chuyển</span></div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas camera={{ position: [10, 20, 10], fov: 50 }} className="canvas" shadows>
        <color attach="background" args={['#f0f4f8']} />
        <fog attach="fog" args={['#f0f4f8', 30, 80]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 20, 5]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <hemisphereLight 
          skyColor="#b8d4ff" 
          groundColor="#f0f4f8" 
          intensity={0.4} 
        />
        
        <Grid 
          args={[50, 50]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#cbd5e1" 
          sectionSize={5} 
          sectionThickness={1} 
          sectionColor="#94a3b8" 
          fadeDistance={40}
          infiniteGrid 
        />
        
        <SceneContent wallsData={walls} />
        
        <OrbitControls 
          makeDefault 
          enableDamping 
          dampingFactor={0.05} 
          rotateSpeed={0.5} 
          zoomSpeed={0.8} 
          maxPolarAngle={Math.PI / 2 - 0.1} 
        />
      </Canvas>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Đang xử lý ảnh & dựng 3D...</p>
        </div>
      )}
    </div>
  );
}

export default App;