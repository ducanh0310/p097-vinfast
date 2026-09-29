"""Unit tests cho logic trích xuất dòng xe (extract_related_models).

Kiểm thử:
1. Độ chính xác khi nhận diện các dòng xe ô tô và xe máy điện VinFast.
2. Khả năng chống False Positive (PR Review: Broad Regex Matching):
   - Không bắt nhầm từ 'evolution', 'revolution' thành xe máy dòng Evo.
   - Không bắt nhầm chữ 'Green' (sống xanh, cây xanh) thành Limo/Herio/Minio Green.
   - Không bắt nhầm số xe mở rộng như 'VF 30', 'VF 80' thành 'VF 3', 'VF 8'.
"""

from __future__ import annotations

import pytest

from src.data_pipeline.crawlers.crawler_utils import extract_related_models


class TestExtractRelatedModels:
    """Bộ kiểm thử cho hàm extract_related_models."""

    # -------------------------------------------------------------
    # 1. Chống False Positives (Critical Review Feedback)
    # -------------------------------------------------------------

    @pytest.mark.parametrize(
        "text",
        [
            "Cuộc cách mạng xe điện (evolution of electric vehicles) đang bùng nổ.",
            "Phát triển phần mềm (software development) là thế mạnh cốt lõi.",
            "Tập đoàn mang đến giải pháp công nghệ mang tính revolution.",
            "Felizmente (tiếng Tây Ban Nha nghĩa là hạnh phúc) không phải xe máy.",
        ],
    )
    def test_no_false_positive_on_substring_words(self, text: str) -> None:
        """Đảm bảo các từ chứa substring như 'evo', 'feliz' KHÔNG bị nhận diện nhầm thành xe máy."""
        matched = extract_related_models(text)
        assert matched == [], f"Phát hiện false positive ngoài ý muốn: {matched}"

    @pytest.mark.parametrize(
        "text",
        [
            "Cam kết phát triển tương lai xanh (green future) và bền vững.",
            "Trạm sạc V-GREEN phủ sóng toàn quốc khắp 63 tỉnh thành.",
            "Màu sơn xanh lá cây (green) rất được ưa chuộng.",
        ],
    )
    def test_no_false_positive_on_generic_green(self, text: str) -> None:
        """Chữ 'green' thông thường không được match thành các xe dịch vụ Limo/Herio/Minio Green."""
        matched = extract_related_models(text)
        assert matched == [], f"Chữ 'green' bị match nhầm: {matched}"

    @pytest.mark.parametrize(
        "text",
        [
            "Dự án VF 30 và VF 88 vẫn đang nằm trong kế hoạch.",
            "Số điện thoại liên hệ: 0987654321.",
            "Năm 2026 ghi nhận mức tăng trưởng đột phá.",
        ],
    )
    def test_no_false_positive_on_similar_numbers(self, text: str) -> None:
        """Đảm bảo VF 30 không bị nhận diện nhầm thành VF 3, số ngẫu nhiên không gây nhiễu."""
        matched = extract_related_models(text)
        assert matched == []

    # -------------------------------------------------------------
    # 2. Nhận diện chính xác ô tô điện
    # -------------------------------------------------------------

    def test_match_standard_vf_models(self) -> None:
        """Nhận diện đúng các dòng xe VF viết cách hoặc viết liền."""
        text = "Khách hàng cân nhắc giữa VF 3, VF3 và VF 8."
        matched = extract_related_models(text)
        assert "VF 3" in matched
        assert "VF 8" in matched

    def test_match_special_car_models(self) -> None:
        """Nhận diện đúng các dòng xe có tên đặc thù."""
        text = "VinFast giới thiệu Limo Green phục vụ taxi, xe bán tải VF Wild và xe van chở hàng EC Van."
        matched = extract_related_models(text)
        assert "Limo Green" in matched
        assert "VF Wild" in matched
        assert "EC Van" in matched

    def test_match_vf8_the_all_new(self) -> None:
        """Nhận diện đúng biến thể VF 8 The All New."""
        text = "Sự kiện ra mắt phiên bản nâng cấp VF 8 The All New."
        matched = extract_related_models(text)
        assert "VF 8 The All New" in matched

    # -------------------------------------------------------------
    # 3. Nhận diện chính xác xe máy điện
    # -------------------------------------------------------------

    def test_match_bike_models_variations(self) -> None:
        """Nhận diện xe máy điện với định dạng viết liền hoặc cách đều linh hoạt."""
        text = "Danh sách xe máy điện gồm Evo200 Lite, Evo 200, Feliz S và Theon-S."
        matched = extract_related_models(text)
        assert "Evo200 Lite" in matched
        assert "Evo200" in matched
        assert "Feliz S" in matched
        assert "Theon-S" in matched

    def test_empty_or_whitespace_input(self) -> None:
        """Xử lý an toàn khi đầu vào rỗng hoặc chỉ có khoảng trắng."""
        assert extract_related_models("") == []
        assert extract_related_models("   \n\t  ") == []
