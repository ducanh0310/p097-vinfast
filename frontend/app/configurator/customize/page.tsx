"use client";

import { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageCircle, X, ChevronLeft } from "lucide-react";
import { SiteNav } from "@/components/shared/site-nav";
import { CarImage } from "@/components/shared/car-image";
import { Stepper } from "@/components/configurator/stepper";
import { ChatPanel } from "@/components/configurator/chat-panel";
import { useConfigurator } from "@/hooks/use-configurator";
import { useChat } from "@/hooks/use-chat";
import { fromQuery, toQuery } from "@/lib/config-url";
import { VEHICLES, PROVINCES, ACCESSORIES } from "@/lib/vehicle-data";
import { formatNumber } from "@/lib/format";

// Dynamic import CarViewer3D không chạy SSR để tránh lỗi Hydration Mismatch
const CarViewer3D = dynamic(
  () => import("@/components/configurator/car-viewer-3d").then((m) => m.CarViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[380px] w-full items-center justify-center sm:h-[440px] md:h-[500px]">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-200 border-t-slate-900" />
      </div>
    ),
  }
);

function Customize() {
  const searchParams = useSearchParams();
  const configurator = useConfigurator(fromQuery(searchParams));
  const chat = useChat();
  const [chatOpen, setChatOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { config, setField, toggleAccessory, pricing } = configurator;
  const v = VEHICLES[config.model];
  const query = toQuery(config);
  const opt = (on: boolean) =>
    `rounded-2xl border px-4 py-3 text-left text-sm transition ${
      on ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"
    }`;

  // Trong lúc chờ mount trên client, render khung giao diện nhất quán
  if (!mounted) {
    return (
      <div className="flex h-[100dvh] flex-col bg-white">
        <SiteNav />
        <Stepper current={1} query="" />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-200 border-t-blue-600" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-white">
      <SiteNav />
      <Stepper current={1} query={query} />
      <main className="min-h-0 flex-1 overflow-y-auto xl:grid xl:grid-cols-[minmax(0,1fr)_380px_380px] xl:grid-rows-1 xl:overflow-hidden">
        {/* CỘT 1: LẤY TOÀN BỘ KHÔNG GIAN ĐỂ HIỂN THỊ XE 3D LIỀN MẠCH */}
        <section className="relative flex h-[50vh] sm:h-[56vh] xl:h-full w-full flex-1 flex-col overflow-hidden bg-white p-0">
          {/* Thông tin dòng xe thanh lịch ở góc trên */}
          <div className="pointer-events-auto absolute left-6 top-5 right-6 z-20 flex items-start justify-between">
            <div>
              <Link
                href="/configurator"
                className="group mb-1.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                <ChevronLeft size={14} className="transition group-hover:-translate-x-0.5" />
                <span>Đổi dòng xe khác</span>
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                VinFast {v.label}
              </h1>
            </div>
            <span className="rounded-full bg-slate-100/90 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur-sm shadow-sm">
              {pricing.version.label}
            </span>
          </div>

          {/* Chữ chìm nghệ thuật phía sau */}
          <span className="pointer-events-none absolute left-6 top-10 select-none text-[120px] font-black leading-none text-slate-100/60 md:text-[200px]">
            {v.label.replace(" ", "")}
          </span>

          {/* Xe 3D Three.js chiếm toàn bộ 100% không gian Cột 1 */}
          <div className="relative z-10 h-full w-full flex-1">
            <CarViewer3D
              modelUrl={v.model3d}
              modelName={v.label}
              colorHex={pricing.color.hex}
              className="h-full w-full"
              fallback2D={
                <CarImage
                  model={config.model}
                  colorId={config.colorId}
                  alt={`VinFast ${v.label}`}
                  maxWidth={720}
                  className="mx-auto"
                />
              }
            />
          </div>
        </section>

        {/* CỘT 2: BẢNG TUỲ CHỈNH ĐỒNG BỘ BÊN PHẢI (GỒM PHIÊN BẢN, MÀU NGOẠI THẤT, PIN...) */}
        <section className="min-h-0 space-y-7 px-6 py-6 xl:overflow-y-auto xl:border-l xl:border-slate-200">
          {/* 1. Phiên bản */}
          <Group title="Phiên bản">
            {v.versions.map((x) => (
              <button
                key={x.id}
                onClick={() => setField("versionId", x.id)}
                className={`${opt(x.id === config.versionId)} flex w-full justify-between`}
              >
                <span className="font-semibold">{x.label}</span>
                <span>{formatNumber(x.price)}đ</span>
              </button>
            ))}
          </Group>

          {/* 2. Màu ngoại thất (Đã chuyển sang đây cho đồng bộ) */}
          <Group title="Màu ngoại thất">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">{pricing.color.label}</span>
              <span className="text-xs text-slate-400">Đã bao gồm trong giá</span>
            </div>
            <div className="flex flex-wrap gap-3 py-1">
              {v.colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setField("colorId", c.id)}
                  aria-label={c.label}
                  title={c.label}
                  className={`h-10 w-10 rounded-full border border-slate-300 transition-all ${
                    c.id === config.colorId
                      ? "scale-110 shadow-md ring-2 ring-blue-600 ring-offset-2"
                      : "hover:scale-105 hover:border-slate-400"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </Group>

          {/* 3. Gói Pin */}
          <Group title="Pin">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setField("battery", "rent")}
                className={opt(config.battery === "rent")}
              >
                <b>Thuê pin</b>
                <br />
                {formatNumber(v.battery.rent)}đ/tháng
              </button>
              <button
                onClick={() => setField("battery", "buy")}
                className={opt(config.battery === "buy")}
              >
                <b>Mua pin</b>
                <br />
                +{formatNumber(v.battery.buy)}đ
              </button>
            </div>
          </Group>

          {/* 4. Nơi đăng ký xe */}
          <Group title="Nơi đăng ký xe">
            <select
              value={config.provinceId}
              onChange={(e) => setField("provinceId", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            >
              {Object.entries(PROVINCES).map(([id, p]) => (
                <option key={id} value={id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Group>

          {/* 5. Phụ kiện */}
          <Group title="Phụ kiện">
            <div className="grid grid-cols-1 gap-2">
              {ACCESSORIES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => toggleAccessory(a.id)}
                  className={opt(config.accessories.includes(a.id))}
                >
                  <span className="block font-medium">{a.label}</span>
                  <span className="text-slate-500">{formatNumber(a.price)}đ</span>
                </button>
              ))}
            </div>
          </Group>
        </section>

        {/* CỘT 3: CHAT VỚI TRỢ LÝ (MÀN NHỎ: MỞ MODAL/DRAWER) */}
        <aside
          className={`${
            chatOpen ? "fixed inset-0 z-50 flex" : "hidden"
          } min-h-0 flex-col bg-white xl:static xl:z-auto xl:flex xl:border-l xl:border-slate-200`}
        >
          <button
            onClick={() => setChatOpen(false)}
            className="flex items-center justify-end gap-1 border-b px-4 py-3 text-sm text-slate-500 xl:hidden"
          >
            <X size={16} />
            Đóng
          </button>
          <div className="min-h-0 flex-1">
            <ChatPanel chat={chat} configurator={configurator} />
          </div>
        </aside>
      </main>

      {/* THANH TỔNG TIỀN DƯỚI ĐÁY */}
      <div className="flex-none border-t border-slate-200 bg-white px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">Giá lăn bánh dự tính, đã trừ ưu đãi</p>
            <p className="text-2xl font-bold text-slate-900">{formatNumber(pricing.finalPrice)}đ</p>
          </div>
          <Link
            href={`/configurator/quote?${query}`}
            className="rounded-full bg-blue-600 px-8 py-3.5 font-semibold text-white hover:bg-blue-700"
          >
            Xem báo giá chi tiết
          </Link>
        </div>
      </div>

      {/* NÚT HỎI TRỢ LÝ TRÊN MÀN HÌNH NHỎ */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg xl:hidden"
      >
        <MessageCircle size={18} />
        Hỏi trợ lý
      </button>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold text-slate-900">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[100dvh] items-center justify-center bg-white">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-200 border-t-blue-600" />
        </div>
      }
    >
      <Customize />
    </Suspense>
  );
}
