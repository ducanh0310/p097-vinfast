import json
import re

with open("scratch/model_color_images.json", "r", encoding="utf-8") as f:
    images = json.load(f)

with open("frontend/lib/vehicle-data.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Models to process
models = ["VF3", "VF5", "VF6", "VF7", "VF8", "VF9"]

for i, m in enumerate(models):
    # Find model block
    start_str = f'"{m}": {{'
    start_pos = content.find(start_str)
    if start_pos == -1:
        continue
    
    # End of this model block is the next model or the end of VEHICLES object
    if i + 1 < len(models):
        next_start = content.find(f'"{models[i+1]}": {{', start_pos)
        block = content[start_pos:next_start]
    else:
        next_start = content.find('export const PROVINCES', start_pos)
        block = content[start_pos:next_start]

    m_images = images.get(m, {})
    for label, url in m_images.items():
        pattern = rf'(\{{\s*id:\s*"[^"]+",\s*label:\s*"{re.escape(label)}",\s*hex:\s*"[^"]+")(\s*\}})'
        replacement = rf'\1, imageUrl: "{url}" \2'
        block = re.sub(pattern, replacement, block)

    content = content[:start_pos] + block + content[next_start:]

with open("frontend/lib/vehicle-data.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Properly updated per-model vehicle-data.ts!")
