"""
SWACHH-AI — YOLOv8 TFLite Waste Classification Inference Engine
================================================================
Loads a quantized YOLOv8 .tflite model and performs real-time
waste classification into 4 categories:
  Organic | Plastic | Paper | Metal

Designed for Raspberry Pi 4 with Pi Camera Module 3.
"""

import numpy as np
import cv2
import logging

try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    # Fallback for development environments without tflite_runtime
    import tensorflow.lite as tflite

from config import (
    MODEL_PATH,
    CONFIDENCE_THRESHOLD,
    NMS_IOU_THRESHOLD,
    INPUT_SIZE,
    CLASS_NAMES,
)

logger = logging.getLogger("swachh.inference")


class WasteClassifier:
    """
    YOLOv8 TFLite inference wrapper for waste classification.
    
    Usage:
        classifier = WasteClassifier()
        detections = classifier.classify(frame)
        # detections = [{"class": "Plastic", "confidence": 0.87, "bbox": [x1,y1,x2,y2]}, ...]
    """

    def __init__(self, model_path: str = MODEL_PATH):
        """Initialize the TFLite interpreter with the quantized YOLOv8 model."""
        logger.info(f"Loading TFLite model from: {model_path}")

        self.interpreter = tflite.Interpreter(
            model_path=model_path,
            num_threads=4,  # Utilize all 4 cores on RPi4
        )
        self.interpreter.allocate_tensors()

        # Cache input/output tensor details
        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()

        self.input_shape = self.input_details[0]["shape"]  # e.g. [1, 640, 640, 3]
        self.input_dtype = self.input_details[0]["dtype"]

        # Check for quantization parameters
        self.is_quantized = self.input_dtype == np.uint8
        if self.is_quantized:
            self.input_scale = self.input_details[0]["quantization"][0]
            self.input_zero_point = self.input_details[0]["quantization"][1]

        logger.info(
            f"Model loaded — Input: {self.input_shape}, "
            f"Quantized: {self.is_quantized}"
        )

    def preprocess(self, frame: np.ndarray) -> np.ndarray:
        """
        Preprocess an OpenCV BGR frame for YOLOv8 inference.
        
        - Resize to model input size (640×640)
        - Convert BGR → RGB
        - Normalize to [0, 1] or quantize to uint8
        - Add batch dimension
        """
        # Resize maintaining aspect ratio with letterboxing
        img = cv2.resize(frame, INPUT_SIZE, interpolation=cv2.INTER_LINEAR)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        if self.is_quantized:
            # Quantized model expects uint8 input
            img = img.astype(np.uint8)
        else:
            # Float model expects [0, 1] normalized input
            img = img.astype(np.float32) / 255.0

        # Add batch dimension: (H, W, C) → (1, H, W, C)
        return np.expand_dims(img, axis=0)

    def postprocess(
        self,
        output_data: np.ndarray,
        original_shape: tuple,
    ) -> list[dict]:
        """
        Post-process YOLOv8 output tensor into a list of detections.
        
        YOLOv8 output shape: [1, num_classes + 4, num_detections]
        Transposed to:       [num_detections, num_classes + 4]
        
        Each row: [x_center, y_center, width, height, class_scores...]
        """
        # Squeeze batch dim and transpose
        predictions = np.squeeze(output_data)
        if predictions.shape[0] == (len(CLASS_NAMES) + 4):
            predictions = predictions.T  # [N, 4+C]

        if len(predictions) == 0:
            return []

        # Extract bounding boxes and class scores
        boxes = predictions[:, :4]         # [x_center, y_center, w, h]
        scores = predictions[:, 4:]        # [class_scores]

        # Get best class per detection
        class_ids = np.argmax(scores, axis=1)
        confidences = np.max(scores, axis=1)

        # Filter by confidence threshold
        mask = confidences >= CONFIDENCE_THRESHOLD
        boxes = boxes[mask]
        class_ids = class_ids[mask]
        confidences = confidences[mask]

        if len(boxes) == 0:
            return []

        # Convert center format to corner format (x1, y1, x2, y2)
        x1 = boxes[:, 0] - boxes[:, 2] / 2
        y1 = boxes[:, 1] - boxes[:, 3] / 2
        x2 = boxes[:, 0] + boxes[:, 2] / 2
        y2 = boxes[:, 1] + boxes[:, 3] / 2

        # Scale to original image dimensions
        h_orig, w_orig = original_shape[:2]
        scale_x = w_orig / INPUT_SIZE[0]
        scale_y = h_orig / INPUT_SIZE[1]

        x1 = (x1 * scale_x).astype(int)
        y1 = (y1 * scale_y).astype(int)
        x2 = (x2 * scale_x).astype(int)
        y2 = (y2 * scale_y).astype(int)

        # Apply Non-Maximum Suppression
        nms_boxes = np.stack([x1, y1, x2, y2], axis=1).tolist()
        nms_scores = confidences.tolist()
        indices = cv2.dnn.NMSBoxes(
            bboxes=[[b[0], b[1], b[2] - b[0], b[3] - b[1]] for b in nms_boxes],
            scores=nms_scores,
            score_threshold=CONFIDENCE_THRESHOLD,
            nms_threshold=NMS_IOU_THRESHOLD,
        )

        # Build final detection list
        detections = []
        if len(indices) > 0:
            for i in indices.flatten():
                cid = int(class_ids[i])
                if cid < len(CLASS_NAMES):
                    detections.append({
                        "class": CLASS_NAMES[cid],
                        "confidence": round(float(confidences[i]), 4),
                        "bbox": [
                            int(x1[i]), int(y1[i]),
                            int(x2[i]), int(y2[i]),
                        ],
                    })

        return detections

    def classify(self, frame: np.ndarray) -> list[dict]:
        """
        Run end-to-end classification on an OpenCV frame.
        
        Args:
            frame: BGR image from OpenCV (Pi Camera)
            
        Returns:
            List of detection dicts with 'class', 'confidence', 'bbox'
        """
        original_shape = frame.shape
        input_tensor = self.preprocess(frame)

        # Set input tensor and invoke
        self.interpreter.set_tensor(
            self.input_details[0]["index"], input_tensor
        )
        self.interpreter.invoke()

        # Get output tensor
        output_data = self.interpreter.get_tensor(
            self.output_details[0]["index"]
        )

        # Dequantize if needed
        if self.is_quantized:
            out_scale = self.output_details[0]["quantization"][0]
            out_zp = self.output_details[0]["quantization"][1]
            output_data = (output_data.astype(np.float32) - out_zp) * out_scale

        detections = self.postprocess(output_data, original_shape)

        logger.debug(f"Detected {len(detections)} objects: "
                      f"{[d['class'] for d in detections]}")

        return detections

    def classify_and_annotate(self, frame: np.ndarray) -> tuple:
        """
        Classify and draw bounding boxes on the frame.
        
        Returns:
            (annotated_frame, detections)
        """
        detections = self.classify(frame)
        annotated = frame.copy()

        # Color map for each waste category
        colors = {
            "Organic": (0, 200, 0),     # Green
            "Plastic": (0, 120, 255),    # Orange
            "Paper":   (255, 200, 0),    # Cyan
            "Metal":   (200, 200, 200),  # Silver
        }

        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            color = colors.get(det["class"], (255, 255, 255))
            label = f"{det['class']} {det['confidence']:.0%}"

            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            cv2.putText(
                annotated, label, (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2,
            )

        return annotated, detections
