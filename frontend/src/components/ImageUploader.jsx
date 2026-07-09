import { useState } from 'react';
import { Upload, X, Check } from 'lucide-react';
import api from '../utils/api';

export default function ImageUploader({ onImageUpload, maxSize = 5 }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState('');

  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = maxSize * 1024 * 1024; // 5MB default

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError('');
    setSuccess('');

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Only PNG, JPG, GIF, or WebP images allowed');
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File must be smaller than ${maxSize}MB`);
      return;
    }

    setFile(selectedFile);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Image uploaded successfully! ✨');
      onImageUpload?.({
        url: res.data.url,
        public_id: res.data.public_id
      });

      // Reset
      setFile(null);
      setPreview('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Preview */}
      {preview && (
        <div className="relative mb-4 rounded-lg overflow-hidden">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          <button
            onClick={() => {
              setFile(null);
              setPreview('');
            }}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-giva-pink transition">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={loading}
          className="hidden"
        />
        <Upload className="mx-auto mb-3 text-gray-400" size={32} />
        <p className="text-sm font-medium text-gray-700">Click to upload image</p>
        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to {maxSize}MB</p>
      </label>

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mt-3 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-200 flex items-center gap-2">
          <Check size={16} /> {success}
        </div>
      )}

      {/* Upload Button */}
      {file && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="mt-4 w-full bg-giva-dark text-white py-3 rounded-lg font-bold hover:bg-black transition disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload Image'}
        </button>
      )}
    </div>
  );
}