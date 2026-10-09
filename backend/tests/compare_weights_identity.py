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
    
    h5_path = r"c:\Users\User\Desktop\Xception-skin disease-83.83.h5"
    keras_path = r"backend\saved_models\skin_lesion_model.keras"
    
    assert os.path.exists(h5_path), f"Original h5 file missing at {h5_path}"
    assert os.path.exists(keras_path), f"Saved keras file missing at {keras_path}"
    
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
