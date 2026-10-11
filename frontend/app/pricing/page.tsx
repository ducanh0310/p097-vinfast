"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  HelpCircle,
  Building2,
  Users,
  Bot,
  Warehouse,
  BarChart3,
  Headphones,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  ChevronDown,
  PhoneCall,
  Laptop,
} from "lucide-react";
import { SiteNav } from "@/components/shared/site-nav";
import { formatVND } from "@/lib/format";

interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number; // giá tính theo tháng khi đóng theo năm
  popular?: boolean;
  idealFor: string;
  features: string[];
  limits: {
    users: string;
    aiChats: string;
    inventory: string;
    support: string;
  };
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Showroom Tiêu Chuẩn",
    tagline: "Khởi đầu số hóa quy trình bán hàng cho Showroom 1S hoặc đại lý độc lập",
    monthlyPrice: 2490000,
    yearlyPrice: 1990000,
    idealFor: "Đại lý 1S / Showroom trưng bày nhỏ (3 - 5 nhân viên sales)",
    limits: {
      users: "Tối đa 5 tài khoản tư vấn viên (Sellers)",
      aiChats: "1.500 lượt hội thoại tư vấn AI/tháng",
      inventory: "Quản lý 1 kho xe showroom (tới 50 xe)",
      support: "Hỗ trợ qua Email & Ticket (Giờ hành chính)",
    },
    features: [
      "Bộ tính giá lăn bánh Web Configurator 63 tỉnh thành",
      "AI Trợ lý tư vấn cấu hình xe tự động 24/7",
      "CRM quản lý Leads & Báo giá khách hàng cơ bản",
      "Xuất báo giá định dạng PDF chuẩn thương hiệu đại lý",
      "Báo cáo thống kê lượt xem & xe được quan tâm nhất",
      "Cập nhật bảng giá & chính sách khuyến mãi tự động",
    ],
  },
  {
    id: "pro",
    name: "Showroom 3S Chuyên Nghiệp",
    tagline: "Giải pháp toàn diện tăng 40% tỷ lệ chốt deal với AI Agent & HITL Portal",
    monthlyPrice: 5990000,
    yearlyPrice: 4790000,
    popular: true,
    idealFor: "Đại lý 3S chính hãng quy mô tiêu chuẩn (10 - 25 nhân sự)",
    limits: {
      users: "Tối đa 20 tài khoản (Sales, Quản lý kho, Giám đốc)",
      aiChats: "Không giới hạn lượt hội thoại AI Agent",
      inventory: "Quản lý tới 3 kho xe & bãi đệm (tới 300 xe)",
      support: "Hỗ trợ Hotline & Zalo riêng (Phản hồi < 15 phút)",
    },
    features: [
      "Toàn bộ tính năng của gói Showroom Tiêu Chuẩn",
      "Trình cấu hình 3D Car Configurator tương tác 360° siêu thực",
      "HITL Portal: Tư vấn viên duyệt báo giá & can thiệp chat real-time",
      "Tự động phân bổ Lead thông minh theo ca trực của tư vấn viên",
      "Quản lý số khung (VIN), số máy & ngày lưu kho chính xác",
      "Tích hợp thông báo qua Zalo ZNS / SMS tự động gửi báo giá",
      "Phân tích hành vi khách hàng & điểm tiềm năng chốt sales (Lead Scoring)",
      "Đào tạo & Onboarding trực tiếp cho đội ngũ nhân viên đại lý",
    ],
  },
  {
    id: "enterprise",
    name: "Chuỗi Hệ Thống Đại Lý",
    tagline: "Hệ thống quản trị tập trung đa chi nhánh, tùy biến AI & kết nối ERP/DMS",
    monthlyPrice: 12990000,
    yearlyPrice: 10390000,
    idealFor: "Tổng đại lý, tập đoàn sở hữu chuỗi nhiều showroom trên toàn quốc",
    limits: {
      users: "Không giới hạn tài khoản nhân viên & chi nhánh",
      aiChats: "Không giới hạn (Ưu tiên băng thông Dedicated AI Server)",
      inventory: "Quản lý không giới hạn kho xe toàn hệ thống chuỗi",
      support: "Chuyên viên Kỹ thuật & Account Manager riêng 24/7",
    },
    features: [
      "Toàn bộ tính năng của gói Showroom 3S Chuyên Nghiệp",
      "Kiến trúc Đa chi nhánh (Multi-tenancy): Quản trị tập trung toàn bộ chuỗi",
      "Mô hình AI Agent được tinh chỉnh (Fine-tuned) theo kịch bản chốt sales riêng",
      "Hệ thống API & Webhook mở kết nối trực tiếp SAP / Salesforce / DMS nội bộ",
      "Tên miền riêng & White-label thương hiệu đại lý hoàn toàn (Custom Domain)",
      "Báo cáo phân tích chuyên sâu đa chiều & Hiệu suất KPI từng tư vấn viên",
      "Cam kết chất lượng dịch vụ SLA 99.9% có ràng buộc hợp đồng",
      "Tùy biến luồng phê duyệt báo giá nhiều cấp bậc (Seller -> Trưởng phòng -> Giám đốc)",
    ],
  },
];

export default function DealerPricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[1]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form đăng ký đại lý
  const [dealerName, setDealerName] = useState("");
  const [contactName, setContactName] = useState("");
  const [position, setPosition] = useState("Giám đốc Đại lý / Showroom Manager");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [province, setProvince] = useState("Hà Nội");
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ regCode: string } | null>(null);

  // ROI Calculator State
  const [monthlyCarsSold, setMonthlyCarsSold] = useState(25);
  const [avgProfitPerCar, setAvgProfitPerCar] = useState(25000000); // 25tr/xe
  const [aiConversionBoost, setAiConversionBoost] = useState(15); // +15% conversion

  const additionalCars = Math.round((monthlyCarsSold * aiConversionBoost) / 100) || 1;
  const additionalMonthlyProfit = additionalCars * avgProfitPerCar;
  const planCost = billingCycle === "yearly" ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
  const netRoiRatio = Math.round((additionalMonthlyProfit / planCost) * 100);

  const openRegisterModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerName || !phone) {
      alert("Vui lòng điền tên đại lý và số điện thoại liên hệ!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/dealer-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealer_name: dealerName,
          contact_name: contactName,
          position,
          phone,
          email,
          province,
          plan_name: selectedPlan.name,
          billing_cycle: billingCycle,
          price: billingCycle === "yearly" ? selectedPlan.yearlyPrice * 12 : selectedPlan.monthlyPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng ký thất bại");

      setSuccessInfo({ regCode: data.reg_code || "DEALER-SAAS-2026-OK" });
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteNav />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#061226] via-[#0d2247] to-[#143265] py-20 text-white text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(37,99,235,0.25),transparent_70%)]" />
        <div className="relative mx-auto max-w-5xl px-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-blue-300 uppercase">
            <Building2 className="h-4 w-4" /> Bảng Giá Nền Tảng Dành Cho Đại Lý & Showroom 3S
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Số Hóa Showroom Bán Xe Với <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">VinFast AI Platform</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base text-slate-300 sm:text-lg">
            Nâng tầm trải nghiệm khách hàng với bộ tính giá lăn bánh 3D, trợ lý AI tư vấn thông minh 24/7,
            và cổng quản trị bán hàng (HITL Portal) giúp đại lý tăng 40% tốc độ chốt đơn.
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm font-semibold ${billingCycle === "monthly" ? "text-white" : "text-slate-400"}`}>
              Thanh toán theo tháng
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative inline-flex h-8 w-16 items-center rounded-full bg-blue-600 transition-colors focus:outline-none"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  billingCycle === "yearly" ? "translate-x-9" : "translate-x-1"
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${billingCycle === "yearly" ? "text-white" : "text-slate-400"}`}>
                Thanh toán theo năm
              </span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-xs font-extrabold text-emerald-300">
                Tiết kiệm 20%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="relative -mt-10 mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl bg-white p-8 transition-all duration-300 ${
                  isPopular
                    ? "border-2 border-blue-600 shadow-2xl shadow-blue-500/15 scale-105 z-10"
                    : "border border-slate-200 shadow-lg hover:border-slate-300"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-extrabold tracking-wider text-white uppercase shadow-md">
                    ★ Lựa Chọn Phổ Biến Nhất
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="mt-2 text-xs text-slate-500 min-h-[36px]">{plan.tagline}</p>
                </div>

                {/* Price Display */}
                <div className="mt-6 border-b border-slate-100 pb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                      {formatVND(price)}
                    </span>
                    <span className="text-xs text-slate-500">/tháng</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {billingCycle === "yearly" ? (
                      <>
                        Thanh toán theo năm: <strong>{formatVND(price * 12)}</strong>/năm
                      </>
                    ) : (
                      "Thanh toán định kỳ từng tháng"
                    )}
                  </div>
                </div>

                {/* Phù hợp cho */}
                <div className="mt-5 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 mb-1">Dành cho quy mô:</div>
                  <div>{plan.idealFor}</div>
                </div>

                {/* Giới hạn tài nguyên */}
                <div className="mt-5 space-y-2 border-b border-slate-100 pb-5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{plan.limits.users}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{plan.limits.aiChats}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{plan.limits.inventory}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{plan.limits.support}</span>
                  </div>
                </div>

                {/* Danh sách tính năng */}
                <div className="mt-5 flex-1 space-y-3 text-xs">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Tính năng nổi bật bao gồm:
                  </div>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-slate-700">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="mt-8 pt-4">
                  <button
                    type="button"
                    onClick={() => openRegisterModal(plan)}
                    className={`w-full rounded-2xl py-3.5 text-sm font-bold transition-all ${
                      isPopular
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    Đăng Ký Gói Này (Dùng Thử 14 Ngày)
                  </button>
                  <p className="mt-2 text-center text-[11px] text-slate-400">
                    Kích hoạt trong 24 giờ • Không yêu cầu thẻ tín dụng
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-950 py-16 text-white">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
              <TrendingUp className="h-4 w-4" /> Công Cụ Tính Toán Hiệu Quả Đầu Tư (ROI)
            </span>
            <h2 className="mt-4 text-2xl font-bold sm:text-4xl">
              Nền Tảng AI Mang Lại Lợi Nhuận Gấp Bao Nhiêu Lần Chi Phí?
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl mx-auto">
              Chỉ cần chốt thêm 1 chiếc xe mỗi tháng từ lượng khách vãng lai truy cập website vào ban đêm, đại lý đã hoàn lại gấp nhiều lần chi phí thuê bao!
            </p>
          </div>

          <div className="mt-10 grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-10 lg:grid-cols-12">
            {/* Input Sliders */}
            <div className="space-y-6 lg:col-span-7">
              <div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Số lượng xe đại lý bán trung bình / tháng:</span>
                  <span className="text-blue-400 font-bold">{monthlyCarsSold} xe/tháng</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={monthlyCarsSold}
                  onChange={(e) => setMonthlyCarsSold(parseInt(e.target.value))}
                  className="mt-2 w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Lợi nhuận gộp trung bình ước tính / 1 xe:</span>
                  <span className="text-emerald-400 font-bold">{formatVND(avgProfitPerCar)}</span>
                </div>
                <input
                  type="range"
                  min={10000000}
                  max={60000000}
                  step={5000000}
                  value={avgProfitPerCar}
                  onChange={(e) => setAvgProfitPerCar(parseInt(e.target.value))}
                  className="mt-2 w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Tỷ lệ tăng chuyển đổi nhờ AI tư vấn 24/7 & 3D Configurator:</span>
                  <span className="text-amber-400 font-bold">+{aiConversionBoost}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={35}
                  step={5}
                  value={aiConversionBoost}
                  onChange={(e) => setAiConversionBoost(parseInt(e.target.value))}
                  className="mt-2 w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Results Output */}
            <div className="flex flex-col justify-between rounded-2xl bg-white/10 p-6 border border-white/15 lg:col-span-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
                  Kết quả dự phóng hàng tháng
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-emerald-400">
                    +{formatVND(additionalMonthlyProfit)}
                  </span>
                  <span className="text-xs text-slate-300">/tháng</span>
                </div>
                <p className="mt-2 text-xs text-slate-300">
                  Nhờ chốt thêm được khoảng <strong>{additionalCars} xe</strong> mỗi tháng từ khách truy cập web và hội thoại tự động.
                </p>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Chi phí phần mềm ({selectedPlan.name}):</span>
                  <span className="font-semibold text-white">{formatVND(planCost)}/tháng</span>
                </div>
                <div className="mt-2 flex justify-between items-center text-sm font-bold text-white">
                  <span>Tỷ suất sinh lời (ROI):</span>
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-emerald-300 border border-emerald-400/40">
                    +{netRoiRatio}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix Table */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl text-slate-900">
            Bảng So Sánh Chi Tiết Tính Năng Các Gói
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Mọi tính năng cần thiết để vận hành và mở rộng quy mô đại lý ô tô điện thời đại số.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="py-4 px-5 font-bold text-sm">Tính năng nền tảng</th>
                <th className="py-4 px-4 font-bold text-center text-sm text-slate-800">Showroom Tiêu Chuẩn</th>
                <th className="py-4 px-4 font-bold text-center text-sm text-blue-700 bg-blue-50/50">Showroom 3S Pro</th>
                <th className="py-4 px-4 font-bold text-center text-sm text-indigo-900">Chuỗi Hệ Thống</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="bg-slate-100/50 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                <td colSpan={4} className="py-2.5 px-5">1. Trợ Lý AI & Tính Giá Xe Lăn Bánh</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Bảng tính giá lăn bánh 63 tỉnh thành tự động</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✔</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-blue-50/30">✔</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✔</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Trình cấu hình 3D Car Configurator tương tác xoay 360°</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-blue-50/30">✔</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✔</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Giới hạn phiên chat AI tư vấn xe</td>
                <td className="py-3 px-4 text-center">1.500 lượt/tháng</td>
                <td className="py-3 px-4 text-center font-bold text-blue-700 bg-blue-50/30">Không giới hạn</td>
                <td className="py-3 px-4 text-center font-bold text-blue-700">Không giới hạn</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Tinh chỉnh AI Agent theo kịch bản chốt sales riêng của đại lý</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-slate-300 bg-blue-50/30">—</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✔ (Dedicated)</td>
              </tr>

              <tr className="bg-slate-100/50 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                <td colSpan={4} className="py-2.5 px-5">2. Bán Hàng & Quản Trị Báo Giá (HITL)</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Cổng tư vấn viên duyệt báo giá (HITL Portal)</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-blue-50/30">✔</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✔</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Tự động phân bổ Lead thông minh theo ca trực</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-blue-50/30">✔</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✔</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Xuất báo giá PDF thương hiệu riêng</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✔</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-blue-50/30">✔</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✔</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Gửi báo giá qua Zalo ZNS / SMS tự động</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-blue-50/30">✔</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✔</td>
              </tr>

              <tr className="bg-slate-100/50 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                <td colSpan={4} className="py-2.5 px-5">3. Quản Trị Kho Xe & Hạ Tầng</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Quản lý kho xe showroom & số khung VIN</td>
                <td className="py-3 px-4 text-center">Tối đa 50 xe</td>
                <td className="py-3 px-4 text-center font-bold text-blue-700 bg-blue-50/30">Tới 300 xe</td>
                <td className="py-3 px-4 text-center font-bold text-blue-700">Không giới hạn</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Quản lý Đa chi nhánh tập trung (Multi-branch)</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-slate-300 bg-blue-50/30">—</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✔</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Tên miền riêng & White-label (showroom.ten-daily.vn)</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-slate-300 bg-blue-50/30">—</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✔</td>
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Tích hợp ERP / CRM / DMS nội bộ qua API</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-slate-300 bg-blue-50/30">—</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✔</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16 border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="text-center text-2xl font-bold sm:text-3xl text-slate-900">
            Câu Hỏi Thường Gặp Của Chủ Đại Lý
          </h2>

          <div className="mt-10 space-y-4 text-sm">
            <div className="rounded-2xl border border-slate-200 p-5">
              <h4 className="font-bold text-slate-900">
                1. Thời gian triển khai và bàn giao hệ thống cho đại lý mất bao lâu?
              </h4>
              <p className="mt-2 text-slate-600 text-xs">
                Sau khi xác nhận đăng ký gói dịch vụ, chuyên viên kỹ thuật của VinFast sẽ cấu hình thông tin đại lý, logo, bảng giá và kho xe trong vòng <strong>24 giờ làm việc</strong> và bàn giao tài khoản quản trị cho đại lý sử dụng ngay.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h4 className="font-bold text-slate-900">
                2. Dữ liệu khách hàng (Leads) của đại lý có được bảo mật riêng biệt không?
              </h4>
              <p className="mt-2 text-slate-600 text-xs">
                Hoàn toàn riêng biệt và bảo mật tuyệt đối theo tiêu chuẩn mã hóa đám mây. Mỗi đại lý sở hữu cơ sở dữ liệu phân quyền độc lập, các đại lý khác hoặc bên thứ ba hoàn toàn không thể truy cập danh sách khách hàng của bạn.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h4 className="font-bold text-slate-900">
                3. Đội ngũ nhân viên bán hàng của đại lý có được hướng dẫn sử dụng không?
              </h4>
              <p className="mt-2 text-slate-600 text-xs">
                Có. Chúng tôi cung cấp tài liệu hướng dẫn trực quan, video đào tạo từng bước và có buổi đào tạo Onboarding trực tuyến hoặc trực tiếp tại đại lý để đảm bảo toàn bộ tư vấn viên đều sử dụng thành thạo cổng duyệt báo giá và quản lý leads.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h4 className="font-bold text-slate-900">
                4. Chính sách dùng thử 14 ngày miễn phí hoạt động như thế nào?
              </h4>
              <p className="mt-2 text-slate-600 text-xs">
                Đại lý được trải nghiệm toàn bộ tính năng cao cấp của gói Showroom 3S Pro trong vòng 14 ngày mà không phải thanh toán bất kỳ chi phí nào trước. Sau 14 ngày, nếu đại lý hài lòng mới tiến hành ký hợp đồng sử dụng chính thức.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL ĐĂNG KÝ GÓI SAAS CHO ĐẠI LÝ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Đăng Ký Gói {selectedPlan.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Kích hoạt dùng thử 14 ngày miễn phí cho Đại lý / Showroom
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setSuccessInfo(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {successInfo ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="mt-4 text-xl font-bold text-slate-900">
                  Đăng Ký Thành Công!
                </h4>
                <p className="mt-2 text-xs text-slate-600">
                  Mã tiếp nhận đại lý: <strong className="font-mono text-blue-700">{successInfo.regCode}</strong>
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Chuyên viên phụ trách giải pháp đại lý sẽ liên hệ với bạn trong vòng <strong>2 giờ làm việc</strong> để bàn giao tài khoản quản trị và hướng dẫn kích hoạt.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setSuccessInfo(null);
                  }}
                  className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Xác Nhận & Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3.5 text-xs">
                <div className="rounded-xl bg-blue-50 p-3 border border-blue-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-blue-900">{selectedPlan.name}</span>
                    <span className="text-slate-500 block text-[11px]">
                      Hình thức: {billingCycle === "yearly" ? "Đóng theo năm (Tiết kiệm 20%)" : "Đóng theo tháng"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-blue-700 text-sm">
                      {formatVND(billingCycle === "yearly" ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">/tháng</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên Đại lý / Showroom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: VinFast Showroom Cầu Giấy 3S"
                    value={dealerName}
                    onChange={(e) => setDealerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Họ tên người liên hệ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Chức vụ
                    </label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0912 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tỉnh / Thành phố
                    </label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
                    >
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Hải Phòng">Hải Phòng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                      <option value="Bình Dương">Bình Dương</option>
                      <option value="Khác">Tỉnh thành khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email nhận thông tin tài khoản
                  </label>
                  <input
                    type="email"
                    placeholder="contact@daily-vinfast.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? "Đang gửi thông tin..." : "Xác Nhận Kích Hoạt 14 Ngày Miễn Phí"}
                  </button>
                  <p className="mt-2 text-center text-[10px] text-slate-400">
                    Bằng việc bấm xác nhận, đại lý đồng ý với chính sách dịch vụ đối tác của VinFast Platform.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
