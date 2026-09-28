# VinFast Auto Data Pipeline (Task 1)

Thư mục `src/data_pipeline` chịu trách nhiệm thu thập (crawl), bóc tách, chuẩn hóa và lưu trữ toàn bộ dữ liệu từ hệ sinh thái [VinFast Auto Việt Nam](https://vinfastauto.com/vn_vi) và [VinFast Shop](https://shop.vinfastauto.com/vn_vi/chi-phi-lan-banh), phục vụ cơ sở dữ liệu và AI RAG Pipeline của dự án.

---

## 📌 Tổng quan mục đích & Phạm vi thu thập

Hệ thống pipeline được mở rộng để thu thập đầy đủ cả **dữ liệu dạng bảng quan hệ (relational tabular)** và **dữ liệu văn bản phi cấu trúc / bán cấu trúc (unstructured & semi-structured JSON)**:

1. **Bảng giá & Chi phí lăn bánh (Relational CSV)**:
   - Toàn bộ các dòng ô tô và xe máy điện đang kinh doanh hoặc mở đặt cọc.
   - Giá bán niêm yết, giá kèm pin / thuê pin, giá pin rời.
   - Ma trận tùy chọn màu sắc cơ bản (0 đ) và nâng cao (+8.000.000 đ).
   - Biểu phí cấp biển số, thuế trước bạ 63 tỉnh thành (KV1, KV2, KV3).
   - Các gói ưu đãi giảm giá và ma trận tính toán chi phí lăn bánh hoàn chỉnh.

2. **Câu hỏi thường gặp (FAQs JSON)**:
   - 400 câu hỏi & giải đáp chi tiết từ VinFast chia theo danh mục đa tầng: Chính sách bán hàng, Chính sách hậu mãi, Sạc pin, Hệ thống trạm sạc, Trợ lý ảo, Thông tin xe...
   - Lọc chính xác theo các dòng xe đã crawl và chính sách áp dụng toàn công ty.

3. **Chính sách & Điều khoản pháp lý (Policies & Legal JSON)**:
   - Chính sách bảo hành chính hãng ô tô (10 năm / 200.000 km) và xe máy điện.
   - Dịch vụ cứu hộ 24/7 toàn quốc, cứu hộ pin khẩn cấp.
   - Chính sách thuê pin, đổi trả và thiết bị sạc tại nhà.
   - Lịch bảo dưỡng định kỳ và dịch vụ sửa chữa chính hãng.
   - Hợp đồng mua bán xe, chính sách đặt cọc và giao nhận xe.
   - Điều khoản pháp lý và chính sách bảo mật quyền riêng tư.

4. **Tin tức & Thông cáo sản phẩm (News JSON)**:
   - Tin tức ra mắt các dòng xe mới (VF Wild, VF MPV 7, VF 8 thế hệ mới, Evo Grand...).
   - Chương trình ưu đãi, nâng cấp phụ kiện (Apple CarPlay cho VF 3...).
   - Thông cáo báo chí, phát triển mạng lưới đại lý và chiến dịch chuyển đổi xanh.

5. **Thông số kỹ thuật chi tiết (Vehicle Specs JSON)**:
   - Bảng thông số kỹ thuật chi tiết (Dimensions, Motor, Battery, NEDC Range, Charging, Seating, Safety & ADAS) cho tất cả 14 dòng ô tô đã crawl được: **VF 2, VF 3, VF 5, VF 6, VF 7, VF 8, VF 8 The All New, VF 9, VF MPV 7, VF Wild, Limo Green, Herio Green, Minio Green, EC Van**.

---

## 📂 Cấu trúc thư mục mã nguồn & dữ liệu

### 1. Kiến trúc module hóa mã nguồn (`src/data_pipeline/`)
Để đảm bảo tính module hóa, dễ bảo trì và **tuân thủ nghiêm ngặt giới hạn mỗi file Python không quá 600 dòng**, mã nguồn được chia thành các crawler chuyên biệt:

```text
src/data_pipeline/
├── task1_vinfast_auto_crawl_data.py   # Entrypoint chính (Orchestrator + CLI flags) (~200 dòng)
├── README.md                          # Tài liệu kỹ thuật chi tiết (file này)
└── crawlers/                          # Gói các module crawler chuyên biệt
    ├── __init__.py                    # Khởi tạo package
    ├── crawler_utils.py               # Tiện ích HTTP an toàn, bypass Cloudflare, clean HTML (~160 dòng)
    ├── relational_crawler.py          # Bóc tách bảng giá & dự toán lăn bánh CSV (~500 dòng)
    ├── faq_crawler.py                 # Bóc tách và phân loại FAQ JSON (~170 dòng)
    ├── policy_crawler.py              # Bóc tách chính sách & pháp lý JSON (~270 dòng)
    ├── news_crawler.py                # Bóc tách tin tức & thông cáo báo chí JSON (~220 dòng)
    └── specs_crawler.py               # Bóc tách thông số kỹ thuật xe ô tô JSON (~260 dòng)
```

### 2. Cấu trúc thư mục dữ liệu đầu ra (`data/landing/`)

```text
data/landing/
├── relational/                        # Dữ liệu dạng bảng CSV quan hệ
│   ├── vinfast_car_editions_pricing.csv   # Giá niêm yết & phí cố định theo phiên bản ô tô
│   ├── vinfast_car_color_options.csv      # Danh mục màu sắc, loại màu, phụ phí & ảnh màu
│   ├── vinfast_provinces_fees.csv         # 63 tỉnh thành & biểu phí ra biển, trước bạ
│   ├── vinfast_promotions.csv             # 8 chương trình ưu đãi (VinClub, O2O...)
│   ├── vinfast_bike_pricing.csv           # Bảng giá 19 dòng xe máy điện & thuê pin
│   └── vinfast_car_rolling_costs.csv      # 216 ma trận dự toán chi phí lăn bánh hoàn chỉnh
│
├── faqs/                              # Câu hỏi thường gặp FAQ (JSON)
│   ├── vinfast_faqs.json                  # Toàn bộ 400 câu hỏi & đáp đã làm sạch và gắn thẻ
│   ├── vinfast_faqs_by_category.json      # Phân cấp theo danh mục cha & con
│   └── vinfast_faqs_summary.json          # Báo cáo tổng hợp số lượng theo danh mục
│
├── policies/                          # Chính sách dịch vụ & hậu mãi (JSON)
│   ├── vinfast_car_warranty_policy.json   # Chính sách bảo hành ô tô
│   ├── vinfast_bike_warranty_policy.json  # Chính sách bảo hành xe máy điện
│   ├── vinfast_car_battery_service.json   # Dịch vụ pin & sạc ô tô
│   ├── vinfast_bike_battery_service.json  # Dịch vụ pin xe máy điện
│   ├── vinfast_rescue_service.json        # Cứu hộ 24/7 & cứu hộ pin
│   ├── vinfast_maintenance_service.json   # Lịch trình & quy trình bảo dưỡng
│   ├── vinfast_repair_service.json        # Dịch vụ sửa chữa & phụ tùng
│   ├── vinfast_sales_contracts_and_policies.json # Hợp đồng & chính sách bán hàng
│   ├── vinfast_charging_stations_policy.json     # Quy định trạm sạc V-GREEN
│   └── vinfast_policies_all.json          # File tổng hợp toàn bộ chính sách
│
├── legal/                             # Điều khoản pháp lý & bảo mật (JSON)
│   ├── vinfast_legal_terms.json           # Điều khoản và điều kiện pháp lý chung
│   ├── vinfast_privacy_policy.json        # Chính sách bảo vệ dữ liệu cá nhân
│   └── vinfast_legal_all.json             # File tổng hợp pháp lý
│
├── news/                              # Tin tức & Thông cáo sản phẩm (JSON)
│   ├── articles/                          # Từng bài viết chi tiết riêng biệt (<slug>.json)
│   ├── vinfast_news_articles.json         # Danh mục tổng hợp tất cả bài viết tin tức
│   └── news_summary.json                  # Báo cáo tổng quan số lượng bài theo dòng xe
│
└── specs/                             # Thông số kỹ thuật chi tiết ô tô (JSON)
    ├── <model_slug>_specs.json            # Thông số kỹ thuật cho từng dòng xe (VF 3, VF 5,...)
    ├── vinfast_car_specifications.json    # File tổng hợp thông số 14 dòng xe
    └── specs_summary.json                 # Báo cáo thống kê specs
```

---

## 🚀 Hướng dẫn thực thi Pipeline

### Điều kiện tiên quyết
- Python 3.9 trở lên.
- Sử dụng toàn bộ thư viện chuẩn của Python (`urllib`, `json`, `csv`, `pathlib`, `re`, `subprocess`). Không bắt buộc cài đặt thêm package ngoài.

### Lệnh thực thi chính

1. **Chạy toàn bộ pipeline (khuyến nghị)**:
   ```powershell
   python src/data_pipeline/task1_vinfast_auto_crawl_data.py
   # hoặc:
   python src/data_pipeline/task1_vinfast_auto_crawl_data.py --all
   ```

2. **Chạy từng tác vụ độc lập**:
   ```powershell
   # Chỉ crawl bảng giá & dự toán lăn bánh (CSV):
   python src/data_pipeline/task1_vinfast_auto_crawl_data.py --relational

   # Chỉ crawl FAQ (JSON):
   python src/data_pipeline/task1_vinfast_auto_crawl_data.py --faqs

   # Chỉ crawl Chính sách bảo hành, pin, cứu hộ & Pháp lý (JSON):
   python src/data_pipeline/task1_vinfast_auto_crawl_data.py --policies

   # Chỉ crawl Tin tức & Thông cáo báo chí (JSON):
   python src/data_pipeline/task1_vinfast_auto_crawl_data.py --news

   # Chỉ crawl Thông số kỹ thuật chi tiết (JSON):
   python src/data_pipeline/task1_vinfast_auto_crawl_data.py --specs
   ```

---

## 📊 Mô tả cấu trúc Schema JSON

### 1. FAQ Item Schema (`data/landing/faqs/vinfast_faqs.json`)
```json
{
  "id": "faq-0001",
  "category": "Ô tô VinFast",
  "subcategory": "Chính sách bán hàng",
  "question": "Tôi có được huỷ cọc xe không?",
  "answer": "Đối với đơn hàng đặt cọc trước: Quý khách được chuyển nhượng/chuyển giao...",
  "related_models": [],
  "is_general": true,
  "source_url": "https://vinfastauto.com/vn_vi/cau-hoi-thuong-gap",
  "crawled_at": "2026-09-28T16:04:12.345678+00:00"
}
```

### 2. Policy Schema (`data/landing/policies/vinfast_car_warranty_policy.json`)
```json
{
  "id": "warranty-car",
  "title": "Chính sách bảo hành ô tô VinFast",
  "category": "Bảo hành",
  "applies_to": "Ô tô điện VinFast (VF 3, VF 5, VF 6, VF 7, VF 8, VF 9...)",
  "source_url": "https://vinfastauto.com/vn_vi/chinh-sach-bao-hanh-oto",
  "crawled_at": "2026-09-28T16:05:00.000000+00:00",
  "related_models": ["VF 3", "VF 5", "VF 6", "VF 7", "VF 8", "VF 9"],
  "sections": [
    {
      "section_title": "Thời hạn bảo hành xe mới",
      "content": "Thời hạn bảo hành 10 năm hoặc 200.000 km áp dụng cho các dòng VF 7, VF 8, VF 9..."
    }
  ],
  "full_content": "..."
}
```

### 3. News Article Schema (`data/landing/news/articles/<slug>.json`)
```json
{
  "id": "nang-cap-apple-carplayandroid-auto-cho-vf-3-chi-tu-29-trieu-dong",
  "title": "NÂNG CẤP APPLE CARPLAY/ANDROID AUTO CHO VF 3 CHỈ TỪ 2,9 TRIỆU ĐỒNG*",
  "category": "Ô tô điện",
  "published_date": "20/04/2026",
  "source_url": "https://vinfastauto.com/vn_vi/nang-cap-apple-carplayandroid-auto-cho-vf-3-chi-tu-29-trieu-dong",
  "crawled_at": "2026-09-28T16:06:00.000000+00:00",
  "summary": "VinFast chính thức triển khai mở rộng chương trình nâng cấp Apple CarPlay/Android Auto...",
  "related_models": ["VF 3"],
  "is_general_company": false,
  "full_content": "..."
}
```

### 4. Vehicle Specs Schema (`data/landing/specs/vf-3_specs.json`)
```json
{
  "model_name": "VF 3",
  "slug": "vf-3",
  "segment": "Mini SUV",
  "seats": 4,
  "page_title": "VinFast VF 3 - Thông số, giá bán mới nhất",
  "description": "VinFast VF 3 là mẫu xe điện cỡ nhỏ với thiết kế cá tính, quãng đường 215 km/lần sạc...",
  "source_url": "https://vinfastauto.com/vn_vi/dat-coc-xe-dien-vf3",
  "crawled_at": "2026-09-28T16:07:00.000000+00:00",
  "specifications_count": 12,
  "specifications": {
    "Dài x Rộng x Cao (mm)": "3.190 x 1.679 x 1.652",
    "Chiều dài cơ sở (mm)": "2.075",
    "Khoảng sáng gầm xe (mm)": "191",
    "Công suất tối đa": "30 kW/hp",
    "Mô men xoắn cực đại": "110 Nm",
    "Quãng đường di chuyển (NEDC)": "215km/1 lần sạc",
    "Dung lượng pin khả dụng": "18.64 kWh",
    "Sạc nhanh từ 10% - 70%": "36 phút",
    "Công suất sạc nhanh DC tối đa": "24 kW"
  },
  "key_features": [...]
}
```

---

## 💡 Lưu ý kỹ thuật & Tương thích ngược

1. **Khả năng vượt chặn Cloudflare**:
   - `crawler_utils.py` cung cấp cơ chế tải hai tầng: thử nghiệm kết nối tiêu chuẩn qua `urllib.request`; nếu bị chặn HTTP 403 do TLS JA3 Fingerprint của Cloudflare, hệ thống sẽ tự động fallback sang `curl.exe` tích hợp sẵn trên hệ điều hành, đảm bảo tỷ lệ tải thành công 100%.
2. **Mã hóa ký tự tiếng Việt**:
   - Các file CSV sử dụng bảng mã `utf-8-sig` (UTF-8 kèm BOM) để hiển thị chính xác trên Microsoft Excel.
   - Các file JSON sử dụng `utf-8` chuẩn với cờ `ensure_ascii=False` để người dùng và các mô hình LLM đọc tiếng Việt tự nhiên không bị escape thành `\uXXXX`.
3. **Giới hạn số dòng file**:
   - Toàn bộ các file `.py` trong dự án đều có số dòng từ 160 đến tối đa 502 dòng, đảm bảo tiêu chuẩn code sạch và dưới 600 dòng.
4. **Tương thích ngược 100%**:
   - File [task1_vinfast_auto_crawl_data.py](file:///c:/Users/Vxtor/Documents/workspace/P-097/src/data_pipeline/task1_vinfast_auto_crawl_data.py) vẫn export đầy đủ tất cả các hàm cũ (`fetch_rolling_data`, `export_car_editions_pricing`, ...) để bất kỳ mã nguồn hiện có nào gọi trực tiếp đều hoạt động bình thường không cần sửa đổi.
