import React, { useCallback, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (content: string, file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '.txt,.log',
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Check file size
      if (file.size > maxSize) {
        setError(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
        return;
      }

      try {
        const content = await file.text();
        setSelectedFile(file);
        onFileSelect(content, file);
      } catch {
        setError('Failed to read file');
      }
    },
    [maxSize, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer',
          'transition-colors duration-200',
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <File className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-primary-600 dark:text-primary-400">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              {accept.split(',').join(', ')} up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};
