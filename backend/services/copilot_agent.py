"""
MedGuard AI — Agentic Copilot & Neuro-Symbolic Clinical Reasoner
===============================================================
Orchestrates a 3-agent clinical loop:
  1. Drug Normalization Agent (Brand -> Generic -> Canonical SMILES)
  2. Molecular Safety & DDI Clashing Agent (Runs Tox21, ClinTox, BBBP, hERG & Symbolic Matrix)
  3. Conversational Copilot Agent (Generates clear vernacular-ready clinical recommendations)
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("medguard.copilot")

from services.drug_dictionary import normalize_drug_name, DRUG_DATABASE
from services.safety_engine import MultiDrugSafetyEngine


class MedGuardCopilotAgent:
    """
    Intelligent agentic assistant that answers user queries, evaluates prospective
    prescriptions, screens drug clashing, and formulates clinician-level explanations.
    """

    def __init__(self, safety_engine: Optional[MultiDrugSafetyEngine] = None):
        self.safety_engine = safety_engine or MultiDrugSafetyEngine()

    def process_message(self, user_message: str, current_regimen: List[str]) -> Dict[str, Any]:
        """
        Processes a chat query or prescription check against the patient's existing regimen.
        Detects if user mentions a new medicine and evaluates prospective interactions.
        """
        lower_msg = user_message.lower()

        # Step 1: Detect mentioned medicines in prompt
        candidate_drugs = []
        for brand in DRUG_DATABASE.keys():
            if brand in lower_msg:
                candidate_drugs.append(brand)
        for data in DRUG_DATABASE.values():
            gen = data["generic"].lower()
            if gen in lower_msg and gen not in candidate_drugs:
                candidate_drugs.append(gen)

        # Merge with existing patient regimen to assess prospective combination
        full_regimen_to_test = list(set([d.lower() for d in current_regimen] + candidate_drugs))
        
        # Step 2: Run Molecular & Symbolic Safety Engine
        safety_report = self.safety_engine.analyze_regimen(full_regimen_to_test)
        
        # Step 3: Formulate Clinical Explanation
        explanation = self._generate_response(user_message, candidate_drugs, current_regimen, safety_report)

        return {
            "query": user_message,
            "detected_drugs": candidate_drugs,
            "safety_status": safety_report["overall_status"],
            "interactions": safety_report["interactions"],
            "molecular_warnings": safety_report.get("molecular_warnings", []),
            "assistant_reply": explanation,
            "recommended_action": "SEEK_PHYSICIAN" if safety_report["overall_status"] == "CRITICAL" else "PROCEED_WITH_CAUTION" if safety_report["overall_status"] == "HIGH" else "SAFE_TO_TAKE"
        }

    def _generate_response(self, user_msg: str, candidate_drugs: List[str],
                           current_regimen: List[str], safety: Dict[str, Any]) -> str:
        """Formulates an evidence-backed neuro-symbolic clinical response."""
        status = safety["overall_status"]
        interactions = safety["interactions"]
        molecular_warns = safety.get("molecular_warnings", [])

        if not candidate_drugs and not current_regimen:
            return "I am MedGuard AI Copilot. Please share a medicine name, upload a prescription photo, or ask about drug safety and interactions."

        parts = []
        if status == "CRITICAL":
            parts.append("🚨 **CRITICAL WARNING DETECTED** 🚨")
            for inter in interactions:
                if inter["severity"] == "CRITICAL":
                    parts.append(f"\n⚠️ **{inter['drug_a']} + {inter['drug_b']} Interaction:**")
                    parts.append(f"• **Hazard:** {inter['title']}")
                    parts.append(f"• **Mechanism:** {inter['mechanism']}")
                    parts.append(f"• **Physician Action:** {inter['action']}")
        elif status == "HIGH":
            parts.append("⚠️ **HIGH CAUTION ADVISED**")
            for inter in interactions:
                parts.append(f"\n• **{inter['drug_a']} + {inter['drug_b']}:** {inter['title']}")
                parts.append(f"  *Mechanism:* {inter['mechanism']}")
        else:
            parts.append("✅ **No severe pharmacokinetic or molecular clashes detected** among tested medications.")

        if molecular_warns:
            parts.append("\n🔬 **Molecular Toxicology & Deep GNN Insights:**")
            for warn in molecular_warns[:3]:
                parts.append(f"• {warn}")

        if safety.get("food_warnings"):
            parts.append("\n🥗 **Dietary & Lifestyle Considerations:**")
            for fw in safety["food_warnings"][:2]:
                parts.append(f"• {fw}")

        parts.append("\n*Disclaimer: MedGuard AI provides assistive neuro-symbolic clinical decision support. Always verify critical drug adjustments with your prescribing clinician.*")

        return "\n".join(parts)
