"use client";

import { useState, useMemo } from "react";
import { VEHICLES, PROVINCES, ACCESSORIES, VehicleKey } from "@/lib/vehicle-data";

export interface Config {
  model:       VehicleKey;
  versionId:   string;
  colorId:     string;
  provinceId:  string;
  battery:     "buy" | "rent";
  accessories: string[];
}

export function useConfigurator() {
  const [config, setConfig] = useState<Config>({
    model:       "VF6",
    versionId:   "vf6_plus",
    colorId:     "white",
    provinceId:  "HN",
    battery:     "rent",
    accessories: [],
  });

  const setField = <K extends keyof Config>(key: K, val: Config[K]) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: val };
      // Reset version khi đổi model
      if (key === "model") {
        const v = VEHICLES[val as VehicleKey];
        next.versionId = v.versions[0].id;
        next.colorId   = v.colors[0].id;
      }
      return next;
    });
  };

  const toggleAccessory = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      accessories: prev.accessories.includes(id)
        ? prev.accessories.filter((a) => a !== id)
        : [...prev.accessories, id],
    }));
  };

  // ── Tính giá DETERMINISTIC ──────────────────────────────────
  const pricing = useMemo(() => {
    const vehicle  = VEHICLES[config.model];
    const version  = vehicle.versions.find((v) => v.id === config.versionId)!;
    const province = PROVINCES[config.provinceId];
    const color    = vehicle.colors.find((c) => c.id === config.colorId)!;

    const basePrice    = version.price;
    const batteryPrice = config.battery === "buy" ? vehicle.battery.buy : 0;
    const batteryRent  = config.battery === "rent" ? vehicle.battery.rent : 0;

    const accList = ACCESSORIES.filter((a) => config.accessories.includes(a.id));
    const accTotal = accList.reduce((s, a) => s + a.price, 0);

    // Phí lăn bánh
    const registrationFee = Math.round(basePrice * province.registrationRate);
    const roadFee         = 1560000;
    const inspectionFee   = 340000;
    const insuranceFee    = Math.round(basePrice * 0.015);
    const plateFee        = province.plateFee;

    const rollingTotal = registrationFee + roadFee + inspectionFee + insuranceFee + plateFee;

    // Mock khuyến mãi
    const promos = [
      { name: "Ưu đãi tháng 10", value: 30000000, source: "VinFast toàn quốc" },
    ];
    const discount = promos.reduce((s, p) => s + p.value, 0);

    const subtotal   = basePrice + batteryPrice + accTotal;
    const finalPrice = subtotal + rollingTotal - discount;

    return {
      basePrice,
      batteryPrice,
      batteryRent,
      accList,
      accTotal,
      registrationFee,
      roadFee,
      inspectionFee,
      insuranceFee,
      plateFee,
      rollingTotal,
      promos,
      discount,
      subtotal,
      finalPrice,
      color,
      version,
      province,
    };
  }, [config]);

  return { config, setField, toggleAccessory, pricing };
}
