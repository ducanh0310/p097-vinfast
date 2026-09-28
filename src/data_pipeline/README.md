# VinFast Auto Data Pipeline

Thư mục `src/data_pipeline` chứa các kịch bản (scripts) chịu trách nhiệm thu thập (crawl), bóc tách, chuẩn hóa và lưu trữ dữ liệu dạng bảng quan hệ (relational tabular data) phục vụ hệ thống cơ sở dữ liệu và AI RAG Pipeline của dự án.

---

## 📌 Tổng quan mục đích

Trang [Dự toán chi phí lăn bánh VinFast](https://shop.vinfastauto.com/vn_vi/chi-phi-lan-banh) cung cấp công cụ tính giá mua xe và chi phí lăn bánh cho toàn bộ các dòng ô tô và xe máy điện VinFast. Tuy nhiên, trên giao diện người dùng, dữ liệu đòi hỏi người dùng phải chọn qua nhiều bước tuần tự (chọn Dòng xe $\rightarrow$ Phiên bản $\rightarrow$ Màu sắc $\rightarrow$ Ưu đãi $\rightarrow$ Tỉnh/Thành đăng ký).

Pipeline này giải quyết bài toán trên bằng cách:
- Kết nối trực tiếp tới endpoint API backend chính thức của VinFast: `RollingUpCost-GetInfoRolling`.
- Bóc tách toàn diện 100% ma trận cấu hình: tất cả các dòng xe, phiên bản, giá gốc, giá kèm pin/thuê pin, tùy chọn màu sắc & phụ phí màu, 63 tỉnh thành kèm biểu phí ra biển/trước bạ, và các chính sách ưu đãi.
- Chuẩn hóa và lưu trữ thành các tập tin CSV quan hệ tại thư mục `data/landing/relational/`.

---

## 📂 Cấu trúc thư mục

```text
├── src/data_pipeline/
│   ├── task1_vinfast_auto_crawl_data.py   # Script crawl và bóc tách dữ liệu VinFast Auto
│   └── README.md                          # Tài liệu hướng dẫn (file này)
│
└── data/landing/relational/               # Thư mục chứa các file CSV đầu ra
    ├── vinfast_car_editions_pricing.csv   # Giá niêm yết & các phí cố định theo phiên bản xe ô tô
    ├── vinfast_car_color_options.csv      # Danh mục màu sắc, loại màu, phụ phí & ảnh màu xe
    ├── vinfast_provinces_fees.csv         # 63 tỉnh thành, phân khu vực (KV1-KV3) & biểu phí biển số
    ├── vinfast_promotions.csv             # Các chương trình ưu đãi (VinClub, O2O, Chuyển đổi xanh...)
    ├── vinfast_car_rolling_costs.csv      # Ma trận dự toán lăn bánh hoàn chỉnh cho các dòng xe & tỉnh thành
    └── vinfast_bike_pricing.csv           # Bảng giá xe máy điện, giá pin và cọc/thuê pin
```

---

## ⚙️ Kịch bản thực thi: `task1_vinfast_auto_crawl_data.py`

### 1. Nguồn dữ liệu & Endpoint
- **URL giao diện**: `https://shop.vinfastauto.com/vn_vi/chi-phi-lan-banh`
- **Endpoint API backend**:
  ```text
  https://shop.vinfastauto.com/on/demandware.store/Sites-app_vinfast_vn-Site/vi_VN/RollingUpCost-GetInfoRolling
  ```
- **Phương thức**: HTTP GET kèm Headers giả lập Browser (`User-Agent`, `Referer`, `X-Requested-With: XMLHttpRequest`).

### 2. Các hàm bóc tách chính

| Hàm trong script | Tập tin CSV đầu ra | Nội dung nghiệp vụ |
| :--- | :--- | :--- |
| `export_car_editions_pricing()` | `vinfast_car_editions_pricing.csv` | Bảng giá niêm yết, giá kèm pin, phí đường bộ 1 năm, bảo hiểm TNDS 1 năm, phí đăng kiểm cho từng phiên bản ô tô điện. |
| `export_car_color_options()` | `vinfast_car_color_options.csv` | Toàn bộ các tùy chọn màu sắc xe, phân loại Màu cơ bản (0 đ) và Màu nâng cao (+8.000.000 đ), giá xe theo từng màu, URL ảnh minh họa. |
| `export_provinces_fees()` | `vinfast_provinces_fees.csv` | Danh sách 63 tỉnh/thành phố, phân chia Khu vực đăng ký (KV1, KV2, KV3), phí đăng ký biển số và tỷ lệ lệ phí trước bạ. |
| `export_promotions()` | `vinfast_promotions.csv` | Danh sách các gói ưu đãi giảm giá (VinClub hạng Vàng, Platinum, Diamond; ưu đãi O2O; chương trình Chuyển đổi xanh...). |
| `export_bike_pricing()` | `vinfast_bike_pricing.csv` | Dữ liệu các dòng xe máy điện: giá xe, giá mua pin, chi phí cọc/thuê pin hàng tháng. |
| `export_car_rolling_cost_summary()` | `vinfast_car_rolling_costs.csv` | Ma trận dự toán chi phí lăn bánh hoàn chỉnh theo đúng công thức VinFast và quy định pháp luật Việt Nam. |

---

## 📊 Mô tả chi tiết dữ liệu đầu ra (Output Schema)

### 1. `vinfast_car_editions_pricing.csv`
- `model_id`: Mã định danh dòng xe (ví dụ: `Products-Car-VF3`, `Products-Car-VF6`).
- `model_name`: Tên thương mại dòng xe (`VF 3`, `VF 6`, `VF 8 The All New`...).
- `edition_id`: Mã phiên bản kỹ thuật (ví dụ: `TI1CV`, `JB12V`, `NE3LV`).
- `edition_name`: Tên phiên bản (`Eco`, `Plus`, `Comfort`...).
- `base_price_vnd`: Giá cơ bản (VNĐ).
- `price_vnd`: Giá bán niêm yết chính thức (VNĐ).
- `price_with_battery_vnd`: Giá bán xe đã bao gồm pin (VNĐ).
- `battery_price_vnd`: Giá mua đứt pin (nếu có tách rời).
- `road_maintenance_fee_1yr`: Phí bảo trì đường bộ 1 năm (`1.560.000 đ`).
- `civil_insurance_fee_1yr`: Bảo hiểm trách nhiệm dân sự bắt buộc 1 năm (`480.700 đ`).
- `inspection_fee`: Phí đăng kiểm xe (`340.000 đ`).
- `default_color`: Mã màu mặc định.
- `deposit_page_url`: Đường dẫn trang đặt cọc chính thức của xe.

### 2. `vinfast_car_color_options.csv`
- `model_id`, `model_name`: Thông tin dòng xe.
- `edition_id`, `edition_name`: Thông tin phiên bản xe.
- `color_code`: Mã màu (ví dụ: `CE18`, `CE2Q`, `CE1W`, `181U`).
- `color_name`: Tên màu hiển thị (ví dụ: `Infinity Blanc`, `Urban Mint`, `Summer Yellow - Infinity Blanc Roof`).
- `color_type`: Phân loại màu (`Màu cơ bản` hoặc `Màu nâng cao`).
- `color_extra_price_vnd`: Phụ phí màu sắc (`0 đ` cho màu cơ bản; `+8.000.000 đ` cho màu nâng cao).
- `total_car_price_vnd`: Giá xe sau khi áp dụng tùy chọn màu.
- `image_url`: Đường dẫn ảnh render thực tế của xe theo màu sắc đó.

### 3. `vinfast_provinces_fees.csv`
- `province_id`, `province_name`: Tên tỉnh/thành phố (63 tỉnh thành).
- `zone`: Khu vực tính phí đăng ký biển số (`KV1`, `KV2`, `KV3`).
- `car_license_plate_fee_vnd`: Phí cấp biển số ô tô (`14.000.000 đ` tại KV1; `1.000.000 đ` tại KV2/KV3).
- `car_registration_fee_pct`: Tỷ lệ lệ phí trước bạ ô tô (`0.0` do ô tô điện được miễn 100% lệ phí trước bạ).
- `bike_license_fee_low_vnd`, `medium_vnd`, `high_vnd`: Biểu phí cấp biển số xe máy điện theo các bậc giá trị xe.
- `bike_registration_fee_pct`: Tỷ lệ lệ phí trước bạ xe máy điện (`5%` tại KV1, `2%` tại các tỉnh còn lại).

### 4. `vinfast_car_rolling_costs.csv`
Bảng tính toán chi phí lăn bánh hoàn chỉnh:
$$\text{Chi phí lăn bánh} = \text{Giá xe sau màu} + \text{Phí trước bạ (0đ)} + \text{Phí cấp biển số} + \text{Phí đăng kiểm} + \text{Phí đường bộ} + \text{Bảo hiểm TNDS}$$

---

## 🚀 Hướng dẫn chạy Pipeline

### Điều kiện tiên quyết
- Python 3.9 trở lên.
- Các thư viện tiêu chuẩn: `urllib`, `json`, `csv`, `pathlib` (không yêu cầu cài thêm package ngoài đối với script này).

### Lệnh thực thi

Từ thư mục gốc của dự án (`P-097`), chạy lệnh:

```powershell
python src/data_pipeline/task1_vinfast_auto_crawl_data.py
```

### Kết quả console mong đợi
```text
=================================================================
🚀 BẮT ĐẦU CRAWL DỮ LIỆU GIÁ & DỰ TOÁN LĂN BÁNH VINFAST AUTO
   Trang nguồn: https://shop.vinfastauto.com/vn_vi/chi-phi-lan-banh
   Thư mục đích: ...\data\landing\relational
=================================================================
🌐 Đang kết nối tới endpoint VinFast: https://shop.vinfastauto.com/...
✅ Tải dữ liệu thành công! Dung lượng phản hồi: 493,948 bytes.

📊 Đang xử lý và bóc tách dữ liệu ra các file CSV quan hệ...
📁 Đã xuất: vinfast_car_editions_pricing.csv (27 phiên bản xe ô tô)
📁 Đã xuất: vinfast_car_color_options.csv (145 tùy chọn màu xe)
📁 Đã xuất: vinfast_provinces_fees.csv (63 tỉnh thành & biểu phí)
📁 Đã xuất: vinfast_promotions.csv (8 chương trình ưu đãi)
📁 Đã xuất: vinfast_bike_pricing.csv (19 dòng xe máy điện)
📁 Đã xuất: vinfast_car_rolling_costs.csv (216 ma trận dự toán lăn bánh)

🎉 Hoàn thành toàn bộ quá trình crawl và lưu trữ CSV thành công!
```

---

## 💡 Lưu ý kỹ thuật

1. **Mã hóa ký tự tiếng Việt (UTF-8 with BOM)**:
   - Các file CSV được xuất với định dạng encoding `utf-8-sig` (UTF-8 kèm BOM) để Microsoft Excel trên Windows tự động nhận diện đúng dấu tiếng Việt không bị lỗi font khi mở trực tiếp.
2. **Khả năng mở rộng**:
   - Nếu VinFast cập nhật bảng giá hoặc thêm dòng xe mới (ví dụ: VF Wild, Limo Green thương mại...), chỉ cần chạy lại lệnh trên để tự động làm mới toàn bộ 6 file CSV.
