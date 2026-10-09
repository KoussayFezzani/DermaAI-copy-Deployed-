import keras
from keras import layers, regularizers

def build_model(num_classes=7, input_shape=(480, 480, 3)):
    """
    Builds the exact Xception-based deep learning architecture used
    by the trained HAM10000 model (83.83% accuracy).
    
    Args:
        num_classes: Number of target classes for classification (default 7).
        input_shape: Input image dimensions (default (480, 480, 3)).
        
    Returns:
        model: An instantiated Keras model.
    """
    base_model = keras.applications.Xception(
        include_top=False,
        weights=None,
        input_shape=input_shape,
        pooling='max'
    )
    
    x = base_model.output
    x = layers.BatchNormalization(axis=-1, momentum=0.99, epsilon=0.001, name='batch_normalization_4')(x)
    x = layers.Dense(256, kernel_regularizer=regularizers.l2(0.0016), activation='swish', name='dense')(x)
    x = layers.Dropout(0.5, seed=123, name='dropout')(x)
    x = layers.Dense(128, kernel_regularizer=regularizers.l2(0.0016), activation='swish', name='dense_1')(x)
    x = layers.Dropout(0.2, seed=123, name='dropout_1')(x)
    outputs = layers.Dense(num_classes, activation='softmax', name='dense_2')(x)
    
    model = keras.Model(inputs=base_model.input, outputs=outputs, name='Xception_SkinDisease')
    return model

