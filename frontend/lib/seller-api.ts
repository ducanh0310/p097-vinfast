const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function getAuthHeader(): HeadersInit {
  if (typeof document === "undefined") return {};
  try {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("vf-auth="))
      ?.split("=")[1];
    if (!raw) return {};
    const parsed = JSON.parse(decodeURIComponent(raw));
    const token = parsed?.state?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

// ── QUOTES ──────────────────────────────────────────────────
export async function fetchQuotes() {
  const res = await fetch(`${API_BASE}/quotes`, {
    headers: { ...getAuthHeader() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch quotes");
  const data = await res.json();
  return data.quotes || [];
}

export async function approveQuote(quoteId: string, action: "approve" | "reject", sellerNote?: string) {
  const res = await fetch(`${API_BASE}/quote/approve?quote_id=${encodeURIComponent(quoteId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ action, seller_note: sellerNote || "" }),
  });
  if (!res.ok) throw new Error("Failed to review quote");
  return res.json();
}

// ── LEADS ───────────────────────────────────────────────────
export async function fetchLeads(status?: string) {
  const url = new URL(`${API_BASE}/leads`);
  if (status && status !== "all") url.searchParams.set("status", status);

  const res = await fetch(url.toString(), {
    headers: { ...getAuthHeader() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch leads");
  const data = await res.json();
  return data.leads || [];
}

export async function updateLead(leadId: string, status?: string, note?: string) {
  const res = await fetch(`${API_BASE}/leads/${encodeURIComponent(leadId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) throw new Error("Failed to update lead");
  return res.json();
}

// ── INVENTORY ───────────────────────────────────────────────
export async function fetchInventory(model?: string) {
  const url = new URL(`${API_BASE}/inventory`);
  if (model) url.searchParams.set("model", model);

  const res = await fetch(url.toString(), {
    headers: { ...getAuthHeader() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch inventory");
  const data = await res.json();
  return data.inventory || [];
}

export async function updateInventory(itemId: string, quantity: number, estDelivery: string) {
  const res = await fetch(`${API_BASE}/inventory/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ quantity, est_delivery: estDelivery }),
  });
  if (!res.ok) throw new Error("Failed to update inventory");
  return res.json();
}

// ── PROMOTIONS ──────────────────────────────────────────────
export async function fetchPromotions(model?: string, province?: string) {
  const url = new URL(`${API_BASE}/promotions`);
  if (model) url.searchParams.set("model", model);
  if (province) url.searchParams.set("province", province);

  const res = await fetch(url.toString(), {
    headers: { ...getAuthHeader() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch promotions");
  const data = await res.json();
  return data.promotions || [];
}

export async function createPromotion(promo: {
  name: string;
  description: string;
  model: string;
  province?: string;
  discount_type: "fixed" | "percent";
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}) {
  const res = await fetch(`${API_BASE}/promotions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(promo),
  });
  if (!res.ok) throw new Error("Failed to create promotion");
  return res.json();
}

export async function deletePromotion(promoId: string) {
  const res = await fetch(`${API_BASE}/promotions/${encodeURIComponent(promoId)}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to delete promotion");
  return res.json();
}
