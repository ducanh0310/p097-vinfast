"use client";

import { INVENTORY } from "@/lib/seller-mock-data";
import { formatVND } from "@/lib/format";
import { Package, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";

const BRANCHES = [
  { id: "d1", name: "Đại lý ABC - Hà Nội",   total: 13, low: 2, out: 1 },
  { id: "d2", name: "Đại lý XYZ - HCM",       total: 8,  low: 1, out: 0 },
  { id: "d3", name: "Đại lý DEF - Đà Nẵng",   total: 5,  low: 3, out: 2 },
];

export default function WarehouseDashboard() {
  const totalCars  = INVENTORY.reduce((s, i) => s + i.quantity, 0);
  const outOfStock = INVENTORY.filter((i) => i.quantity === 0).length;
  const lowStock   = INVENTORY.filter((i) => i.quantity > 0 && i.quantity <= 1).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan Kho xe</h1>
        <p className="text-gray-500 text-sm mt-1">Tất cả chi nhánh · Cập nhật realtime</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Package size={20} className="text-blue-600" />,    bg:"bg-blue-50",   label:"Tổng xe tồn kho",  value: totalCars,  sub:"Tất cả chi nhánh" },
          { icon: <AlertTriangle size={20} className="text-red-500"/>, bg:"bg-red-50",    label:"Hết hàng",          value: outOfStock, sub:"Cần nhập ngay"    },
          { icon: <TrendingUp size={20} className="text-yellow-600"/>, bg:"bg-yellow-50", label:"Sắp hết (≤1 xe)",  value: lowStock,   sub:"Cần theo dõi"     },
          { icon: <CheckCircle size={20} className="text-green-600"/>, bg:"bg-green-50",  label:"Chi nhánh active", value: BRANCHES.length, sub:"Đang hoạt động" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border p-5 shadow-sm">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Theo chi nhánh */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Tồn kho theo chi nhánh</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wide border-b bg-gray-50">
              <th className="px-5 py-3 text-left">Chi nhánh</th>
              <th className="px-4 py-3 text-center">Tổng xe</th>
              <th className="px-4 py-3 text-center">Sắp hết</th>
              <th className="px-4 py-3 text-center">Hết hàng</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {BRANCHES.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{b.name}</td>
                <td className="px-4 py-3 text-center font-bold text-blue-600">{b.total}</td>
                <td className="px-4 py-3 text-center">
                  {b.low > 0
                    ? <span className="text-yellow-600 font-medium">{b.low}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {b.out > 0
                    ? <span className="text-red-600 font-medium">{b.out}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${b.out > 0 ? "bg-red-100 text-red-600" : b.low > 0 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                    {b.out > 0 ? "Cần nhập hàng" : b.low > 0 ? "Theo dõi" : "Ổn định"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cảnh báo hết hàng */}
      {INVENTORY.filter((i) => i.quantity === 0).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> Xe hết hàng cần nhập ngay
          </h3>
          <div className="space-y-2">
            {INVENTORY.filter((i) => i.quantity === 0).map((i) => (
              <div key={i.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: i.colorHex }} />
                  <span className="text-sm font-medium">{i.model} {i.version} · {i.color}</span>
                </div>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">Hết hàng</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
