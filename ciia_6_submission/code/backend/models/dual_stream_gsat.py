#!/usr/bin/env python3
"""
Dual-Stream Gated GSATGINE Architecture (DeNovo v2 Foundation)
============================================================
Combines:
  1. Stream A (Local Graph Stream): GSATGINE with stochastic edge-attention
     and dataset/pocket-adaptive Information Bottleneck (IB) for intrinsic,
     chemically faithful subgraph extraction.
  2. Stream B (Global Physicochemical Stream): Dense molecular descriptors +
     Morgan circular fingerprints to preserve global context (steric volume,
     TPSA, LogP, diffuse binding envelopes) without polluting local graph attributions.
  3. Gated Multi-Scale Fusion Head: Dynamic gating w = sigmoid(MLP([h_sub, h_global]))
     allowing the model to smoothly interpolate between purely local toxicophores (Tox21)
     and diffuse binding pockets (BACE-1, BBBP).
"""

from __future__ import annotations

import math
from typing import Dict, List, Optional, Tuple, Union

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import Tensor
from torch_geometric.data import Batch, Data
from torch_geometric.nn import GINEConv, global_add_pool, global_mean_pool

try:
    from rdkit import Chem
    from rdkit.Chem import AllChem, Descriptors, rdMolDescriptors
    HAS_RDKIT = True
except ImportError:
    HAS_RDKIT = False


# ---------------------------------------------------------------------------
# Featurization
# ---------------------------------------------------------------------------
def _one_hot(value: int, choices: List[int]) -> List[float]:
    out = [0.0] * len(choices)
    if value in choices:
        out[choices.index(value)] = 1.0
    return out


def extract_atom_features(atom) -> List[float]:
    """Dense atom feature vector (dim = 17)."""
    feat = []
    feat.append(float(atom.GetAtomicNum()))
    feat += _one_hot(atom.GetAtomicNum(), [6, 7, 8, 9, 15, 16, 17, 35, 53])  # 9 common
    feat.append(atom.GetDegree() / 6.0)
    feat.append(float(atom.GetFormalCharge()))
    feat.append(float(atom.GetNumRadicalElectrons()))
    feat.append(float(int(atom.GetHybridization())))
    feat.append(float(int(atom.GetIsAromatic())))
    feat.append(atom.GetTotalNumHs() / 4.0)
    feat.append(float(int(atom.GetChiralTag())))
    return feat


def extract_bond_features(bond) -> List[float]:
    """Dense bond feature vector (dim = 7)."""
    bt = bond.GetBondType()
    feat = [
        1.0 if bt == Chem.rdchem.BondType.SINGLE else 0.0,
        1.0 if bt == Chem.rdchem.BondType.DOUBLE else 0.0,
        1.0 if bt == Chem.rdchem.BondType.TRIPLE else 0.0,
        1.0 if bt == Chem.rdchem.BondType.AROMATIC else 0.0,
        float(int(bond.GetIsConjugated())),
        float(int(bond.IsInRing())),
        float(int(bond.GetStereo())),
    ]
    return feat


def extract_global_descriptors(mol) -> np.ndarray:
    """
    Extracts 256-bit Morgan Fingerprint (radius=2) + 16 normalized physicochemical descriptors.
    Total dimension = 272.
    """
    if mol is None:
        return np.zeros(272, dtype=np.float32)

    # 1. Morgan Fingerprint (256 bits)
    fp = AllChem.GetMorganFingerprintAsBitVect(mol, radius=2, nBits=256)
    fp_arr = np.zeros((256,), dtype=np.float32)
    for idx in fp.GetOnBits():
        fp_arr[idx] = 1.0

    # 2. Key Physicochemical Descriptors (16 features)
    try:
        mw = Descriptors.MolWt(mol) / 500.0
        logp = Descriptors.MolLogP(mol) / 5.0
        tpsa = Descriptors.TPSA(mol) / 150.0
        hbd = Descriptors.NumHDonors(mol) / 5.0
        hba = Descriptors.NumHAcceptors(mol) / 10.0
        rotb = Descriptors.NumRotatableBonds(mol) / 10.0
        fsp3 = Descriptors.FractionCSP3(mol)
        rings = Descriptors.RingCount(mol) / 5.0
        aromatic_rings = Descriptors.NumAromaticRings(mol) / 4.0
        heavy_atoms = mol.GetNumHeavyAtoms() / 50.0
        nocount = Descriptors.NOCount(mol) / 10.0
        nhohcount = Descriptors.NHOHCount(mol) / 5.0
        qed = Descriptors.qed(mol)
        halogens = sum(1 for atom in mol.GetAtoms() if atom.GetAtomicNum() in [9, 17, 35, 53]) / 5.0
        aromatic_atoms = sum(1 for atom in mol.GetAtoms() if atom.GetIsAromatic())
        aromatic_ratio = aromatic_atoms / max(1, mol.GetNumAtoms())
        chiral_centers = len(Chem.FindMolChiralCenters(mol, includeUnassigned=True)) / 4.0
        
        phys_arr = np.array([
            mw, logp, tpsa, hbd, hba, rotb, fsp3, rings,
            aromatic_rings, heavy_atoms, nocount, nhohcount, qed,
            halogens, aromatic_ratio, chiral_centers
        ], dtype=np.float32)
    except Exception:
        phys_arr = np.zeros(16, dtype=np.float32)

    return np.concatenate([fp_arr, phys_arr], axis=0)


def mol_to_dual_stream_data(smiles: str) -> Optional[Data]:
    """Converts SMILES into PyG Data containing graph + global descriptors."""
    if not HAS_RDKIT or not isinstance(smiles, str) or len(smiles.strip()) == 0:
        return None
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None

    # Graph stream
    atom_feats = [extract_atom_features(a) for a in mol.GetAtoms()]
    if len(atom_feats) == 0:
        return None

    edges = []
    edge_feats = []
    for bond in mol.GetBonds():
        u = bond.GetBeginAtomIdx()
        v = bond.GetEndAtomIdx()
        bf = extract_bond_features(bond)
        edges.append((u, v))
        edge_feats.append(bf)
        edges.append((v, u))
        edge_feats.append(bf)

    x = torch.tensor(atom_feats, dtype=torch.float32)
    if len(edges) == 0:
        edge_index = torch.empty((2, 0), dtype=torch.long)
        edge_attr = torch.empty((0, 7), dtype=torch.float32)
    else:
        edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
        edge_attr = torch.tensor(edge_feats, dtype=torch.float32)

    # Global descriptor stream
    global_feats = extract_global_descriptors(mol)
    global_x = torch.tensor(global_feats, dtype=torch.float32).unsqueeze(0)  # [1, 272]

    # Target-adaptive information bottleneck metadata
    aromatic_atoms = sum(1 for atom in mol.GetAtoms() if atom.GetIsAromatic())
    aromatic_ratio = aromatic_atoms / max(1, mol.GetNumAtoms())

    data = Data(
        x=x,
        edge_index=edge_index,
        edge_attr=edge_attr,
        global_x=global_x,
        smiles=smiles,
        num_nodes=x.size(0),
        aromatic_ratio=aromatic_ratio,
    )
    return data


# ---------------------------------------------------------------------------
# GSAT Concrete Distribution Sampling
# ---------------------------------------------------------------------------
def concrete_sample(attn: Tensor, temperature: float = 1.0) -> Tensor:
    """Continuous relaxation of discrete Bernoulli sampling (Concrete distribution)."""
    eps = 1e-6
    a = attn.clamp(eps, 1.0 - eps)
    noise = torch.rand_like(a).clamp(eps, 1.0 - eps)
    logits = torch.log(a) - torch.log(1.0 - a)
    z = logits + torch.log(noise) - torch.log(1.0 - noise)
    return torch.sigmoid(z / max(temperature, 0.1))


# ---------------------------------------------------------------------------
# Dual-Stream Gated GSATGINE Model
# ---------------------------------------------------------------------------
class DualStreamGSATGINE(nn.Module):
    """
    Dual-Stream Architecture uniting GSAT-GINE with Global Molecular Context.
    """

    def __init__(
        self,
        in_atom_dim: int = 17,
        in_edge_dim: int = 7,
        in_global_dim: int = 272,
        hidden_dim: int = 256,
        out_dim: int = 256,
        num_tasks: int = 1,
        num_layers: int = 4,
        dropout: float = 0.15,
        gsat_temp: float = 1.0,
        gsat_beta: float = 0.05,
    ):
        super().__init__()
        self.in_atom_dim = in_atom_dim
        self.in_edge_dim = in_edge_dim
        self.in_global_dim = in_global_dim
        self.hidden_dim = hidden_dim
        self.out_dim = out_dim
        self.num_tasks = num_tasks
        self.gsat_temp = gsat_temp
        self.gsat_beta = gsat_beta

        # 1. Graph Stream Projections & GINE Layers
        self.atom_lin = nn.Linear(in_atom_dim, hidden_dim)
        self.edge_lin = nn.Linear(in_edge_dim, hidden_dim)

        self.convs = nn.ModuleList()
        self.bns = nn.ModuleList()
        for _ in range(num_layers):
            mlp = nn.Sequential(
                nn.Linear(hidden_dim, hidden_dim),
                nn.LayerNorm(hidden_dim),
                nn.ReLU(),
                nn.Dropout(dropout),
                nn.Linear(hidden_dim, hidden_dim),
            )
            self.convs.append(GINEConv(mlp, edge_dim=hidden_dim, aggr="add"))
            self.bns.append(nn.LayerNorm(hidden_dim))

        # Stochastic Edge Attention Network [h_u, h_v, edge_attr]
        self.attn_mlp = nn.Sequential(
            nn.Linear(2 * hidden_dim + in_edge_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, 1),
        )

        # 2. Global Stream MLP (uses LayerNorm for robust single-molecule batch support)
        self.global_mlp = nn.Sequential(
            nn.Linear(in_global_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU(),
        )

        # 3. Gated Multi-Scale Fusion
        self.gate_mlp = nn.Sequential(
            nn.Linear(2 * hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.Sigmoid(),
        )

        self.dropout = nn.Dropout(dropout)

        # 4. Final Classification Head
        self.head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, num_tasks),
        )

        # Stash for Faithfulness & IB Audits
        self._last_edge_attn = None
        self._last_edge_mask = None
        self._last_ib_penalty = None
        self._last_gate_weight = None

    def _edge_attention(self, x: Tensor, edge_index: Tensor, edge_attr_raw: Tensor) -> Tensor:
        """Symmetric per-edge attention in (0, 1)."""
        u, v = edge_index[0], edge_index[1]
        lo = torch.where(u < v, u, v)
        hi = torch.where(u < v, v, u)
        pair_feat = torch.cat([x[lo], x[hi], edge_attr_raw], dim=-1)
        return torch.sigmoid(self.attn_mlp(pair_feat))

    @staticmethod
    def _edge_entropy(attn: Tensor) -> Tensor:
        """Mean binary entropy over edge attention scores."""
        eps = 1e-6
        a = attn.clamp(eps, 1.0 - eps)
        ent = -a * torch.log(a) - (1.0 - a) * torch.log(1.0 - a)
        return ent.mean()

    def _pass(self, x0: Tensor, edge_index: Tensor, edge_attr_proj: Tensor) -> Tensor:
        """GINE message passing pass."""
        x = self.atom_lin(x0)
        for conv, bn in zip(self.convs, self.bns):
            x = conv(x, edge_index, edge_attr_proj)
            x = bn(x)
            x = F.relu(x)
            x = self.dropout(x)
        return x

    def forward(self, data: Batch, sample: bool = True) -> Tensor:
        x0 = data.x
        edge_index = data.edge_index
        edge_attr_raw = data.edge_attr
        global_x = data.global_x
        batch = getattr(data, "batch", None)

        if batch is None:
            batch = torch.zeros(x0.size(0), dtype=torch.long, device=x0.device)

        # ----------------------------------------------------
        # 1. Graph Stream (GSATGINE)
        # ----------------------------------------------------
        edge_attr_clean = self.edge_lin(edge_attr_raw)
        h_clean = self._pass(x0, edge_index, edge_attr_clean)

        if edge_index.size(1) > 0:
            attn = self._edge_attention(h_clean, edge_index, edge_attr_raw)
            if self.training and sample:
                mask = concrete_sample(attn, self.gsat_temp)
                self._last_ib_penalty = self.gsat_beta * self._edge_entropy(attn)
            else:
                mask = attn
                self._last_ib_penalty = None
            edge_attr_masked = edge_attr_clean * mask
        else:
            attn = torch.empty((0, 1), device=x0.device)
            mask = attn
            edge_attr_masked = edge_attr_clean
            self._last_ib_penalty = torch.tensor(0.0, device=x0.device)

        h_masked = self._pass(x0, edge_index, edge_attr_masked)
        h_sub = global_mean_pool(h_masked, batch)  # [B, hidden_dim]

        self._last_edge_attn = attn.detach()
        self._last_edge_mask = mask.detach()

        # ----------------------------------------------------
        # 2. Global Stream
        # ----------------------------------------------------
        if global_x.dim() == 3:
            global_x = global_x.squeeze(1)
        h_global = self.global_mlp(global_x)  # [B, hidden_dim]

        # ----------------------------------------------------
        # 3. Gated Fusion
        # ----------------------------------------------------
        gate = self.gate_mlp(torch.cat([h_sub, h_global], dim=-1))  # [B, hidden_dim]
        h_fused = gate * h_sub + (1.0 - gate) * h_global

        self._last_gate_weight = gate.mean().item()

        # ----------------------------------------------------
        # 4. Classification Output
        # ----------------------------------------------------
        logits = self.head(h_fused)
        return logits

    def get_edge_attention(self) -> Optional[Tensor]:
        return self._last_edge_attn

    def get_ib_penalty(self) -> Optional[Tensor]:
        return self._last_ib_penalty

    def get_last_gate_weight(self) -> Optional[float]:
        return self._last_gate_weight


# ---------------------------------------------------------------------------
# Quick Verification
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    model = DualStreamGSATGINE(num_tasks=1, gsat_beta=0.03)
    smiles_list = ["CCO", "c1ccccc1NC(=O)C", "CC(=O)Oc1ccccc1C(=O)O"]
    data_list = [mol_to_dual_stream_data(s) for s in smiles_list if mol_to_dual_stream_data(s) is not None]
    batch = Batch.from_data_list(data_list)

    model.train()
    out = model(batch)
    print(f"✅ DualStreamGSATGINE Train Forward: Out Shape = {out.shape}, IB Penalty = {model.get_ib_penalty().item():.5f}, Gate = {model.get_last_gate_weight():.4f}")

    model.eval()
    with torch.no_grad():
        out_e = model(batch, sample=False)
    print(f"✅ DualStreamGSATGINE Eval Forward: Out Shape = {out_e.shape}, Mean Edge Attn = {model.get_edge_attention().mean().item():.4f}")
