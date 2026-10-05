import json

from src.agents.tools.vinfast_tools import (
    lookup_car_color_options,
    lookup_province_fees,
    search_vehicles,
)
from src.agents.tools.web_lookup import _host_allowed


def test_search_vehicles_reads_local_catalog():
    result = json.loads(search_vehicles.invoke({
        "vehicle_queries": ["VF 6"],
        "fields": ["price", "colors"],
    }))

    assert len(result["matched_versions"]) >= 1
    assert result["matched_versions"][0]["price_vnd"] > 0
    assert result["matched_versions"][0]["exterior_colors"] == []
    assert result["catalog_source"] == "dataset/gold/rdb_schema"


def test_lookup_car_color_options_reads_local_catalog():
    result = json.loads(lookup_car_color_options.invoke({"vehicle_queries": ["VF 2"]}))

    assert result["color_options"]
    assert result["color_options"][0]["color"]
    assert result["catalog_source"] == "dataset/gold/rdb_schema/vinfast_car_color_options.csv"


def test_lookup_province_fees_reads_local_catalog():
    result = json.loads(lookup_province_fees.invoke({"province": "Hà Nội"}))

    assert result["fees"]["province"] == "Hà Nội"
    assert result["fees"]["car_license_plate_fee_vnd"] == 14_000_000
    assert result["fees"]["car_registration_fee_percent"] == 0


def test_web_lookup_restricts_scheme_and_host():
    allowed_domains = ["vinfastauto.com"]

    assert _host_allowed("https://shop.vinfastauto.com/model", allowed_domains)
    assert not _host_allowed("http://vinfastauto.com/model", allowed_domains)
    assert not _host_allowed("https://vinfastauto.com.attacker.test/model", allowed_domains)
