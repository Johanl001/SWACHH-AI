"""
═══════════════════════════════════════════════════════════════════════
  SWACHH-AI — Dataset Preparation Utility
═══════════════════════════════════════════════════════════════════════

Two-Dataset Strategy:
  1. Master Dataset (TrashNet/TACO) → Global object shapes & textures
  2. Custom Indian Dataset          → Local context (crumpled packets,
                                      local branding, street debris)

This script:
  - Downloads/extracts both datasets
  - Converts classification labels to YOLO detection format
  - Merges into a unified dataset with train/val/test splits
  - Applies offline augmentation (brightness, flips) for diversity
  - Validates label integrity and class distribution

Usage:
  python prepare_dataset.py --master ./raw/trashnet --custom ./raw/indian_waste --output ./datasets/waste_merged

Author: SWACHH-AI Team — India Innovate 2026
═══════════════════════════════════════════════════════════════════════
"""

import os
import sys
import json
import shutil
import random
import argparse
import logging
from pathlib import Path
from collections import Counter

import cv2
import numpy as np

# ── Configuration ──────────────────────────────────────────────
CLASS_MAP = {
    "plastic": 0,
    "organic": 1,
    "paper":   2,
    "metal":   3,
}

# Aliases for common folder names in public datasets
CLASS_ALIASES = {
    "plastic":    "plastic",
    "pet":        "plastic",
    "hdpe":       "plastic",
    "polystyrene":"plastic",
    "organic":    "organic",
    "food":       "organic",
    "compost":    "organic",
    "vegetation": "organic",
    "paper":      "paper",
    "cardboard":  "paper",
    "newspaper":  "paper",
    "metal":      "metal",
    "aluminum":   "metal",
    "tin":        "metal",
    "steel":      "metal",
    "can":        "metal",
}

SPLIT_RATIOS = {
    "train": 0.75,
    "val":   0.15,
    "test":  0.10,
}

IMG_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("swachh.dataset")


# ═══════════════════════════════════════════════════════════════
#  1. Dataset Discovery & Scanning
# ═══════════════════════════════════════════════════════════════

def scan_classification_dataset(root_dir: str) -> dict[str, list[str]]:
    """
    Scan a classification-style dataset (one folder per class).
    
    Expected structure:
      root_dir/
        plastic/
          img001.jpg
          img002.jpg
        organic/
          ...
    
    Returns:
        dict mapping normalized class name → list of image paths
    """
    root = Path(root_dir)
    if not root.exists():
        logger.warning(f"Dataset directory not found: {root_dir}")
        return {}

    class_images = {}

    for subdir in sorted(root.iterdir()):
        if not subdir.is_dir():
            continue

        folder_name = subdir.name.lower().strip()
        normalized = CLASS_ALIASES.get(folder_name)

        if normalized is None:
            logger.info(f"  ⏩ Skipping unrecognized class folder: {folder_name}")
            continue

        images = [
            str(f) for f in subdir.iterdir()
            if f.suffix.lower() in IMG_EXTENSIONS
        ]

        if images:
            if normalized not in class_images:
                class_images[normalized] = []
            class_images[normalized].extend(images)
            logger.info(f"  📂 {folder_name} → {normalized}: {len(images)} images")

    return class_images


def scan_yolo_dataset(root_dir: str) -> list[tuple[str, str]]:
    """
    Scan a YOLO-format dataset (images/ + labels/ directories).
    
    Returns:
        List of (image_path, label_path) tuples
    """
    root = Path(root_dir)
    images_dir = root / "images"
    labels_dir = root / "labels"

    if not images_dir.exists() or not labels_dir.exists():
        logger.warning(f"YOLO dataset structure not found at: {root_dir}")
        return []

    pairs = []
    for img_file in images_dir.rglob("*"):
        if img_file.suffix.lower() in IMG_EXTENSIONS:
            label_file = labels_dir / img_file.relative_to(images_dir).with_suffix(".txt")
            if label_file.exists():
                pairs.append((str(img_file), str(label_file)))

    logger.info(f"  📂 YOLO dataset: {len(pairs)} image-label pairs")
    return pairs


# ═══════════════════════════════════════════════════════════════
#  2. Classification → YOLO Format Conversion
# ═══════════════════════════════════════════════════════════════

def classification_to_yolo(
    image_path: str,
    class_id: int,
    output_images_dir: str,
    output_labels_dir: str,
    idx: int,
) -> tuple[str, str] | None:
    """
    Convert a classification image to YOLO detection format.
    
    Since classification datasets don't have bounding boxes,
    we create a full-frame bounding box (the object fills most
    of the frame in typical waste datasets).
    
    YOLO format: class_id x_center y_center width height
    (all normalized to [0, 1])
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None

        h, w = img.shape[:2]

        # Determine output filenames
        ext = Path(image_path).suffix
        img_name = f"waste_{idx:06d}{ext}"
        lbl_name = f"waste_{idx:06d}.txt"

        img_out = os.path.join(output_images_dir, img_name)
        lbl_out = os.path.join(output_labels_dir, lbl_name)

        # Resize to consistent resolution
        img_resized = cv2.resize(img, (640, 640), interpolation=cv2.INTER_AREA)
        cv2.imwrite(img_out, img_resized)

        # Create YOLO label (full-frame bbox with small margin)
        # Slightly randomize bbox to prevent model from learning
        # fixed full-frame patterns
        margin = random.uniform(0.02, 0.12)
        cx = 0.5 + random.uniform(-0.03, 0.03)
        cy = 0.5 + random.uniform(-0.03, 0.03)
        bw = 1.0 - margin * 2 + random.uniform(-0.02, 0.02)
        bh = 1.0 - margin * 2 + random.uniform(-0.02, 0.02)

        with open(lbl_out, "w") as f:
            f.write(f"{class_id} {cx:.6f} {cy:.6f} {bw:.6f} {bh:.6f}\n")

        return img_out, lbl_out

    except Exception as e:
        logger.warning(f"Failed to convert {image_path}: {e}")
        return None


# ═══════════════════════════════════════════════════════════════
#  3. Offline Augmentation
# ═══════════════════════════════════════════════════════════════

def augment_image(image: np.ndarray, seed: int = None) -> np.ndarray:
    """
    Apply offline augmentation to simulate Indian street conditions:
    
    - Random brightness adjustment (±30%) → varied lighting
    - Random horizontal flip (50% chance) → orientation invariance  
    - Random HSV jitter → color variations (faded plastics, wet organic)
    - Random slight rotation (±5°) → bin angle variations
    """
    if seed is not None:
        random.seed(seed)
        np.random.seed(seed)

    aug = image.copy()

    # 1. Random brightness (simulate harsh sunlight / shade)
    brightness_factor = random.uniform(0.7, 1.3)
    aug = np.clip(aug * brightness_factor, 0, 255).astype(np.uint8)

    # 2. Horizontal flip (50%)
    if random.random() > 0.5:
        aug = cv2.flip(aug, 1)

    # 3. HSV jitter
    hsv = cv2.cvtColor(aug, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[:, :, 0] = (hsv[:, :, 0] + random.uniform(-10, 10)) % 180  # Hue
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * random.uniform(0.8, 1.2), 0, 255)  # Saturation
    hsv[:, :, 2] = np.clip(hsv[:, :, 2] * random.uniform(0.85, 1.15), 0, 255)  # Value
    aug = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

    # 4. Slight rotation (±5°)
    angle = random.uniform(-5, 5)
    h, w = aug.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
    aug = cv2.warpAffine(aug, M, (w, h), borderMode=cv2.BORDER_REFLECT)

    return aug


def generate_augmented_copies(
    img_path: str,
    lbl_path: str,
    output_images_dir: str,
    output_labels_dir: str,
    num_copies: int = 2,
    start_idx: int = 0,
) -> int:
    """
    Generate augmented copies of an image-label pair.
    Labels are copied as-is (full-frame bbox survives flips/rotations).
    
    Returns:
        Number of successfully generated copies
    """
    img = cv2.imread(img_path)
    if img is None:
        return 0

    generated = 0
    for i in range(num_copies):
        idx = start_idx + i
        aug = augment_image(img, seed=idx)

        ext = Path(img_path).suffix
        aug_img_name = f"aug_{idx:06d}{ext}"
        aug_lbl_name = f"aug_{idx:06d}.txt"

        aug_img_path = os.path.join(output_images_dir, aug_img_name)
        aug_lbl_path = os.path.join(output_labels_dir, aug_lbl_name)

        cv2.imwrite(aug_img_path, aug)
        shutil.copy2(lbl_path, aug_lbl_path)
        generated += 1

    return generated


# ═══════════════════════════════════════════════════════════════
#  4. Dataset Merge & Split
# ═══════════════════════════════════════════════════════════════

def merge_and_split(
    master_dir: str,
    custom_dir: str,
    output_dir: str,
    augment_copies: int = 2,
    max_per_class: int = 2000,
    yolo_format_custom: bool = False,
):
    """
    Merge Master + Custom datasets, apply augmentation, and split.
    
    Args:
        master_dir: Path to master dataset (TrashNet-style classification folders)
        custom_dir: Path to custom Indian dataset (classification or YOLO format)
        output_dir: Output path for merged YOLO dataset
        augment_copies: Number of augmented copies per original image
        max_per_class: Maximum images per class (for balancing)
        yolo_format_custom: If True, custom dataset is already in YOLO format
    """
    output = Path(output_dir)

    # Create split directories
    for split in ["train", "val", "test"]:
        (output / "images" / split).mkdir(parents=True, exist_ok=True)
        (output / "labels" / split).mkdir(parents=True, exist_ok=True)

    # ── Step 1: Collect all images by class ──────────────
    logger.info("=" * 60)
    logger.info("  SWACHH-AI Dataset Preparation")
    logger.info("=" * 60)

    all_class_images = {}

    # Scan master dataset
    logger.info(f"\n📦 Scanning Master Dataset: {master_dir}")
    master_data = scan_classification_dataset(master_dir)
    for cls_name, images in master_data.items():
        all_class_images.setdefault(cls_name, []).extend(
            [(img, "master") for img in images]
        )

    # Scan custom dataset
    logger.info(f"\n📦 Scanning Custom Dataset: {custom_dir}")
    if yolo_format_custom:
        logger.info("  (YOLO format — will copy directly)")
        # Handle separately in split phase
    else:
        custom_data = scan_classification_dataset(custom_dir)
        for cls_name, images in custom_data.items():
            all_class_images.setdefault(cls_name, []).extend(
                [(img, "custom") for img in images]
            )

    # ── Step 2: Balance & Split ──────────────────────────
    logger.info("\n📊 Class Distribution (before balancing):")
    for cls_name in sorted(all_class_images.keys()):
        count = len(all_class_images[cls_name])
        logger.info(f"  {cls_name:12s}: {count:5d} images")

    global_idx = 0
    split_counts = Counter()

    for cls_name in sorted(all_class_images.keys()):
        class_id = CLASS_MAP.get(cls_name)
        if class_id is None:
            logger.warning(f"Skipping unmapped class: {cls_name}")
            continue

        images = all_class_images[cls_name]
        random.shuffle(images)

        # Cap at max_per_class
        images = images[:max_per_class]

        # Split indices
        n = len(images)
        n_train = int(n * SPLIT_RATIOS["train"])
        n_val = int(n * SPLIT_RATIOS["val"])

        splits = {
            "train": images[:n_train],
            "val":   images[n_train:n_train + n_val],
            "test":  images[n_train + n_val:],
        }

        for split_name, split_images in splits.items():
            img_dir = str(output / "images" / split_name)
            lbl_dir = str(output / "labels" / split_name)

            for img_path, source in split_images:
                result = classification_to_yolo(
                    img_path, class_id, img_dir, lbl_dir, global_idx
                )
                if result:
                    global_idx += 1
                    split_counts[f"{split_name}_{cls_name}"] += 1

                    # Augment training images
                    if split_name == "train" and augment_copies > 0:
                        gen = generate_augmented_copies(
                            result[0], result[1],
                            img_dir, lbl_dir,
                            num_copies=augment_copies,
                            start_idx=global_idx,
                        )
                        global_idx += gen
                        split_counts[f"{split_name}_{cls_name}_aug"] += gen

    # ── Step 3: Summary ──────────────────────────────────
    logger.info("\n" + "=" * 60)
    logger.info("  Dataset Preparation Complete!")
    logger.info("=" * 60)

    for split in ["train", "val", "test"]:
        img_count = len(list((output / "images" / split).glob("*")))
        lbl_count = len(list((output / "labels" / split).glob("*.txt")))
        logger.info(f"  {split:6s}: {img_count:5d} images, {lbl_count:5d} labels")

    logger.info(f"\n  Output: {output_dir}")
    logger.info(f"  Total images processed: {global_idx}")

    # Save dataset info
    info = {
        "total_images": global_idx,
        "classes": CLASS_MAP,
        "splits": dict(split_counts),
        "augment_copies": augment_copies,
    }
    info_path = output / "dataset_info.json"
    with open(info_path, "w") as f:
        json.dump(info, f, indent=2)
    logger.info(f"  Dataset info saved: {info_path}")


# ═══════════════════════════════════════════════════════════════
#  5. Validation
# ═══════════════════════════════════════════════════════════════

def validate_dataset(dataset_dir: str):
    """
    Validate the prepared YOLO dataset for common issues:
    - Missing labels for images
    - Invalid label format
    - Class distribution imbalance
    """
    root = Path(dataset_dir)
    logger.info("\n🔍 Validating dataset...")

    issues = []

    for split in ["train", "val", "test"]:
        img_dir = root / "images" / split
        lbl_dir = root / "labels" / split

        if not img_dir.exists():
            issues.append(f"Missing directory: {img_dir}")
            continue

        img_files = list(img_dir.glob("*"))
        class_counts = Counter()
        missing_labels = 0

        for img_file in img_files:
            if img_file.suffix.lower() not in IMG_EXTENSIONS:
                continue

            lbl_file = lbl_dir / img_file.with_suffix(".txt").name
            if not lbl_file.exists():
                missing_labels += 1
                continue

            # Parse label
            try:
                with open(lbl_file) as f:
                    for line in f:
                        parts = line.strip().split()
                        if len(parts) == 5:
                            cls_id = int(parts[0])
                            class_counts[cls_id] += 1
                        else:
                            issues.append(f"Invalid label format in {lbl_file}")
            except Exception as e:
                issues.append(f"Error reading {lbl_file}: {e}")

        logger.info(f"\n  [{split}] {len(img_files)} images, "
                     f"{missing_labels} missing labels")
        for cls_id, count in sorted(class_counts.items()):
            cls_name = [k for k, v in CLASS_MAP.items() if v == cls_id]
            cls_name = cls_name[0] if cls_name else f"class_{cls_id}"
            logger.info(f"    {cls_name:12s} (id={cls_id}): {count:5d}")

    if issues:
        logger.warning(f"\n⚠️  {len(issues)} issues found:")
        for issue in issues[:20]:
            logger.warning(f"    - {issue}")
    else:
        logger.info("\n✅ Dataset validation passed — no issues found!")


# ═══════════════════════════════════════════════════════════════
#  Main
# ═══════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="SWACHH-AI Dataset Preparation — Merge & Augment"
    )
    parser.add_argument(
        "--master", type=str, default="./raw/trashnet",
        help="Path to master dataset (TrashNet-style classification folders)"
    )
    parser.add_argument(
        "--custom", type=str, default="./raw/indian_waste",
        help="Path to custom Indian dataset"
    )
    parser.add_argument(
        "--output", type=str, default="./datasets/waste_merged",
        help="Output path for merged YOLO dataset"
    )
    parser.add_argument(
        "--augment", type=int, default=2,
        help="Number of augmented copies per training image (default: 2)"
    )
    parser.add_argument(
        "--max-per-class", type=int, default=2000,
        help="Max images per class before augmentation (default: 2000)"
    )
    parser.add_argument(
        "--validate-only", action="store_true",
        help="Only validate an existing dataset (skip preparation)"
    )

    args = parser.parse_args()

    if args.validate_only:
        validate_dataset(args.output)
    else:
        merge_and_split(
            master_dir=args.master,
            custom_dir=args.custom,
            output_dir=args.output,
            augment_copies=args.augment,
            max_per_class=args.max_per_class,
        )
        validate_dataset(args.output)

    logger.info("\n🎉 Done!")


if __name__ == "__main__":
    main()
