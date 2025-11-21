// /frontend/src/App.jsx
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import axios from 'axios';
import { SceneContent } from './Walls';
import './App.css';

function App() {
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

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
      alert('Có lỗi xảy ra khi xử lý ảnh!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1>3D Floor Plan Viewer</h1>
        </div>
        
        <div className="upload-section">
          <label htmlFor="file-upload" className="upload-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {loading ? 'Đang xử lý...' : 'Upload Mặt Bằng'}
          </label>
          <input 
            id="file-upload" 
            type="file" 
            accept="image/*"
            onChange={handleUpload} 
            disabled={loading}
          />
          {fileName && <span className="file-name">{fileName}</span>}
        </div>
      </header>

      {/* Info Panel */}
      {walls.length === 0 && !loading && (
        <div className="info-panel">
          <div className="info-content">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="info-icon">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>Chưa có mô hình 3D</h2>
            <p>Upload ảnh mặt bằng để bắt đầu visualize trong không gian 3D</p>
            <ul>
              <li>✓ Hỗ trợ định dạng: PNG, JPG, JPEG</li>
              <li>✓ Ảnh nên có độ tương phản cao</li>
              <li>✓ Tường màu đen, nền màu trắng</li>
            </ul>
          </div>
        </div>
      )}

      {/* Controls Info */}
      {walls.length > 0 && (
        <div className="controls-info">
          <div className="control-item">
            <span className="control-icon">🖱️</span>
            <span>Kéo trái: Xoay</span>
          </div>
          <div className="control-item">
            <span className="control-icon">🔄</span>
            <span>Scroll: Zoom</span>
          </div>
          <div className="control-item">
            <span className="control-icon">👆</span>
            <span>Kéo phải: Di chuyển</span>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [15, 15, 15], fov: 50 }}
        className="canvas"
      >
        <color attach="background" args={['#f0f4f8']} />
        <fog attach="fog" args={['#f0f4f8', 20, 50]} />
        
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#4a90e2" />
        <Environment preset="night" />
        
        {/* Grid helper */}
        <Grid 
          args={[50, 50]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#cbd5e1" 
          sectionSize={5} 
          sectionThickness={1} 
          sectionColor="#94a3b8" 
          fadeDistance={40} 
          fadeStrength={1}
          infiniteGrid
        />
        
        <SceneContent wallsData={walls} />
        
        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />
      </Canvas>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Đang xử lý ảnh...</p>
        </div>
      )}
    </div>
  );
}

export default App;