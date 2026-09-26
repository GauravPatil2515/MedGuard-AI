# MedGuard Pretrained Models & Architectures

This directory contains the Python model architecture files, featurizers, and conformal prediction reasoning engines:
- `attention_ginet.py` — Attention-based Graph Isomorphism Network.
- `cardiotox.py` / `cipa_cardiotox.py` — hERG and CiPA cardiotoxicity assessment engines.
- `conformal_predictor.py` — Calibrated 95% conformal confidence interval predictor.
- `dual_stream_gsat.py` — Dual-Stream Graph Self-Attention Transformer.
- `reasoner.py` / `tox_engine.py` — Molecular toxicity inference coordinator.

### Pretrained Binary Model Weights
To keep this repository lightweight and suitable for GitHub upload without Git LFS, binary model checkpoint weights (`*.pth`, `*.pt`, `*.pkl`) are excluded from direct version control.
- In production, client-side on-device models are cached in-browser via `@huggingface/transformers` and ONNX Web (`Xenova/trocr-small-handwritten`, `OpenMed-NER-PharmaDetect-125M`, `CatBoost DDI`, and `Qwen2.5-0.5B-Instruct`).
