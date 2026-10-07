"""Deterministic VinFast catalog, ownership-cost, and promotion tools."""

import csv
import json
import re
import unicodedata
from datetime import date
from functools import lru_cache
from pathlib import Path

from langchain_core.tools import tool

from src.agents.tools.rag import search_gold_knowledge
from src.agents.tools.web_lookup import lookup_official_web

GOLD_DIR = Path(__file__).resolve().parents[3] / "dataset" / "gold"
RELATIONAL_DIR = GOLD_DIR / "rdb_schema"


def _normalize(text: str | None) -> str:
    text = unicodedata.normalize("NFKD", (text or "").replace("đ", "d").replace("Đ", "D"))
    value = "".join(char for char in text if not unicodedata.combining(char))
    value = re.sub(r"[^a-z0-9]+", "", value.lower())
    if value.startswith("thanhpho"):
        value = value[len("thanhpho"):]
    elif value.startswith("tp"):
        value = value[2:]
    return {"hcm": "hochiminh", "hn": "hanoi"}.get(value, value)


def _read_csv(name: str) -> list[dict[str, str]]:
    path = RELATIONAL_DIR / name
    if not path.is_file():
        alt_path = Path(__file__).resolve().parents[3] / "data" / "vinfast_agent" / "relational" / name
        if alt_path.is_file():
            path = alt_path
        else:
            raise RuntimeError(f"Thiếu dữ liệu catalog: {path}")
    with path.open(encoding="utf-8-sig", newline="") as source:
        return list(csv.DictReader(source))


def _format_vnd(amount: int | float) -> str:
    value = float(amount)
    if abs(value) >= 1_000_000_000:
        number, unit, digits = value / 1_000_000_000, "tỷ", 3
    else:
        number, unit, digits = value / 1_000_000, "triệu", 2
    formatted = f"{number:.{digits}f}".rstrip("0").rstrip(".").replace(".", ",")
    return f"{formatted} {unit} đồng"


def _canonical_tier(value: str | None) -> str | None:
    normalized = _normalize(value)
    for aliases, canonical in (
        (("platinum", "bachkim"), "platinum"),
        (("diamond", "kimcuong"), "diamond"),
        (("gold", "vang"), "gold"),
        (("member", "thanhvien", "chuacohang"), "member"),
        (("none", "khongthamgia", "khongphaithanhvien"), "none"),
    ):
        if any(alias in normalized for alias in aliases):
            return canonical
    return normalized or None


def _canonical_group(value: str | None) -> str | None:
    normalized = _normalize(value)
    if any(alias in normalized for alias in ("congan", "quandoi", "military", "publicsecurity")):
        return "publicsecuritymilitary"
    if any(alias in normalized for alias in ("xexang", "chuyendoixanh", "greenswitch")):
        return "greenswitch"
    return normalized or None


@lru_cache(maxsize=1)
def _load_data() -> tuple[list[dict], list[dict], list[dict]]:
    cars = {
        row["car_id"]: row
        for row in _read_csv("cars_catalog.csv")
        if row.get("vehicle_type", "").lower() == "electric car"
    }
    prices = _read_csv("trims_pricing.csv")
    rolling_rows = _read_csv("rolling_cost_matrix.csv")

    catalog = []
    for row in prices:
        car = cars.get(row["car_id"])
        if car is None:
            continue
        catalog.append({
            "model_id": row["car_id"],
            "edition_id": row["trim_id"],
            "name": f"VinFast {row['car_name']}",
            "model_name": row["car_name"],
            "edition": row["trim_name"],
            "battery_option": row.get("battery_option", ""),
            "price_vnd": int(row["price_vat_vnd"] or 0),
            "segment": None,
            "seats": None,
            "specs": {},
            "colors": [],
        })
    return catalog, rolling_rows, []


def _resolve(queries: list[str] | None) -> tuple[list[dict], list[str]]:
    catalog, _, _ = _load_data()
    if not queries:
        return catalog, []
    results: list[dict] = []
    unmatched = []
    for query in queries:
        term = _normalize(query)
        found = [v for v in catalog if term and term in _normalize(v["name"] + " " + v["edition"])]
        if not found:
            # Allow a query such as "VF 6 Ultra" to return that model's real trims.
            found = [v for v in catalog if _normalize(v["model_name"]) in term]
        if not found:
            unmatched.append(query)
        for vehicle in found:
            if vehicle not in results:
                results.append(vehicle)
    return results, unmatched


@tool
def search_vehicles(
    vehicle_queries: list[str] | None = None,
    fields: list[str] | None = None,
    seats: int | None = None,
    budget_million: float | None = None,
    segment: str | None = None,
) -> str:
    """Look up VinFast car trims, official catalog prices, colors, and specifications.

    Args:
        vehicle_queries: Car names or trims to look up, e.g. ["VF 6 Plus"].
        fields: Requested fields: overview, price, colors, performance, battery_charging, dimensions, other_specs.
        seats: Filter by the vehicle model's number of seats.
        budget_million: Maximum listed price, in million VND.
        segment: Filter by vehicle segment.
    """
    catalog, _, _ = _load_data()
    vehicles, unmatched = _resolve(vehicle_queries)
    fields = fields or ["overview", "price"]
    vehicles = [v for v in vehicles
                if (seats is None or str(v["seats"] or "") == str(seats))
                and (budget_million is None or v["price_vnd"] <= budget_million * 1_000_000)
                and (segment is None or _normalize(segment) in _normalize(v["segment"] or ""))]

    if not vehicle_queries and not any((seats is not None, budget_million is not None, segment)):
        groups: dict[str, list[dict]] = {}
        for vehicle in catalog:
            groups.setdefault(vehicle["model_name"], []).append(vehicle)
        models = [{
            "model": model,
            "trims": len(rows),
            "price_range": f"{_format_vnd(min(v['price_vnd'] for v in rows))} - {_format_vnd(max(v['price_vnd'] for v in rows))}",
        } for model, rows in groups.items()]
        return json.dumps({"models": models, "notes": [f"Không tìm thấy xe: {q}" for q in unmatched]}, ensure_ascii=False)

    output = []
    for vehicle in vehicles:
        record = {"name": vehicle["name"], "edition": vehicle["edition"]}
        if "overview" in fields:
            record.update(segment=vehicle["segment"], seats=vehicle["seats"])
        if "price" in fields:
            record.update(price_vnd=vehicle["price_vnd"], price_text=_format_vnd(vehicle["price_vnd"]))
        if "colors" in fields:
            record["exterior_colors"] = vehicle["colors"]
        requested_specs = {
            "performance": ("max_power_kw", "max_torque_nm"),
            "battery_charging": ("battery_capacity_kwh", "range_km", "fast_charge_mins", "fast_charge_dc_kw", "ac_charge_kw"),
            "dimensions": ("wheelbase_mm",),
        }
        for field, keys in requested_specs.items():
            if field in fields:
                record[field] = {key: vehicle["specs"].get(key) for key in keys if vehicle["specs"].get(key) is not None}
        if "other_specs" in fields:
            record["other_specs"] = vehicle["specs"].get("specs", {})
        output.append(record)

    return json.dumps({
        "matched_versions": output,
        "notes": [f"Không tìm thấy xe: {q}" for q in unmatched],
        "catalog_source": "dataset/gold/rdb_schema",
    }, ensure_ascii=False)


@tool
def lookup_car_color_options(vehicle_queries: list[str]) -> str:
    """Look up available exterior colors and color surcharges for VinFast trims.

    Args:
        vehicle_queries: Car models or trims to look up, e.g. ["VF 3", "VF 6 Plus"].
    """
    rows = _read_csv("vinfast_car_color_options.csv")
    matched_options = []
    unmatched = []
    for query in vehicle_queries:
        term = _normalize(query)
        matches = [
            row for row in rows
            if term and term in _normalize(f"{row.get('model_name') or row.get('model_id', '')} {row.get('edition_name') or row.get('edition_id', '')}")
        ]
        if not matches:
            unmatched.append(query)
            continue
        for row in matches:
            option = {
                "model": row.get("model_name") or row.get("model_id", ""),
                "edition": row.get("edition_name") or row.get("edition_id", ""),
                "color": row.get("color_name", ""),
                "color_code": row.get("color_code", ""),
                "color_type": row.get("color_type", ""),
                "extra_price_vnd": int(row.get("color_extra_price_vnd") or 0),
                "total_car_price_vnd": int(row.get("total_car_price_vnd") or 0),
                "image_url": row.get("image_url", ""),
            }
            if option not in matched_options:
                matched_options.append(option)
    return json.dumps({
        "color_options": matched_options,
        "notes": [f"Không tìm thấy màu xe: {query}" for query in unmatched],
        "catalog_source": "dataset/gold/rdb_schema/vinfast_car_color_options.csv",
    }, ensure_ascii=False)


@tool
def lookup_province_fees(province: str, vehicle_queries: list[str] | None = None) -> str:
    """Look up vehicle registration fees by Vietnamese province or city.

    Args:
        province: Province or city, e.g. "Hà Nội" or "TP. Hồ Chí Minh".
        vehicle_queries: Optional car models or trims for an estimated car registration total.
    """
    rows = _read_csv("vinfast_provinces_fees.csv")
    fee_row = next((row for row in rows if _normalize(row["province_name"]) == _normalize(province)), None)
    if fee_row is None:
        return json.dumps({"error": f"Không tìm thấy phí cho tỉnh/thành: {province}"}, ensure_ascii=False)

    registration_rate = float(fee_row["car_registration_fee_pct"] or 0)
    fees = {
        "province": fee_row["province_name"],
        "zone": fee_row["zone"],
        "car_license_plate_fee_vnd": int(fee_row["car_license_plate_fee_vnd"] or 0),
        "car_registration_fee_percent": registration_rate * 100,
        "bike_license_fee_low_vnd": int(fee_row["bike_license_fee_low_vnd"] or 0),
        "bike_license_fee_medium_vnd": int(fee_row["bike_license_fee_medium_vnd"] or 0),
        "bike_license_fee_high_vnd": int(fee_row["bike_license_fee_high_vnd"] or 0),
        "bike_registration_fee_percent": float(fee_row["bike_registration_fee_pct"] or 0) * 100,
    }
    estimates = []
    unmatched = []
    if vehicle_queries:
        vehicles, unmatched = _resolve(vehicle_queries)
        for vehicle in vehicles:
            registration = round(vehicle["price_vnd"] * registration_rate)
            plate_fee = fees["car_license_plate_fee_vnd"]
            estimates.append({
                "vehicle": vehicle["name"],
                "edition": vehicle["edition"],
                "listed_price_vnd": vehicle["price_vnd"],
                "car_registration_fee_vnd": registration,
                "car_license_plate_fee_vnd": plate_fee,
                "estimated_province_fees_vnd": registration + plate_fee,
            })

    return json.dumps({
        "fees": fees,
        "car_estimates": estimates,
        "notes": [f"Không tìm thấy xe: {query}" for query in unmatched],
        "catalog_source": "dataset/gold/rdb_schema/vinfast_provinces_fees.csv",
    }, ensure_ascii=False)


@tool
def calculate_vehicle_tco(vehicle_queries: list[str], years: int = 5, location: str | None = None) -> str:
    """Calculate known purchase and ownership costs from the local VinFast fee tables.

    Args:
        vehicle_queries: Car names or trims, e.g. ["VF 6 Plus"].
        years: Ownership period, at least one year.
        location: Province or city, e.g. "Hà Nội".
    """
    if years < 1 or years > 50:
        return json.dumps({"error": "years phải nằm trong khoảng 1 đến 50"}, ensure_ascii=False)
    vehicles, unmatched = _resolve(vehicle_queries)
    _, rolling_rows, _ = _load_data()
    results = []
    for vehicle in vehicles:
        row = next((r for r in rolling_rows
                    if r["car_id"] == vehicle["model_id"]
                    and _normalize(r["trim_name"]) == _normalize(vehicle["edition"])
                    and _normalize(r.get("battery_option")) == _normalize(vehicle["battery_option"])
                    and _normalize(r["province_name"]) == _normalize(location)), None) if location else None
        if not row:
            results.append({
                "vehicle": vehicle["name"], "edition": vehicle["edition"],
                "listed_price_vnd": vehicle["price_vnd"],
                "listed_price_text": _format_vnd(vehicle["price_vnd"]),
                "location": location,
                "note": "Không có bảng phí cho địa phương này; chưa tính tổng lăn bánh.",
            })
            continue
        initial = int(row["total_rolling_cost_vnd"])
        annual = int(row.get("road_fee_vnd") or 0) + int(row.get("mandatory_insurance_vnd") or 0)
        total = initial + annual * (years - 1)
        results.append({
            "vehicle": vehicle["name"], "edition": vehicle["edition"], "years": years,
            "location": location, "initial_cost_vnd": initial,
            "initial_cost_text": _format_vnd(initial),
            "estimated_known_cost_vnd": total,
            "estimated_known_cost_text": _format_vnd(total),
            "excludes": ["điện, bảo dưỡng, khấu hao, giá bán lại, khuyến mãi"],
        })
    return json.dumps({"tco": results, "notes": [f"Không tìm thấy xe: {q}" for q in unmatched]}, ensure_ascii=False)


@tool
def get_eligible_promotions(
    vehicle_queries: list[str] | None = None,
    vinclub_tier: str | None = None,
    customer_group: str | None = None,
    purchase_channel: str | None = None,
) -> str:
    """Check current VinFast promotions and calculate explicit cash discounts when eligible.

    Args:
        vehicle_queries: Car names or trims, e.g. ["VF 6 Plus"].
        vinclub_tier: Customer tier: platinum, gold, diamond, member, or none.
        customer_group: Eligibility group, such as public_security_military or green_switch.
        purchase_channel: Sales channel, such as O2O.
    """
    vehicles, unmatched = _resolve(vehicle_queries) if vehicle_queries else ([], [])
    _, _, promotions = _load_data()
    today = date.today()
    tier = _canonical_tier(vinclub_tier)
    group = _canonical_group(customer_group)
    channel = _normalize(purchase_channel)
    applicable = []
    conditional = []
    for promotion in promotions:
        if promotion.get("is_active", "").lower() != "true":
            continue
        start = date.fromisoformat(promotion["valid_from"]) if promotion.get("valid_from") else None
        end = date.fromisoformat(promotion["valid_to"]) if promotion.get("valid_to") else None
        if (start and today < start) or (end and today > end):
            continue
        audience = promotion.get("audience") or "all"
        missing = None
        if audience == "vinclub_tier" and tier is None:
            missing = "vinclub_tier"
        elif audience not in {"all", "vinclub_tier"} and group is None:
            missing = "customer_group"
        elif promotion.get("channel") and channel is None:
            missing = "purchase_channel"
        if missing:
            conditional.append({"name": promotion["promo_name"], "requires": missing})
            continue
        if audience == "vinclub_tier" and _canonical_tier(promotion.get("tier")) != tier:
            continue
        if audience not in {"all", "vinclub_tier"} and _canonical_group(audience) != group:
            continue
        if promotion.get("channel") and _normalize(promotion["channel"]) != channel:
            continue
        applicable.append(promotion)

    if not vehicle_queries:
        return json.dumps({
            "programs": [{
                "name": promotion["promo_name"],
                "benefit_type": promotion.get("benefit_type"),
                "discount_percent": float(promotion.get("discount_percent") or 0),
                "loyalty_percent": float(promotion.get("loyalty_percent") or 0),
                "description": promotion.get("description", ""),
            } for promotion in applicable],
            "conditional_promotions": conditional,
            "notes": ["Chưa có xe cụ thể nên chưa tính số tiền ưu đãi."],
        }, ensure_ascii=False)

    results = []
    for vehicle in vehicles:
        model = vehicle["model_name"]
        benefits = []
        for promotion in applicable:
            allowed_models = [part.strip() for part in promotion.get("applies_to", "").split("|") if part.strip()]
            if allowed_models and model not in allowed_models:
                continue
            price = vehicle["price_vnd"]
            discount = round(price * float(promotion.get("discount_percent") or 0) / 100)
            discount += int(float(promotion.get("discount_amount_vnd") or 0))
            benefit = {"name": promotion["promo_name"], "description": promotion.get("description", "")}
            if promotion.get("benefit_type") == "cash_discount" and discount:
                benefit.update(
                    discount_vnd=discount,
                    discount_text=_format_vnd(discount),
                    price_after_discount_vnd=price - discount,
                    price_after_discount_text=_format_vnd(price - discount),
                )
            if float(promotion.get("loyalty_percent") or 0):
                points = round(price * float(promotion["loyalty_percent"]) / 100)
                benefit["loyalty_points"] = {
                    "value_vnd": points,
                    "value_text": _format_vnd(points),
                    "note": "Tích điểm, không trừ vào giá xe.",
                }
            benefits.append(benefit)
        cash_benefits = [benefit for benefit in benefits if "discount_vnd" in benefit]
        stackable = all(promotion.get("stack_policy") == "stackable" for promotion in applicable)
        results.append({
            "vehicle": vehicle["name"], "edition": vehicle["edition"],
            "listed_price_text": _format_vnd(vehicle["price_vnd"]),
            "programs": benefits,
            "stacking": "stackable" if len(cash_benefits) < 2 or stackable else "unknown",
            "note": "Không cộng dồn các ưu đãi khi dữ liệu chưa xác nhận; cần hỏi đại lý." if len(cash_benefits) > 1 and not stackable else None,
        })
    return json.dumps({
        "vehicles": results,
        "conditional_promotions": conditional,
        "inputs": {"vinclub_tier": tier, "customer_group": group, "purchase_channel": channel},
        "notes": [f"Không tìm thấy xe: {q}" for q in unmatched],
    }, ensure_ascii=False)


VINFAST_TOOLS = [
    search_gold_knowledge,
    search_vehicles,
    lookup_car_color_options,
    lookup_province_fees,
    calculate_vehicle_tco,
    get_eligible_promotions,
    lookup_official_web,
]
