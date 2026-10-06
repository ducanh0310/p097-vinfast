import json

result = {}
with open("dataset/silver/silver_vehicles.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        m = data.get("model_name", "").replace(" ", "")
        if m in ["VF3", "VF5", "VF6", "VF7", "VF8", "VF9"]:
            result[m] = []
            for c in data.get("colors", []):
                result[m].append({
                    "color_code": c.get("color_code"),
                    "label": c.get("color_name_vi") or c.get("color_name"),
                    "hex": c.get("color_hex"),
                    "image_url": c.get("image_url")
                })

with open("scratch/colors_dataset.json", "w", encoding="utf-8") as out:
    json.dump(result, out, ensure_ascii=False, indent=2)

print("Done, keys:", list(result.keys()))
for m, cols in result.items():
    print(f"{m}: {len(cols)} colors")
    for c in cols:
        print(f"  {c['label']} -> {c['image_url']}")

