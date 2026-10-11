import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const planName = body.plan_name || "Gói Pro 3S";
    const billingCycle = body.billing_cycle === "yearly" ? "Theo năm (Tiết kiệm 20%)" : "Theo tháng";

    let leadId: string | null = null;
    try {
      const res = await fetch(`${BACKEND}/api/v1/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: body.session_id || `dealer_${Date.now()}`,
          name: `${body.dealer_name} (LH: ${body.contact_name} - ${body.position})`,
          phone: body.phone,
          province: body.province || "Hà Nội",
          interested_in: `Đăng ký SaaS Đại lý: ${planName} (${billingCycle}) - Quy mô: ${body.team_size || "10-20"} nhân sự`,
          budget: body.price || 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        leadId = data.id;
      }
    } catch (e) {
      console.warn("Backend lead creation notice:", e);
    }

    const regCode = `DEALER-SAAS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      success: true,
      reg_code: regCode,
      lead_id: leadId,
      message: "Đăng ký gói giải pháp đại lý thành công. Chuyên viên VinFast sẽ liên hệ kích hoạt tài khoản trong vòng 2 giờ.",
    });
  } catch (error) {
    console.error("Dealer registration API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
