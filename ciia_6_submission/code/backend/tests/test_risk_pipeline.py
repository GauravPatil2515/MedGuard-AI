import unittest
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from services.risk_pipeline import (
    extract_drugs,
    extract_conditions,
    check_interactions,
    lookup_side_effects,
    run_full_pipeline
)


class TestRiskPipeline(unittest.TestCase):

    def test_extract_drugs_known_prescription(self):
        sample_text = "Patient prescribed Tab Warfarin 5mg OD and Combiflam 400mg SOS."
        drugs = extract_drugs(sample_text)
        drug_names = [d["name"].lower() for d in drugs]
        self.assertIn("warfarin", drug_names)
        self.assertIn("combiflam", drug_names)
        for d in drugs:
            self.assertIn("start", d)
            self.assertIn("end", d)
            self.assertIn("confidence", d)
            self.assertGreater(d["confidence"], 0)

    def test_extract_conditions(self):
        sample_text = "Diagnosis: Hypertension and Type 2 Diabetes Mellitus."
        conditions = extract_conditions(sample_text)
        cond_names = [c["name"].lower() for c in conditions]
        self.assertTrue(any("hypertension" in c for c in cond_names))
        self.assertTrue(any("diabetes" in c for c in cond_names))

    def test_check_interactions_flagging(self):
        # Known documented major interaction: Warfarin + Amiodarone
        interactions = check_interactions(["Warfarin", "Amiodarone"], threshold=0.6)
        self.assertGreaterEqual(len(interactions), 1)
        inter = interactions[0]
        self.assertEqual(inter["risk_label"], "Major")
        self.assertGreaterEqual(inter["confidence"], 0.6)
        self.assertTrue("CYP" in inter["description"] or "bleeding" in inter["description"].lower())

    def test_check_interactions_safe_drugs(self):
        # Unrelated safe drugs shouldn't trigger high-risk interaction
        interactions = check_interactions(["Paracetamol", "Vitamin C"], threshold=0.6)
        self.assertEqual(len(interactions), 0)

    def test_lookup_side_effects(self):
        res = lookup_side_effects("Warfarin")
        self.assertEqual(res["drug"], "Warfarin")
        self.assertIsInstance(res["reactions"], list)

    def test_run_full_pipeline(self):
        ocr_text = "Rx: Tab Warfarin 5mg and Tab Amiodarone 100mg for Atrial Fibrillation."
        pipeline_output = run_full_pipeline(ocr_text)

        self.assertIn("drugs", pipeline_output)
        self.assertIn("conditions", pipeline_output)
        self.assertIn("interactions", pipeline_output)
        self.assertIn("side_effects", pipeline_output)
        self.assertIn("needs_review", pipeline_output)
        self.assertIn("disclaimer", pipeline_output)

        self.assertTrue(pipeline_output["needs_review"])
        self.assertIn("AI-generated", pipeline_output["disclaimer"])


if __name__ == "__main__":
    unittest.main()
