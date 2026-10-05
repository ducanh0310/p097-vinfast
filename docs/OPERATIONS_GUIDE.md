# 📖 CẨM NANG VẬN HÀNH DỰ ÁN: AUTOQUOTE AI PLATFORM
> **Project Code:** P-097 | **Mã đề tài:** VF020-04 | **Version:** 1.0.0
> **Mục tiêu:** Hướng dẫn chi tiết từng bước (Step-by-step) để bất kỳ ai (Developer, DevOps, QA, Product Manager) đều có thể cài đặt, cấu hình và vận hành hệ thống trơn tru từ A đến Z.

---

## 📑 MỤC LỤC
1. [Kiến trúc Tổng quan & Tech Stack](#1-kiến-trúc-tổng-quan--tech-stack)
2. [Yêu cầu Môi trường (Prerequisites)](#2-yêu-cầu-môi-trường-prerequisites)
3. [Cấu hình Biến môi trường (Environment Variables)](#3-cấu-hình-biến-môi-trường-environment-variables)
4. [Vận hành Môi trường Phát triển (Local Development)](#4-vận-hành-môi-trường-phát-triển-local-development)
5. [Vận hành Môi trường Production (Docker Compose 1-Click)](#5-vận-hành-môi-trường-production-docker-compose-1-click)
6. [Vận hành Pipeline Dữ liệu (Data Pipeline: Crawl → Silver → Gold)](#6-vận-hành-pipeline-dữ-liệu-data-pipeline)
7. [Tài khoản Demo & Kịch bản Kiểm thử Nghiệp vụ](#7-tài-khoản-demo--kịch-bản-kiểm-thử-nghiệp-vụ)
8. [Kiểm thử Tự động & Quản lý Chất lượng Mã nguồn](#8-kiểm-thử-tự-động--quản-lý-chất-lượng-mã-nguồn)
9. [Triển khai Đám mây (Cloud Deployment: Vercel + Render + Supabase)](#9-triển-khai-đám-mây-cloud-deployment)
10. [Xử lý Sự cố Thường gặp (Troubleshooting FAQs)](#10-xử-lý-sự-cố-thường-gặp-troubleshooting-faqs)

---

## 1. KIẾN TRÚC TỔNG QUAN & TECH STACK

Hệ thống được thiết kế theo mô hình **Micro-services / Tách biệt Frontend - Backend**:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                       NGƯỜI DÙNG & TƯ VẤN VIÊN                         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                 HTTP / REST API     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 15 + TypeScript + Tailwind CSS) — Port 3000           │
│  • Consumer Configurator (3-Panel Stage) • Seller & Warehouse Dashboard │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                 REST / JSON API     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BACKEND (FastAPI + Python 3.11/3.12) — Port 8000                       │
│  • Deterministic Pricing Engine (Lăn bánh & Khuyến mãi)                 │
│  • LangGraph AI Copilot (RAG Knowledge, Grounding Guard, TCO)           │
│  • Lead & Quote Management Service (HITL Approval Workflow)             │
└──────────────────┬─────────────────┬─────────────────┬──────────────────┘
                   │                 │                 │
                   ▼                 ▼                 ▼
        ┌──────────────────┐ ┌───────────────┐ ┌────────────────┐
        │  PostgreSQL 16   │ │ Redis Cache   │ │ Gold RAG Store │
        │  (Port 5432)     │ │ (Port 6379)   │ │ 1,328 Chunks   │
        └──────────────────┘ └───────────────┘ └────────────────┘
```

---

## 2. YÊU CẦU MÔI TRƯỜNG (PREREQUISITES)

Cài đặt các công cụ sau trước khi vận hành:

| Phần mềm | Phiên bản khuyến nghị | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Python** | `≥ 3.11` (Hỗ trợ tốt 3.11 & 3.12) | Chạy Backend API, LangGraph Agent & Pipeline |
| **Node.js & npm**| Node `≥ 20.x`, npm `≥ 10.x` | Chạy Frontend Next.js |
| **Docker & Docker Compose** | Docker Desktop `≥ 24.x` | Chạy toàn bộ stack containerized |
| **Git** | `≥ 2.40` | Quản lý mã nguồn |
| **LLM API Key** | OpenAI API Key **hoặc** Google Gemini Key | Cung cấp trí tuệ cho AI Agent |

---

## 3. CẤU HÌNH BIẾN MÔI TRƯỜNG (ENVIRONMENT VARIABLES)

### 3.1. Cấu hình Backend (`.env` tại thư mục gốc)
Tạo file `.env` từ file mẫu `.env.example`:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Điền các thông số quan trọng trong `.env`:
```ini
# LLM Providers (Điền ít nhất 1 trong 2 key)
OPENAI_API_KEY="sk-proj-..."
GOOGLE_API_KEY="AIzaSy..."
LLM_PROVIDER="auto"          # "auto" (ưu tiên OpenAI nếu có key, fallback Gemini) hoặc "openai" / "gemini"

# Database Connection (Mặc định cho Docker Compose)
DATABASE_URL="postgresql+asyncpg://vinfast:vinfast123@localhost:5432/vinfast_ai"

# Redis Cache
REDIS_URL="redis://localhost:6379/0"

# CORS Configuration (Cho phép Frontend gọi API)
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# Application Settings
APP_NAME="VinFast AI Agent"
APP_ENV="development"
DEBUG=True
PORT=8000
```

### 3.2. Cấu hình Frontend (`frontend/.env.local`)
Tạo file `frontend/.env.local`:

```bash
# Windows PowerShell
Copy-Item frontend/.env.local.example frontend/.env.local

# Linux / macOS
cp frontend/.env.local.example frontend/.env.local
```

Nội dung `frontend/.env.local`:
```ini
# URL Backend API mà trình duyệt sẽ gọi tới
NEXT_PUBLIC_API_URL="http://localhost:8000/api/v1"

# URL Backend khi Server-side render (SSR trong Docker hoặc internal network)
BACKEND_URL="http://localhost:8000"
```

---

## 4. VẬN HÀNH MÔI TRƯỜNG PHÁT TRIỂN (LOCAL DEVELOPMENT)

Chạy song song Backend và Frontend trên máy cá nhân để phát triển và sửa code có Hot-reload.

### Bước 1: Khởi động Database (PostgreSQL & Redis)
Khuyến nghị dùng Docker để chạy nhanh Database và Redis mà không cần cài trực tiếp vào máy:

```bash
docker compose up -d postgres redis
```
*Ghi chú: Container postgres đã được cấu hình tự động nạp schema (`scripts/db/schema.sql`) và dữ liệu mẫu (`scripts/db/seed.sql`).*

### Bước 2: Khởi động Backend (FastAPI)
Mở Terminal 1:

```powershell
# 1. Kích hoạt môi trường ảo Python
# Trên Windows:
.\.venv\Scripts\activate
# Trên Linux / macOS:
# source .venv/bin/activate

# 2. Cài đặt thư viện (nếu mới clone lần đầu)
pip install -r requirements.txt

# 3. Khởi chạy Backend Server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```
- **Kiểm tra Healthcheck**: [http://localhost:8000/health](http://localhost:8000/health) `{"status":"ok"}`
- **Tài liệu API Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Bước 3: Khởi động Frontend (Next.js)
Mở Terminal 2:

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt thư viện Node
npm install

# Khởi chạy Next.js Dev Server
npm run dev
```
- **Giao diện Khách hàng**: [http://localhost:3000/configurator](http://localhost:3000/configurator)
- **Cổng Đại lý / Sales**: [http://localhost:3000/seller/dashboard](http://localhost:3000/seller/dashboard)
- **Cổng Thủ kho**: [http://localhost:3000/warehouse/dashboard](http://localhost:3000/warehouse/dashboard)

---

## 5. VẬN HÀNH MÔI TRƯỜNG PRODUCTION (DOCKER COMPOSE 1-CLICK)

Dành cho môi trường staging, demo hoặc triển khai production trên máy chủ vật lý / VPS / VM.

### 5.1. Khởi chạy 1-Click
Chỉ cần chạy duy nhất 1 lệnh từ thư mục gốc:

```bash
docker compose up --build -d
```

Hệ thống sẽ tự động thực hiện:
1. Build Multi-stage Image siêu nhẹ cho Backend (`Dockerfile`) chạy dưới non-root user.
2. Build Multi-stage Standalone Image cho Next.js (`frontend/Dockerfile`) nhúng sẵn biến API URL.
3. Khởi tạo `vinfast_postgres` và tự động import schema + seed data ban đầu.
4. Thiết lập network cô lập `vinfast_net` và healthcheck liên tục giữa các dịch vụ.

### 5.2. Các cổng dịch vụ mở ra máy Host

| Dịch vụ | URL Truy cập | Ghi chú |
| :--- | :--- | :--- |
| **Frontend Web** | [http://localhost:3000](http://localhost:3000) | Giao diện người dùng & dashboard đại lý |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | REST API cho ứng dụng |
| **Swagger UI** | [http://localhost:8000/docs](http://localhost:8000/docs) | Tài liệu API tương tác trực tiếp |
| **PostgreSQL** | `localhost:5432` | User: `vinfast`, Pass: `vinfast123`, DB: `vinfast_ai` |
| **Redis** | `localhost:6379` | In-memory cache & sessions |

### 5.3. Quản lý Container

```bash
# Xem trạng thái các container đang chạy
docker compose ps

# Xem log theo thời gian thực của toàn bộ hệ thống
docker compose logs -f

# Xem riêng log của Backend hoặc Frontend
docker compose logs -f backend
docker compose logs -f frontend

# Khởi động lại một dịch vụ
docker compose restart backend

# Dừng toàn bộ hệ thống (dữ liệu database vẫn được bảo toàn trong volume)
docker compose down

# Dừng và xóa sạch toàn bộ volume database (reset từ đầu)
docker compose down -v
```

---

## 6. VẬN HÀNH PIPELINE DỮ LIỆU (DATA PIPELINE)

Hệ thống sở hữu Pipeline ETL 3 tầng chuyên biệt cho ngành ô tô điện:

```text
[Raw Web / API / PDF] ──► [Bronze Layer] ──► [Silver Layer] ──► [Gold Layer]
```

Khi VinFast ra mắt xe mới, cập nhật bảng giá hoặc đổi chương trình khuyến mãi, chạy các lệnh sau:

### 6.1. Thu thập dữ liệu thô (Crawl & Ingestion)
```bash
# Crawl toàn bộ (API giá xe, FAQ, bài viết ưu đãi, brochure PDF)
python -m src.pipeline.cli crawl --mode all

# Hoặc chỉ cập nhật API giá và bảng màu:
python -m src.pipeline.cli crawl --mode api
```
*Dữ liệu lưu tại:* `dataset/bronze/vinfast/relational/vinfast_rolling_raw_snapshot.json`

### 6.2. Chuẩn hóa & Sinh Semantic Chunks (Bronze → Silver)
```bash
python -m src.pipeline.cli silver
```
*Tác vụ thực hiện:*
- Chuẩn hóa tiếng Việt toàn diện (NFC, chuẩn dấu thanh).
- Trích xuất **216 tùy chọn màu sắc xe** (`dataset/silver/rdb_schema/vehicle_colors.csv`).
- Phân đoạn ngữ cảnh theo cấu trúc tiêu đề (Hierarchical Chunks).
- Tự động sinh báo cáo kiểm toán chất lượng tại `dataset/silver/README.md`.

### 6.3. Tinh lọc tri thức tư vấn mua xe (Silver → Gold)
```bash
python -m src.pipeline.cli gold
```
*Tác vụ thực hiện:*
- Lọc bỏ quy định giao thông không liên quan, giữ lại 100% kiến thức mua bán, tính giá và pháp lý sở hữu ô tô điện.
- Khử trùng lặp nội dung (Exact & Near Deduplication).
- Xuất bản **141 cấu hình màu xe ô tô điện** (`dataset/gold/rdb_schema/vehicle_colors.csv`).
- Phân vùng dữ liệu theo 7 chủ đề tư vấn tại `dataset/gold/by_topic/`.

---

## 7. TÀI KHOẢN DEMO & KỊCH BẢN KIỂM THỬ NGHIỆP VỤ

### 7.1. Danh sách tài khoản thử nghiệm

| Vai trò (Role) | Email đăng nhập | Mật khẩu | Trang quản trị |
| :--- | :--- | :--- | :--- |
| **Khách hàng (Buyer)** | *Không cần đăng nhập* | — | `/configurator` |
| **Nhân viên Sale (Seller)** | `seller@abc.vn` | `123456` | `/seller/dashboard` |
| **Thủ kho (Warehouse)** | `warehouse@abc.vn` | `123456` | `/warehouse/dashboard` |
| **Quản trị viên (Admin)** | `admin@vinfast.vn` | `admin123` | `/seller/dashboard` |

### 7.2. Kịch bản kiểm thử E2E (End-to-End Test Flow)

1. **Khách hàng cấu hình xe:**
   - Truy cập [http://localhost:3000/configurator](http://localhost:3000/configurator).
   - Chọn dòng xe **VF 6**, bản **Plus**, màu **Đỏ Năng Lượng (Solar Ruby)**, đăng ký tại **Hà Nội**, chọn **Thuê pin**.
   - Quan sát bảng chiết tính lăn bánh nhảy tự động (miễn 100% lệ phí trước bạ, phí cấp biển 20.000.000đ).
2. **Chat với AI Copilot:**
   - Tại panel chat bên phải, bấm vào câu hỏi gợi ý hoặc gõ: *"Xe này có những màu nào và thuê pin mỗi tháng bao nhiêu?"*.
   - AI Copilot trích xuất dữ liệu Gold RAG trả lời chính xác từng tùy chọn màu và gói thuê pin.
3. **Gửi yêu cầu nhận báo giá:**
   - Nhập Họ tên, Số điện thoại và bấm **[Nhận Báo Giá]**.
   - Báo giá được tạo thành công với trạng thái `pending`.
4. **Tư vấn viên tiếp nhận & duyệt báo giá (HITL):**
   - Đăng nhập với tài khoản `seller@abc.vn` / `123456`.
   - Vào menu **Hàng đợi Lead (`/seller/leads`)** thấy thông tin khách vừa gửi.
   - Vào menu **Báo giá (`/seller/quotes`)**, bấm **[Duyệt]** hoặc **[Từ chối]** báo giá.

---

## 8. KIỂM THỬ TỰ ĐỘNG & QUẢN LÝ CHẤT LƯỢNG MÃ NGUỒN

Trước khi commit mã nguồn hoặc tạo Pull Request, luôn chạy 2 lệnh sau:

### 8.1. Kiểm tra Linter & Code Style (Ruff)
```powershell
# Chạy kiểm tra quy chuẩn code
.\.venv\Scripts\ruff check .

# Tự động sửa các lỗi format an toàn
.\.venv\Scripts\ruff check --fix .
```
*Tiêu chuẩn: Phải đạt `All checks passed!` (0 lỗi).*

### 8.2. Chạy Bộ kiểm thử tự động (Pytest)
```powershell
# Chạy toàn bộ 42 bài kiểm thử (Agent, API, Pipeline, Color Data)
.\.venv\Scripts\python -m pytest tests/ -v
```
*Tiêu chuẩn: Toàn bộ `42 passed`.*

---

## 9. TRIỂN KHAI ĐÁM MÂY (CLOUD DEPLOYMENT)

Theo đúng kiến trúc đề xuất trong Product One-Pager:

### 9.1. Database: Supabase (PostgreSQL)
1. Tạo Project mới trên [Supabase](https://supabase.com/).
2. Mở mục **SQL Editor**, copy toàn bộ nội dung file [`scripts/db/schema.sql`](file:///c:/Users/Vxtor/Documents/workspace/P-097/scripts/db/schema.sql) và [`scripts/db/seed.sql`](file:///c:/Users/Vxtor/Documents/workspace/P-097/scripts/db/seed.sql) vào chạy.
3. Lấy chuỗi kết nối PostgreSQL (URI) dạng:
   `postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 9.2. Backend API: Render
1. Kết nối repo GitHub với [Render Dashboard](https://dashboard.render.com/).
2. Tạo mới **Web Service**, chọn **Docker Runtime**.
3. Cấu hình Environment Variables:
   - `DATABASE_URL`: Điền connection string Supabase ở trên.
   - `OPENAI_API_KEY` hoặc `GOOGLE_API_KEY`.
   - `CORS_ORIGINS`: Điền domain Vercel của Frontend.
4. Render sẽ tự động build từ `Dockerfile` và cấp domain dạng `https://vinfast-api.onrender.com`.

### 9.3. Frontend: Vercel
1. Import repo vào [Vercel Dashboard](https://vercel.com/).
2. Đặt Root Directory là `frontend`.
3. Thêm Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://vinfast-api.onrender.com/api/v1`
4. Bấm **Deploy**. Vercel sẽ tự động build Next.js Standalone và phân phối toàn cầu qua Edge CDN.

---

## 10. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING FAQS)

### ❓ Lỗi 1: `port is already allocated` (Cổng 5432 hoặc 8000 bị chiếm dụng)
- **Nguyên nhân:** Máy đang chạy sẵn PostgreSQL cài trực tiếp hoặc service khác ở cổng 5432/8000.
- **Khắc phục:**
  - Tắt service Postgres đang chạy ngầm trên máy:
    - *Windows:* Mở Task Manager hoặc `services.msc`, tìm `postgresql-x64` và bấm **Stop**.
    - *Linux/macOS:* `sudo systemctl stop postgresql`.
  - Hoặc đổi port mapping trong `docker-compose.yml` (ví dụ `"5433:5432"`).

### ❓ Lỗi 2: Trình duyệt báo `Network Error` hoặc `CORS error` khi chat/tính giá
- **Nguyên nhân:** Biến `CORS_ORIGINS` của Backend chưa cho phép domain của Frontend.
- **Khắc phục:** Mở file `.env`, thêm URL Frontend vào `CORS_ORIGINS`:
  `CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://ten-mien-vercel.vercel.app"`

### ❓ Lỗi 3: `RuntimeError: Thiếu dữ liệu catalog` khi chạy Backend
- **Nguyên nhân:** Chưa chạy pipeline hoặc chưa có file CSV trong `data/vinfast_agent/relational/`.
- **Khắc phục:** Chạy lệnh đồng bộ pipeline:
  ```bash
  python -m src.pipeline.cli silver
  python -m src.pipeline.cli gold
  ```

### ❓ Lỗi 4: AI Agent báo lỗi `Missing LLM API Key`
- **Nguyên nhân:** File `.env` chưa có `OPENAI_API_KEY` hoặc `GOOGLE_API_KEY`.
- **Khắc phục:** Mở `.env`, điền API Key hợp lệ. Nếu dùng Gemini, đặt `LLM_PROVIDER="gemini"`.
