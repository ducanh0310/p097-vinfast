import json

with open("dataset/silver/silver_vehicles.jsonl", "r", encoding="utf-8") as f:
    dataset_cars = [json.loads(line) for line in f]

# Build a lookup: (model_key, color_name_normalized) -> image_url
# model_key: "VF3", "VF5", etc.
lookup = {}
for car in dataset_cars:
    model_raw = car.get("model_name", "").replace(" ", "")
    for col in car.get("colors", []):
        cname_vi = col.get("color_name_vi") or ""
        # e.g. "Trắng Tinh Khôi (Infinity Blanc)" -> "Trắng Tinh Khôi"
        short_name = cname_vi.split("(")[0].strip()
        img = col.get("image_url", "")
        lookup[(model_raw, short_name)] = img
        if cname_vi:
            lookup[(model_raw, cname_vi)] = img

# Also check trims.colors
for car in dataset_cars:
    model_raw = car.get("model_name", "").replace(" ", "")
    for trim in car.get("trims", []):
        for col in trim.get("colors", []):
            cname_vi = col.get("color_name_vi") or ""
            short_name = cname_vi.split("(")[0].strip()
            img = col.get("image_url", "")
            if img:
                lookup[(model_raw, short_name)] = img

db_models_colors = [
    ("VF3", "Hồng nóc Trắng"),
    ("VF3", "Trắng Tinh Khôi"),
    ("VF3", "Vàng nóc Trắng"),
    ("VF3", "Xanh Bạc Hà"),
    ("VF3", "Xanh Cổng Trời nóc Trắng"),
    ("VF3", "Xám Tinh Tế"),
    ("VF3", "Đen Huyền Bí"),
    ("VF3", "Đỏ Năng Lượng"),
    ("VF5", "Trắng Tinh Khôi"),
    ("VF5", "Vàng nóc Đen"),
    ("VF5", "Xanh Bạc Hà"),
    ("VF5", "Xanh Cổng Trời nóc Trắng"),
    ("VF5", "Xám Tinh Tế"),
    ("VF5", "Đen Huyền Bí"),
    ("VF5", "Đỏ Năng Lượng"),
    ("VF6", "Trắng Tinh Khôi"),
    ("VF6", "Xanh Bạc Hà"),
    ("VF6", "Xám Tinh Tế"),
    ("VF6", "Đen Huyền Bí"),
    ("VF6", "Đỏ Năng Lượng"),
    ("VF7", "Trắng Tinh Khôi"),
    ("VF7", "Xanh Bạc Hà"),
    ("VF7", "Xám Tinh Tế"),
    ("VF7", "Đen Huyền Bí"),
    ("VF7", "Đỏ Năng Lượng"),
    ("VF8", "Trắng Tinh Khôi"),
    ("VF8", "Trắng nóc Xám"),
    ("VF8", "Xanh Rêu Đậm"),
    ("VF8", "Xám nóc Bạc"),
    ("VF8", "Đen Huyền Bí"),
    ("VF8", "Đen nóc Đồng"),
    ("VF8", "Đỏ Thẫm Quý Phái"),
    ("VF8", "Đỏ Đậm nóc Đồng"),
    ("VF9", "Bạc Ánh Kim"),
    ("VF9", "Trắng Tinh Khôi"),
    ("VF9", "Xanh Bạc Hà"),
    ("VF9", "Xanh Rêu Đậm"),
    ("VF9", "Xám Tinh Tế"),
    ("VF9", "Đen Huyền Bí"),
    ("VF9", "Đỏ Thẫm Quý Phái"),
]

missing = []
sql_updates = []
mapping_dict = {}

for m, c in db_models_colors:
    url = lookup.get((m, c))
    if not url:
        # try case insensitive or startswith
        found = False
        for (lm, lc), lurl in lookup.items():
            if lm == m and (c in lc or lc in c):
                url = lurl
                found = True
                break
        if not found:
            # Fallback for monotone black
            if m == "VF3":
                url = "https://shop.vinfastauto.com/on/demandware.static/-/Sites-vinfast_vn_master/default/dw0636251d/images/VF3/TI1CV/CE1V.png"
            elif m == "VF5":
                url = "https://shop.vinfastauto.com/on/demandware.static/-/Sites-vinfast_vn_master/default/dwe77f7665/images/VF5/GA12V/111U.png"
            else:
                missing.append((m, c))
    if url:
        mapping_dict.setdefault(m, {})[c] = url
        sql_updates.append(f"UPDATE vehicle_prices SET image_url = '{url}' WHERE model = '{m}' AND color = '{c}';")


print("Matched:", len(sql_updates), "/ 40")
if missing:
    print("Missing:", ascii(missing))

with open("scratch/db_image_updates.sql", "w", encoding="utf-8") as out:
    out.write("\n".join(sql_updates))

with open("scratch/model_color_images.json", "w", encoding="utf-8") as out:
    json.dump(mapping_dict, out, ensure_ascii=False, indent=2)
