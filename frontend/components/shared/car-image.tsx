"use client";

import { useState } from "react";
import type { VehicleKey } from "@/lib/vehicle-data";

/** Quy ước: frontend/public/cars/<model viết thường>/<id màu>.png  vd: public/cars/vf6/white.png */
export const carImagePath = (model: VehicleKey, colorId: string) => `/cars/${model.toLowerCase()}/${colorId}.png`;

interface Props {
  model: VehicleKey;
  colorId: string;
  alt: string;
  className?: string;
  /** Chiều rộng tối đa (px). Khung luôn tỉ lệ 16:9, ảnh co vừa khung (object-fit: contain). */
  maxWidth?: number;
}

export function CarImage({ model, colorId, alt, className = "", maxWidth }: Props) {
  const src = carImagePath(model, colorId);
  const [failed, setFailed] = useState<string | null>(null);
  // Dùng style trực tiếp để kích thước khung không phụ thuộc việc Tailwind đã sinh class hay chưa
  const box: React.CSSProperties = { width: "100%", maxWidth, aspectRatio: "16 / 9" };

  if (failed === src) {
    return (
      <div className={`grid place-items-center rounded-2xl bg-slate-200/60 p-4 text-center text-xs text-slate-500 ${className}`} style={box}>
        <span>Thiếu ảnh<br />public{src}</span>
      </div>
    );
  }
  return (
    <div className={className} style={box}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} onError={() => setFailed(src)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
  );
}
