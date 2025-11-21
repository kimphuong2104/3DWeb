import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Cấu hình CORS để React gọi được API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def rectify_points(points, width, height):
    """
    Hàm làm thẳng các đường tường (Wall Rectification).
    
    Thuật toán cải tiến:
    - Chỉ ép thẳng các đoạn tường dài (mặt tường).
    - Giữ nguyên các đoạn ngắn (đầu hồi, độ dày tường) sẽ được giữ nguyên 
      để bảo toàn hình dáng.
    """
    if len(points) < 2:
        return points

    # Chuyển numpy array sang list các điểm [x, y] để dễ chỉnh sửa
    new_points = [list(p[0]) for p in points]
    
    # Ngưỡng xác định (Threshold):
    # Khoảng 0.5% kích thước ảnh. 
    threshold = max(width, height) * 0.005 

    for i in range(1, len(new_points)):
        prev_p = new_points[i-1]
        curr_p = new_points[i]

        dx = abs(curr_p[0] - prev_p[0])
        dy = abs(curr_p[1] - prev_p[1])
        
        # Tính độ dài thực tế của đoạn thẳng
        segment_length = np.sqrt(dx*dx + dy*dy)

        # LOGIC QUAN TRỌNG: Chỉ ép thẳng nếu đoạn thẳng đó ĐỦ DÀI (lớn hơn 2 lần ngưỡng)
        if segment_length > (threshold * 2):
            if dx < threshold: 
                curr_p[0] = prev_p[0] # Ép thẳng đứng
            elif dy < threshold: 
                curr_p[1] = prev_p[1] # Ép nằm ngang
        
        # Cập nhật lại điểm sau khi xử lý
        new_points[i] = curr_p

    # Xử lý khép kín vòng (Điểm cuối nối với điểm đầu)
    if len(new_points) > 2:
        first = new_points[0]
        last = new_points[-1]
        dx = abs(first[0] - last[0])
        dy = abs(first[1] - last[1])
        
        if dx < threshold and dy < threshold:
            new_points[-1] = first
        elif dx < threshold:
            new_points[-1][0] = first[0]
        elif dy < threshold:
            new_points[-1][1] = first[1]

    return new_points

@app.post("/process-image/")
async def process_image(file: UploadFile = File(...)):
    # 1. Đọc dữ liệu ảnh từ client upload lên
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 2. Tiền xử lý (Preprocessing)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray) # Tăng tương phản
    blurred = cv2.GaussianBlur(gray, (3, 3), 0) # Blur nhẹ
    
    # Phân ngưỡng: Biến tường thành màu TRẮNG, nền thành ĐEN
    _, thresh = cv2.threshold(blurred, 200, 255, cv2.THRESH_BINARY_INV)
    
    # Morphological Closing: Nối liền các vết đứt gãy nhỏ
    kernel = np.ones((3,3), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    # 3. Tìm đường bao (Contours)
    contours, _ = cv2.findContours(thresh, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

    walls_data = []
    height, width = image.shape[:2]
    scale_factor = max(width, height) / 50 

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 100: continue # Bỏ qua nhiễu nhỏ
        
        perimeter = cv2.arcLength(cnt, True)
        
        # Epsilon cực nhỏ (0.002) để giữ lại độ dày tường
        epsilon = 0.002 * perimeter 
        approx = cv2.approxPolyDP(cnt, epsilon, True)

        if len(approx) < 4: continue

        # 4. Làm thẳng (Rectification)
        rectified_points = rectify_points(approx, width, height)

        # 5. Chuẩn hóa tọa độ (Normalization)
        final_points = []
        for point in rectified_points:
            x, y = point
            # Dời gốc tọa độ về tâm ảnh (0,0)
            normalized_x = (float(x) - width / 2) / scale_factor
            normalized_y = (float(y) - height / 2) / scale_factor
            
            # Grid Snap nhẹ (0.05)
            normalized_x = round(normalized_x / 0.05) * 0.05
            normalized_y = round(normalized_y / 0.05) * 0.05
            
            final_points.append({"x": normalized_x, "y": normalized_y})

        walls_data.append({
            "points": final_points,
            "isInner": False 
        })

    return {"walls": walls_data}

# Chạy server: uvicorn main:app --reload --port 8001