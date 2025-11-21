# 3DWeb - Floor Plan to 3D Visualization

Ứng dụng web chuyển đổi mặt bằng 2D thành mô hình 3D tương tác sử dụng Computer Vision và Three.js.

## 📋 Tổng quan

Dự án này cho phép người dùng:
- Upload ảnh mặt bằng 2D
- Tự động nhận diện và trích xuất các bức tường
- Hiển thị mô hình 3D tương tác trong trình duyệt
- Xoay, phóng to/thu nhỏ để xem từ nhiều góc độ

## 🛠️ Công nghệ sử dụng

### Backend
- **FastAPI** - Web framework Python
- **OpenCV** - Xử lý ảnh và Computer Vision
- **NumPy** - Tính toán khoa học

### Frontend
- **React** - UI framework
- **Three.js** - Render 3D graphics
- **React Three Fiber** - React renderer cho Three.js
- **React Three Drei** - Helper components cho R3F
- **Vite** - Build tool và dev server
- **Axios** - HTTP client

## 📁 Cấu trúc dự án

```
3DWeb/
├── backend/
│   ├── main.py                 # FastAPI server và image processing
│   ├── create_test_image.py    # Script tạo ảnh test
│   ├── test_plan_chuan.png     # Ảnh mẫu
│   ├── .env                    # Environment variables
│   └── venv/                   # Python virtual environment
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── Walls.jsx           # 3D wall rendering component
│   │   ├── main.jsx            # React entry point
│   │   └── assets/             # Static assets
│   ├── public/                 # Public files
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   └── .env                    # Frontend environment variables
│
├── .gitignore                  # Git ignore rules
└── README.md                   # Tài liệu này
```

## 🚀 Cài đặt và Chạy

### Backend (FastAPI)

1. **Tạo và kích hoạt môi trường ảo:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

2. **Cài đặt dependencies:**
```bash
pip install fastapi uvicorn opencv-python numpy python-multipart
```

3. **Chạy server:**
```bash
uvicorn main:app --reload --port 8001
```

Server sẽ chạy tại: `http://localhost:8001`

### Frontend (React + Vite)

1. **Cài đặt dependencies:**
```bash
cd frontend
npm install
```

2. **Chạy dev server:**
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

## 🎯 Cách sử dụng

1. Khởi động cả backend và frontend
2. Mở trình duyệt tại `http://localhost:5173`
3. Click nút **"Choose File"** để upload ảnh mặt bằng
4. Hệ thống sẽ tự động:
   - Phân tích ảnh
   - Nhận diện tường
   - Render mô hình 3D
5. Sử dụng chuột để:
   - **Kéo trái**: Xoay camera
   - **Scroll**: Zoom in/out
   - **Kéo phải**: Di chuyển

## 🔧 API Endpoints

### POST `/process-image/`
Upload và xử lý ảnh mặt bằng

**Request:**
- Content-Type: `multipart/form-data`
- Body: File ảnh

**Response:**
```json
{
  "walls": [
    [
      {"x": 0.5, "y": 0.5},
      {"x": 1.5, "y": 0.5},
      {"x": 1.5, "y": 2.5}
    ]
  ]
}
```

## 📝 Cấu hình

### Backend `.env`
```env
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8001
```

## 🐛 Troubleshooting

### Backend không khởi động
- Kiểm tra Python version (yêu cầu 3.8+)
- Đảm bảo đã cài đặt đầy đủ dependencies
- Kiểm tra port 8001 có bị chiếm dụng không

### Frontend không kết nối được API
- Kiểm tra backend đã chạy chưa
- Xác nhận CORS đã được cấu hình đúng
- Kiểm tra URL API trong code

### Mô hình 3D không hiển thị
- Kiểm tra console browser để xem lỗi
- Đảm bảo ảnh upload có độ tương phản cao
- Thử với ảnh mẫu `test_plan_chuan.png`

## 📦 Build Production

### Frontend
```bash
cd frontend
npm run build
```

Output sẽ được tạo trong thư mục `frontend/dist/`

## 🤝 Contributing

Contributions, issues và feature requests đều được welcome!

## 📄 License

MIT License

## 👤 Author

**kimphuong2104**
- GitHub: [@kimphuong2104](https://github.com/kimphuong2104)
- Repository: [3DWeb](https://github.com/kimphuong2104/3DWeb)

---

⭐ Nếu thấy project hữu ích, hãy cho một star nhé!
