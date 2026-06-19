import { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface PhotoUploadProps {
  userId: string;
  onUpload: (userId: string, file: File) => Promise<void>;
  onClose: () => void;
}

export function PhotoUpload({ userId, onUpload, onClose }: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(userId, file);
      onClose();
    } catch {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border rounded-lg p-6 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Upload Photo</h2>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          {preview ? (
            <div className="space-y-3">
              <img src={preview} alt="Preview" className="w-24 h-24 rounded-full mx-auto object-cover" />
              <p className="text-sm text-muted-foreground">{file?.name}</p>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to select image</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
          <button onClick={handleSubmit} disabled={!file || uploading} className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
