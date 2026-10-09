import keras
import numpy as np
import cv2
import os
import base64
from keras.preprocessing import image
from ml_core.models.xception_model import build_model
from ml_core.explainability.grad_cam import generate_grad_cam, overlay_heatmap

# Define classes (Must strictly match generator.class_indices from training notebook)
CLASSES = ['AKIEC', 'BCC', 'BKL', 'DF', 'MEL', 'NV', 'VASC']

# Mapping for readable frontend display and risk assessment
LONG_NAMES = {
    'AKIEC': 'Actinic keratoses',
    'BCC': 'Basal cell carcinoma',
    'BKL': 'Benign keratosis',
    'DF': 'Dermatofibroma',
    'MEL': 'Melanoma',
    'NV': 'Melanocytic nevi',
    'VASC': 'Vascular lesions'
}

RISK_LEVELS = {
    'AKIEC': 'Malignant',
    'BCC': 'Malignant',
    'BKL': 'Benign',
    'DF': 'Benign',
    'MEL': 'Malignant',
    'NV': 'Benign',
    'VASC': 'Benign'
}

class PredictionService:
    _model = None

    @classmethod
    def load_model(cls):
        if cls._model is None:
            # Check explicit environment override first
            env_model_path = os.environ.get('MODEL_PATH')
            if env_model_path and os.path.exists(env_model_path):
                print(f"Loading model from MODEL_PATH={env_model_path}...")
                cls._model = keras.models.load_model(env_model_path, compile=False)
                return cls._model

            # Resolve saved_models relative to backend directory or working directory
            backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            candidate_paths = [
                os.path.join(backend_dir, 'saved_models', 'skin_lesion_model.keras'),
                os.path.join(backend_dir, 'saved_models', 'skin_lesion_model.h5'),
                os.path.join('saved_models', 'skin_lesion_model.keras'),
                os.path.join('backend', 'saved_models', 'skin_lesion_model.keras')
            ]
            
            model_path = None
            for p in candidate_paths:
                if os.path.exists(p):
                    model_path = p
                    break

            if not model_path:
                raise RuntimeError(
                    "Model artifact not found. Please place 'skin_lesion_model.keras' "
                    "in 'backend/saved_models/' or set the MODEL_PATH environment variable."
                )

            print(f"Loading full model from {model_path}...")
            try:
                cls._model = keras.models.load_model(model_path, compile=False)
                print("Model loaded successfully.")
            except Exception as e:
                print(f"Failed to load full model via load_model: {e}. Attempting architecture rebuild + weight load...")
                cls._model = build_model(num_classes=len(CLASSES), input_shape=(480, 480, 3))
                cls._model.load_weights(model_path)
                print("Rebuilt architecture with loaded weights successfully.")
                    
        return cls._model

    @classmethod
    def predict_and_explain(cls, image_path):
        model = cls.load_model()
        
        # 1. Preprocess Image
        # Note: Training notebook used 480x480 RGB images with scalar(img)=img (range 0 to 255)
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not open or decode image: {image_path}")
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, (480, 480))
        img_batch = np.expand_dims(img_resized.astype(np.float32), axis=0)

        # 2. Prediction (Direct callable call avoids Windows console progress-bar charmap issues)
        predictions_tensor = model(img_batch, training=False)
        predictions_array = predictions_tensor.numpy()[0]
        top_indices = np.argsort(predictions_array)[::-1][:2]
        
        class_index = int(top_indices[0])
        confidence = float(predictions_array[class_index])
        raw_class = CLASSES[class_index]
        diagnosis = f"{RISK_LEVELS[raw_class]} ({LONG_NAMES[raw_class]})"
        
        class_index_2 = int(top_indices[1])
        confidence_2 = float(predictions_array[class_index_2])
        raw_class_2 = CLASSES[class_index_2]
        diagnosis_2 = f"{RISK_LEVELS[raw_class_2]} ({LONG_NAMES[raw_class_2]})"

        # 3. Grad-CAM
        # Identify the last conv layer: 'block14_sepconv2_act'
        heatmap = generate_grad_cam(model, img_batch, 'block14_sepconv2_act', class_index)
        
        grad_cam_b64 = None
        if heatmap is not None:
            # Use original RGB image for overlay
            overlay = overlay_heatmap(heatmap, img_rgb)
            
            # Convert to Base64
            overlay_bgr = cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR)
            _, buffer = cv2.imencode('.jpg', overlay_bgr)
            grad_cam_b64 = base64.b64encode(buffer).decode('utf-8')
            grad_cam_b64 = f"data:image/jpeg;base64,{grad_cam_b64}"

        return {
            "diagnosis": diagnosis,
            "confidence": confidence,
            "diagnosis_2": diagnosis_2,
            "confidence_2": confidence_2,
            "raw_class": raw_class,
            "raw_class_2": raw_class_2,
            "grad_cam_image": grad_cam_b64
        }

