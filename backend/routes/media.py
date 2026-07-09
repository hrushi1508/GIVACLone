import logging
from flask import Blueprint, jsonify, request
import cloudinary.uploader
from .utils import token_required

media_bp = Blueprint('media', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@media_bp.route('/api/upload-image', methods=['POST'])
@token_required
def upload_image(current_user):
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        image_file = request.files['image']
        if not image_file.filename or not allowed_file(image_file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400

        # Read into memory to enforce size limit regardless of Content-Length header
        file_bytes = image_file.read(MAX_FILE_SIZE + 1)
        if len(file_bytes) > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large. Maximum size is 5 MB'}), 413

        image_file.seek(0)
        upload_result = cloudinary.uploader.upload(image_file)

        url = upload_result.get('secure_url')
        public_id = upload_result.get('public_id')

        if not url:
            return jsonify({'error': 'Upload succeeded but no URL returned'}), 500

        logging.info(f"User {current_user['id']} uploaded image {public_id}")
        return jsonify({'url': url, 'public_id': public_id}), 200

    except Exception as e:
        logging.error(f"Upload error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Upload failed'}), 500
