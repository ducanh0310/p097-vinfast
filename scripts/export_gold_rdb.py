import csv
from pathlib import Path

from src.pipeline.extractors.relational_extractor import RelationalExtractor


def export():
    bronze_path = Path("dataset/bronze")
    out_dir = Path("dataset/gold/rdb_schema")
    out_dir.mkdir(parents=True, exist_ok=True)

    extractor = RelationalExtractor(bronze_dir=bronze_path)
    tables = extractor.get_relational_tables(cars_only=True)

    for table_name, rows in tables.items():
        if not rows:
            continue
        file_path = out_dir / f"{table_name}.csv"
        headers = list(rows[0].keys())
        with open(file_path, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(rows)
        print(f"Exported {len(rows)} rows to {file_path}")

if __name__ == "__main__":
    export()
