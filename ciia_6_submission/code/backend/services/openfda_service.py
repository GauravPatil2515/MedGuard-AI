"""
MedGuard AI — OpenFDA Adverse Event & Drug Recall Cross-Reference
==================================================================
Supplements GNN molecular models with FDA's real-world adverse event signals.
Uses OpenFDA's free public API (no key required for basic queries).

Endpoints used:
  - /drug/event.json       (FAERS adverse event reports)
  - /drug/enforcement.json (Recalls & market withdrawals)
  - /drug/label.json       (Structured product labels, interactions section)
"""

import logging
import time
import functools
from typing import Dict, Any, List, Optional

logger = logging.getLogger("medguard.openfda")

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

OPENFDA_BASE = "https://api.fda.gov"
REQUEST_TIMEOUT = 6  # seconds
CACHE: Dict[str, Any] = {}
CACHE_TTL = 3600  # 1 hour


def _cached_get(url: str, params: dict) -> Optional[dict]:
    """Simple in-memory cache layer over OpenFDA requests."""
    cache_key = url + str(sorted(params.items()))
    if cache_key in CACHE:
        ts, result = CACHE[cache_key]
        if time.time() - ts < CACHE_TTL:
            return result

    if not HAS_REQUESTS:
        return None
    try:
        resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            CACHE[cache_key] = (time.time(), data)
            return data
    except Exception as e:
        logger.warning(f"OpenFDA request failed: {e}")
    return None


def get_fda_adverse_events(drug_name: str, limit: int = 5) -> List[Dict]:
    """
    Queries OpenFDA FAERS for top adverse event signals for a drug.
    Returns list of {reaction, count} ranked by frequency.
    """
    url = f"{OPENFDA_BASE}/drug/event.json"
    params = {
        "search": f'patient.drug.medicinalproduct:"{drug_name}"',
        "count": "patient.reaction.reactionmeddrapt.exact",
        "limit": limit
    }
    data = _cached_get(url, params)
    if data and "results" in data:
        return [
            {"reaction": r["term"].title(), "count": r["count"]}
            for r in data["results"][:limit]
        ]
    return []


def get_fda_recalls(drug_name: str) -> List[Dict]:
    """
    Queries OpenFDA drug enforcement database for active recalls.
    Returns list of {product, reason, classification, date} if any found.
    """
    url = f"{OPENFDA_BASE}/drug/enforcement.json"
    params = {
        "search": f'product_description:"{drug_name}"&status:"Ongoing"',
        "limit": 3
    }
    data = _cached_get(url, params)
    if data and "results" in data:
        return [
            {
                "product": r.get("product_description", "")[:80],
                "reason": r.get("reason_for_recall", "")[:120],
                "classification": r.get("classification", ""),
                "recall_date": r.get("recall_initiation_date", ""),
                "status": r.get("status", "")
            }
            for r in data["results"]
        ]
    return []


def get_fda_interactions_label(drug_name: str) -> List[str]:
    """
    Queries OpenFDA structured product labels for drug interaction warnings.
    Returns up to 3 interaction warning snippets from the label.
    """
    url = f"{OPENFDA_BASE}/drug/label.json"
    params = {
        "search": f'openfda.brand_name:"{drug_name}"',
        "limit": 1
    }
    data = _cached_get(url, params)
    if data and "results" in data:
        label = data["results"][0]
        interactions = label.get("drug_interactions", [])
        # Take first 300 chars of each entry, max 3
        return [i[:300] for i in interactions[:3]]
    return []


def cross_reference_drugs(drug_names: List[str]) -> Dict[str, Any]:
    """
    Runs all three OpenFDA cross-references for a list of drug names.
    Returns a combined safety intelligence report.
    """
    report = {
        "openfda_query_count": len(drug_names),
        "recalls": {},
        "top_adverse_events": {},
        "label_interactions": {}
    }

    for name in drug_names:
        # Only use the primary name (before "+" for combination drugs)
        query_name = name.split("+")[0].strip()

        adverse = get_fda_adverse_events(query_name, limit=5)
        recalls = get_fda_recalls(query_name)
        label_ints = get_fda_interactions_label(query_name)

        if adverse:
            report["top_adverse_events"][name] = adverse
        if recalls:
            report["recalls"][name] = recalls
        if label_ints:
            report["label_interactions"][name] = label_ints

    report["has_recalls"] = bool(report["recalls"])
    report["has_adverse_events"] = bool(report["top_adverse_events"])
    return report
