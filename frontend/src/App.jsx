import React, { useState, useMemo, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
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
  
  /* Material Picker */
  .material-picker {
    position: absolute; top: 90px; right: 24px; z-index: 50;
    background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);
    border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.05); max-width: 350px; max-height: calc(100vh - 120px);
    display: flex; flex-direction: column;
  }
  .material-picker-header {
    padding: 16px; border-bottom: 1px solid #e2e8f0;
    display: flex; justify-content: space-between; align-items: center;
  }
  .material-picker-header h3 { font-size: 1rem; color: #1e293b; font-weight: 600; }
  .close-btn {
    background: none; border: none; color: #64748b; cursor: pointer;
    font-size: 1.5rem; line-height: 1; padding: 0; width: 24px; height: 24px;
  }
  .close-btn:hover { color: #1e293b; }
  
  .material-tabs {
    display: flex; border-bottom: 1px solid #e2e8f0; padding: 0 16px;
  }
  .material-tab {
    padding: 12px 16px; border: none; background: none; cursor: pointer;
    color: #64748b; font-weight: 500; font-size: 0.875rem;
    border-bottom: 2px solid transparent; transition: all 0.2s;
  }
  .material-tab:hover { color: #1e293b; }
  .material-tab.active { color: #2563eb; border-bottom-color: #2563eb; }
  
  .material-search {
    padding: 16px; border-bottom: 1px solid #e2e8f0;
  }
  .material-search input {
    width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0;
    border-radius: 8px; font-size: 0.875rem; outline: none;
  }
  .material-search input:focus { border-color: #2563eb; }
  
  .material-categories {
    padding: 12px 16px; border-bottom: 1px solid #e2e8f0;
    display: flex; flex-wrap: wrap; gap: 8px; max-height: 120px; overflow-y: auto;
  }
  .category-chip {
    padding: 6px 12px; border-radius: 16px; font-size: 0.75rem;
    background: #f1f5f9; color: #475569; cursor: pointer;
    transition: all 0.2s; border: 1px solid transparent; font-weight: 500;
  }
  .category-chip:hover { background: #e2e8f0; }
  .category-chip.active { background: #2563eb; color: white; border-color: #1d4ed8; }
  
  .material-list {
    overflow-y: auto; padding: 16px; display: grid;
    grid-template-columns: repeat(2, 1fr); gap: 12px; max-height: 400px;
  }
  .material-item {
    position: relative; cursor: pointer; border-radius: 8px;
    overflow: hidden; aspect-ratio: 1; border: 2px solid transparent;
    transition: all 0.2s; background: #f8fafc;
  }
  .material-item:hover { border-color: #cbd5e1; transform: scale(1.05); }
  .material-item.active { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); }
  .material-item img {
    width: 100%; height: 100%; object-fit: cover;
  }
  .material-item-name {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    color: white; padding: 8px; font-size: 0.75rem; font-weight: 500;
  }
  .material-loading {
    grid-column: 1 / -1; text-align: center; padding: 20px;
    color: #64748b; font-size: 0.875rem;
  }
  
  .toggle-materials-btn {
    position: absolute; top: 90px; right: 24px; z-index: 49;
    background: #2563eb; color: white; border: none;
    padding: 12px 20px; border-radius: 8px; cursor: pointer;
    font-weight: 500; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
    display: flex; align-items: center; gap: 8px;
  }
  .toggle-materials-btn:hover { background: #1d4ed8; }
  
  /* View Mode Tabs */
  .view-mode-tabs {
    position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 50; display: flex; gap: 8px; background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px); padding: 8px; border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid rgba(0, 0, 0, 0.05);
  }
  .view-tab {
    padding: 10px 24px; border: none; background: transparent;
    color: #64748b; font-weight: 600; font-size: 0.875rem;
    border-radius: 8px; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 8px;
  }
  .view-tab:hover { color: #1e293b; background: #f1f5f9; }
  .view-tab.active { color: white; background: #2563eb; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3); }
  
  /* 2D Canvas */
  .canvas-2d-container {
    width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #e0e7ff 0%, #f0f4f8 100%);
  }
  .canvas-2d {
    max-width: 90%; max-height: 90%; border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    background: white; border: 1px solid #e2e8f0;
  }
  
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

// --- PHẦN 2: LOGIC 3D ---

// Component Tường với Dynamic Texture
const WallShape = ({ points, wallTexture, isInner = false }) => {
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

  // Load textures - fallback to local if no URL provided
  const diffuseUrl = wallTexture?.diffuse || '/textures/walls/grey_plaster_diff_4k.jpg';
  const roughnessUrl = wallTexture?.roughness || '/textures/walls/grey_plaster_rough_4k.jpg';
  
  const diffuseMap = useLoader(THREE.TextureLoader, diffuseUrl);
  const roughnessMap = useLoader(THREE.TextureLoader, roughnessUrl);

  // Setup texture wrapping và repeat
  useMemo(() => {
    [diffuseMap, roughnessMap].forEach(tex => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
      }
    });
  }, [diffuseMap, roughnessMap]);

  const extrudeSettings = { depth: 2.5, bevelEnabled: false };

  if (!points || points.length === 0) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial 
        map={diffuseMap}
        roughnessMap={roughnessMap}
        color="#ffffff" 
        roughness={1}
        metalness={0}
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
};

// Component Sàn nhà với Dynamic Texture
const Floor = ({ floorTexture }) => {
  // Load floor textures - fallback to local if no URL provided
  const diffuseUrl = floorTexture?.diffuse || '/textures/floors/wood_floor_deck_diff_4k.jpg';
  const roughnessUrl = floorTexture?.roughness;
  const normalUrl = floorTexture?.normal;
  
  const diffuseMap = useLoader(THREE.TextureLoader, diffuseUrl);
  const roughnessMap = roughnessUrl ? useLoader(THREE.TextureLoader, roughnessUrl) : null;
  const normalMap = normalUrl ? useLoader(THREE.TextureLoader, normalUrl) : null;

  // Setup texture wrapping và repeat
  useMemo(() => {
    [diffuseMap, roughnessMap, normalMap].forEach(tex => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(8, 8);
      }
    });
  }, [diffuseMap, roughnessMap, normalMap]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        map={diffuseMap}
        roughnessMap={roughnessMap}
        normalMap={normalMap}
        color="#ffffff" 
        roughness={roughnessMap ? 1 : 0.8}
        metalness={0.1}
      />
    </mesh>
  );
};

// Scene Chính chứa Tường và Sàn
const SceneContent = ({ wallsData, wallTexture, floorTexture }) => {
  return (
    <group>
      {wallsData.map((wall, index) => {
        // Xử lý cả format cũ (array) và format mới (object với points)
        const points = Array.isArray(wall) ? wall : wall.points;
        const isInner = wall.isInner || false;
        
        return (
          <WallShape 
            key={index} 
            points={points} 
            wallTexture={wallTexture}
            isInner={isInner}
          />
        );
      })}
      <Floor floorTexture={floorTexture} />
    </group>
  );
};

// --- PHẦN 3: MATERIAL PICKER COMPONENT ---

const MaterialPicker = ({ isOpen, onClose, activeTab, onSelectMaterial }) => {
  const [tab, setTab] = useState(activeTab || 'walls');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWall, setSelectedWall] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://api.polyhaven.com/assets?t=textures');
        const textureData = Object.entries(response.data).map(([id, data]) => ({
          id,
          name: data.name || id,
          categories: data.categories || [],
          thumbnail: `https://cdn.polyhaven.com/asset_img/thumbs/${id}.png?width=200`
        }));
        setMaterials(textureData);
        
        // Tạo danh sách categories duy nhất
        const allCategories = new Set();
        textureData.forEach(mat => {
          mat.categories.forEach(cat => allCategories.add(cat));
        });
        setCategories([...allCategories].sort());
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchMaterials();
    }
  }, [isOpen]);

  const filteredMaterials = materials.filter(mat => {
    const matchesSearch = mat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mat.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || mat.categories.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const handleSelectMaterial = async (material) => {
    try {
      // Fetch chi tiết material để lấy download links
      const detailResponse = await axios.get(`https://api.polyhaven.com/files/${material.id}`);
      const files = detailResponse.data;
      
      // Lấy texture ở resolution 1k (cân bằng chất lượng và tốc độ)
      const resolution = '1k';
      const textureUrls = {
        diffuse: files?.Diffuse?.['1k']?.jpg?.url || files?.Diffuse?.['2k']?.jpg?.url,
        roughness: files?.Rough?.['1k']?.jpg?.url || files?.Rough?.['2k']?.jpg?.url,
        normal: files?.nor_gl?.['1k']?.jpg?.url || files?.nor_gl?.['2k']?.jpg?.url,
      };

      if (tab === 'walls') {
        setSelectedWall(material.id);
        onSelectMaterial('wall', { ...textureUrls, name: material.name });
      } else {
        setSelectedFloor(material.id);
        onSelectMaterial('floor', { ...textureUrls, name: material.name });
      }
    } catch (error) {
      console.error('Error loading material details:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="material-picker">
      <div className="material-picker-header">
        <h3>🎨 Chọn Vật Liệu</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="material-tabs">
        <button 
          className={`material-tab ${tab === 'walls' ? 'active' : ''}`}
          onClick={() => setTab('walls')}
        >
          Tường
        </button>
        <button 
          className={`material-tab ${tab === 'floors' ? 'active' : ''}`}
          onClick={() => setTab('floors')}
        >
          Sàn nhà
        </button>
      </div>

      <div className="material-search">
        <input 
          type="text" 
          placeholder="Tìm kiếm vật liệu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="material-categories">
        <div 
          className={`category-chip ${!selectedCategory ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          Tất cả
        </div>
        {categories.map(cat => (
          <div 
            key={cat}
            className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </div>
        ))}
      </div>

      <div className="material-list">
        {loading ? (
          <div className="material-loading">Đang tải vật liệu từ Poly Haven...</div>
        ) : filteredMaterials.length === 0 ? (
          <div className="material-loading">Không tìm thấy vật liệu nào</div>
        ) : (
          filteredMaterials.slice(0, 50).map(mat => (
            <div 
              key={mat.id}
              className={`material-item ${
                (tab === 'walls' && selectedWall === mat.id) || 
                (tab === 'floors' && selectedFloor === mat.id) 
                  ? 'active' : ''
              }`}
              onClick={() => handleSelectMaterial(mat)}
            >
              <img src={mat.thumbnail} alt={mat.name} />
              <div className="material-item-name">{mat.name}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- PHẦN 4: APP COMPONENT CHÍNH ---

function App() {
  const [walls, setWalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const [wallTexture, setWallTexture] = useState(null);
  const [floorTexture, setFloorTexture] = useState(null);
  const [viewMode, setViewMode] = useState('3d'); // '2d' or '3d'
  const [uploadedImage, setUploadedImage] = useState(null);

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
    
    // Đọc và lưu ảnh gốc cho 2D view
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
    };
    reader.readAsDataURL(file);
    
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

  const handleSelectMaterial = (type, textureUrls) => {
    if (type === 'wall') {
      setWallTexture(textureUrls);
    } else {
      setFloorTexture(textureUrls);
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

      {/* Material Picker Toggle Button */}
      {walls.length > 0 && !showMaterialPicker && (
        <button 
          className="toggle-materials-btn"
          onClick={() => setShowMaterialPicker(true)}
        >
          <span>🎨</span>
          <span>Chọn Vật Liệu</span>
        </button>
      )}

      {/* Material Picker Panel */}
      <MaterialPicker 
        isOpen={showMaterialPicker}
        onClose={() => setShowMaterialPicker(false)}
        activeTab="walls"
        onSelectMaterial={handleSelectMaterial}
      />

      {/* View Mode Tabs */}
      {walls.length > 0 && (
        <div className="view-mode-tabs">
          <button 
            className={`view-tab ${viewMode === '2d' ? 'active' : ''}`}
            onClick={() => setViewMode('2d')}
          >
            <span>📐</span>
            <span>2D</span>
          </button>
          <button 
            className={`view-tab ${viewMode === '3d' ? 'active' : ''}`}
            onClick={() => setViewMode('3d')}
          >
            <span>🏠</span>
            <span>3D</span>
          </button>
        </div>
      )}

      {/* Controls Info */}
      {walls.length > 0 && viewMode === '3d' && (
        <div className="controls-info">
          <div className="control-item"><span className="control-icon">🖱️</span><span>Trái: Xoay</span></div>
          <div className="control-item"><span className="control-icon">🔄</span><span>Scroll: Zoom</span></div>
          <div className="control-item"><span className="control-icon">👆</span><span>Phải: Di chuyển</span></div>
        </div>
      )}

      {/* 2D View */}
      {viewMode === '2d' && uploadedImage && (
        <div className="canvas-2d-container">
          <img src={uploadedImage} alt="Floor Plan" className="canvas-2d" />
        </div>
      )}

      {/* 3D Canvas */}
      {viewMode === '3d' && (
        <Canvas camera={{ position: [10, 20, 10], fov: 50 }} className="canvas" shadows>
          <color attach="background" args={['#f0f4f8']} />
          
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
          
          <SceneContent wallsData={walls} wallTexture={wallTexture} floorTexture={floorTexture} />
          
          <OrbitControls 
            makeDefault 
            enableDamping 
            dampingFactor={0.05} 
            rotateSpeed={0.5} 
            zoomSpeed={0.8} 
            maxPolarAngle={Math.PI / 2 - 0.1} 
          />
        </Canvas>
      )}

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