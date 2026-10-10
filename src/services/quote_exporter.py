import html
from typing import Any

from src.orm_models import Quote


def generate_quote_html(quote: Quote) -> str:
    """Tạo HTML báo giá chi tiết, định dạng chuyên nghiệp phục vụ in ấn hoặc xuất PDF."""
    snapshot: dict[str, Any] = quote.price_snapshot or {}
    lead = quote.lead

    customer_name = lead.name if lead else "Khách hàng"
    customer_phone = lead.phone if lead else "—"
    created_str = quote.created_at.strftime("%d/%m/%Y %H:%M") if quote.created_at else ""

    base_price = snapshot.get("base_price", quote.final_price)
    battery_cost = snapshot.get("battery_cost", 0)
    accessories = snapshot.get("accessories", [])
    rolling_costs = snapshot.get("rolling_costs", {})
    promotions = snapshot.get("promotions", [])
    final_price = quote.final_price

    def format_money(val: int | float) -> str:
        return f"{int(val):,}".replace(",", ".") + " VNĐ"

    accessories_rows = "".join(
        f"<tr><td>{html.escape(item.get('name', 'Phụ kiện'))}</td><td style='text-align: right;'>{format_money(item.get('price', 0))}</td></tr>"
        for item in accessories
    ) or "<tr><td colspan='2' style='color: #6b7280; font-style: italic;'>Không có phụ kiện kèm theo</td></tr>"

    promo_rows = "".join(
        f"<tr><td>{html.escape(item.get('name', 'Ưu đãi'))}</td><td style='text-align: right; color: #16a34a;'>-{format_money(item.get('discount_amount', 0))}</td></tr>"
        for item in promotions
    ) or "<tr><td colspan='2' style='color: #6b7280; font-style: italic;'>Không có chương trình ưu đãi áp dụng</td></tr>"

    rolling_rows = "".join(
        f"<tr><td>{html.escape(k.replace('_', ' ').title())}</td><td style='text-align: right;'>{format_money(v)}</td></tr>"
        for k, v in rolling_costs.items()
        if isinstance(v, (int, float))
    )

    return f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Báo giá xe VinFast - {html.escape(quote.model)} {html.escape(quote.version)}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; margin: 40px; }}
    .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }}
    .brand {{ font-size: 24px; font-weight: bold; color: #1e40af; }}
    .tagline {{ font-size: 13px; color: #6b7280; }}
    .quote-meta {{ text-align: right; font-size: 13px; color: #4b5563; }}
    .section-title {{ font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 8px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }}
    table {{ width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 14px; }}
    th, td {{ padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }}
    th {{ background: #f9fafb; text-align: left; font-weight: 600; color: #374151; }}
    .total-box {{ background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin-top: 25px; }}
    .total-row {{ display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #1e3a8a; }}
    .footer {{ margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; }}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">VINFAST AUTO</div>
      <div class="tagline">Hệ Thống Đại Lý Ủy Quyền Chính Hãng</div>
    </div>
    <div class="quote-meta">
      <div><strong>Mã báo giá:</strong> {html.escape(str(quote.id)[:8]).upper()}</div>
      <div><strong>Ngày tạo:</strong> {created_str}</div>
      <div><strong>Trạng thái:</strong> {html.escape(quote.status.value.upper() if quote.status else "PENDING")}</div>
    </div>
  </div>

  <div class="section-title">THÔNG TIN KHÁCH HÀNG & PHƯƠNG TIỆN</div>
  <table>
    <tr><th style="width: 25%;">Khách hàng</th><td>{html.escape(customer_name)}</td><th style="width: 20%;">Số điện thoại</th><td>{html.escape(customer_phone)}</td></tr>
    <tr><th>Mẫu xe & Phiên bản</th><td><strong>{html.escape(quote.model)} {html.escape(quote.version)}</strong></td><th>Tỉnh / Thành phố</th><td>{html.escape(quote.province)}</td></tr>
    <tr><th>Màu ngoại thất</th><td>{html.escape(quote.color)}</td><th>Gói pin</th><td>{html.escape(quote.battery)}</td></tr>
  </table>

  <div class="section-title">CHI TIẾT DỰ TOÁN BÁO GIÁ</div>
  <table>
    <thead><tr><th>Khoản mục</th><th style="text-align: right; width: 35%;">Số tiền (VNĐ)</th></tr></thead>
    <tbody>
      <tr><td>Giá niêm yết xe</td><td style="text-align: right;">{format_money(base_price)}</td></tr>
      <tr><td>Chi phí Pin ({html.escape(quote.battery)})</td><td style="text-align: right;">{format_money(battery_cost)}</td></tr>
      {accessories_rows}
      {promo_rows}
      {rolling_rows}
    </tbody>
  </table>

  <div class="total-box">
    <div class="total-row">
      <span>TỔNG CHI PHÍ DỰ TOÁN (LĂN BÁNH):</span>
      <span>{format_money(final_price)}</span>
    </div>
    <div style="font-size: 13px; color: #4b5563; margin-top: 5px;">
      * Giá lăn bánh đã bao gồm lệ phí trước bạ, biển số, bảo hiểm TNDS & các chi phí lưu hành áp dụng tại {html.escape(quote.province)}.
    </div>
  </div>

  {f'<div style="margin-top: 15px; font-size: 13px; color: #4b5563;"><strong>Ghi chú tư vấn:</strong> {html.escape(quote.seller_note)}</div>' if quote.seller_note else ''}

  <div class="footer">
    Báo giá có giá trị tham khảo theo bảng giá phiên bản {html.escape(quote.price_version or "Hiện hành")}. Vui lòng liên hệ đại lý chính hãng để nhận hợp đồng chính thức.
  </div>
</body>
</html>
"""
