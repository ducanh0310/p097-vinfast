"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Tag, Package,
  Users, FileCheck, LogOut, Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";

const NAV = [
  { href: "/seller/dashboard",  icon: LayoutDashboard, label: "Tổng quan"  },
  { href: "/seller/promotions", icon: Tag,             label: "Khuyến mãi" },
  { href: "/seller/inventory",  icon: Package,         label: "Kho xe"     },
  { href: "/seller/leads",      icon: Users,           label: "Khách hàng" },
  { href: "/seller/quotes",     icon: FileCheck,       label: "Báo giá"    },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname      = usePathname();
  const router        = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-60 flex-shrink-0 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="px-5 py-5 border-b">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">VinFast Seller</p>
              <p className="text-xs text-gray-500 truncate">{user?.dealer ?? "Đại lý"}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                pathname === href
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t space-y-1">
          {/* User info */}
          {user && (
            <div className="px-3 py-2 mb-2 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-700 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          )}
          <Link
            href="/configurator"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
          >
            <Car size={17} />
            Trang buyer
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={17} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
