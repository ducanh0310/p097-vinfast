"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore, ROLE_HOME } from "@/lib/auth-store";
import { Eye, EyeOff, Car, Loader2 } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "Nhân viên Kinh doanh", email: "seller@abc.vn",    pw: "123456",   color: "blue"  },
  { role: "Thủ kho",              email: "warehouse@abc.vn", pw: "123456",   color: "green" },
  { role: "Admin VinFast",        email: "admin@vinfast.vn", pw: "admin123", color: "purple"},
];

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuthStore();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Nếu đã đăng nhập → redirect
  useEffect(() => {
    if (user) {
      const from = searchParams.get("from");
      // Validate "from" để tránh open redirect
      const safePaths: Record<string, boolean> = {
        "/seller/dashboard":    true,
        "/warehouse/dashboard": true,
        "/admin/dashboard":     true,
        "/configurator":        true,
      };
      const dest = from && safePaths[from] ? from : ROLE_HOME[user.role];
      router.replace(dest);
    }
  }, [user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Đăng nhập thất bại");
    }
    // Nếu ok → useEffect bắt user thay đổi và redirect
  };

  const fillDemo = (demoEmail: string, demoPw: string) => {
    setEmail(demoEmail);
    setPassword(demoPw);
    setError("");
  };

  const BORDER_COLOR: Record<string, string> = {
    blue:   "border-blue-500 hover:bg-blue-50",
    green:  "border-green-500 hover:bg-green-50",
    purple: "border-purple-500 hover:bg-purple-50",
  };
  const TEXT_COLOR: Record<string, string> = {
    blue:   "text-blue-700",
    green:  "text-green-700",
    purple: "text-purple-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">

        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Car size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-white">VinFast Portal</h1>
          <p className="text-blue-200 text-sm mt-1">Dành cho nhân viên & đại lý</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">

          {searchParams.get("error") === "unauthorized" && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              ⚠️ Bạn không có quyền truy cập trang đó.
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@vinfastauto.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              ❌ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Đang đăng nhập...</>
              : "Đăng nhập"
            }
          </button>

          {/* Link buyer */}
          <p className="text-center text-sm text-gray-500">
            Không phải nhân viên?{" "}
            <a href="/configurator" className="text-blue-600 hover:underline font-medium">
              Xem giá xe →
            </a>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 space-y-3">
          <p className="text-white text-xs font-semibold uppercase tracking-widest">
            🔑 Tài khoản demo — bấm để điền
          </p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => fillDemo(d.email, d.pw)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 bg-white transition-all ${BORDER_COLOR[d.color]}`}
              >
                <p className={`text-sm font-semibold ${TEXT_COLOR[d.color]}`}>
                  {d.role}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {d.email} &nbsp;·&nbsp; mật khẩu: <span className="font-mono">{d.pw}</span>
                </p>
              </button>
            ))}
          </div>
          <p className="text-blue-200 text-xs">
            ↑ Bấm 1 tài khoản → email & mật khẩu tự điền → bấm Đăng nhập
          </p>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-blue-800 flex items-center justify-center">
        <Loader2 size={32} className="text-white animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
