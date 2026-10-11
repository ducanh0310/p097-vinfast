"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingDown,
  ShieldCheck,
  FileText,
  Printer,
  Plus,
  Trash2,
  PhoneCall,
  Download,
  AlertCircle,
  HelpCircle,
  Layers,
  Fuel,
  BatteryCharging,
  ArrowRight,
} from "lucide-react";
import { SiteNav } from "@/components/shared/site-nav";
import { VEHICLES, PROVINCES, VehicleKey } from "@/lib/vehicle-data";
import { formatVND, formatNumber } from "@/lib/format";

interface FleetItem {
  id: string;
  model: VehicleKey;
  versionId: string;
  battery: "buy" | "rent";
  quantity: number;
}

const DEFAULT_FLEET: FleetItem[] = [
  { id: "1", model: "VF5", versionId: "vf5_plus", battery: "buy", quantity: 5 },
  { id: "2", model: "VF8", versionId: "vf8_plus", battery: "buy", quantity: 2 },
];

export default function BusinessQuotePage() {
  const [fleet, setFleet] = useState<FleetItem[]>(DEFAULT_FLEET);
  const [provinceKey, setProvinceKey] = useState<string>("HN");

  // Form thông tin doanh nghiệp
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [contactName, setContactName] = useState("");
  const [position, setPosition] = useState("Quản lý đội xe (Fleet Manager)");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  // Nhu cầu gia tăng
  const [needsCharger, setNeedsCharger] = useState(true);
  const [needsFinance, setNeedsFinance] = useState(true);
  const [needsBranding, setNeedsBranding] = useState(false);
  const [needsDriverTraining, setNeedsDriverTraining] = useState(false);

  // Trạng thái gửi
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    refCode: string;
    submittedAt: string;
  } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Thêm xe mới vào đội
  const addFleetItem = () => {
    const newItem: FleetItem = {
      id: Math.random().toString(36).slice(2, 9),
      model: "VF6",
      versionId: "vf6_plus",
      battery: "buy",
      quantity: 3,
    };
    setFleet([...fleet, newItem]);
  };

  const removeFleetItem = (id: string) => {
    if (fleet.length <= 1) return;
    setFleet(fleet.filter((f) => f.id !== id));
  };

  const updateFleetItem = (id: string, updates: Partial<FleetItem>) => {
    setFleet(
      fleet.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        // Nếu đổi model thì reset version sang version đầu tiên của model đó
        if (updates.model && updates.model !== item.model) {
          const vData = VEHICLES[updates.model];
          updated.versionId = vData.versions[0]?.id || "";
        }
        return updated;
      })
    );
  };

  // Tính toán chi phí
  const calculation = useMemo(() => {
    let totalQuantity = 0;
    let baseTotal = 0;

    const detailedItems = fleet.map((item) => {
      const v = VEHICLES[item.model];
      const ver = v.versions.find((x) => x.id === item.versionId) || v.versions[0];
      const vehiclePrice = ver.price;
      const batteryPrice = item.battery === "buy" ? v.battery.buy : 0;
      const monthlyBatteryRent = item.battery === "rent" ? v.battery.rent : 0;
      const unitPrice = vehiclePrice + batteryPrice;
      const itemTotal = unitPrice * item.quantity;

      totalQuantity += item.quantity;
      baseTotal += itemTotal;

      return {
        ...item,
        modelLabel: v.label,
        versionLabel: ver.label,
        unitPrice,
        batteryPrice,
        monthlyBatteryRent,
        itemTotal,
      };
    });

    // Bậc chiết khấu theo số lượng (Volume Tier Discount)
    let discountPercent = 0;
    let tierTitle = "Ưu đãi Tiêu chuẩn";
    let tierPerks: string[] = [];

    if (totalQuantity >= 16) {
      discountPercent = 0.06; // 6%
      tierTitle = "Bậc Kim Cương (16+ xe)";
      tierPerks = [
        "Chiết khấu trực tiếp 6% trên tổng giá trị lô xe",
        "Tặng gói lắp đặt Trạm sạc nhanh DC chuyên dụng tại bãi đỗ công ty",
        "Hỗ trợ gói vay lãi suất 0% trong 12 tháng đầu từ ngân hàng đối tác",
        "Đặc quyền Dịch vụ cứu hộ & Bảo dưỡng lưu động VIP 24/7",
      ];
    } else if (totalQuantity >= 6) {
      discountPercent = 0.04; // 4%
      tierTitle = "Bậc Vàng (6 - 15 xe)";
      tierPerks = [
        "Chiết khấu trực tiếp 4% trên tổng giá trị lô xe",
        "Hỗ trợ 50% chi phí lắp đặt cụm trụ sạc AC tại văn phòng",
        "Tặng 2 năm bảo hiểm thân vỏ thương mại cho toàn bộ đội xe",
        "Ưu tiên cấp số khung và giao xe sớm theo hợp đồng",
      ];
    } else if (totalQuantity >= 3) {
      discountPercent = 0.02; // 2%
      tierTitle = "Bậc Bạc (3 - 5 xe)";
      tierPerks = [
        "Chiết khấu trực tiếp 2% trên tổng giá trị lô xe",
        "Tặng 1 năm bảo hiểm thân vỏ chính hãng",
        "Gói đào tạo hướng dẫn quản trị và vận hành xe điện cho tài xế",
      ];
    } else {
      tierTitle = "Doanh nghiệp Khởi điểm (1 - 2 xe)";
      tierPerks = [
        "Chính sách bảo hành 7-10 năm hoặc 200.000 km",
        "Hỗ trợ miễn 100% lệ phí trước bạ xe điện",
      ];
    }

    const discountAmount = Math.round(baseTotal * discountPercent);
    const afterDiscount = baseTotal - discountAmount;

    // Chi phí lăn bánh ước tính (xe điện được MIỄN 100% Lệ phí trước bạ theo Nghị định 10/2022/NĐ-CP)
    const prov = PROVINCES[provinceKey] || PROVINCES.HN;
    const plateFeeTotal = prov.plateFee * totalQuantity;
    const inspectionFeeTotal = 340000 * totalQuantity; // Phí đăng kiểm
    const roadFeeTotal = 2160000 * totalQuantity; // Phí sử dụng đường bộ doanh nghiệp (180k/tháng)
    const insuranceTotal = 1500000 * totalQuantity; // TNDS bắt buộc kinh doanh

    const rollingFeesTotal = plateFeeTotal + inspectionFeeTotal + roadFeeTotal + insuranceTotal;
    const grandTotal = afterDiscount + rollingFeesTotal;

    // Phân tích TCO (Total Cost of Ownership) so sánh với xe xăng (tính trung bình 3.000 km/xe/tháng)
    const avgKmPerMonth = 3000;
    const gasCostPerKm = 2200; // Xe xăng ~8L/100km * 25.000đ
    const evCostPerKm = 650; // Xe điện ~16-18 kWh/100km * 3.858đ/kWh
    const monthlyGasTotal = totalQuantity * avgKmPerMonth * gasCostPerKm;
    const monthlyEvTotal = totalQuantity * avgKmPerMonth * evCostPerKm;
    const monthlySavings = monthlyGasTotal - monthlyEvTotal;
    const yearlySavings = monthlySavings * 12;
    const threeYearSavings = yearlySavings * 3;

    return {
      totalQuantity,
      detailedItems,
      baseTotal,
      discountPercent,
      discountAmount,
      afterDiscount,
      tierTitle,
      tierPerks,
      rollingFeesTotal,
      plateFeeTotal,
      inspectionFeeTotal,
      roadFeeTotal,
      insuranceTotal,
      grandTotal,
      tco: {
        monthlySavings,
        yearlySavings,
        threeYearSavings,
      },
    };
  }, [fleet, provinceKey]);

  // Submit form gửi báo giá
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !phone) {
      alert("Vui lòng điền đầy đủ Tên công ty và Số điện thoại liên hệ!");
      return;
    }

    setSubmitting(true);
    try {
      const summaryModels = calculation.detailedItems
        .map((i) => `${i.quantity}x ${i.modelLabel} ${i.versionLabel}`)
        .join(", ");

      const payload = {
        session_id: `b2b_${Date.now()}`,
        company_name: companyName,
        tax_id: taxId,
        contact_name: contactName,
        position,
        phone,
        email,
        province: PROVINCES[provinceKey]?.label || "Hà Nội",
        summary_models: summaryModels,
        total_quantity: calculation.totalQuantity,
        discount_percent: calculation.discountPercent,
        discount_amount: calculation.discountAmount,
        final_total_price: calculation.grandTotal,
        items: calculation.detailedItems,
        addons: [
          needsCharger && "Lắp trạm sạc tại trụ sở công ty",
          needsFinance && "Tư vấn gói vay/Leasing doanh nghiệp",
          needsBranding && "Dán Decal thương hiệu công ty",
          needsDriverTraining && "Đào tạo tài xế vận hành",
          note && `Ghi chú: ${note}`,
        ].filter(Boolean),
        primary_quote: calculation.detailedItems[0]
          ? {
              model: calculation.detailedItems[0].model,
              version: calculation.detailedItems[0].versionLabel,
              battery: calculation.detailedItems[0].battery,
            }
          : undefined,
      };

      const res = await fetch("/api/business-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gửi yêu cầu thất bại");

      setSuccessResult({
        refCode: data.ref_code || `VF-B2B-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        submittedAt: new Date().toLocaleString("vi-VN"),
      });
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi gửi báo giá. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteNav />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071328] via-[#0f244a] to-[#1e3a8a] py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.2),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-blue-300 uppercase">
            <Building2 className="h-4 w-4" /> VinFast Fleet Solutions • Dành Cho Doanh Nghiệp
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Báo Giá Lô Xe Doanh Nghiệp
          </h1>
          <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
            Giải pháp điện hóa đội xe vận tải, xe công vụ và đưa đón chuyên gia toàn diện.
            Tối ưu hóa tổng chi phí sở hữu (TCO), nhận chiết khấu bậc thang theo số lượng và miễn 100% lệ phí trước bạ.
          </p>

          {/* Quick Metrics */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-emerald-400 sm:text-3xl">-65%</div>
              <div className="mt-1 text-xs text-slate-300">Chi phí năng lượng & bảo dưỡng</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-400 sm:text-3xl">0 VNĐ</div>
              <div className="mt-1 text-xs text-slate-300">Lệ phí trước bạ (Ưu đãi 100%)</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-amber-400 sm:text-3xl">Tới 6%</div>
              <div className="mt-1 text-xs text-slate-300">Chiết khấu trực tiếp theo lô</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-400 sm:text-3xl">10 Năm</div>
              <div className="mt-1 text-xs text-slate-300">Bảo hành chính hãng vượt trội</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* CỘT TRÁI: Fleet Builder & TCO (7 Cột) */}
          <div className="space-y-8 lg:col-span-7">
            {/* Box 1: Cấu hình danh sách lô xe */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-blue-600" />
                    1. Thiết Lập Danh Mục Đội Xe (Fleet)
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Chọn các dòng xe, phiên bản và số lượng xe dự kiến đầu tư.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addFleetItem}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Thêm dòng xe
                </button>
              </div>

              {/* Danh sách các xe */}
              <div className="mt-6 space-y-4">
                {fleet.map((item, index) => {
                  const currentVeh = VEHICLES[item.model];
                  return (
                    <div
                      key={item.id}
                      className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/20"
                    >
                      <div className="flex items-center justify-between gap-2 pb-3">
                        <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                          Mục #{index + 1}
                        </span>
                        {fleet.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFleetItem(item.id)}
                            className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                            title="Xóa mục này"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                        {/* Chọn Dòng Xe */}
                        <div className="sm:col-span-4">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Dòng xe
                          </label>
                          <select
                            value={item.model}
                            onChange={(e) =>
                              updateFleetItem(item.id, {
                                model: e.target.value as VehicleKey,
                              })
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                          >
                            {Object.entries(VEHICLES).map(([key, v]) => (
                              <option key={key} value={key}>
                                {v.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Chọn Phiên Bản */}
                        <div className="sm:col-span-4">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Phiên bản
                          </label>
                          <select
                            value={item.versionId}
                            onChange={(e) =>
                              updateFleetItem(item.id, { versionId: e.target.value })
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                          >
                            {currentVeh.versions.map((ver) => (
                              <option key={ver.id} value={ver.id}>
                                {ver.label} ({formatVND(ver.price)})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Gói Pin */}
                        <div className="sm:col-span-4">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Hình thức Pin
                          </label>
                          <select
                            value={item.battery}
                            onChange={(e) =>
                              updateFleetItem(item.id, {
                                battery: e.target.value as "buy" | "rent",
                              })
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                          >
                            <option value="buy">
                              Kèm Pin (+{formatVND(currentVeh.battery.buy)})
                            </option>
                            <option value="rent">
                              Thuê Pin ({formatVND(currentVeh.battery.rent)}/tháng)
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* Số lượng xe */}
                      <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-200/60 pt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Số lượng xe:</span>
                          <div className="flex items-center rounded-lg border border-slate-300 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateFleetItem(item.id, {
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                              }
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={200}
                              value={item.quantity}
                              onChange={(e) =>
                                updateFleetItem(item.id, {
                                  quantity: Math.max(1, parseInt(e.target.value) || 1),
                                })
                              }
                              className="w-14 text-center text-sm font-bold text-slate-800 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateFleetItem(item.id, {
                                  quantity: item.quantity + 1,
                                })
                              }
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400">Tạm tính lô xe: </span>
                          <span className="text-sm font-bold text-blue-700">
                            {formatVND(
                              ((currentVeh.versions.find((x) => x.id === item.versionId)?.price ||
                                0) +
                                (item.battery === "buy" ? currentVeh.battery.buy : 0)) *
                                item.quantity
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tỉnh thành đăng ký lăn bánh */}
              <div className="mt-6 rounded-2xl bg-slate-100/70 p-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa bàn đăng ký lăn bánh chính của đội xe:
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {Object.entries(PROVINCES).slice(0, 4).map(([key, prov]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setProvinceKey(key)}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        provinceKey === key
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {prov.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Box 2: Chính sách Chiết khấu Bậc Thang Doanh Nghiệp */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Chính Sách Chiết Khấu Theo Quy Mô Lô Xe
                </h3>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  Tổng: {calculation.totalQuantity} xe
                </span>
              </div>

              {/* Current Tier Active Card */}
              <div className="mt-4 rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 text-sm">
                    {calculation.tierTitle}
                  </span>
                  <span className="rounded-md bg-amber-500 px-2.5 py-0.5 text-xs font-extrabold text-white">
                    {calculation.discountPercent > 0
                      ? `Giảm ${calculation.discountPercent * 100}%`
                      : "Ưu đãi cơ bản"}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-amber-800">
                  {calculation.tierPerks.map((perk, i) => (
                    <li key={i} className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tier Reference Table */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div
                  className={`rounded-xl p-2.5 border ${
                    calculation.totalQuantity >= 3 && calculation.totalQuantity <= 5
                      ? "border-blue-500 bg-blue-50 font-bold"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="text-slate-500">Từ 3 - 5 xe</div>
                  <div className="text-blue-700 font-bold text-sm">Chiết khấu 2%</div>
                  <div className="text-[10px] text-slate-500">+ 1 năm bảo hiểm</div>
                </div>
                <div
                  className={`rounded-xl p-2.5 border ${
                    calculation.totalQuantity >= 6 && calculation.totalQuantity <= 15
                      ? "border-blue-500 bg-blue-50 font-bold"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="text-slate-500">Từ 6 - 15 xe</div>
                  <div className="text-blue-700 font-bold text-sm">Chiết khấu 4%</div>
                  <div className="text-[10px] text-slate-500">+ Hỗ trợ 50% trụ sạc</div>
                </div>
                <div
                  className={`rounded-xl p-2.5 border ${
                    calculation.totalQuantity >= 16
                      ? "border-blue-500 bg-blue-50 font-bold"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="text-slate-500">Từ 16 xe trở lên</div>
                  <div className="text-blue-700 font-bold text-sm">Chiết khấu 6%</div>
                  <div className="text-[10px] text-slate-500">+ Trạm sạc DC Free</div>
                </div>
              </div>
            </div>

            {/* Box 3: Phân tích TCO - Tiết kiệm chi phí vận hành */}
            <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-emerald-600" />
                Hiệu Quả Kinh Tế Khi Chuyển Sang Xe Điện (TCO)
              </h3>
              <p className="mt-1 text-xs text-emerald-800">
                Ước tính mức chi phí nhiên liệu & bảo dưỡng doanh nghiệp tiết kiệm được so với xe xăng cùng phân khúc (tính trung bình 3.000 km/xe/tháng):
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Tiết kiệm / Tháng</div>
                  <div className="mt-1 text-xl font-bold text-emerald-600">
                    {formatVND(calculation.tco.monthlySavings)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">cho cả {calculation.totalQuantity} xe</div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Tiết kiệm / Năm</div>
                  <div className="mt-1 text-xl font-bold text-emerald-600">
                    {formatVND(calculation.tco.yearlySavings)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">giảm trực tiếp OPEX</div>
                </div>
                <div className="rounded-2xl border border-emerald-300 bg-emerald-600 text-white p-4 shadow-xs">
                  <div className="text-xs font-semibold text-emerald-100">Tiết kiệm 3 Năm</div>
                  <div className="mt-1 text-xl font-extrabold text-white">
                    {formatVND(calculation.tco.threeYearSavings)}
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-200">tương đương ~{Math.round(calculation.tco.threeYearSavings / 600000000)} chiếc xe mới!</div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Bảng Báo Giá Chi Tiết & Form Doanh Nghiệp (5 Cột) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Box Tóm Tắt Chi Phí Lô Xe */}
            <div className="sticky top-20 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Bảng Tổng Hợp Chi Phí</h3>
                <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700">
                  {calculation.totalQuantity} Xe
                </span>
              </div>

              {/* Chi tiết từng mục */}
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Tổng giá niêm yết ({calculation.totalQuantity} xe):</span>
                  <span className="font-semibold text-slate-800">
                    {formatVND(calculation.baseTotal)}
                  </span>
                </div>

                {calculation.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-3 py-2 rounded-xl">
                    <span>Chiết khấu DN ({calculation.discountPercent * 100}%):</span>
                    <span>- {formatVND(calculation.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Tiền xe sau chiết khấu:</span>
                  <span className="font-semibold text-slate-900">
                    {formatVND(calculation.afterDiscount)}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Các chi phí lăn bánh theo luật:
                  </div>

                  <div className="flex justify-between text-xs text-slate-600 py-1">
                    <span className="flex items-center gap-1">
                      Lệ phí trước bạ ô tô điện:
                      <span className="rounded bg-emerald-100 px-1 text-[10px] text-emerald-800 font-bold">
                        0%
                      </span>
                    </span>
                    <span className="font-bold text-emerald-700">0 VNĐ (Miễn 100%)</span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-600 py-1">
                    <span>Lệ phí cấp biển số ({PROVINCES[provinceKey]?.label}):</span>
                    <span>{formatVND(calculation.plateFeeTotal)}</span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-600 py-1">
                    <span>Phí đường bộ DN & Đăng kiểm:</span>
                    <span>
                      {formatVND(
                        calculation.roadFeeTotal + calculation.inspectionFeeTotal
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-600 py-1">
                    <span>Bảo hiểm TNDS bắt buộc DN:</span>
                    <span>{formatVND(calculation.insuranceTotal)}</span>
                  </div>
                </div>

                {/* Tổng Cộng Dự Toán */}
                <div className="border-t-2 border-slate-900/10 pt-4">
                  <div className="text-xs font-medium text-slate-500">TỔNG KINH PHÍ ĐẦU TƯ LÔ XE:</div>
                  <div className="mt-1 text-2xl font-black text-blue-700 sm:text-3xl">
                    {formatVND(calculation.grandTotal)}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Đã bao gồm thuế GTGT (VAT) & hóa đơn điện tử hợp lệ cho doanh nghiệp khấu trừ thuế.
                  </p>
                </div>
              </div>

              {/* Form Đăng ký nhận Báo giá chính thức */}
              <form onSubmit={handleSubmit} className="mt-6 border-t border-slate-200 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Thông Tin Doanh Nghiệp Nhận Báo Giá
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên Doanh nghiệp / Công ty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Công ty Cổ phần Vận tải Xanh Hà Nội"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mã số thuế (MST)
                    </label>
                    <input
                      type="text"
                      placeholder="0101234567"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Người phụ trách / Liên hệ
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0987 654 321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email doanh nghiệp
                    </label>
                    <input
                      type="email"
                      placeholder="fleet@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dịch vụ gia tăng doanh nghiệp quan tâm */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Nhu cầu hỗ trợ đặc thù:
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needsCharger}
                      onChange={(e) => setNeedsCharger(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Khảo sát lắp trạm sạc AC / DC tại trụ sở doanh nghiệp</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needsFinance}
                      onChange={(e) => setNeedsFinance(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Tư vấn gói vay trả góp / Thuê mua tài chính (Leasing)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needsBranding}
                      onChange={(e) => setNeedsBranding(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Hỗ trợ thiết kế & dán Decal nhận diện thương hiệu công ty</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      "Đang gửi yêu cầu..."
                    ) : (
                      <>
                        Gửi Yêu Cầu Báo Giá Chính Thức <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="w-full rounded-2xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Printer className="h-4 w-4 text-slate-500" />
                    Xem & In Bản Dự Thảo Báo Giá (PDF)
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL THÀNH CÔNG */}
      {successResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">
              Tiếp Nhận Yêu Cầu Thành Công!
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Cảm ơn Quý doanh nghiệp <strong>{companyName}</strong> đã tin tưởng lựa chọn giải pháp xe điện VinFast.
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã hồ sơ B2B:</span>
                <span className="font-bold text-blue-700 font-mono text-sm">
                  {successResult.refCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quy mô lô xe:</span>
                <span className="font-semibold text-slate-800">
                  {calculation.totalQuantity} xe ({calculation.tierTitle})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dự toán kinh phí:</span>
                <span className="font-bold text-emerald-600">
                  {formatVND(calculation.grandTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian ghi nhận:</span>
                <span className="text-slate-700">{successResult.submittedAt}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Chuyên viên Quản lý Khách hàng Doanh nghiệp (Key Account Manager) của VinFast sẽ liên hệ trực tiếp qua số <strong>{phone}</strong> trong vòng <strong>2 giờ làm việc</strong> để gửi hồ sơ dự thầu và sắp xếp buổi lái thử tại doanh nghiệp.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                In bản báo giá
              </button>
              <button
                type="button"
                onClick={() => setSuccessResult(null)}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / XEM TRƯỚC BẢN IN BÁO GIÁ DOANH NGHIỆP */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-8 shadow-2xl text-slate-900 my-8">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-bold text-base">Bản Xem Trước Báo Giá Doanh Nghiệp (Official Draft)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> In / Lưu PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* Khổ giấy in ấn tiêu chuẩn B2B */}
            <div className="mt-6 space-y-6 text-sm print:m-0 print:p-0">
              {/* Header Công ty VinFast */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-5">
                <div>
                  <div className="text-2xl font-black tracking-widest text-blue-900">VINFAST AUTO</div>
                  <div className="text-xs text-slate-500 mt-1">CÔNG TY TNHH KINH DOANH THƯƠNG MẠI VÀ DỊCH VỤ VINFAST</div>
                  <div className="text-xs text-slate-500">Khối Khách Hàng Doanh Nghiệp & Đội Xe (B2B Fleet Division)</div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-800">BẢNG BÁO GIÁ LÔ XE THƯƠNG MẠI</div>
                  <div className="text-slate-500 font-mono mt-0.5">Số: VF-B2B/{new Date().getFullYear()}/HQ</div>
                  <div className="text-slate-500">Ngày lập: {new Date().toLocaleDateString("vi-VN")}</div>
                  <div className="text-slate-500">Hiệu lực: 30 ngày kể từ ngày báo giá</div>
                </div>
              </div>

              {/* Thông tin Khách hàng Doanh nghiệp */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-500">Đơn vị thụ hưởng:</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {companyName || "CÔNG TY ĐỐI TÁC DOANH NGHIỆP"}
                  </div>
                  <div className="text-slate-600 mt-0.5">Mã số thuế: {taxId || "Chưa cung cấp"}</div>
                </div>
                <div>
                  <div className="text-slate-500">Người liên hệ:</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {contactName || "Đại diện Doanh nghiệp"} ({position})
                  </div>
                  <div className="text-slate-600 mt-0.5">Điện thoại: {phone || "Chưa cung cấp"} | Địa bàn: {PROVINCES[provinceKey]?.label}</div>
                </div>
              </div>

              {/* Bảng Kê Chi Tiết Xe */}
              <div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-800 bg-slate-100">
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3">Dòng xe & Phiên bản</th>
                      <th className="py-2.5 px-3">Gói Pin</th>
                      <th className="py-2.5 px-3 text-center">Số lượng</th>
                      <th className="py-2.5 px-3 text-right">Đơn giá niêm yết</th>
                      <th className="py-2.5 px-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {calculation.detailedItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold">
                          VinFast {item.modelLabel} ({item.versionLabel})
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {item.battery === "buy" ? "Kèm pin" : "Thuê pin"}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right">{formatVND(item.unitPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-bold">{formatVND(item.itemTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tổng Kết & Chiết Khấu */}
              <div className="border-t border-slate-300 pt-3 flex justify-end text-xs">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Tổng cộng ({calculation.totalQuantity} xe):</span>
                    <span className="font-semibold">{formatVND(calculation.baseTotal)}</span>
                  </div>
                  {calculation.discountAmount > 0 && (
                    <div className="flex justify-between font-bold text-emerald-700">
                      <span>Chiết khấu DN ({calculation.discountPercent * 100}%):</span>
                      <span>- {formatVND(calculation.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Ưu đãi Thuế trước bạ xe điện:</span>
                    <span className="text-emerald-700 font-bold">Miễn 100% (0đ)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Các khoản phí lăn bánh tạm tính:</span>
                    <span>{formatVND(calculation.rollingFeesTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-blue-900 border-t-2 border-slate-800 pt-2">
                    <span>TỔNG KINH PHÍ DỰ TOÁN:</span>
                    <span>{formatVND(calculation.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Chữ ký hai bên */}
              <div className="grid grid-cols-2 pt-10 text-center text-xs">
                <div>
                  <div className="font-bold text-slate-800">ĐẠI DIỆN KHÁCH HÀNG DOANH NGHIỆP</div>
                  <div className="text-slate-400 italic mt-1">(Ký, ghi rõ họ tên và đóng dấu)</div>
                </div>
                <div>
                  <div className="font-bold text-blue-900">ĐẠI DIỆN VINFAST AUTO - B2B FLEET</div>
                  <div className="text-slate-400 italic mt-1">(Đã ký điện tử & xác nhận hệ thống)</div>
                  <div className="mt-8 font-bold text-blue-700 font-serif italic text-sm">VinFast Auto Corp.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
