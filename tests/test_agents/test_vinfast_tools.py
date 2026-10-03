import json

from src.agents.tools.vinfast_tools import search_vehicles
from src.agents.tools.web_lookup import _host_allowed


def test_search_vehicles_reads_local_catalog():
    result = json.loads(search_vehicles.invoke({
        "vehicle_queries": ["VF 6"],
        "fields": ["price", "colors"],
    }))

    assert len(result["matched_versions"]) >= 1
    assert result["matched_versions"][0]["price_vnd"] > 0
    assert result["matched_versions"][0]["exterior_colors"]


def test_web_lookup_restricts_scheme_and_host():
    allowed_domains = ["vinfastauto.com"]

    assert _host_allowed("https://shop.vinfastauto.com/model", allowed_domains)
    assert not _host_allowed("http://vinfastauto.com/model", allowed_domains)
    assert not _host_allowed("https://vinfastauto.com.attacker.test/model", allowed_domains)
