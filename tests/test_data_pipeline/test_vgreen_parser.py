"""Unit tests cho parser FAQ của V-GREEN (parse_vgreen_faqs).

Kiểm thử:
1. Khả năng chống Fragile Parsing (PR Review feedback):
   - Không bị gãy khi tiêu đề danh mục thay đổi (ví dụ: 'Trạm sạc Ô tô điện', 'Dành cho Xe máy điện').
   - Nhận diện câu hỏi linh hoạt cả khi có dấu hỏi hoặc bắt đầu bằng mẫu câu hỏi.
   - Không nhầm các bước thao tác ('+ Bước 1: ...') thành câu hỏi mới.
   - Flush an toàn câu hỏi cuối cùng trước footer / form liên hệ.
2. Hỗ trợ đầu vào HTML lẫn Text thô.
"""

from __future__ import annotations

import pytest

from src.data_pipeline.crawlers.vgreen_crawler import _detect_faq_section, _is_faq_question, parse_vgreen_faqs


class TestVgreenFaqParser:
    """Bộ kiểm thử cho bộ bóc tách FAQ V-GREEN."""

    # -------------------------------------------------------------
    # 1. Kiểm tra nhận diện Section linh hoạt
    # -------------------------------------------------------------

    @pytest.mark.parametrize(
        ("line", "expected_section"),
        [
            ("Ô tô điện", "Ô tô điện"),
            ("Trạm sạc Ô tô điện", "Ô tô điện"),
            ("Dành cho ô tô điện", "Ô tô điện"),
            ("Mục Ô tô", "Ô tô điện"),
            ("Xe máy điện", "Xe máy điện"),
            ("Trạm sạc Xe máy điện", "Xe máy điện"),
            ("Dành cho xe máy", "Xe máy điện"),
            ("Phần xe máy điện (scooter)", "Xe máy điện"),
            ("Câu hỏi thường gặp chung", None),
            ("Chính sách thanh toán", None),
        ],
    )
    def test_detect_faq_section_flexible(self, line: str, expected_section: str | None) -> None:
        """Kiểm tra nhận diện section chống phụ thuộc chuỗi tuyệt đối."""
        assert _detect_faq_section(line) == expected_section

    # -------------------------------------------------------------
    # 2. Kiểm tra nhận diện câu hỏi
    # -------------------------------------------------------------

    @pytest.mark.parametrize(
        "line",
        [
            "Thời hạn thanh toán chi phí sạc ô tô điện tại trạm sạc V-Green như thế nào?",
            "Tôi có thể tìm kiếm trạm sạc V-Green bằng cách nào?",
            "Làm thế nào để sạc xe an toàn?",
            "Thời gian được phép dừng đỗ ở các trạm sạc của V-Green là bao lâu?",
            "Làm sao để liên hệ tổng đài cứu hộ?",
        ],
    )
    def test_is_faq_question_positive(self, line: str) -> None:
        """Đảm bảo các mẫu câu hỏi hợp lệ được phát hiện."""
        assert _is_faq_question(line) is True

    @pytest.mark.parametrize(
        "line",
        [
            "+ Bước 1: Chạm tay vào Tìm kiếm",
            "- Bước 2: Bấm chọn trạm sạc",
            "Khách hàng có thể tham khảo thêm về hệ thống.",
            "Trang chủ",
            "",
            "   ",
        ],
    )
    def test_is_faq_question_negative(self, line: str) -> None:
        """Đảm bảo các bước thao tác hoặc văn bản thường không bị nhận nhầm thành câu hỏi."""
        assert _is_faq_question(line) is False

    # -------------------------------------------------------------
    # 3. Kiểm thử parse toàn diện luồng FAQ
    # -------------------------------------------------------------

    def test_parse_faqs_with_modified_ui_headers(self) -> None:
        """Mô phỏng trang web V-GREEN đổi text tiêu đề section nhưng parser vẫn phân loại đúng."""
        mock_content = """
        Trang chủ
        FAQs

        Trạm sạc Ô tô điện
        Thời hạn thanh toán chi phí sạc ô tô điện tại trạm sạc V-Green như thế nào?
        Khách hàng có thể thanh toán trực tiếp hoặc qua ứng dụng VinFast trước ngày 14 hàng tháng.
        + Bước 1: Mở ứng dụng.
        + Bước 2: Chọn thanh toán.

        Thời gian được phép dừng đỗ ở trạm sạc là bao lâu?
        Sau khi sạc đầy quá 10 phút sẽ tính phí sử dụng vị trí sạc.

        Dành cho Xe máy điện
        Pin xe máy điện có thể đổi tại tủ pin không?
        Có, khách hàng có thể đổi pin tại các điểm tủ đổi pin tự động của V-Green.

        ĐĂNG KÝ ĐỐI TÁC
        Điền thông tin để trở thành đối tác trạm sạc.
        """

        faqs = parse_vgreen_faqs(mock_content, "https://vgreen.net/vi/cau-hoi-thuong-gap")

        assert len(faqs) == 3, f"Số câu hỏi trích xuất không khớp: {len(faqs)}"

        # Câu 1: Ô tô điện
        assert faqs[0]["section"] == "Ô tô điện"
        assert "Thời hạn thanh toán" in faqs[0]["question"]
        assert "+ Bước 1: Mở ứng dụng." in faqs[0]["answer"]

        # Câu 2: Ô tô điện
        assert faqs[1]["section"] == "Ô tô điện"
        assert "dừng đỗ" in faqs[1]["question"]

        # Câu 3: Xe máy điện
        assert faqs[2]["section"] == "Xe máy điện"
        assert "tủ pin" in faqs[2]["question"]
        assert "tủ đổi pin tự động" in faqs[2]["answer"]

    def test_parse_faqs_from_html_input(self) -> None:
        """Hỗ trợ bóc tách mượt mà ngay cả khi truyền trực tiếp chuỗi HTML."""
        html_input = """
        <div class="faq-container">
            <h2>Ô tô điện</h2>
            <div class="faq-item">
                <p class="question">Chi phí sạc pin ô tô điện được tính như thế nào?</p>
                <div class="answer">
                    <p>Đơn giá sạc là 3.858 VNĐ/kWh theo quy định.</p>
                </div>
            </div>
        </div>
        """
        faqs = parse_vgreen_faqs(html_input, "https://vgreen.net/vi/cau-hoi-thuong-gap")
        assert len(faqs) == 1
        assert faqs[0]["section"] == "Ô tô điện"
        assert "Chi phí sạc" in faqs[0]["question"]
        assert "3.858 VNĐ/kWh" in faqs[0]["answer"]
