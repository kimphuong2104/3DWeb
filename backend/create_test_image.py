# /backend/create_test_image.py
import cv2
import numpy as np

print("Đang tạo ảnh test...")

# 1. Tạo ảnh nền trắng 500x500
img = np.ones((500, 500, 3), dtype=np.uint8) * 255

# 2. Vẽ tường bao màu ĐEN (dày 20 pixel)
cv2.rectangle(img, (100, 100), (400, 400), (0, 0, 0), 20)

# 3. Vẽ tường ngăn ở giữa
cv2.line(img, (250, 100), (250, 400), (0, 0, 0), 20)

# 4. Đục cửa đi (vẽ màu TRẮNG đè lên)
cv2.line(img, (150, 400), (200, 400), (255, 255, 255), 22)

# 5. Lưu thành file
cv2.imwrite('test_plan_chuan.png', img)
print("Xong! Đã tạo file 'test_plan_chuan.png' trong thư mục backend.")