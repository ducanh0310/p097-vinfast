import Link from "next/link";
import { Check } from "lucide-react";

const STEPS = [
  { label: "Chọn dòng xe", path: "/configurator" },
  { label: "Tuỳ chỉnh xe", path: "/configurator/customize" },
  { label: "Báo giá & tư vấn", path: "/configurator/quote" },
];

export function Stepper({ current, query = "" }: { current: 0 | 1 | 2; query?: string }) {
  return (
    <ol className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-4 text-sm">
      {STEPS.map((s, i) => {
        const done = i < current;
        const body = (
          <span className={`flex items-center gap-2 ${i === current ? "font-semibold text-blue-600" : done ? "text-slate-700" : "text-slate-400"}`}>
            <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${i === current ? "bg-blue-600 text-white" : done ? "bg-slate-800 text-white" : "bg-slate-200"}`}>
              {done ? <Check size={14} /> : i + 1}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </span>
        );
        return (
          <li key={s.path} className="flex flex-1 items-center gap-2 last:flex-none">
            {done ? <Link href={query && i > 0 ? `${s.path}?${query}` : s.path}>{body}</Link> : body}
            {i < 2 && <span className="h-px flex-1 bg-slate-200" />}
          </li>
        );
      })}
    </ol>
  );
}
