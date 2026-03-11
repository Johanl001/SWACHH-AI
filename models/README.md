# SWACHH-AI — YOLOv8 Training Pipeline

Complete ML pipeline for training and deploying the waste classification model.

## 📁 Files

| File | Purpose |
|------|---------|
| `data.yaml` | YOLO dataset config (4 classes) |
| `prepare_dataset.py` | Two-dataset merge, augmentation, YOLO conversion |
| `train.py` | YOLOv8n training with SGD, early stopping |
| `export_model.py` | TFLite INT8 / ONNX / NCNN export + benchmarks |
| `requirements.txt` | Python dependencies |

## 🚀 Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Prepare your datasets (place raw data in ./raw/)
#    raw/trashnet/     → Master dataset (classification folders)
#    raw/indian_waste/  → Custom Indian dataset
python prepare_dataset.py --master ./raw/trashnet --custom ./raw/indian_waste

# 3. Train the model (100 epochs, batch 16, SGD lr=0.01)
python train.py

# 4. Export for Raspberry Pi deployment
python export_model.py --benchmark

# 5. Model is auto-copied to models/yolov8_waste.tflite
```

## 🎯 Target Specs

| Spec | Target |
|------|--------|
| Model Size | 6-10 MB (.tflite) |
| Inference | < 500 ms |
| mAP@0.5 | > 92% |
| Precision | > 0.93 |

## 📦 Recommended Datasets

- **TrashNet**: https://github.com/garythung/trashnet (2527 images, 6 classes)
- **TACO**: http://tacodataset.org/ (1500 images, 60 classes)
- **Custom**: Photograph local waste items (crumpled packets, local branding)
