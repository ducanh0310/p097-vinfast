# Auto Car Configurator & Pricing AI Agent (VFO2O-04)

> **Tóm tắt 1 câu:** Tự động hóa quá trình tư vấn cấu hình dòng xe Xe X, áp dụng chính xác quy tắc giá & chương trình khuyến mãi theo thời gian thực và tự động tính chi phí lăn bánh theo tỉnh/thành cho Khách hàng & Tư vấn viên.

---

## Vấn đề (Problem)

**Thực trạng & Pain Point:**
- **Ai đang gặp vấn đề?** Khách hàng mua xe ô tô và Đội ngũ tư vấn viên bán hàng (Sales Representative / Consultant).
- **Vấn đề tốn bao nhiêu thời gian/tiền?** Khi chọn mua xe, khách hàng có nhu cầu tự cấu hình chi tiết (phiên bản, màu sắc, gói thuê/mua pin, phụ kiện) và nắm rõ chi phí lăn bánh chính xác. Tuy nhiên, bảng giá niêm yết, chính sách ưu đãi/khuyến mãi và lệ phí trước bạ thay đổi liên tục theo mẫu xe, thời điểm và đối tượng khách hàng. Tư vấn viên phải báo giá thủ công, mất nhiều thời gian tra cứu và dễ dẫn đến sai sót, báo giá không thống nhất.
- **Tại sao các giải pháp hiện tại chưa đủ?** Các công cụ configurator truyền thống hoặc bảng tính tĩnh thiếu linh hoạt trong việc kết hợp nhiều điều kiện khuyến mãi phức tạp, không cung cấp giải thích tự nhiên bằng AI, không cảnh báo xung đột cấu hình và thiếu quy trình kiểm duyệt báo giá chính thức (Human-in-the-Loop - HITL) trước khi gửi khách hàng.

---

## Giải pháp (Solution)

Hệ thống **AI Agent Cấu hình xe & Báo giá khuyến mãi tự động** giải quyết toàn diện vấn đề trên:

- **Cấu hình xe tương tác từng bước (Interactive Configurator):** Hướng dẫn người dùng chọn phiên bản, màu sơn, pin (mua đứt vs thuê pin) và phụ kiện; tự động kiểm tra & cảnh báo khi có lựa chọn cấu hình không hợp lý/xung đột.
- **Tính giá & Khuyến mãi chuẩn xác (Deterministic Pricing & RAG Engine):** Tích hợp RAG trên Vector DB để cập nhật chính xác bảng giá & ưu đãi mới nhất. Sử dụng công cụ tính toán deterministic (không để LLM tự tính tiền) để đảm bảo độ chính xác 100% khi áp khuyến mãi và phí lăn bánh theo từng tỉnh/thành.
- **Quy trình Báo giá & Duyệt HITL (Human-in-the-Loop):** Hỗ trợ 2 vai trò (Khách hàng & Tư vấn viên), cho phép xuất file báo giá PDF chuyên nghiệp. Mọi báo giá chính thức đều trải qua luồng tư vấn viên kiểm duyệt (HITL) để ghi log phiên bản giá và bảo mật thông tin khách hàng.
- **Tính năng nâng cao:**
  - Cảnh báo & khuyến nghị gói cấu hình tối ưu theo ngân sách khách hàng.
  - Phân tích & so sánh bài toán tài chính: Mua pin vs Thuê pin theo thời gian sử dụng.
  - Quản lý lịch sử báo giá khách hàng & Dashboard đánh giá hiệu quả chương trình khuyến mãi.

---

## Target User

- **Primary User:** Khách hàng cá nhân / doanh nghiệp có nhu cầu tìm hiểu, tùy chỉnh cấu hình xe và nhận bảng báo giá dự toán chi tiết.
- **Secondary User:** Tư vấn viên bán hàng (Sales / Consultant) cần công cụ tự động hóa tính giá, kiểm tra báo giá chính xác (HITL) và xuất file PDF gửi khách hàng.

---

## Tech Stack

| Layer | Technology | Chi tiết |
|-------|-----------|----------|
| **AI Agent Orchestration** | LangGraph + LangChain 0.3 | Điều phối luồng cấu hình, kiểm tra quy tắc giá & phản hồi hội thoại |
| **LLM Service** | OpenAI GPT-4o / Gemini | Xử lý hội thoại tự nhiên, tư vấn & giải thích chi tiết |
| **RAG & Vector DB** | ChromaDB / Vector Store | Tra cứu bảng giá, chính sách khuyến mãi & lệ phí trước bạ theo tỉnh |
| **Calculation Engine** | Python Deterministic Tool Engine | Tính toán giá cuối, ưu đãi & phí lăn bánh tuyệt đối chính xác |
| **Backend API** | FastAPI + Python 3.11+ | RESTful API server, async processing, Pydantic validation |
| **Frontend UI** | React / Next.js + TypeScript | Giao diện Car Configurator 3D/Trực quan (Khách / Tư vấn viên) |
| **Database** | PostgreSQL / SQLite | Lưu trữ dữ liệu cấu hình, lịch sử báo giá & phiên bản bảng giá |
| **Export Service** | PDF Generator (ReportLab / WeasyPrint) | Xuất báo giá PDF chính thức |
| **DevOps & CI/CD** | Docker + GitHub Actions (Render / Vercel) | Multi-stage build, tự động lint, test & deploy |

---

## Quick Start

```bash
# 1. Clone repo của đội
git clone https://github.com/AI20K-Build-Phase-Cohort-4/P-097.git
cd P-097

# 2. Setup môi trường Python
python3.11 -m venv .venv
# Trên Linux/macOS:
source .venv/bin/activate
# Trên Windows:
.venv\Scripts\activate

# 3. Cấu hình biến môi trường
cp .env.example .env
# Chỉnh sửa file .env với OPENAI_API_KEY và AI_LOG_API_KEY của bạn

# 4. Cài đặt phụ thuộc
pip install -r requirements.txt

# 5. Chạy development server
uvicorn src.main:app --reload --port 8000
```

Truy cập Swagger UI API Documentation tại: `http://localhost:8000/docs`

---

## Project Structure

```
.
├── src/
│   ├── agents/          # LangGraph agent definitions
│   │   ├── graph.py     # Main state graph (nodes + edges)
│   │   ├── state.py     # AgentState schema (TypedDict)
│   │   ├── nodes/       # Node functions (parse, analyze, calculate, format)
│   │   └── tools/       # Tools (pricing calculation, RAG search, PDF export)
│   ├── api/             # FastAPI routes & handlers
│   │   └── routes.py    # Endpoint definitions (/chat, /status, /configurate)
│   ├── models/          # Pydantic data schemas
│   │   └── schemas.py   # Request/Response models
│   ├── pipeline/        # Vietnamese Pre-RAG Data Pipeline (Bronze -> Silver -> Gold)
│   │   ├── crawlers/    # Web & API crawlers (Live Pricing API, FAQ, Promos, PDFs)
│   │   ├── extractors/  # Extractors (HTML, FAQ, Relational API, PDF)
│   │   ├── nlp/         # Vietnamese text normalizer & sentence splitter
│   │   ├── chunking/    # Hierarchical chunker with breadcrumb context
│   │   ├── filters/     # Gold consultation filter & chunk deduplicators
│   │   ├── storage/     # Data persistence writers & automated report generators
│   │   └── README.md    # Chi tiết kiến trúc & hướng dẫn Data Pipeline
│   ├── services/        # Business logic (LLM client, pricing engine, RAG)
│   ├── config.py        # Environment settings
│   └── main.py          # FastAPI application entry point
├── dataset/             # Dữ liệu phân tầng Medallion (Bronze, Silver, Gold, PDF)
├── tests/               # Pytest suite (unit & integration tests)
├── docs/                # Project documentation & architecture diagrams
├── eval/                # Evaluation evidence & test suite results
├── presentation/        # Demo Day pitch deck & video materials
├── Dockerfile           # Multi-stage Docker build config
├── docker-compose.yml   # Full stack deployment setup
└── .github/workflows/   # CI/CD pipelines (ruff, pytest)
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Kiểm tra trạng thái hoạt động của hệ thống (Health check) |
| `GET` | `/api/v1/status` | Kiểm tra trạng thái và phiên bản của LangGraph Agent |
| `POST` | `/api/v1/chat` | Tương tác hội thoại tư vấn cấu hình xe với AI Agent |
| `POST` | `/api/v1/configurate` | Gửi lựa chọn cấu hình xe và tính toán giá lăn bánh |
| `POST` | `/api/v1/quote/approve` | Tư vấn viên duyệt báo giá chính thức (HITL) |
| `POST` | `/api/v1/quote/export-pdf` | Xuất bảng báo giá định dạng PDF |

---

## Deliverables Checklist

- [x] **Source Code**: Mã nguồn đầy đủ trên GitHub (`src/`)
- [x] **README.md**: Tài liệu hướng dẫn & giới thiệu dự án hoàn chỉnh
- [x] **Architecture Diagram**: Sơ đồ kiến trúc chi tiết (`docs/architecture_diagram.md` & `ARCHITECTURE.md`)
- [x] **AI Logs**: Tự động thu thập & đồng bộ AI prompt logging
- [ ] **Live URL**: Deploy phiên bản thử nghiệm trên Vercel / Render
- [ ] **Video Demo**: Video trình diễn tính năng sản phẩm (`presentation/`)
- [ ] **Pitch Deck**: Slide thuyết trình cho Demo Day (`presentation/`)
- [x] **Development Journal**: Nhật ký phát triển hàng tuần (`JOURNAL.md`)
- [x] **Worklog**: Nhập nhật ký công việc chi tiết (`WORKLOG.md`)
- [ ] **Evaluation Evidence**: Bằng chứng đánh giá độ chính xác 100% trên bộ test giá (`eval/results/`)

---

## Team Members (Phòng C401)

| Thành viên | Vai trò | MSSV | Chuyên môn / Đóng góp |
|------------|---------|------|-----------------------|
| **Nguyễn Đức Anh** 👑 | Team Lead / Fullstack / AI Engineer | `2A202602888` | Backend, Frontend, Machine Learning, UI/UX Design, Project Management, User Research |
| **Lại Bá Quân** | Backend / Data & DevOps | `2A202602495` | Backend, Data Engineering, DevOps/Cloud, Prompt Engineering, Business Analysis |
| **Đồng Mạnh Hùng** | ML & NLP Engineer / Backend | `2A202602412` | Machine Learning, NLP, Computer Vision, Business Analysis, Communication |
| **Phùng Thành An** | UI/UX Designer / AI & DevOps Engineer | `2A202603006` | UI/UX Design, Computer Vision, Machine Learning, DevOps/Cloud, Product Management |

---

## License

Dự án được phân phối dưới giấy phép [MIT License](LICENSE).
