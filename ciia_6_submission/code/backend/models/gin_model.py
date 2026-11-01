"""
MedGuard AI — Lightweight GIN Model Definition
===============================================
Standalone GIN implementation that matches the architecture of saved checkpoints
(clearance, bbbp, clintox models with convs.* keys and pred.* head).

Architecture: 5-layer GIN with global attention pooling → binary/regression prediction.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GINEConv as PyGGINEConv, GlobalAttention, global_mean_pool
from torch_geometric.nn import BatchNorm


NUM_ATOM_TYPE = 120
NUM_CHIRALITY = 4
NUM_BOND_TYPE = 5
NUM_BOND_DIRECTION = 3


def make_gine_conv(emb_dim):
    """Factory for GINEConv-compatible MLP."""
    nn_block = nn.Sequential(
        nn.Linear(emb_dim, emb_dim * 2),
        nn.BatchNorm1d(emb_dim * 2),
        nn.ReLU(),
        nn.Linear(emb_dim * 2, emb_dim),
    )
    return PyGGINEConv(nn_block)


class LightGINModel(nn.Module):
    """
    Lightweight GIN matching checkpoints with keys:
      x_embedding1, x_embedding2, convs.*, batch_norms.*,
      edge_embedding1, edge_embedding2, pool.*, pred.*
    """

    def __init__(self, num_tasks: int = 1, emb_dim: int = 300, num_layers: int = 5,
                 task: str = "classification"):
        super().__init__()
        self.task = task
        self.num_tasks = num_tasks
        self.emb_dim = emb_dim

        self.x_embedding1 = nn.Embedding(NUM_ATOM_TYPE, emb_dim)
        self.x_embedding2 = nn.Embedding(NUM_CHIRALITY, emb_dim)

        self.edge_embedding1 = nn.Embedding(NUM_BOND_TYPE, emb_dim)
        self.edge_embedding2 = nn.Embedding(NUM_BOND_DIRECTION, emb_dim)

        self.convs = nn.ModuleList([make_gine_conv(emb_dim) for _ in range(num_layers)])
        self.batch_norms = nn.ModuleList([nn.BatchNorm1d(emb_dim) for _ in range(num_layers)])

        gate_nn = nn.Sequential(nn.Linear(emb_dim, 300), nn.ReLU(), nn.Linear(300, 1))
        self.pool = GlobalAttention(gate_nn=gate_nn)

        self.pred = nn.Sequential(
            nn.Linear(emb_dim, emb_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(emb_dim // 2, num_tasks),
        )

    def forward(self, data):
        x, edge_index, edge_attr, batch = (
            data.x, data.edge_index, data.edge_attr, data.batch
        )
        # Node embeddings
        h = self.x_embedding1(x[:, 0]) + self.x_embedding2(x[:, 1])

        # Edge embeddings
        e = self.edge_embedding1(edge_attr[:, 0]) + self.edge_embedding2(edge_attr[:, 1])

        for conv, bn in zip(self.convs, self.batch_norms):
            h = conv(h, edge_index, e)
            h = bn(h)
            h = F.relu(h)

        graph_emb = self.pool(h, batch)
        out = self.pred(graph_emb)
        return out, graph_emb  # (logits, embedding)
