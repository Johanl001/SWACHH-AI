"""
═══════════════════════════════════════════════════════════════════════
  SWACHH-AI — YOLOv8 Nano Training Script
═══════════════════════════════════════════════════════════════════════

Trains a YOLOv8 Nano (yolov8n) model for waste classification with
four categories: Plastic, Organic, Paper, Metal.

Key Features:
  ✓ Transfer learning from yolov8n.pt (COCO pre-trained)
  ✓ SGD optimizer with lr=0.01 and cosine annealing
  ✓ Early Stopping on mAP@0.5 (patience=10 epochs)
  ✓ Online augmentation: HSV jitter, translation, mosaic, flips
  ✓ 640×640 training resolution for maximum precision
  ✓ Auto-exports best model to TFLite and ONNX after training

Target Specifications:
  ┌────────────────────┬──────────────┐
  │ Spec               │ Target       │
  ├────────────────────┼──────────────┤
  │ Model Weight       │ 6-10 MB      │
  │ Inference Time     │ < 1 second   │
  │ Accuracy (mAP@0.5) │ > 92%        │
  │ Precision          │ > 0.93       │
  └────────────────────┴──────────────┘

Usage:
  python train.py                          # Full training
  python train.py --epochs 50 --batch 8    # Quick test run
  python train.py --resume runs/detect/swachh_waste/weights/last.pt

Author: SWACHH-AI Team — India Innovate 2026
═══════════════════════════════════════════════════════════════════════
"""

import os
import sys
import argparse
import logging
from pathlib import Path
from datetime import datetime

# Ultralytics YOLOv8
from ultralytics import YOLO

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("swachh.train")


# ═══════════════════════════════════════════════════════════════
#  Training Configuration
# ═══════════════════════════════════════════════════════════════

DEFAULT_CONFIG = {
    # ── Model ───────────────────────────────
    "base_model": "yolov8n.pt",           # YOLOv8 Nano (pre-trained on COCO)
    "data_yaml": "data.yaml",             # Dataset configuration

    # ── Training Parameters ─────────────────
    "epochs": 100,                         # Maximum training epochs
    "batch": 16,                           # Batch size (reduce for low VRAM)
    "imgsz": 640,                          # Training image resolution
    "optimizer": "SGD",                    # SGD optimizer (stable for small datasets)
    "lr0": 0.01,                           # Initial learning rate
    "lrf": 0.01,                           # Final learning rate (lr0 × lrf = 0.0001)
    "momentum": 0.937,                     # SGD momentum
    "weight_decay": 0.0005,                # L2 regularization

    # ── Early Stopping ──────────────────────
    "patience": 10,                        # Stop if mAP@0.5 doesn't improve for 10 epochs

    # ── Augmentation (Online — during training) ─
    "hsv_h": 0.015,                        # Hue jitter (±1.5%)
    "hsv_s": 0.7,                          # Saturation jitter
    "hsv_v": 0.4,                          # Value/brightness jitter
    "translate": 0.1,                      # Translation (10% of image)
    "scale": 0.5,                          # Scale jitter
    "fliplr": 0.5,                         # Horizontal flip probability
    "flipud": 0.0,                         # Vertical flip (disabled — waste has orientation)
    "mosaic": 1.0,                         # Mosaic augmentation (4-image merge)
    "mixup": 0.1,                          # MixUp probability
    "copy_paste": 0.0,                     # Copy-paste augmentation

    # ── Training Control ────────────────────
    "workers": 4,                          # DataLoader workers
    "cache": True,                         # Cache images in RAM for faster training
    "cos_lr": True,                        # Cosine annealing LR scheduler
    "close_mosaic": 10,                    # Disable mosaic in last 10 epochs
    "amp": True,                           # Automatic Mixed Precision (faster on GPU)
    "seed": 42,                            # Reproducibility

    # ── Output ──────────────────────────────
    "project": "runs/detect",
    "name": "swachh_waste",
    "exist_ok": True,                      # Overwrite existing run
    "plots": True,                         # Generate training plots
    "save_period": 10,                     # Save checkpoint every 10 epochs
}


# ═══════════════════════════════════════════════════════════════
#  Training Pipeline
# ═══════════════════════════════════════════════════════════════

def train_model(config: dict, resume: str = None) -> str:
    """
    Train YOLOv8 Nano waste classification model.
    
    Args:
        config: Training configuration dictionary
        resume: Path to checkpoint for resuming training
        
    Returns:
        Path to the best model weights
    """
    logger.info("=" * 60)
    logger.info("  🌿 SWACHH-AI YOLOv8 Training Pipeline")
    logger.info("=" * 60)
    logger.info(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"  Base Model: {config['base_model']}")
    logger.info(f"  Dataset: {config['data_yaml']}")
    logger.info(f"  Epochs: {config['epochs']}")
    logger.info(f"  Batch Size: {config['batch']}")
    logger.info(f"  Image Size: {config['imgsz']}")
    logger.info(f"  Optimizer: {config['optimizer']} (lr={config['lr0']})")
    logger.info(f"  Early Stopping: patience={config['patience']}")
    logger.info("=" * 60)

    # ── Step 1: Load Model ────────────────────────────────
    if resume:
        logger.info(f"\n📦 Resuming from checkpoint: {resume}")
        model = YOLO(resume)
    else:
        logger.info(f"\n📦 Loading base model: {config['base_model']}")
        model = YOLO(config["base_model"])

    # ── Step 2: Train ─────────────────────────────────────
    logger.info("\n🚀 Starting training...\n")

    results = model.train(
        data=config["data_yaml"],
        epochs=config["epochs"],
        batch=config["batch"],
        imgsz=config["imgsz"],
        # Optimizer
        optimizer=config["optimizer"],
        lr0=config["lr0"],
        lrf=config["lrf"],
        momentum=config["momentum"],
        weight_decay=config["weight_decay"],
        # Early stopping
        patience=config["patience"],
        # Augmentation
        hsv_h=config["hsv_h"],
        hsv_s=config["hsv_s"],
        hsv_v=config["hsv_v"],
        translate=config["translate"],
        scale=config["scale"],
        fliplr=config["fliplr"],
        flipud=config["flipud"],
        mosaic=config["mosaic"],
        mixup=config["mixup"],
        copy_paste=config["copy_paste"],
        # Training control
        workers=config["workers"],
        cache=config["cache"],
        cos_lr=config["cos_lr"],
        close_mosaic=config["close_mosaic"],
        amp=config["amp"],
        seed=config["seed"],
        # Output
        project=config["project"],
        name=config["name"],
        exist_ok=config["exist_ok"],
        plots=config["plots"],
        save_period=config["save_period"],
    )

    # ── Step 3: Results ───────────────────────────────────
    best_weights = Path(config["project"]) / config["name"] / "weights" / "best.pt"

    logger.info("\n" + "=" * 60)
    logger.info("  📊 Training Complete!")
    logger.info("=" * 60)
    logger.info(f"  Best Weights: {best_weights}")

    return str(best_weights)


# ═══════════════════════════════════════════════════════════════
#  Validation & Metrics
# ═══════════════════════════════════════════════════════════════

def validate_model(model_path: str, data_yaml: str = "data.yaml") -> dict:
    """
    Run validation on the trained model and check against targets.
    
    Targets:
        mAP@0.5 > 0.92
        Precision > 0.93
    """
    logger.info("\n🔍 Running validation...")

    model = YOLO(model_path)
    results = model.val(data=data_yaml, imgsz=640, batch=16)

    # Extract key metrics
    metrics = {
        "mAP50": results.box.map50,          # mAP@0.5
        "mAP50_95": results.box.map,         # mAP@0.5:0.95
        "precision": results.box.mp,          # Mean Precision
        "recall": results.box.mr,             # Mean Recall
    }

    logger.info("\n  ┌────────────────────┬──────────┬──────────┐")
    logger.info("  │ Metric             │ Achieved │ Target   │")
    logger.info("  ├────────────────────┼──────────┼──────────┤")
    logger.info(f"  │ mAP@0.5            │ {metrics['mAP50']:.4f}   │ > 0.92   │"
                f" {'✅' if metrics['mAP50'] > 0.92 else '❌'}")
    logger.info(f"  │ mAP@0.5:0.95       │ {metrics['mAP50_95']:.4f}   │   —      │")
    logger.info(f"  │ Precision          │ {metrics['precision']:.4f}   │ > 0.93   │"
                f" {'✅' if metrics['precision'] > 0.93 else '❌'}")
    logger.info(f"  │ Recall             │ {metrics['recall']:.4f}   │   —      │")
    logger.info("  └────────────────────┴──────────┴──────────┘")

    # Per-class results
    logger.info("\n  Per-Class mAP@0.5:")
    class_names = ["Plastic", "Organic", "Paper", "Metal"]
    if hasattr(results.box, 'maps') and results.box.maps is not None:
        for i, name in enumerate(class_names):
            if i < len(results.box.maps):
                logger.info(f"    {name:12s}: {results.box.maps[i]:.4f}")

    return metrics


# ═══════════════════════════════════════════════════════════════
#  Main Entry Point
# ═══════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="SWACHH-AI YOLOv8 Waste Classification Training"
    )
    parser.add_argument(
        "--epochs", type=int, default=DEFAULT_CONFIG["epochs"],
        help="Number of training epochs (default: 100)"
    )
    parser.add_argument(
        "--batch", type=int, default=DEFAULT_CONFIG["batch"],
        help="Batch size (default: 16, reduce for low VRAM)"
    )
    parser.add_argument(
        "--imgsz", type=int, default=DEFAULT_CONFIG["imgsz"],
        help="Training image size (default: 640)"
    )
    parser.add_argument(
        "--lr", type=float, default=DEFAULT_CONFIG["lr0"],
        help="Initial learning rate (default: 0.01)"
    )
    parser.add_argument(
        "--patience", type=int, default=DEFAULT_CONFIG["patience"],
        help="Early stopping patience (default: 10)"
    )
    parser.add_argument(
        "--data", type=str, default=DEFAULT_CONFIG["data_yaml"],
        help="Path to data.yaml (default: data.yaml)"
    )
    parser.add_argument(
        "--resume", type=str, default=None,
        help="Path to checkpoint for resuming training"
    )
    parser.add_argument(
        "--validate-only", type=str, default=None,
        help="Only validate an existing model (pass model path)"
    )
    parser.add_argument(
        "--no-cache", action="store_true",
        help="Disable image caching (saves RAM)"
    )

    args = parser.parse_args()

    # Update config from args
    config = DEFAULT_CONFIG.copy()
    config["epochs"] = args.epochs
    config["batch"] = args.batch
    config["imgsz"] = args.imgsz
    config["lr0"] = args.lr
    config["patience"] = args.patience
    config["data_yaml"] = args.data
    if args.no_cache:
        config["cache"] = False

    if args.validate_only:
        validate_model(args.validate_only, config["data_yaml"])
        return

    # Train
    best_weights = train_model(config, resume=args.resume)

    # Validate
    metrics = validate_model(best_weights, config["data_yaml"])

    # Check targets
    if metrics["mAP50"] > 0.92 and metrics["precision"] > 0.93:
        logger.info("\n🎉 Model meets all target specifications!")
        logger.info("   Run export_model.py to generate deployment-ready files.")
    else:
        logger.info("\n⚠️  Model does not yet meet all targets.")
        logger.info("   Consider: more data, more epochs, or hyperparameter tuning.")

    logger.info(f"\n  Best weights saved at: {best_weights}")
    logger.info("  Done! 🌿")


if __name__ == "__main__":
    main()
