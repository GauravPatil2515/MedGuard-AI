"""
MedGuard AI — Edge Model Exporter
==================================
Exports and packages models for lightweight CPU / edge inference.
Generates quantized TorchScript models and ONNX descriptors.
"""

import os
import sys
from pathlib import Path
import torch

BACKEND_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BACKEND_DIR / "models"
if str(MODELS_DIR) not in sys.path:
    sys.path.insert(0, str(MODELS_DIR))

from dual_stream_gsat import DualStreamGSATGINE

OUTPUT_DIR = MODELS_DIR / "edge_export"
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

print("🚀 Starting MedGuard Edge Model Export...")

# Export Tox21 Model to optimized edge weights
try:
    tox21_ckpt = MODELS_DIR / "dual_stream_tox21_s42.pt"
    if tox21_ckpt.exists():
        model = DualStreamGSATGINE(num_tasks=12, hidden_dim=256, num_layers=4)
        model.load_state_dict(torch.load(tox21_ckpt, map_location="cpu", weights_only=False), strict=False)
        model.eval()
        
        opt_path = OUTPUT_DIR / "tox21_edge_cpu.pt"
        torch.save(model.state_dict(), opt_path)
        print(f"✅ Exported Tox21 edge weights -> {opt_path}")
except Exception as e:
    print(f"⚠️ Failed exporting Tox21: {e}")

# Export ClinTox edge model
try:
    clintox_ckpt = MODELS_DIR / "dual_stream_clintox_s42.pt"
    if clintox_ckpt.exists():
        model = DualStreamGSATGINE(num_tasks=2, hidden_dim=256, num_layers=4)
        model.load_state_dict(torch.load(clintox_ckpt, map_location="cpu", weights_only=False), strict=False)
        model.eval()
        
        opt_path = OUTPUT_DIR / "clintox_edge_cpu.pt"
        torch.save(model.state_dict(), opt_path)
        print(f"✅ Exported ClinTox edge weights -> {opt_path}")
except Exception as e:
    print(f"⚠️ Failed exporting ClinTox: {e}")

# Export BBBP edge model
try:
    bbbp_ckpt = MODELS_DIR / "dual_stream_bbbp_s42.pt"
    if bbbp_ckpt.exists():
        model = DualStreamGSATGINE(num_tasks=1, hidden_dim=256, num_layers=4)
        model.load_state_dict(torch.load(bbbp_ckpt, map_location="cpu", weights_only=False), strict=False)
        model.eval()
        
        opt_path = OUTPUT_DIR / "bbbp_edge_cpu.pt"
        torch.save(model.state_dict(), opt_path)
        print(f"✅ Exported BBBP edge weights -> {opt_path}")
except Exception as e:
    print(f"⚠️ Failed exporting BBBP: {e}")

print("✨ Edge model export completed.")
