import json
import re

with open("scratch/model_color_images.json", "r", encoding="utf-8") as f:
    images = json.load(f)

with open("scripts/db/seed.sql", "r", encoding="utf-8") as f:
    sql = f.read()

# Replace column list
sql = sql.replace(
    "INSERT INTO vehicle_prices (id, model, version, color, color_hex, price, price_version, effective_from) VALUES",
    "INSERT INTO vehicle_prices (id, model, version, color, color_hex, price, price_version, effective_from, image_url) VALUES"
)

# Replace each line
lines = sql.splitlines()
new_lines = []
for line in lines:
    m = re.search(r"\(gen_random_uuid\(\),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*'([^']+)',\s*'([^']+)'\)", line)
    if m:
        model, version, color, color_hex, price, price_ver, eff_from = m.groups()
        img = images.get(model, {}).get(color, "")
        updated_line = f"  (gen_random_uuid(), '{model}', '{version}', '{color}', '{color_hex}', {price}, '{price_ver}', '{eff_from}', '{img}'),"
        if line.rstrip().endswith(";"):
            updated_line = updated_line[:-1] + ";"
        new_lines.append(updated_line)
    else:
        new_lines.append(line)

with open("scripts/db/seed.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(new_lines) + "\n")

print("seed.sql updated with image_url!")
