'use client';

import { useRef, useState } from 'react';
import { uploadImage, type UploadResult } from '@/actions/upload-actions';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  uploadFn?: (formData: FormData) => Promise<UploadResult>;
}

export default function ImageUploader({
  value,
  onChange,
  label,
  className,
  uploadFn = uploadImage,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen.');
      return;
    }

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadFn(formData);

    setIsUploading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onChange(result.url!);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  }

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
          {label}
        </label>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-4 text-center transition-colors ${
          isDragging ? 'border-[#002d62] bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Vista previa" className="h-24 w-24 rounded-md object-cover" />
        ) : (
          <span className="text-xs text-gray-500">
            Arrastra una imagen aquí o haz clic para seleccionar
          </span>
        )}

        {isUploading && <span className="text-xs text-gray-500">Subiendo...</span>}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {value && !isUploading && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onChange('');
          }}
          className="mt-1 text-xs font-medium text-red-600 hover:text-red-700"
        >
          Quitar imagen
        </button>
      )}
    </div>
  );
}
