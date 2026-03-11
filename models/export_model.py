"""
═══════════════════════════════════════════════════════════════════════
  SWACHH-AI — Model Export Script (Edge Optimization)
═══════════════════════════════════════════════════════════════════════

Exports the trained YOLOv8 model to deployment-ready formats
optimized for Raspberry Pi 4 inference:

  1. TensorFlow Lite (INT8) → Primary deployment format
  2. ONNX                   → Alternative runtime (ONNX Runtime)
  3. NCNN                   → Ultra-lightweight for ARM

Key Optimizations:
  ✓ INT8 quantization     → Reduces model size from ~12MB to ~6MB
  ✓ 320×320 export        → 4× faster inference vs 640×640
  ✓ Representative dataset → Calibration for accurate quantization
  ✓ Benchmark report      → Measures actual inference latency

Target Specifications:
  ┌──────────────────────┬──────────────┐
  │ Specification        │ Target       │
  ├──────────────────────┼──────────────┤
  │ Model Size (.tflite) │ 6-10 MB      │
  │ Inference Latency    │ < 500 ms     │
  │ Export Resolution     │ 320×320      │
  │ Quantization          │ INT8         │
  └──────────────────────┴──────────────┘

Usage:
  python export_model.py                                    # Default export
  python export_model.py --model best.pt --format tflite    # TFLite only
  python export_model.py --model best.pt --format all       # All formats
  python export_model.py --benchmark best.pt                # Benchmark only

Author: SWACHH-AI Team — India Innovate 2026
═══════════════════════════════════════════════════════════════════════
"""

import os
import sys
import time
import argparse
import logging
from pathlib import Path

from ultralytics import YOLO

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("swachh.export")


# ═══════════════════════════════════════════════════════════════
#  Export Configuration
# ═══════════════════════════════════════════════════════════════

EXPORT_CONFIG = {
    "train_imgsz": 640,      # Resolution used during training
    "deploy_imgsz": 320,     # Optimized resolution for edge deployment
    "default_model": "runs/detect/swachh_waste/weights/best.pt",
    "output_dir": "./exported_models",
}


# ═══════════════════════════════════════════════════════════════
#  1. TensorFlow Lite Export (INT8 Quantized)
# ═══════════════════════════════════════════════════════════════

def export_tflite(
    model_path: str,
    imgsz: int = 320,
    quantize_int8: bool = True,
    output_dir: str = None,
) -> str:
    """
    Export YOLOv8 model to TensorFlow Lite with INT8 quantization.
    
    INT8 quantization reduces model size by ~4× while maintaining
    >95% of the original accuracy. Requires a representative dataset
    for calibration (handled automatically by Ultralytics).
    
    Args:
        model_path: Path to trained .pt model
        imgsz: Export image resolution (320 for edge, 640 for max accuracy)
        quantize_int8: Enable INT8 quantization
        output_dir: Custom output directory
        
    Returns:
        Path to exported .tflite file
    """
    logger.info("=" * 60)
    logger.info("  📦 Exporting to TensorFlow Lite")
    logger.info("=" * 60)
    logger.info(f"  Model: {model_path}")
    logger.info(f"  Resolution: {imgsz}×{imgsz}")
    logger.info(f"  Quantization: {'INT8' if quantize_int8 else 'Float16'}")

    model = YOLO(model_path)

    # Export with INT8 quantization
    export_path = model.export(
        format="tflite",
        imgsz=imgsz,
        int8=quantize_int8,
        half=not quantize_int8,       # Float16 if not INT8
        optimize=True,                 # Optimize for mobile
    )

    # Move to output directory if specified
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        out_name = "yolov8_waste_int8.tflite" if quantize_int8 else "yolov8_waste_fp16.tflite"
        out_path = os.path.join(output_dir, out_name)

        # The export creates a directory; find the .tflite file
        export_path_obj = Path(str(export_path))
        if export_path_obj.is_dir():
            tflite_files = list(export_path_obj.glob("*.tflite"))
            if tflite_files:
                import shutil
                shutil.copy2(str(tflite_files[0]), out_path)
                export_path = out_path
        elif export_path_obj.suffix == ".tflite":
            import shutil
            shutil.copy2(str(export_path_obj), out_path)
            export_path = out_path

    # Report file size
    file_size = os.path.getsize(str(export_path)) / (1024 * 1024)
    logger.info(f"\n  ✅ TFLite exported: {export_path}")
    logger.info(f"  📏 File size: {file_size:.2f} MB")
    logger.info(f"  {'✅' if file_size <= 10 else '⚠️'} Target: 6-10 MB")

    return str(export_path)


# ═══════════════════════════════════════════════════════════════
#  2. ONNX Export
# ═══════════════════════════════════════════════════════════════

def export_onnx(
    model_path: str,
    imgsz: int = 320,
    simplify: bool = True,
    output_dir: str = None,
) -> str:
    """
    Export YOLOv8 model to ONNX format.
    
    ONNX is useful for:
    - Cross-platform inference (ONNX Runtime)
    - TensorRT conversion for NVIDIA Jetson
    - OpenVINO for Intel devices
    
    Args:
        model_path: Path to trained .pt model
        imgsz: Export image resolution
        simplify: Simplify ONNX graph
        output_dir: Custom output directory
        
    Returns:
        Path to exported .onnx file
    """
    logger.info("=" * 60)
    logger.info("  📦 Exporting to ONNX")
    logger.info("=" * 60)
    logger.info(f"  Model: {model_path}")
    logger.info(f"  Resolution: {imgsz}×{imgsz}")
    logger.info(f"  Simplify: {simplify}")

    model = YOLO(model_path)

    export_path = model.export(
        format="onnx",
        imgsz=imgsz,
        simplify=simplify,
        opset=12,              # ONNX opset version
        dynamic=False,         # Static shape for embedded
        half=True,             # Float16 precision
    )

    # Move to output directory
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        out_path = os.path.join(output_dir, "yolov8_waste.onnx")
        import shutil
        shutil.copy2(str(export_path), out_path)
        export_path = out_path

    file_size = os.path.getsize(str(export_path)) / (1024 * 1024)
    logger.info(f"\n  ✅ ONNX exported: {export_path}")
    logger.info(f"  📏 File size: {file_size:.2f} MB")

    return str(export_path)


# ═══════════════════════════════════════════════════════════════
#  3. NCNN Export (Ultra-lightweight ARM)
# ═══════════════════════════════════════════════════════════════

def export_ncnn(
    model_path: str,
    imgsz: int = 320,
    output_dir: str = None,
) -> str:
    """
    Export YOLOv8 model to NCNN format.
    
    NCNN is Tencent's neural network inference framework,
    optimized for ARM processors (Raspberry Pi, Android).
    Typically achieves the fastest inference on ARM.
    """
    logger.info("=" * 60)
    logger.info("  📦 Exporting to NCNN")
    logger.info("=" * 60)

    model = YOLO(model_path)

    export_path = model.export(
        format="ncnn",
        imgsz=imgsz,
        half=True,
    )

    logger.info(f"\n  ✅ NCNN exported: {export_path}")

    return str(export_path)


# ═══════════════════════════════════════════════════════════════
#  4. Benchmark
# ═══════════════════════════════════════════════════════════════

def benchmark_model(model_path: str, imgsz: int = 320, runs: int = 50):
    """
    Benchmark inference latency of the model.
    
    Runs multiple inference passes and reports:
    - Average latency
    - Min / Max latency
    - FPS
    - Whether target (<500ms) is met
    """
    import numpy as np

    logger.info("=" * 60)
    logger.info("  ⚡ Benchmarking Inference Latency")
    logger.info("=" * 60)
    logger.info(f"  Model: {model_path}")
    logger.info(f"  Resolution: {imgsz}×{imgsz}")
    logger.info(f"  Runs: {runs}")

    model = YOLO(model_path)

    # Create a dummy image
    dummy = np.random.randint(0, 255, (imgsz, imgsz, 3), dtype=np.uint8)

    # Warm-up runs
    logger.info("\n  Warming up (5 runs)...")
    for _ in range(5):
        model.predict(dummy, imgsz=imgsz, verbose=False)

    # Timed runs
    logger.info(f"  Running {runs} inference passes...")
    latencies = []

    for i in range(runs):
        start = time.perf_counter()
        model.predict(dummy, imgsz=imgsz, verbose=False)
        elapsed = (time.perf_counter() - start) * 1000  # ms
        latencies.append(elapsed)

    latencies = np.array(latencies)
    avg_ms = latencies.mean()
    min_ms = latencies.min()
    max_ms = latencies.max()
    p95_ms = np.percentile(latencies, 95)
    fps = 1000.0 / avg_ms

    logger.info(f"\n  ┌────────────────────┬──────────────┐")
    logger.info(f"  │ Metric             │ Value        │")
    logger.info(f"  ├────────────────────┼──────────────┤")
    logger.info(f"  │ Average Latency    │ {avg_ms:8.1f} ms  │")
    logger.info(f"  │ Min Latency        │ {min_ms:8.1f} ms  │")
    logger.info(f"  │ Max Latency        │ {max_ms:8.1f} ms  │")
    logger.info(f"  │ P95 Latency        │ {p95_ms:8.1f} ms  │")
    logger.info(f"  │ FPS                │ {fps:8.1f}     │")
    logger.info(f"  └────────────────────┴──────────────┘")

    target_ms = 500
    if avg_ms < target_ms:
        logger.info(f"\n  ✅ Meets target: {avg_ms:.1f}ms < {target_ms}ms")
    else:
        logger.info(f"\n  ⚠️ Does NOT meet target: {avg_ms:.1f}ms > {target_ms}ms")
        logger.info(f"  💡 Try: smaller imgsz (224/256) or NCNN format")

    return {
        "avg_ms": avg_ms,
        "min_ms": min_ms,
        "max_ms": max_ms,
        "p95_ms": p95_ms,
        "fps": fps,
    }


# ═══════════════════════════════════════════════════════════════
#  5. Full Export Pipeline
# ═══════════════════════════════════════════════════════════════

def full_export_pipeline(model_path: str, output_dir: str = None):
    """
    Run the complete export pipeline:
    1. Export TFLite INT8 (primary)
    2. Export ONNX (alternative)
    3. Benchmark all formats
    4. Copy best model to project models/ directory
    """
    if output_dir is None:
        output_dir = EXPORT_CONFIG["output_dir"]

    os.makedirs(output_dir, exist_ok=True)

    logger.info("\n" + "🌿" * 30)
    logger.info("  SWACHH-AI — Full Model Export Pipeline")
    logger.info("🌿" * 30)

    # ── Export TFLite (INT8) — Primary format ─────────────
    tflite_path = export_tflite(
        model_path,
        imgsz=EXPORT_CONFIG["deploy_imgsz"],
        quantize_int8=True,
        output_dir=output_dir,
    )

    # ── Export TFLite (Float16) — Higher accuracy fallback ─
    tflite_fp16_path = export_tflite(
        model_path,
        imgsz=EXPORT_CONFIG["deploy_imgsz"],
        quantize_int8=False,
        output_dir=output_dir,
    )

    # ── Export ONNX ───────────────────────────────────────
    onnx_path = export_onnx(
        model_path,
        imgsz=EXPORT_CONFIG["deploy_imgsz"],
        output_dir=output_dir,
    )

    # ── Summary ───────────────────────────────────────────
    logger.info("\n" + "=" * 60)
    logger.info("  📋 Export Summary")
    logger.info("=" * 60)

    exports = [
        ("TFLite INT8", tflite_path),
        ("TFLite FP16", tflite_fp16_path),
        ("ONNX", onnx_path),
    ]

    for name, path in exports:
        if os.path.exists(str(path)):
            size_mb = os.path.getsize(str(path)) / (1024 * 1024)
            logger.info(f"  {name:14s}: {size_mb:6.2f} MB → {path}")
        else:
            logger.info(f"  {name:14s}: ❌ Export failed")

    # ── Copy primary model to project models/ ─────────────
    project_model_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "models", "yolov8_waste.tflite"
    )

    try:
        import shutil
        # Use INT8 as the primary deployment model
        if os.path.exists(tflite_path):
            shutil.copy2(tflite_path, project_model_path)
            logger.info(f"\n  🎯 Primary model copied to: {project_model_path}")
    except Exception as e:
        logger.warning(f"  Could not copy to project models/: {e}")

    logger.info("\n  🎉 Export pipeline complete!")
    logger.info(f"  All exports saved to: {output_dir}")

    return {
        "tflite_int8": tflite_path,
        "tflite_fp16": tflite_fp16_path,
        "onnx": onnx_path,
    }


# ═══════════════════════════════════════════════════════════════
#  Main
# ═══════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="SWACHH-AI Model Export — Edge Optimization"
    )
    parser.add_argument(
        "--model", type=str, default=EXPORT_CONFIG["default_model"],
        help="Path to trained .pt model"
    )
    parser.add_argument(
        "--format", type=str, default="all",
        choices=["tflite", "onnx", "ncnn", "all"],
        help="Export format (default: all)"
    )
    parser.add_argument(
        "--imgsz", type=int, default=EXPORT_CONFIG["deploy_imgsz"],
        help="Export image resolution (default: 320)"
    )
    parser.add_argument(
        "--output", type=str, default=EXPORT_CONFIG["output_dir"],
        help="Output directory for exported models"
    )
    parser.add_argument(
        "--benchmark", action="store_true",
        help="Run inference benchmark after export"
    )
    parser.add_argument(
        "--benchmark-only", action="store_true",
        help="Only run benchmark (skip export)"
    )
    parser.add_argument(
        "--no-int8", action="store_true",
        help="Export Float16 instead of INT8"
    )

    args = parser.parse_args()

    if args.benchmark_only:
        benchmark_model(args.model, imgsz=args.imgsz)
        return

    if args.format == "all":
        exports = full_export_pipeline(args.model, args.output)
    elif args.format == "tflite":
        export_tflite(args.model, args.imgsz, not args.no_int8, args.output)
    elif args.format == "onnx":
        export_onnx(args.model, args.imgsz, output_dir=args.output)
    elif args.format == "ncnn":
        export_ncnn(args.model, args.imgsz, args.output)

    if args.benchmark:
        benchmark_model(args.model, imgsz=args.imgsz)


if __name__ == "__main__":
    main()
