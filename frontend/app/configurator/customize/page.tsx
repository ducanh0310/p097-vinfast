"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { SiteNav } from "@/components/shared/site-nav";
import { CarImage } from "@/components/shared/car-image";
import { Stepper } from "@/components/configurator/stepper";
import { ChatPanel } from "@/components/configurator/chat-panel";
import { useConfigurator } from "@/hooks/use-configurator";
import { useChat } from "@/hooks/use-chat";
import { fromQuery, toQuery } from "@/lib/config-url";
import { VEHICLES, PROVINCES, ACCESSORIES, VehicleKey } from "@/lib/vehicle-data";
import { formatNumber } from "@/lib/format";

function Customize() {
  const configurator = useConfigurator(fromQuery(useSearchParams()));
  const chat = useChat();
  const [chatOpen, setChatOpen] = useState(false);
  const { config, setField, toggleAccessory, pricing } = configurator;
  const v = VEHICLES[config.model];
  const query = toQuery(config);
  const opt = (on: boolean) => `rounded-2xl border px-4 py-3 text-left text-sm transition ${on ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`;

  return (
    <div className="flex h-[100dvh] flex-col bg-white">
      <SiteNav />
      <Stepper current={1} query={query} />
      <main className="min-h-0 flex-1 overflow-y-auto xl:grid xl:grid-cols-[minmax(0,1fr)_360px_380px] xl:grid-rows-1 xl:overflow-hidden">
        {/* Cột 1: xe */}
        <section className="relative min-h-0 overflow-hidden p-5 xl:overflow-y-auto">
          <div className="relative z-10 flex flex-wrap gap-2">
            {(Object.keys(VEHICLES) as VehicleKey[]).map((k) => (
              <button key={k} onClick={() => setField("model", k)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${k === config.model ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{VEHICLES[k].label}</button>
            ))}
          </div>
          <span className="pointer-events-none absolute left-5 top-16 select-none text-[110px] font-extrabold leading-none text-slate-100 md:text-[170px]">{v.label.replace(" ", "")}</span>
          <CarImage model={config.model} colorId={config.colorId} alt={`VinFast ${v.label}`} maxWidth={760} className="relative z-10 mx-auto my-6" />
          <div className="relative z-10 text-center">
            <p className="text-lg font-semibold text-slate-900">{pricing.color.label}</p>
            <div className="mt-3 flex justify-center gap-3">
              {v.colors.map((c) => (
                <button key={c.id} onClick={() => setField("colorId", c.id)} aria-label={c.label} title={c.label}
                  className={`h-9 w-9 rounded-full border border-slate-300 ${c.id === config.colorId ? "ring-2 ring-blue-600 ring-offset-2" : ""}`} style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          </div>
        </section>

        {/* Cột 2: tuỳ chọn */}
        <section className="min-h-0 space-y-7 px-5 py-5 xl:overflow-y-auto xl:border-l xl:border-slate-200">
          <Group title="Phiên bản">
            {v.versions.map((x) => (
              <button key={x.id} onClick={() => setField("versionId", x.id)} className={`${opt(x.id === config.versionId)} flex w-full justify-between`}>
                <span className="font-semibold">{x.label}</span><span>{formatNumber(x.price)}đ</span>
              </button>
            ))}
          </Group>
          <Group title="Pin">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setField("battery", "rent")} className={opt(config.battery === "rent")}><b>Thuê pin</b><br />{formatNumber(v.battery.rent)}đ/tháng</button>
              <button onClick={() => setField("battery", "buy")} className={opt(config.battery === "buy")}><b>Mua pin</b><br />+{formatNumber(v.battery.buy)}đ</button>
            </div>
          </Group>
          <Group title="Nơi đăng ký xe">
            <select value={config.provinceId} onChange={(e) => setField("provinceId", e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm">
              {Object.entries(PROVINCES).map(([id, p]) => <option key={id} value={id}>{p.label}</option>)}
            </select>
          </Group>
          <Group title="Phụ kiện">
            <div className="grid grid-cols-1 gap-2">
              {ACCESSORIES.map((a) => (
                <button key={a.id} onClick={() => toggleAccessory(a.id)} className={opt(config.accessories.includes(a.id))}>
                  <span className="block font-medium">{a.label}</span><span className="text-slate-500">{formatNumber(a.price)}đ</span>
                </button>
              ))}
            </div>
          </Group>
        </section>

        {/* Cột 3: chat với trợ lý (màn nhỏ: mở toàn màn hình) */}
        <aside className={`${chatOpen ? "fixed inset-0 z-50 flex" : "hidden"} min-h-0 flex-col bg-white xl:static xl:z-auto xl:flex xl:border-l xl:border-slate-200`}>
          <button onClick={() => setChatOpen(false)} className="flex items-center justify-end gap-1 border-b px-4 py-3 text-sm text-slate-500 xl:hidden"><X size={16} />Đóng</button>
          <div className="min-h-0 flex-1"><ChatPanel chat={chat} configurator={configurator} /></div>
        </aside>
      </main>

      <div className="flex-none border-t border-slate-200 bg-white px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div><p className="text-xs text-slate-500">Giá lăn bánh dự tính, đã trừ ưu đãi</p><p className="text-2xl font-bold text-slate-900">{formatNumber(pricing.finalPrice)}đ</p></div>
          <Link href={`/configurator/quote?${query}`} className="rounded-full bg-blue-600 px-8 py-3.5 font-semibold text-white hover:bg-blue-700">Xem báo giá chi tiết</Link>
        </div>
      </div>
      <button onClick={() => setChatOpen(true)} className="fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg xl:hidden"><MessageCircle size={18} />Hỏi trợ lý</button>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h2 className="mb-3 text-lg font-bold text-slate-900">{title}</h2><div className="space-y-2">{children}</div></div>;
}

export default function Page() {
  return <Suspense><Customize /></Suspense>;
}
