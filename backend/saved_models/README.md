# DermaAI Model Artifact Instructions

## Model Details
- **Architecture**: Fine-tuned Xception Deep Convolutional Neural Network
- **Input Resolution**: `480 × 480 × 3` RGB (normalized to `[0.0, 1.0]`)
- **Number of Classes**: 7 (HAM10000 taxonomy: `akiec`, `bcc`, `bkl`, `df`, `mel`, `nv`, `vasc`)
- **Evaluation Accuracy**: 83.83%
- **Evaluation Macro F1**: 0.75
- **File Format**: Keras 3 Native Archive (`.keras`)
- **Filename**: `skin_lesion_model.keras`
- **SHA256 Checksum**: `051B70AAFAF372143492A7C2DE6317EF3CF9672A5AB8939B9BCB505BA023EC36`
- **File Size**: 82.2 MB (86,186,694 bytes)

## Location
Place `skin_lesion_model.keras` directly inside this directory:
```
backend/saved_models/skin_lesion_model.keras
```

## Explainability
Grad-CAM heatmaps are computed using the final separable convolution activation layer:
- **Target Layer**: `block14_sepconv2_act`
- **Colormap**: `DERMA_COOL` custom clinical palette
