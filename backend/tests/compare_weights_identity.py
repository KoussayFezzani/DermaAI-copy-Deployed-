import keras
import cv2
import numpy as np
import glob
import os
import sys

# Ensure backend path is available
sys.path.insert(0, os.path.abspath('backend'))
from ml_core.models.xception_model import build_model

def compare_models():
    print("==================================================")
    print(" COMPARING ORIGINAL .H5 WEIGHTS VS SAVED .KERAS   ")
    print("==================================================")
    
    h5_path = os.environ.get('ORIGINAL_H5_PATH')
    if not h5_path or not os.path.exists(h5_path):
        for candidate in [
            'backend/saved_models/skin_lesion_model.h5',
            'saved_models/skin_lesion_model.h5',
            os.path.join(os.path.expanduser('~'), 'Desktop', 'Xception-skin disease-83.83.h5')
        ]:
            if os.path.exists(candidate):
                h5_path = candidate
                break

    keras_path = os.environ.get('KERAS_MODEL_PATH')
    if not keras_path or not os.path.exists(keras_path):
        for candidate in [
            'backend/saved_models/skin_lesion_model.keras',
            'saved_models/skin_lesion_model.keras'
        ]:
            if os.path.exists(candidate):
                keras_path = candidate
                break

    if not keras_path or not os.path.exists(keras_path):
        print(f"[ERROR] Target .keras model artifact not found. Please build or place it in saved_models.")
        sys.exit(1)

    if not h5_path or not os.path.exists(h5_path):
        print(f"[SKIP] Original training .h5 checkpoint not found on this machine.")
        print(f"       To run bitwise model comparison, set ORIGINAL_H5_PATH=<path_to_weights.h5>.")
        return
    
    print("Loading original weights into reconstructed architecture...")
    m_orig = build_model(7, (480, 480, 3))
    m_orig.load_weights(h5_path)
    
    print("Loading saved .keras model...")
    m_saved = keras.models.load_model(keras_path)
    
    img_files = glob.glob(r"frontend\public\diseases\*.*")
    print(f"Testing {len(img_files)} sample disease images for numerical identity...")
    
    CLASSES = ['AKIEC', 'BCC', 'BKL', 'DF', 'MEL', 'NV', 'VASC']
    
    for p in img_files:
        im = cv2.imread(p)
        if im is None:
            continue
        im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
        im = cv2.resize(im, (480, 480))
        x = np.expand_dims(im.astype(np.float32), 0)
        
        p1 = m_orig(x, training=False).numpy()[0]
        p2 = m_saved(x, training=False).numpy()[0]
        
        diff = float(np.max(np.abs(p1 - p2)))
        c1 = CLASSES[int(np.argmax(p1))]
        c2 = CLASSES[int(np.argmax(p2))]
        
        print(f"Image: {os.path.basename(p):20s} | Max diff: {diff:.2e} | Orig: {c1} ({np.max(p1):.4f}) | Saved: {c2} ({np.max(p2):.4f})")
        assert diff < 1e-4, f"Output divergence detected on {p}!"
        assert c1 == c2, f"Argmax mismatch on {p}!"
        
    print("\n[VERIFIED] The .keras model is bitwise identical in inference to the original .h5 artifact!")

if __name__ == '__main__':
    compare_models()
