import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Tạo Lead doanh nghiệp
    let leadId: string | null = null;
    try {
      const leadRes = await fetch(`${BACKEND}/api/v1/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: body.session_id || `corp_${Date.now()}`,
          name: `${body.company_name} (LH: ${body.contact_name} - ${body.position})`,
          phone: body.phone,
          province: body.province || "Hà Nội",
          interested_in: `Đội xe B2B: ${body.summary_models} (Tổng ${body.total_quantity} xe)`,
          budget: body.final_total_price,
        }),
      });
      if (leadRes.ok) {
        const leadData = await leadRes.json();
        leadId = leadData.id;
      }
    } catch (e) {
      console.warn("Backend leads endpoint notice:", e);
    }

    // 2. Tạo Quote nếu có dòng xe chính
    let quoteId: string | null = null;
    if (body.primary_quote) {
      try {
        const quoteRes = await fetch(`${BACKEND}/api/v1/quotes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: body.session_id || `corp_${Date.now()}`,
            buyer_name: body.company_name,
            buyer_phone: body.phone,
            model: body.primary_quote.model || "VF8",
            version: body.primary_quote.version || "Plus",
            color: "Doanh nghiệp",
            battery: body.primary_quote.battery || "buy",
            province: body.province || "Hà Nội",
            accessories: body.addons || [],
            price_snapshot: {
              company_name: body.company_name,
              tax_id: body.tax_id,
              total_quantity: body.total_quantity,
              items: body.items,
              discount_percent: body.discount_percent,
              discount_amount: body.discount_amount,
              final_total_price: body.final_total_price,
            },
            price_version: "2026-CORP-B2B",
            final_price: body.final_total_price,
          }),
        });
        if (quoteRes.ok) {
          const qData = await quoteRes.json();
          quoteId = qData.id;
        }
      } catch (e) {
        console.warn("Backend quotes endpoint notice:", e);
      }
    }

    const refCode = `VF-B2B-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      success: true,
      ref_code: refCode,
      lead_id: leadId,
      quote_id: quoteId,
      message: "Yêu cầu báo giá doanh nghiệp đã được tiếp nhận thành công",
    });
  } catch (error) {
    console.error("Business quote API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
