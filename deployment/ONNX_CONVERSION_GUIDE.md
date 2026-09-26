# ONNX Model Conversion & Static Hosting Guide for MedGuard In-Browser Inference
===================================================================================

This guide details the one-time offline conversion of the Hugging Face models to ONNX formats for client-side execution via `@huggingface/transformers` and `onnxruntime-web`.

---

## 1. Drug NER & Disease NER Conversion (Optimum Exporter)

Neither `OpenMed-NER-PharmaDetect-SuperMedical-125M` nor `OpenMed-NER-DiseaseDetect-BioMed-335M` are pre-exported to ONNX on Hugging Face. Run this one-time command on an offline machine:

```bash
# 1. Install optimum with onnx exporters
pip install "optimum[exporters]" onnx onnxruntime

# 2. Export PharmaDetect NER (125M)
optimum-cli export onnx \
  --model OpenMed/OpenMed-NER-PharmaDetect-SuperMedical-125M \
  --task token-classification \
  pharma_ner_onnx/

# 3. (Optional) Export DiseaseDetect NER (335M)
# Note: Keep the 800MB first-load budget in mind. If exceeding budget, omit or make on-demand.
optimum-cli export onnx \
  --model OpenMed/OpenMed-NER-DiseaseDetect-BioMed-335M \
  --task token-classification \
  disease_ner_onnx/
```

### Hosting the NER Models:
1. Create a repository on Hugging Face under your account (e.g. `your-org/pharma-ner-onnx`).
2. Upload the exported directory structure:
   ```text
   pharma_ner_onnx/
   ├── config.json
   ├── tokenizer.json
   ├── tokenizer_config.json
   └── onnx/
       ├── model.onnx
       └── model_quantized.onnx
   ```
3. In `frontend/src/lib/models.ts`, set:
   ```typescript
   pipeline('token-classification', 'your-org/pharma-ner-onnx')
   ```

---

## 2. CatBoost DDI Classifier to ONNX Conversion

`bprimal/Drug-Drug-Interaction-Classification` uses CatBoost (`.cbm`). Convert it to standard ONNX:

```python
from catboost import CatBoostClassifier

# Load the trained CatBoost model
model = CatBoostClassifier()
model.load_model("catboost_model.cbm")

# Export to ONNX
model.save_model(
    "ddi.onnx",
    format="onnx",
    export_parameters={
        'onnx_domain': 'ai.catboost',
        'onnx_model_version': 1,
        'onnx_doc_string': 'CatBoost DDI Classifier'
    }
)
print("ddi.onnx exported successfully.")
```

### Hosting the DDI ONNX Model:
1. Place the generated `ddi.onnx` into `frontend/public/models/ddi.onnx`.
2. It will be served statically by Vite / web server and loaded in-browser via:
   ```typescript
   import * as ort from 'onnxruntime-web';
   const session = await ort.InferenceSession.create('/models/ddi.onnx');
   ```

---

## 3. Total First-Load Download Budget Breakdown

| Model | Source | Size | Acceleration |
|---|---|---|---|
| **Chat Copilot** | `onnx-community/Qwen2.5-0.5B-Instruct` | ~350 MB | WebGPU / WASM |
| **OCR Scanner** | `Xenova/trocr-small-handwritten` | ~250 MB | WebGPU / WASM |
| **Drug NER** | `pharma_ner_onnx` (quantized) | ~80 MB | WASM |
| **DDI Classifier**| `ddi.onnx` | ~15 MB | WASM |
| **Total** | | **~695 MB** | **Under 800MB Target** |

*Note: The 335M parameter Disease NER model is excluded from the initial bundle to honor the strict <800MB budget constraint.*
