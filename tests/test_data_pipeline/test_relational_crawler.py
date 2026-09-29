"""Unit tests cho module relational_crawler (fetch_rolling_data).

Kiểm thử:
1. Khả năng chống Potential API Failure (PR Review feedback):
   - Cơ chế Session Handshake và thiết lập cookie.
   - Vòng lặp Retry với Backoff khi mạng chập chờn hoặc API lỗi.
   - Tự động nạp dữ liệu từ local snapshot dự phòng khi API mất kết nối.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock, patch

import pytest

from src.data_pipeline.crawlers.relational_crawler import fetch_rolling_data


class TestFetchRollingData:
    """Bộ kiểm thử cho hàm fetch_rolling_data."""

    @pytest.fixture
    def mock_rolling_payload(self) -> dict[str, Any]:
        """Tạo payload mẫu hợp lệ của API VinFast."""
        return {
            "vehicles": {"cars": {"models": [{"id": "vf3", "name": "VF 3"}]}},
            "objects": {"costs": [], "colors": {}},
        }

    def test_fetch_success_and_saves_snapshot(
        self, tmp_path: Path, mock_rolling_payload: dict[str, Any]
    ) -> None:
        """API trả về thành công -> nạp dữ liệu và lưu snapshot dự phòng."""
        fake_snapshot = tmp_path / "snapshot.json"
        payload_bytes = json.dumps(mock_rolling_payload).encode("utf-8")

        mock_resp = MagicMock()
        mock_resp.read.return_value = payload_bytes

        with patch("urllib.request.build_opener") as mock_opener_cls:
            mock_opener = MagicMock()
            mock_opener.open.return_value.__enter__.return_value = mock_resp
            mock_opener_cls.return_value = mock_opener

            data = fetch_rolling_data(
                max_retries=1,
                session_handshake=True,
                cache_path=fake_snapshot,
            )

            assert data == mock_rolling_payload
            assert fake_snapshot.exists()
            with open(fake_snapshot, encoding="utf-8") as f:
                saved = json.load(f)
            assert saved == mock_rolling_payload

    def test_api_failure_fallback_to_local_snapshot(
        self, tmp_path: Path, mock_rolling_payload: dict[str, Any]
    ) -> None:
        """API thất bại -> tự động fallback sang local snapshot đã lưu trước đó."""
        fake_snapshot = tmp_path / "snapshot.json"
        with open(fake_snapshot, "w", encoding="utf-8") as f:
            json.dump(mock_rolling_payload, f)

        with patch("urllib.request.build_opener") as mock_opener_cls:
            mock_opener = MagicMock()
            mock_opener.open.side_effect = TimeoutError("Connection timed out")
            mock_opener_cls.return_value = mock_opener

            data = fetch_rolling_data(
                max_retries=2,
                session_handshake=False,
                use_cache_fallback=True,
                cache_path=fake_snapshot,
            )

            assert data == mock_rolling_payload

    def test_api_failure_without_snapshot_raises_error(self, tmp_path: Path) -> None:
        """API thất bại và không có snapshot dự phòng -> ném RuntimeError rõ ràng."""
        fake_snapshot = tmp_path / "non_existent.json"

        with patch("urllib.request.build_opener") as mock_opener_cls:
            mock_opener = MagicMock()
            mock_opener.open.side_effect = ConnectionResetError("Connection reset")
            mock_opener_cls.return_value = mock_opener

            with pytest.raises(RuntimeError, match="Không thể tải dữ liệu từ API VinFast"):
                fetch_rolling_data(
                    max_retries=1,
                    session_handshake=False,
                    use_cache_fallback=True,
                    cache_path=fake_snapshot,
                )
