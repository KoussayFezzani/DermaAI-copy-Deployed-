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
            # Try to load the full model first (.keras or .h5)
            # Try multiple base folders depending on where the script is run from
            possible_bases = ['backend', '']
            model_filenames = ['skin_lesion_model.keras', 'skin_lesion_model.h5']
            
            full_model_path = None
            for base in possible_bases:
                for fname in model_filenames:
                    path = os.path.join(base, 'saved_models', fname) if base else os.path.join('saved_models', fname)
                    if os.path.exists(path):
                        full_model_path = path
                        break
                if full_model_path: break

            if full_model_path:
                print(f"Loading full model from {full_model_path}...")
                try:
                    cls._model = keras.models.load_model(full_model_path, compile=False)
                    print("Model loaded successfully.")
                except Exception as e:
                    print(f"Failed to load full model due to error: {e}. Falling back to manual architecture + weights...")
                    cls._model = build_model(num_classes=len(CLASSES), input_shape=(480, 480, 3))
                    cls._model.load_weights(full_model_path)
                    print("Fell back to loading weights into built architecture.")
            else:
                # Fallback: check Desktop model or saved_models weights
                desktop_h5 = r"C:\Users\User\Desktop\Xception-skin disease-83.83.h5"
                print("Model not found in saved_models. Checking fallbacks...")
                cls._model = build_model(num_classes=len(CLASSES), input_shape=(480, 480, 3))
                
                weights_path = None
                if os.path.exists(desktop_h5):
                    weights_path = desktop_h5
                else:
                    for base in possible_bases:
                        for fname in ['skin_lesion_model.weights.h5', 'xception_weights.h5']:
                            wp = os.path.join(base, 'saved_models', fname) if base else os.path.join('saved_models', fname)
                            if os.path.exists(wp):
                                weights_path = wp
                                break
                        if weights_path: break
                
                if weights_path:
                    cls._model.load_weights(weights_path)
                    print(f"Model weights loaded from {weights_path}.")
                else:
                    raise RuntimeError("Model not loaded. Please place the model weights in saved_models.")
                    
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

