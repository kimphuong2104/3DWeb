import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

#Cấu hình CORS để React gọi được API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/process-image/")
async def process_image(file: UploadFile = File(...)):
    # 1. Đọc ảnh từ upload
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 2. Chuyển sang ảnh xám (Grayscale)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 3. Phân ngưỡng (Threshold): Biến ảnh thành đen-trắng tuyệt đối
    # Giả sử tường màu đen, nền trắng -> Đảo ngược để tường thành trắng (255) để dễ detect
    _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)

    # 4. Tìm đường viền (Contours)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    walls_data = []

    for cnt in contours:
        # Bỏ qua các nhiễu quá nhỏ
        if cv2.contourArea(cnt) < 100: 
            continue
            
        # 5. Làm mượt đường viền (Quan trọng nhất!)
        # epsilon càng lớn thì đường càng thẳng, càng ít điểm
        epsilon = 0.01 * cv2.arcLength(cnt, True) 
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        
        # Chuyển numpy array thành list python thường để trả về JSON
        points = []
        for point in approx:
            x, y = point[0]
            # Chuẩn hóa toạ độ (Scale nhỏ lại cho Three.js dễ hiển thị)
            points.append({"x": int(x) / 50, "y": int(y) / 50}) 
            
        walls_data.append(points)

    return {"walls": walls_data}

# Chạy server: uvicorn main:app --reload
