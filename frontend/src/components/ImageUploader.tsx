import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage } from '../api/uploads';
import { useToastStore } from '../store/toastStore';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const getFullUrl = (urlPath: string) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http')) return urlPath;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000';
    // Clean uploads path
    const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
    return `${base}${cleanPath}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB', 'error');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      addToast('File must be an image', 'error');
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      onChange(url);
      addToast('Image uploaded successfully', 'success');
    } catch (error) {
      addToast('Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}

      {value ? (
        <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-slate-200 group">
          <img
            src={getFullUrl(value)}
            alt="Uploaded Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary hover:bg-slate-50 transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-xs text-slate-400">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-slate-400 mb-2 group-hover:text-primary" />
                <p className="text-xs font-medium">Click to upload</p>
                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 5MB</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}
