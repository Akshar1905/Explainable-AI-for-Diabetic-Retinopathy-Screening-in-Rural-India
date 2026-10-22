"""
Render publication tables as high-resolution images (300 DPI).
"""

import os
import matplotlib.pyplot as plt
import pandas as pd

OUTPUT_DIR = "paper/figures"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -------------------------------------------------------------------------
# Table 1: Model Comparison Table (Dark Mode matching user's screenshot)
# -------------------------------------------------------------------------
def render_model_comparison_dark():
    headers = [
        "Model",
        "Accuracy (%)",
        "Macro-Precision\n(%)",
        "Macro-Recall\n(%)",
        "Macro-F1 (%)",
        "QWK",
        "Inference time\n(ms/image)"
    ]

    rows = [
        ["Small CNN", "69.27", "56.40", "54.12", "55.24", "0.7380", "7.8"],
        ["ResNet-50", "84.00", "71.32", "71.28", "81.24", "0.9015", "28.4"],
        ["DenseNet-121", "81.82", "68.91", "67.84", "78.92", "0.8841", "34.6"],
        ["EfficientNet-B0", "80.55", "67.42", "66.15", "77.45", "0.8710", "18.5"],
        ["MobileNetV3", "78.18", "65.14", "63.88", "74.56", "0.8492", "12.3"]
    ]

    fig, ax = plt.subplots(figsize=(13, 3.8), dpi=300)
    fig.patch.set_facecolor('#0a0a0c')
    ax.set_facecolor('#0a0a0c')
    ax.axis('off')

    table = ax.table(
        cellText=rows,
        colLabels=headers,
        loc='center',
        cellLoc='center'
    )

    table.auto_set_font_size(False)
    table.set_fontsize(11)
    table.scale(1.0, 2.4)

    # Style cells
    for (row, col), cell in table.get_celld().items():
        cell.set_edgecolor('#222226')
        cell.set_linewidth(1.0)
        if row == 0:
            # Header
            cell.set_text_props(weight='bold', color='#ffffff', fontsize=11.5)
            cell.set_facecolor('#121216')
            cell.set_height(0.24)
        else:
            # Data cells
            cell.set_facecolor('#0a0a0c')
            cell.set_height(0.18)
            # Model name column left-aligned
            if col == 0:
                cell.set_text_props(weight='bold', color='#60a5fa' if row == 2 else '#e2e8f0', ha='left')
                cell.get_text().set_position((0.15, 0.5))
            else:
                # Highlight ResNet-50 row
                if row == 2:
                    cell.set_text_props(weight='bold', color='#34d399')
                    cell.set_facecolor('#0f231c')
                else:
                    cell.set_text_props(color='#cbd5e1')

    plt.tight_layout()
    out_path = f"{OUTPUT_DIR}/table_model_comparison_dark.png"
    plt.savefig(out_path, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"✓ Saved: {out_path}")


# -------------------------------------------------------------------------
# Table 1: Model Comparison Table (Publication Light Mode)
# -------------------------------------------------------------------------
def render_model_comparison_light():
    headers = [
        "Model Architecture",
        "Accuracy\n(%)",
        "Macro-Precision\n(%)",
        "Macro-Recall\n(%)",
        "Macro-F1\n(%)",
        "QWK",
        "Inference Time\n(ms/image)"
    ]

    rows = [
        ["Small CNN Baseline", "69.27", "56.40", "54.12", "55.24", "0.7380", "7.8"],
        ["ResNet-50 (Proposed)", "84.00", "71.32", "71.28", "81.24", "0.9015", "28.4"],
        ["DenseNet-121", "81.82", "68.91", "67.84", "78.92", "0.8841", "34.6"],
        ["EfficientNet-B0", "80.55", "67.42", "66.15", "77.45", "0.8710", "18.5"],
        ["MobileNetV3", "78.18", "65.14", "63.88", "74.56", "0.8492", "12.3"]
    ]

    fig, ax = plt.subplots(figsize=(13.5, 4.2), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')
    ax.axis('off')

    table = ax.table(
        cellText=rows,
        colLabels=headers,
        loc='center',
        cellLoc='center'
    )

    table.auto_set_font_size(False)
    table.set_fontsize(10.5)
    table.scale(1.0, 2.2)

    for (row, col), cell in table.get_celld().items():
        cell.set_edgecolor('#cbd5e1')
        cell.set_linewidth(0.8)
        if row == 0:
            cell.set_text_props(weight='bold', color='#0f172a', fontsize=11)
            cell.set_facecolor('#f1f5f9')
            cell.set_height(0.22)
        else:
            cell.set_height(0.18)
            if row % 2 == 1:
                cell.set_facecolor('#ffffff')
            else:
                cell.set_facecolor('#f8fafc')

            if col == 0:
                cell.set_text_props(weight='bold', color='#1e3a8a' if row == 2 else '#1e293b', ha='left')
                cell.get_text().set_position((0.10, 0.5))
            else:
                if row == 2:
                    cell.set_text_props(weight='bold', color='#065f46')
                    cell.set_facecolor('#ecfdf5')
                else:
                    cell.set_text_props(color='#334155')

    ax.set_title("Table 1: Deep Learning Classification Backbone Performance on Validation Cohort (n = 550)",
                 fontsize=12, fontweight='bold', pad=15, color='#0f172a')

    plt.tight_layout()
    out_path = f"{OUTPUT_DIR}/table_model_comparison_light.png"
    plt.savefig(out_path, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"✓ Saved: {out_path}")


# -------------------------------------------------------------------------
# Table 2: Ablation Study & Safety Veto Table (Section 8)
# -------------------------------------------------------------------------
def render_ablation_table():
    headers = [
        "Cfg",
        "Configuration Description",
        "Level\nComparison",
        "Spatial\nGate",
        "Coverage\n(%)",
        "Autonomous\nAccuracy (%)",
        "Referable Misses\n(Sent Home)",
        "Triage Counts\n(Clear / Refer / Escalate)",
        "ADR-0001\nStatus"
    ]

    rows = [
        ["A1", "CNN Only (Standard Baseline)", "N/A", "None", "100.0%", "94.36%", "4", "338 / 212 / 0", "Baseline"],
        ["A5", "Full Pipeline (Classical Channel)", "Exact", "Gate", "27.45%", "99.34%", "1", "140 / 11 / 399", "Admissible"],
        ["A7", "Full Pipeline (Learned, 4 Heads)", "Exact", "Gate", "4.55%", "99.62%", "0", "0 / 25 / 525", "Admissible"],
        ["A9", "Full Pipeline (Learned, EX Only)", "Exact", "Gate", "6.91%", "94.74%", "0", "9 / 29 / 512", "Admissible"],
        ["A10", "Proposed Frozen Pipeline", "Endpoint", "Gate", "32.73%", "98.89%", "0", "139 / 41 / 370", "Adopted (Optimal)"],
        ["A11", "Learned (Spatial Advisory)", "Exact", "Advisory", "24.36%", "95.52%", "2", "35 / 99 / 416", "Admissible"],
        ["A12", "Learned (Both Repairs)", "Endpoint", "Advisory", "66.36%", "98.36%", "2", "244 / 121 / 185", "Rejected (Veto)"],
        ["A13", "Classical (Both Repairs)", "Endpoint", "Advisory", "73.82%", "97.04%", "4", "282 / 124 / 144", "Rejected (Veto)"]
    ]

    fig, ax = plt.subplots(figsize=(15.5, 6.2), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')
    ax.axis('off')

    table = ax.table(
        cellText=rows,
        colLabels=headers,
        loc='center',
        cellLoc='center'
    )

    table.auto_set_font_size(False)
    table.set_fontsize(9.5)
    table.scale(1.0, 2.2)

    for (row, col), cell in table.get_celld().items():
        cell.set_edgecolor('#cbd5e1')
        cell.set_linewidth(0.8)
        if row == 0:
            cell.set_text_props(weight='bold', color='#0f172a', fontsize=10)
            cell.set_facecolor('#e2e8f0')
            cell.set_height(0.20)
        else:
            cell.set_height(0.16)
            # Default zebra
            cell.set_facecolor('#ffffff' if row % 2 == 1 else '#f8fafc')

            # Highlight A10 (row 5)
            if row == 5:
                cell.set_facecolor('#ecfdf5')
                cell.set_text_props(weight='bold', color='#065f46')
                if col == 8:
                    cell.set_text_props(weight='bold', color='#047857')

            # Highlight Veto rows (row 7, 8)
            if row in [7, 8] and col == 8:
                cell.set_text_props(weight='bold', color='#dc2626')
                cell.set_facecolor('#fef2f2')

            # Format config ID
            if col == 0:
                cell.set_text_props(weight='bold', color='#1e293b')
            elif col == 1:
                cell.set_text_props(ha='left')
                cell.get_text().set_position((0.05, 0.5))

    ax.set_title("Table 2: Ablation Study and Equal-Coverage Safety Veto (ADR-0001) Analysis across Pipeline Variants",
                 fontsize=12, fontweight='bold', pad=15, color='#0f172a')

    plt.tight_layout()
    out_path = f"{OUTPUT_DIR}/table_ablation_study.png"
    plt.savefig(out_path, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"✓ Saved: {out_path}")


if __name__ == "__main__":
    render_model_comparison_dark()
    render_model_comparison_light()
    render_ablation_table()
    print("\nAll table images generated successfully!")
