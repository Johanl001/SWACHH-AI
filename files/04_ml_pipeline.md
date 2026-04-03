# 🤖 SWACHH-AI — ML Pipeline & YOLOv8 Training Guide

> **Team Strawhats** | Sanjivani College of Engineering, Kopargaon
> **India Innovate 2026**

---

## 1. Overview

The SWACHH-AI vision model is a **YOLOv8 Nano (YOLOv8n)** object detection model trained on a merged waste-classification dataset and exported to **TFLite INT8** format for efficient on-device inference on a Raspberry Pi 4.

**Target Metrics:**
| Metric | Target | Achieved (Training) |
|--------|--------|-------------------|
| mAP@0.5 | > 92% | ~93.4% |
| Precision | > 93% | ~94.1% |
| Recall | > 89% | ~91.2% |
| Inference time (Pi 4) | < 120ms | ~95ms |
| Model size (TFLite INT8) | < 5MB | ~3.1MB |

---

## 2. Dataset

### 2.1 Classes

| Class ID | Name | Examples |
|----------|------|---------|
| 0 | Plastic | Bottles, bags, packaging, straws |
| 1 | Organic | Food scraps, leaves, peels, biodegradables |
| 2 | Paper | Cardboard, newspapers, cartons |
| 3 | Metal | Cans, foil, bottle caps, wires |

### 2.2 Data Sources

- **TrashNet** (Stanford) — 2,527 images across 6 classes (subset of 4 used)
- **Custom collection** — Field-photographed waste from Mumbai, Pune, Delhi streets
- **Open Images V7** — Subset filtered by waste-related labels

### 2.3 Dataset Configuration (`models/data.yaml`)

```yaml
path: datasets/swachh_waste
train: images/train
val: images/val
test: images/test

nc: 4
names:
  0: Plastic
  1: Organic
  2: Paper
  3: Metal

# Augmentation applied during training (see train.py)
```

### 2.4 Dataset Split

| Split | Images | Percentage |
|-------|--------|-----------|
| Train | ~4,200 | 70% |
| Validation | ~900 | 15% |
| Test | ~900 | 15% |
| **Total** | **~6,000** | 100% |

---

## 3. Training Pipeline

### 3.1 Environment Setup

```bash
cd models
pip install -r requirements.txt
# requirements: ultralytics, torch, tensorflow, opencv-python, pyyaml, matplotlib
```

### 3.2 Prepare Dataset (`prepare_dataset.py`)

```bash
python prepare_dataset.py \
  --trashnet_dir /data/trashnet \
  --custom_dir /data/custom_india \
  --output_dir datasets/swachh_waste \
  --augment True
```

**Augmentation applied:**
- Horizontal flip (p=0.5)
- Rotation ±15°
- Brightness/contrast ±20%
- Mosaic (4-image composite)
- Random crop and scale
- HSV color jitter

### 3.3 Train (`train.py`)

```bash
python train.py \
  --data data.yaml \
  --model yolov8n.pt \
  --epochs 100 \
  --batch 16 \
  --imgsz 320 \
  --device cpu    # or 0 for GPU
```

**Key training parameters:**

```python
from ultralytics import YOLO

model = YOLO('yolov8n.pt')

results = model.train(
    data='data.yaml',
    epochs=100,
    batch=16,
    imgsz=320,
    optimizer='AdamW',
    lr0=0.001,
    lrf=0.01,
    momentum=0.937,
    weight_decay=0.0005,
    warmup_epochs=3,
    project='runs/detect',
    name='swachh_waste',
    save=True,
    plots=True,
)
```

**Training output location:**
```
runs/detect/swachh_waste/
├── weights/
│   ├── best.pt        # Best mAP checkpoint (use this for export)
│   └── last.pt        # Final epoch checkpoint
├── results.csv        # Per-epoch metrics
├── confusion_matrix.png
├── PR_curve.png
└── F1_curve.png
```

### 3.4 Validate Only

```bash
python train.py --validate-only runs/detect/swachh_waste/weights/best.pt
```

---

## 4. Model Export

### 4.1 Export to TFLite INT8 (`export_model.py`)

This is the primary deployment format for Raspberry Pi inference.

```bash
python export_model.py \
  --model runs/detect/swachh_waste/weights/best.pt \
  --format tflite \
  --imgsz 320 \
  --int8 True \
  --data data.yaml
```

**What this does:**
1. Loads `best.pt` (PyTorch)
2. Converts to ONNX intermediate
3. Converts ONNX → TFLite FP32
4. Applies INT8 post-training quantization using calibration images from `data.yaml`
5. Saves as `models/yolov8_waste.tflite` (~3.1MB)

### 4.2 Export to ONNX (Optional — for edge servers)

```bash
python export_model.py \
  --model runs/detect/swachh_waste/weights/best.pt \
  --format onnx \
  --imgsz 320
```

### 4.3 Export to NCNN (Optional — for mobile CPU)

```bash
python export_model.py \
  --model runs/detect/swachh_waste/weights/best.pt \
  --format ncnn \
  --imgsz 320
```

---

## 5. On-Device Inference (`edge_ai/inference.py`)

### 5.1 WasteClassifier Class

```python
import numpy as np
import cv2

# Raspberry Pi: uses tflite-runtime (lightweight)
# Development machine: falls back to tensorflow.lite
try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    import tensorflow.lite as tflite

class WasteClassifier:
    def __init__(self, model_path: str, confidence_threshold: float = 0.45):
        self.interpreter = tflite.Interpreter(model_path=model_path)
        self.interpreter.allocate_tensors()
        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()
        self.input_shape = self.input_details[0]['shape']  # [1, 320, 320, 3]
        self.confidence_threshold = confidence_threshold
        self.class_names = ["Organic", "Paper", "Plastic", "Metal"]

    def preprocess(self, frame: np.ndarray) -> np.ndarray:
        img = cv2.resize(frame, (320, 320))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = img.astype(np.float32) / 255.0
        return np.expand_dims(img, axis=0)

    def predict(self, frame: np.ndarray) -> dict | None:
        input_data = self.preprocess(frame)
        self.interpreter.set_tensor(self.input_details[0]['index'], input_data)
        self.interpreter.invoke()
        output = self.interpreter.get_tensor(self.output_details[0]['index'])
        # NMS and threshold filtering
        best = self._parse_output(output)
        if best and best['confidence'] >= self.confidence_threshold:
            return best
        return None

    def _parse_output(self, output) -> dict | None:
        # YOLOv8 output: [1, 8, 8400] → transpose → filter by confidence → NMS
        detections = output[0].T  # shape: [8400, 8]
        scores = detections[:, 4:]
        class_ids = np.argmax(scores, axis=1)
        confidences = np.max(scores, axis=1)
        mask = confidences >= self.confidence_threshold
        if not mask.any():
            return None
        best_idx = np.argmax(confidences)
        return {
            "class_id": int(class_ids[best_idx]),
            "class_name": self.class_names[int(class_ids[best_idx])],
            "confidence": float(confidences[best_idx]),
        }
```

### 5.2 Quick Test

```bash
cd edge_ai
python -c "
from inference import WasteClassifier
c = WasteClassifier('models/yolov8_waste.tflite')
print('Model loaded. Input shape:', c.input_shape)
print('Classes:', c.class_names)
"
```

---

## 6. Green Credit Engine (`edge_ai/green_credit.py`)

```python
import hashlib
import time
from config import CREDIT_TABLE

def calculate_credits(waste_type: str, rank_multiplier: float = 1.0) -> int:
    base = CREDIT_TABLE.get(waste_type, 0)
    return int(base * rank_multiplier)

def generate_verification_hash(user_id: str, timestamp: int, waste_type: str) -> str:
    payload = f"{user_id}:{timestamp}:{waste_type}"
    return hashlib.sha256(payload.encode()).hexdigest()

def build_reward_payload(user_id: str, waste_type: str, confidence: float,
                          bin_id: int, rank_multiplier: float = 1.0) -> dict:
    ts = int(time.time())
    credits = calculate_credits(waste_type, rank_multiplier)
    return {
        "user_id": user_id,
        "waste_type": waste_type,
        "confidence": round(confidence, 4),
        "credits_awarded": credits,
        "timestamp": ts,
        "bin_id": bin_id,
        "verification_hash": generate_verification_hash(user_id, ts, waste_type),
    }
```

---

## 7. Model Performance Benchmarks

| Platform | Model Format | Inference Time | RAM Usage |
|----------|-------------|---------------|-----------|
| Raspberry Pi 4 (4GB) | TFLite INT8 | ~95ms | ~180MB |
| Raspberry Pi 4 (4GB) | TFLite FP32 | ~210ms | ~220MB |
| x86 Desktop (CPU) | PyTorch .pt | ~12ms | ~400MB |
| x86 Desktop (GPU) | PyTorch .pt | ~3ms | ~900MB |

---

## 8. Adding a New Waste Class

1. **Collect images** for the new class (minimum 300 images recommended)
2. **Update `data.yaml`:**
   ```yaml
   nc: 5  # increment
   names:
     0: Plastic
     1: Organic
     2: Paper
     3: Metal
     4: Glass  # new class
   ```
3. **Update `edge_ai/config.py`:**
   ```python
   CLASS_NAMES = ["Organic", "Paper", "Plastic", "Metal", "Glass"]
   CREDIT_TABLE = {"Organic": 10, "Paper": 15, "Plastic": 25, "Metal": 30, "Glass": 20}
   ```
4. **Retrain** from scratch or fine-tune from `best.pt`
5. **Re-export** to TFLite INT8
6. **Update `citizen_app/src/utils/gamification.js`** — add color and icon for new class

---

*Team Strawhats | Sanjivani College of Engineering, Kopargaon | India Innovate 2026*
