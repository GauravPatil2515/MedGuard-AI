"""
MedGuard AI - Indian Brand Name to Generic & Molecular SMILES Dictionary
========================================================================
Maps common Indian commercial formulations to active ingredients, canonical SMILES,
pharmacological classes, and criticality weights for polypharmacy triage.
"""

from typing import Dict, Any, Optional

DRUG_DATABASE: Dict[str, Dict[str, Any]] = {
    # --- Cardiovascular & Anticoagulants ---
    "warfarin": {
        "generic": "Warfarin",
        "smiles": "CC(=O)CC(c1ccccc1)c1c(O)c2ccccc2oc1=O",
        "class": "Anticoagulant (Vitamin K Antagonist)",
        "criticality": "HIGH",
        "cns_penetration": False,
        "food_warnings": ["Avoid large quantities of leafy green vegetables (high Vitamin K reduces efficacy).", "Avoid cranberry juice."]
    },
    "coumadin": {
        "generic": "Warfarin",
        "smiles": "CC(=O)CC(c1ccccc1)c1c(O)c2ccccc2oc1=O",
        "class": "Anticoagulant (Vitamin K Antagonist)",
        "criticality": "HIGH",
        "cns_penetration": False,
        "food_warnings": ["Avoid large quantities of leafy green vegetables."]
    },
    "amiodarone": {
        "generic": "Amiodarone",
        "smiles": "CCCCc1oc2ccccc2c1C(=O)c1cc(I)c(OCCN(CC)CC)c(I)c1",
        "class": "Class III Antiarrhythmic",
        "criticality": "HIGH",
        "cns_penetration": False,
        "food_warnings": ["Avoid grapefruit juice (inhibits CYP3A4 metabolism and elevates toxicity)."]
    },
    "cordarone": {
        "generic": "Amiodarone",
        "smiles": "CCCCc1oc2ccccc2c1C(=O)c1cc(I)c(OCCN(CC)CC)c(I)c1",
        "class": "Class III Antiarrhythmic",
        "criticality": "HIGH",
        "cns_penetration": False,
        "food_warnings": ["Avoid grapefruit juice."]
    },
    "ecosprin": {
        "generic": "Aspirin",
        "smiles": "CC(=O)Oc1ccccc1C(=O)O",
        "class": "Antiplatelet / Salicylate",
        "criticality": "MEDIUM",
        "cns_penetration": False,
        "food_warnings": ["Take with food to minimize gastric irritation."]
    },
    "aspirin": {
        "generic": "Aspirin",
        "smiles": "CC(=O)Oc1ccccc1C(=O)O",
        "class": "Antiplatelet / Salicylate",
        "criticality": "MEDIUM",
        "cns_penetration": False,
        "food_warnings": ["Take after food."]
    },
    "clopidogrel": {
        "generic": "Clopidogrel",
        "smiles": "COC(=O)[C@H](c1ccccc1Cl)N1CCc2sccc2C1",
        "class": "P2Y12 Antiplatelet",
        "criticality": "HIGH",
        "cns_penetration": False,
        "food_warnings": ["Avoid omeprazole without doctor consultation."]
    },
    "clopilet": {
        "generic": "Clopidogrel",
        "smiles": "COC(=O)[C@H](c1ccccc1Cl)N1CCc2sccc2C1",
        "class": "P2Y12 Antiplatelet",
        "criticality": "HIGH",
        "cns_penetration": False,
        "food_warnings": ["Avoid omeprazole."]
    },
    "telma": {
        "generic": "Telmisartan",
        "smiles": "CCCC1=NC2=C(C)C(=C(C=C2N1Cc1ccc(cc1)c1ccccc1C(=O)O)C)C",
        "class": "Angiotensin II Receptor Blocker (ARB)",
        "criticality": "MEDIUM",
        "cns_penetration": False,
        "food_warnings": ["Avoid potassium supplements and salt substitutes containing potassium."]
    },
    "telmisartan": {
        "generic": "Telmisartan",
        "smiles": "CCCC1=NC2=C(C)C(=C(C=C2N1Cc1ccc(cc1)c1ccccc1C(=O)O)C)C",
        "class": "Angiotensin II Receptor Blocker (ARB)",
        "criticality": "MEDIUM",
        "cns_penetration": False,
        "food_warnings": ["Avoid potassium supplements."]
    },
    "telma-h": {
        "generic": "Telmisartan + Hydrochlorothiazide",
        "smiles": "CCCC1=NC2=C(C)C(=C(C=C2N1Cc1ccc(cc1)c1ccccc1C(=O)O)C)C",
        "class": "ARB + Thiazide Diuretic",
        "criticality": "MEDIUM",
        "cns_penetration": False,
        "food_warnings": ["Take in the morning to prevent nighttime urination."]
    },
    "met-xl": {
        "generic": "Metoprolol Succinate",
        "smiles": "COCCC1=CC=C(OCC(O)CNC(C)C)C=C1",
        "class": "Beta-1 Adrenergic Blocker",
        "criticality": "HIGH",
        "cns_penetration": True,
        "food_warnings": ["Do not stop taking abruptly; risk of rebound tachycardia."]
    },
    "metoprolol": {
        "generic": "Metoprolol",
        "smiles": "COCCC1=CC=C(OCC(O)CNC(C)C)C=C1",
        "class": "Beta-1 Adrenergic Blocker",
        "criticality": "HIGH",
        "cns_penetration": True,
        "food_warnings": ["Do not stop abruptly."]
    },
    "atorvastatin": {
        "generic": "Atorvastatin",
        "smiles": "CC(C)c1c(C(=O)Nc2ccccc2)c(-c2ccccc2)c(-c2ccc(F)cc2)n1CC[C@@H](O)C[C@@H](O)CC(=O)O",
        "class": "HMG-CoA Reductase Inhibitor (Statin)",
        "criticality": "LOW",
        "cns_penetration": False,
        "food_warnings": ["Avoid grapefruit juice (increases statin blood concentration)."]
    },
    "atorva": {
        "generic": "Atorvastatin",
        "smiles": "CC(C)c1c(C(=O)Nc2ccccc2)c(-c2ccccc2)c(-c2ccc(F)cc2)n1CC[C@@H](O)C[C@@H](O)CC(=O)O",
        "class": "Statin",
        "criticality": "LOW",
        "cns_penetration": False,
        "food_warnings": ["Avoid grapefruit juice."]
    },

    # --- NSAIDs & Pain Relief ---
    "combiflam": {
        "generic": "Ibuprofen + Paracetamol",
        "smiles": "CC(C)Cc1ccc(C(C)C(=O)O)cc1",
        "class": "NSAID + Analgesic",
        "criticality": "MEDIUM",
        "cns_penetration": False,
        "food_warnings": ["Take with milk or meal to avoid stomach upset.", "Contraindicated with blood thinners."]
    },
    "ibuprofen": {
        "generic": "Ibuprofen",
        "smiles": "CC(C)Cc1ccc(C(C)C(=O)O)cc1",
        "class": "NSAID",
        "criticality": "MEDIUM",
        "cns_penetration": False,
        "food_warnings": ["Take with food."]
    },
    "voveran": {
        "generic": "Diclofenac Sodium",
        "smiles": "O=C(O)Cc1ccccc1Nc1c(Cl)cccc1Cl",
        "class": "NSAID",
        "criticality": "MEDIUM",
        "cns_penetration": False,
        "food_warnings": ["High risk of gastrointestinal bleeding when combined with anticoagulants."]
    },
    "diclofenac": {
        "generic": "Diclofenac",
        "smiles": "O=C(O)Cc1ccccc1Nc1c(Cl)cccc1Cl",
        "class": "NSAID",
        "criticality": "MEDIUM",
        "cns_penetration": False,
        "food_warnings": ["Take after meal."]
    },
    "dolo": {
        "generic": "Paracetamol 650mg",
        "smiles": "CC(=O)Nc1ccc(O)cc1",
        "class": "Analgesic / Antipyretic",
        "criticality": "LOW",
        "cns_penetration": True,
        "food_warnings": ["Do not exceed 4g/day to avoid acute hepatotoxicity."]
    },
    "paracetamol": {
        "generic": "Paracetamol",
        "smiles": "CC(=O)Nc1ccc(O)cc1",
        "class": "Analgesic / Antipyretic",
        "criticality": "LOW",
        "cns_penetration": True,
        "food_warnings": ["Limit alcohol consumption."]
    },

    # --- Diabetes & Endocrine ---
    "glycomet": {
        "generic": "Metformin",
        "smiles": "CN(C)C(=N)NC(=N)N",
        "class": "Biguanide Antidiabetic",
        "criticality": "HIGH",
        "cns_penetration": False,
        "food_warnings": ["Take with meals to reduce gastrointestinal side effects."]
    },
    "metformin": {
        "generic": "Metformin",
        "smiles": "CN(C)C(=N)NC(=N)N",
        "class": "Biguanide Antidiabetic",
        "criticality": "HIGH",
        "cns_penetration": False,
        "food_warnings": ["Take with food."]
    },
    "amaryl": {
        "generic": "Glimepiride",
        "smiles": "CCc1c(C)c(N(C)C(=O)CCc2ccc(S(=O)(=O)NC(=O)NC3CCC(C)CC3)cc2)on1",
        "class": "Sulfonylurea Antidiabetic",
        "criticality": "HIGH",
        "cns_penetration": False,
        "food_warnings": ["Take immediately before or with breakfast to prevent hypoglycemia."]
    },

    # --- Gastrointestinal ---
    "pan-d": {
        "generic": "Pantoprazole + Domperidone",
        "smiles": "COc1ccc2[nH]c(S(=O)Cc3ncc(OC)c(OC)c3)nc2c1",
        "class": "PPI + Prokinetic",
        "criticality": "LOW",
        "cns_penetration": False,
        "food_warnings": ["Take 30 minutes before breakfast on an empty stomach."]
    },
    "pantoprazole": {
        "generic": "Pantoprazole",
        "smiles": "COc1ccc2[nH]c(S(=O)Cc3ncc(OC)c(OC)c3)nc2c1",
        "class": "Proton Pump Inhibitor (PPI)",
        "criticality": "LOW",
        "cns_penetration": False,
        "food_warnings": ["Take 30 minutes before breakfast."]
    },

    # --- Antibiotics & Anti-Infectives ---
    "augmentin": {
        "generic": "Amoxicillin + Clavulanic Acid",
        "smiles": "CC1(C)S[C@@H]2[C@H](NC(=O)[C@H](N)c3ccc(O)cc3)C(=O)N2[C@H]1C(=O)O",
        "class": "Penicillin Antibiotic + Beta-lactamase inhibitor",
        "criticality": "MEDIUM",
        "cns_penetration": False,
        "food_warnings": ["Complete the entire prescribed antibiotic course."]
    },
    "ciprofloxacin": {
        "generic": "Ciprofloxacin",
        "smiles": "O=C(O)c1cn(C2CC2)c2cc(N3CCNCC3)c(F)cc2c1=O",
        "class": "Fluoroquinolone Antibiotic",
        "criticality": "HIGH",
        "cns_penetration": False,
        "food_warnings": ["Do not take with milk, yogurt, or calcium-fortified juice (reduces absorption).", "QT prolongation risk."]
    },
    "azithromycin": {
        "generic": "Azithromycin",
        "smiles": "CC[C@@H]1OC(=O)[C@H](C)[C@@H](O[C@H]2C[C@@](C)(OC)[C@@H](O)[C@H](C)O2)[C@H](C)[C@@H](O[C@@H]3O[C@H](C)C[C@@H](N(C)C)[C@@H]3O)[C@](C)(O)C[C@@H](C)CN(C)[C@H](C)[C@@H](O)[C@]1(C)O",
        "class": "Macrolide Antibiotic",
        "criticality": "HIGH",
        "cns_penetration": False,
        "food_warnings": ["Can prolong cardiac QT interval, especially when combined with antiarrhythmics."]
    },
    "azithral": {
        "generic": "Azithromycin",
        "smiles": "CC[C@@H]1OC(=O)[C@H](C)[C@@H](O[C@H]2C[C@@](C)(OC)[C@@H](O)[C@H](C)O2)[C@H](C)[C@@H](O[C@@H]3O[C@H](C)C[C@@H](N(C)C)[C@@H]3O)[C@](C)(O)C[C@@H](C)CN(C)[C@H](C)[C@@H](O)[C@]1(C)O",
        "class": "Macrolide Antibiotic",
        "criticality": "HIGH",
        "cns_penetration": False,
        "food_warnings": ["Cardiac QT interval prolongation risk."]
    }
}


def normalize_drug_name(raw_name: str) -> Optional[Dict[str, Any]]:
    """
    Fuzzy normalizes user/prescription input to standard drug record.
    Matches Indian brand names, generic names, and dosage strings.
    """
    cleaned = raw_name.lower().strip()
    # Strip dose markers like 500mg, 10mg, etc.
    words = cleaned.replace("-", " ").replace("+", " ").split()
    
    # Direct match first
    if cleaned in DRUG_DATABASE:
        return DRUG_DATABASE[cleaned]
    
    # Check individual tokens
    for token in words:
        for key, record in DRUG_DATABASE.items():
            if token == key or token == record["generic"].lower():
                return record
            if key in token or token in key:
                if len(token) >= 4:
                    return record
                    
    return None
