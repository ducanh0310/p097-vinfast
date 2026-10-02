"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, BarChart3, Truck, LogOut, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/warehouse/dashboard", icon: BarChart3, label: "Tổng quan" },
  { href: "/warehouse/stock",     icon: Package,   label: "Tồn kho"   },
  { href: "/warehouse/transfer",  icon: Truck,     label: "Nhập/Xuất" },
];

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-60 flex-shrink-0 bg-white border-r flex flex-col">
        <div className="px-5 py-5 border-b">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Quản lý Kho</p>
              <p className="text-xs text-gray-500">{user?.dealer || "VinFast"}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                pathname === href
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t space-y-1">
          <Link href="/configurator" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100">
            <Car size={17} /> Trang buyer
          </Link>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut size={17} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
