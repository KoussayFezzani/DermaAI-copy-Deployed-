import numpy as np
import tensorflow as tf
import keras
import cv2
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

# Custom cool colormap: dark navy → blue → cyan → teal → white at peak
_COOL_COLORS = [
    (0.031, 0.067, 0.176),   # #08122D  dark navy (zero activation)
    (0.098, 0.275, 0.706),   # #1946B4  blue
    (0.071, 0.651, 0.831),   # #12A6D4  cyan
    (0.114, 0.620, 0.459),   # #1D9E75  teal
    (1.000, 1.000, 1.000),   # white    (peak activation)
]
DERMA_COOL = LinearSegmentedColormap.from_list('derma_cool', _COOL_COLORS, N=256)

def generate_grad_cam(model, img_array, layer_name, class_index):
    """
    Generates Grad-CAM heatmap for a specific class.
    """
    try:
        grad_model = keras.models.Model(
            inputs=model.inputs,
            outputs=[model.get_layer(layer_name).output, model.output]
        )
    except ValueError:
        print(f"Layer {layer_name} not found in model.")
        return None

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        loss = predictions[:, class_index]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-10)
    return heatmap.numpy()

def overlay_heatmap(heatmap, original_img, alpha=0.45):
    """
    Overlays heatmap onto the original image using the cool DERMA palette.
    Upsamples heatmap at 4× native resolution before final resize for sharpness.
    original_img should be in range [0, 255] and uint8 (RGB).
    """
    h, w = original_img.shape[:2]

    # Upsample heatmap at 4× before final resize (bicubic for smoothness)
    up_h = max(heatmap.shape[0] * 4, h)
    up_w = max(heatmap.shape[1] * 4, w)
    heatmap_up = cv2.resize(heatmap, (up_w, up_h), interpolation=cv2.INTER_CUBIC)
    heatmap_up = np.clip(heatmap_up, 0, 1)

    # Apply custom cool colormap via matplotlib (returns RGBA float 0–1)
    colored = DERMA_COOL(heatmap_up)          # shape (up_h, up_w, 4)
    colored_rgb = (colored[:, :, :3] * 255).astype(np.uint8)  # drop alpha

    # Resize back to original image dimensions
    colored_rgb = cv2.resize(colored_rgb, (w, h), interpolation=cv2.INTER_AREA)

    # Blend with original
    superimposed = cv2.addWeighted(original_img, 1 - alpha, colored_rgb, alpha, 0)
    return np.clip(superimposed, 0, 255).astype(np.uint8)

