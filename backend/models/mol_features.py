"""
MedGuard AI — RDKit Molecular Graph Feature Extractor
=====================================================
Converts a SMILES string into a PyG Data object with atom (node)
and bond (edge) features matching the training-time featurisation.
"""

import torch
from torch_geometric.data import Data

try:
    from rdkit import Chem
    from rdkit.Chem import AllChem
    RDKIT_OK = True
except ImportError:
    RDKIT_OK = False

# ── Atom allowlists ──────────────────────────────────────────────────────────
ATOM_LIST = list(range(1, 119))  # atomic numbers 1-118

CHIRALITY_MAP = {
    "CHI_UNSPECIFIED":    0,
    "CHI_TETRAHEDRAL_CW": 1,
    "CHI_TETRAHEDRAL_CCW":2,
    "OTHER":              3,
}
BOND_TYPE_MAP = {
    "SINGLE":    0,
    "DOUBLE":    1,
    "TRIPLE":    2,
    "AROMATIC":  3,
    "SELF_LOOP": 4,
}
BOND_DIR_MAP = {
    "NONE":      0,
    "BEGINWEDGE":1,
    "BEGINDASH": 2,
}


def _atom_features(atom) -> list:
    """Returns [atomic_number_idx, chirality_idx]."""
    an = atom.GetAtomicNum()
    an_idx = an if an < 120 else 0           # embedding index (0-119)
    chir_str = str(atom.GetChiralTag()).split(".")[-1]
    chir_idx = CHIRALITY_MAP.get(chir_str, 0)
    return [an_idx, chir_idx]


def _bond_features(bond) -> list:
    """Returns [bond_type_idx, bond_direction_idx]."""
    bt = str(bond.GetBondTypeAsDouble())
    bt_str = {1.0: "SINGLE", 2.0: "DOUBLE", 3.0: "TRIPLE", 1.5: "AROMATIC"}.get(
        bond.GetBondTypeAsDouble(), "SINGLE"
    )
    bt_idx = BOND_TYPE_MAP.get(bt_str, 0)
    bd_str = str(bond.GetBondDir()).split(".")[-1]
    bd_idx = BOND_DIR_MAP.get(bd_str, 0)
    return [bt_idx, bd_idx]


def smiles_to_pyg(smiles: str, device: str = "cpu"):
    """
    Convert a SMILES string to a PyG Data object.

    Returns:
        Data object with .x (node features), .edge_index, .edge_attr
        OR None if SMILES is invalid / RDKit unavailable.
    """
    if not RDKIT_OK:
        return None

    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None

    # ── Node features ────────────────────────────────────────────────────────
    node_feat = []
    for atom in mol.GetAtoms():
        node_feat.append(_atom_features(atom))

    x = torch.tensor(node_feat, dtype=torch.long)  # [N, 2]

    # ── Edge features (bidirectional) ─────────────────────────────────────────
    edges_src, edges_dst, edge_feats = [], [], []
    for bond in mol.GetBonds():
        i, j = bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()
        feat = _bond_features(bond)
        edges_src += [i, j]
        edges_dst += [j, i]
        edge_feats += [feat, feat]

    if not edges_src:           # single-atom molecules
        edges_src = [0]
        edges_dst = [0]
        edge_feats = [[BOND_TYPE_MAP["SELF_LOOP"], 0]]

    edge_index = torch.tensor([edges_src, edges_dst], dtype=torch.long)
    edge_attr  = torch.tensor(edge_feats, dtype=torch.long)   # [E, 2]

    data = Data(x=x, edge_index=edge_index, edge_attr=edge_attr)
    data.batch = torch.zeros(x.size(0), dtype=torch.long)     # single mol → batch 0

    return data.to(device)


def smiles_to_fingerprint(smiles: str, n_bits: int = 2048):
    """
    Convert SMILES to Morgan fingerprint numpy array (for RF-based models).
    Returns np.ndarray of shape (1, n_bits) or None.
    """
    if not RDKIT_OK:
        return None
    import numpy as np
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None
    fp = AllChem.GetMorganFingerprintAsBitVect(mol, radius=2, nBits=n_bits)
    arr = np.zeros((1, n_bits), dtype=np.float32)
    for bit in fp.GetOnBits():
        arr[0, bit] = 1.0
    return arr
