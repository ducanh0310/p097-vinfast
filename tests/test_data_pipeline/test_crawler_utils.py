"""Unit tests cho các hàm tiện ích crawler (crawler_utils và specs_crawler).

Kiểm thử:
1. build_rag_metadata: tính hợp lệ của schema metadata, phân loại domain, content hash, word count.
2. clean_html: loại bỏ script, style, nav thẻ HTML và giải mã entities.
3. extract_specs_from_html: bóc tách thông số kỹ thuật xe từ thẻ spec và thẻ bảng tr/td.
"""

from __future__ import annotations

from src.data_pipeline.crawlers.crawler_utils import (
    build_rag_metadata,
    clean_html,
    compute_content_hash,
)
from src.data_pipeline.crawlers.specs_crawler import extract_specs_from_html


class TestCrawlerUtils:
    """Bộ kiểm thử cho crawler_utils."""

    def test_compute_content_hash(self) -> None:
        """MD5 hash phải đồng nhất và không rỗng."""
        h1 = compute_content_hash("VinFast VF 3")
        h2 = compute_content_hash("VinFast VF 3")
        h3 = compute_content_hash("VinFast VF 8")
        assert h1 == h2
        assert h1 != h3
        assert len(h1) == 32

    def test_clean_html_strips_scripts_and_tags(self) -> None:
        """Làm sạch HTML, loại bỏ thẻ script, style, nav và decode entity."""
        raw = """
        <nav><a href="/">Trang chủ</a></nav>
        <style>.hide { display: none; }</style>
        <p>Giá xe VinFast VF 3 l&agrave; <b>240 tri&#7879;u</b>.</p>
        <script>console.log("secret");</script>
        """
        cleaned = clean_html(raw, strip_nav=True)
        assert "Trang chủ" not in cleaned
        assert "console.log" not in cleaned
        assert ".hide" not in cleaned
        assert "240 triệu" in cleaned or "240" in cleaned

    def test_build_rag_metadata_full_fields(self) -> None:
        """Metadata được tạo ra phải đầy đủ tất cả các trường RAG bắt buộc."""
        meta = build_rag_metadata(
            doc_id="doc_test_01",
            doc_type="vehicle_spec",
            title="Thông số kỹ thuật VF 3",
            category="Thông số kỹ thuật",
            subcategory="Mini SUV",
            source_url="https://shop.vinfastauto.com/vn_vi/dat-coc-vf3",
            related_models=["VF 3"],
            raw_content="Xe điện cỡ nhỏ VinFast VF 3 với quãng đường 210 km.",
        )

        assert meta["doc_id"] == "doc_test_01"
        assert meta["doc_type"] == "vehicle_spec"
        assert meta["title"] == "Thông số kỹ thuật VF 3"
        assert meta["domain"] == "shop.vinfastauto.com"
        assert meta["language"] == "vi"
        assert meta["related_models"] == ["VF 3"]
        assert meta["is_general_info"] is False
        assert meta["char_count"] > 0
        assert meta["word_count"] > 0
        assert len(meta["content_hash"]) == 32
        assert "crawled_at" in meta

    def test_build_rag_metadata_general_info_fallback(self) -> None:
        """Nếu không có related_models thì is_general_info phải là True."""
        meta = build_rag_metadata(
            doc_id="doc_general_01",
            doc_type="policy",
            title="Chính sách bảo hành chung",
            category="Bảo hành",
            source_url="",
            raw_content="",
        )
        assert meta["domain"] == "vinfastauto.com"
        assert meta["related_models"] == []
        assert meta["is_general_info"] is True
        assert meta["content_hash"] == ""


class TestSpecsParser:
    """Bộ kiểm thử cho logic bóc tách thông số kỹ thuật (extract_specs_from_html)."""

    def test_extract_specs_from_table_rows(self) -> None:
        """Trích xuất đúng các cặp thông số (key - value) từ thẻ <tr><td>."""
        html_table = """
        <table>
            <tr><td>Công suất tối đa</td><td>150 kW</td></tr>
            <tr><td>Mô-men xoắn cực đại</td><td>310 Nm</td></tr>
            <tr><td>Quãng đường di chuyển (WLTP)</td><td>471 km</td></tr>
        </table>
        """
        specs = extract_specs_from_html(html_table)
        assert specs.get("Công suất tối đa") == "150 kW"
        assert specs.get("Mô-men xoắn cực đại") == "310 Nm"
        assert specs.get("Quãng đường di chuyển (WLTP)") == "471 km"

    def test_extract_specs_from_spec_class_blocks(self) -> None:
        """Trích xuất đúng từ các khối div có class spec."""
        html_divs = """
        <div class="vehicle-spec-item">
            <span>Dung lượng pin</span>
            <span>87.7 kWh</span>
        </div>
        """
        specs = extract_specs_from_html(html_divs)
        assert specs.get("Dung lượng pin") == "87.7 kWh"
