import os
from werkzeug.utils import secure_filename

# Upload directory definition
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads'))
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def safe_delete_upload_file(image_url):
    """
    Safely deletes an uploaded medical image file from disk.
    
    Guarantees:
    1. Path Traversal Protection: Strictly confined to UPLOAD_FOLDER using os.path.commonpath.
    2. Secure Filename: Strips directory navigation characters.
    3. Graceful Failure: Never raises unhandled exceptions on missing files or permissions.
    
    Returns:
        bool: True if a file was deleted, False otherwise.
    """
    if not image_url or not isinstance(image_url, str):
        return False
        
    # Extract only the base filename
    raw_name = os.path.basename(image_url)
    safe_name = secure_filename(raw_name)
    if not safe_name:
        return False

    target_path = os.path.abspath(os.path.join(UPLOAD_FOLDER, safe_name))

    # Path Confinement Check: target MUST reside strictly inside UPLOAD_FOLDER
    try:
        if os.path.commonpath([target_path, UPLOAD_FOLDER]) != UPLOAD_FOLDER:
            print(f"Security Alert: Blocked attempted path traversal deletion: {image_url}")
            return False
    except ValueError:
        # Cross-drive or invalid path comparison on Windows
        return False

    if os.path.isfile(target_path):
        try:
            os.remove(target_path)
            return True
        except OSError as e:
            print(f"Warning: Failed to delete image file {target_path}: {e}")
            return False
            
    return False
