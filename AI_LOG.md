# AI Usage Logging Guide — AI20K Build Phase

Dự án này sử dụng cơ chế tự động ghi nhận và nộp nhật ký sử dụng AI (AI Usage Logging - Deliverable #4) lên hệ thống chấm điểm Phoenix.

---

## 1. Cấu hình biến môi trường

Đảm bảo file `.env` đã được cấu hình đúng API Key cá nhân lấy từ [Dashboard Phoenix](https://phoenix.note.transformerlabs.ai/api-keys):

```env
AI_LOG_SERVER=https://ai-logs.note.transformerlabs.ai/api-ingest
AI_LOG_API_KEY=<API_KEY_CÁ_NHÂN_CỦA_BẠN>
AI_LOG_DIR=.ai-log
```

---

## 2. Cài đặt Git Pre-push Hook

Chạy một lần duy nhất sau khi clone dự án để tự động nộp log mỗi khi `git push`:

- **Trên Windows PowerShell:**
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts\setup_hooks.ps1
  ```
- **Trên Linux / macOS / Git Bash:**
  ```bash
  bash scripts/setup_hooks.sh
  ```

---

## 3. Quy trình ghi log

### 🤖 Ghi log tự động (Auto-logging)
Hệ thống tự động ghi nhận prompt khi sử dụng các công cụ IDE được hỗ trợ:
- **Antigravity IDE**: Cấu hình tại `.agents/hooks.json`.
- **Cursor**: Cấu hình tự động tại `.cursor/hooks.json`.
- **Claude Code**: Cấu hình tự động tại `.claude/settings.json`.
- **OpenAI Codex CLI**: Cấu hình tại `.codex/hooks.json`.
- **GitHub Copilot**: Cấu hình tại `.github/hooks/hooks.json`.

### 📝 Ghi log thủ công (Manual-logging)
Khi sử dụng các công cụ web (ChatGPT, Gemini Web, Claude.ai,...):

- **Giao diện tương tác:**
  ```bash
  python scripts/log_manual.py
  ```
- **Lệnh 1 dòng nhanh:**
  - *Windows PowerShell:*
    ```powershell
    python scripts/log_manual.py --tool chatgpt --prompt "Nội dung prompt bạn đã dùng"
    ```
  - *Linux / macOS / Git Bash:*
    ```bash
    bash scripts/_pyrun.sh scripts/log_manual.py --tool chatgpt --prompt "Nội dung prompt bạn đã dùng"
    ```

---

## 4. Kiểm tra & Gửi log thủ công

- **File lưu trữ log local:** `.ai-log/session.jsonl`
- **Gửi log trực tiếp không cần `git push`:**
  ```bash
  python scripts/submit_log.py
  ```
