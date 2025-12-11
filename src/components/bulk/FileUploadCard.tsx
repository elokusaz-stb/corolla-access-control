'use client';

import { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, Download, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileUploadCardProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  selectedFile: File | null;
  onClear: () => void;
}

export function FileUploadCard({
  onFileSelect,
  isUploading,
  selectedFile,
  onClear,
}: FileUploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.csv')) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDownloadTemplate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch('/api/access-grants/bulk');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'access_grants_template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      console.error('Failed to download template');
    }
  };

  // Show selected file state
  if (selectedFile && !isUploading) {
    return (
      <div
        className={cn(
          'relative overflow-hidden',
          'bg-corolla-primary-container',
          'border-2 border-corolla-quick-grant-border',
          'rounded-[2rem] p-8',
          'shadow-inner shadow-sm',
          'duration-300 animate-in slide-in-from-top-4'
        )}
      >
        <div className="flex items-center justify-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-corolla-primary/10">
            <FileText className="h-7 w-7 text-corolla-primary" />
          </div>
          <div>
            <p className="font-bold text-corolla-on-surface">
              {selectedFile.name}
            </p>
            <p className="text-sm text-corolla-on-surface-variant">
              {(selectedFile.size / 1024).toFixed(1)} KB • Ready to process
            </p>
          </div>
          <button
            onClick={onClear}
            className="ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-corolla-on-surface-variant transition-colors hover:bg-white hover:text-corolla-on-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Show uploading state
  if (isUploading) {
    return (
      <div
        className={cn(
          'relative overflow-hidden',
          'bg-corolla-primary-container',
          'border-2 border-corolla-quick-grant-border',
          'rounded-[2rem] p-12',
          'shadow-inner shadow-sm'
        )}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 animate-spin text-corolla-primary" />
          <p className="mt-4 font-bold text-corolla-on-surface">
            Processing CSV...
          </p>
          <p className="mt-1 text-sm text-corolla-on-surface-variant">
            Validating rows and checking for errors
          </p>
        </div>
      </div>
    );
  }

  // Default upload card
  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative cursor-pointer overflow-hidden',
        'bg-corolla-primary-container',
        'border-2 border-dashed',
        'rounded-[2rem] p-12',
        'shadow-inner shadow-sm',
        'transition-all duration-200',
        'duration-300 animate-in slide-in-from-top-4',
        isDragOver
          ? 'scale-[1.02] border-corolla-primary bg-corolla-active-nav'
          : 'border-corolla-quick-grant-border hover:border-corolla-primary/50 hover:bg-corolla-active-nav/50'
      )}
    >
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center text-center">
        <div
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-2xl transition-colors',
            isDragOver
              ? 'bg-corolla-primary text-white'
              : 'bg-corolla-primary/10'
          )}
        >
          <UploadCloud
            className={cn(
              'h-10 w-10',
              isDragOver ? 'text-white' : 'text-corolla-primary'
            )}
          />
        </div>
        <h3 className="mt-6 text-xl font-bold text-corolla-on-surface">
          {isDragOver
            ? 'Drop your CSV file here'
            : 'Drag CSV here, or click to upload'}
        </h3>
        <p className="mt-2 text-corolla-on-surface-variant">
          Upload a CSV file with user emails, systems, and access tiers
        </p>
        <button
          onClick={handleDownloadTemplate}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-corolla-primary underline underline-offset-2 transition-colors hover:text-corolla-primary/80"
        >
          <Download className="h-4 w-4" />
          Download CSV Template
        </button>
      </div>
    </div>
  );
}

