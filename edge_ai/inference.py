# SWACHH-AI — Edge AI
# Team Strawhats | Sanjivani College of Engineering, Kopargaon
# India Innovate 2026

import numpy as np
import cv2

try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    import tensorflow.lite as tflite

class WasteClassifier:
    """Class to handle YOLOv8 TFLite waste classification model."""

    def __init__(self, model_path: str, confidence_threshold: float):
        """
        Initialize the TFLite Interpreter.
        """
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        try:
            self.interpreter = tflite.Interpreter(model_path=model_path)
            self.interpreter.allocate_tensors()
            self.input_details = self.interpreter.get_input_details()
            self.output_details = self.interpreter.get_output_details()
        except Exception as e:
            print(f"Error loading TFLite model: {e}")
            raise

    @property
    def input_shape(self) -> tuple:
        """Returns the interpreter input shape."""
        return tuple(self.input_details[0]['shape'])

    def preprocess(self, frame: np.ndarray) -> np.ndarray:
        """Preprocess frame: resize to 320x320, BGR->RGB, normalize to [0,1], expand dims."""
        image = cv2.resize(frame, (320, 320))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = image.astype(np.float32) / 255.0
        image = np.expand_dims(image, axis=0)
        return image

    def predict(self, frame: np.ndarray) -> dict | None:
        """Run interpreter, parse YOLOv8 output tensor."""
        try:
            input_data = self.preprocess(frame)
            self.interpreter.set_tensor(self.input_details[0]['index'], input_data)
            self.interpreter.invoke()
            output_data = self.interpreter.get_tensor(self.output_details[0]['index'])
            
            # YOLOv8 output tensor (shape [1, 8, 8400])
            predictions = np.squeeze(output_data).T  # Shape: [8400, 8]
            
            # Assuming format [x, y, w, h, cls1, cls2, cls3, cls4]
            class_scores = predictions[:, 4:8]
            max_scores = np.max(class_scores, axis=1)
            class_ids = np.argmax(class_scores, axis=1)
            
            mask = max_scores >= self.confidence_threshold
            if not np.any(mask):
                return None
                
            filtered_scores = max_scores[mask]
            filtered_class_ids = class_ids[mask]
            
            best_idx = np.argmax(filtered_scores)
            best_class_id = filtered_class_ids[best_idx]
            best_confidence = filtered_scores[best_idx]
            from config import CLASS_NAMES
            
            return {
                "class_id": int(best_class_id),
                "class_name": CLASS_NAMES[best_class_id],
                "confidence": float(best_confidence)
            }
        except Exception as e:
            print(f"Error during prediction: {e}")
            return None
