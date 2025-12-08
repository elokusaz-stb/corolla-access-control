'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, RotateCcw, Sparkles } from 'lucide-react';
import {
  FileUploadCard,
  BulkPreviewTable,
  InsertGrantsButton,
} from '@/components/bulk';
import { useBulkUpload } from '@/hooks/useBulkUpload';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export default function BulkUploadPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const {
    state,
    validRows,
    errorRows,
    error,
    insertedCount,
    uploadFile,
    insertGrants,
    reset,
    canInsert,
  } = useBulkUpload();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback(
    (file: File) => {
      setSelectedFile(file);
      uploadFile(file);
    },
    [uploadFile]
  );

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    reset();
  }, [reset]);

  const handleInsert = useCallback(async () => {
    await insertGrants();
  }, [insertGrants]);

  // Handle success state
  const handleSuccessDone = useCallback(() => {
    addToast({
      type: 'success',
      title: 'Bulk Upload Complete!',
      message: `Successfully created ${insertedCount} access grants`,
      duration: 5000,
    });
    router.push('/dashboard/access');
  }, [addToast, insertedCount, router]);

  // Success state
  if (state === 'success') {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back Link */}
        <Link
          href="/dashboard/access"
          className="corolla-btn-secondary inline-flex text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Link>

        {/* Success Card */}
        <div
          className={cn(
            'relative overflow-hidden',
            'bg-gradient-to-br from-green-100 to-emerald-50',
            'border-2 border-green-200',
            'rounded-[2rem] p-12',
            'shadow-xl',
            'text-center',
            'duration-500 animate-in fade-in zoom-in-95'
          )}
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-200">
            <Sparkles className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black text-green-800">
            Bulk Upload Complete!
          </h2>
          <p className="mt-3 text-lg text-green-700">
            Successfully created{' '}
            <strong>
              {insertedCount} access grant{insertedCount !== 1 ? 's' : ''}
            </strong>
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button onClick={handleSuccessDone} className="corolla-btn-primary">
              View All Grants
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
            <button onClick={handleClear} className="corolla-btn-secondary">
              <RotateCcw className="h-4 w-4" />
              Upload Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/access"
          className="corolla-btn-secondary text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Link>
        <Link href="/access/new" className="corolla-btn-secondary text-sm">
          <Plus className="h-4 w-4" />
          Single Grant
        </Link>
      </div>

      {/* Page Title */}
      <div className="text-center">
        <h1 className="corolla-page-title">Bulk Upload Access Grants</h1>
        <p className="mx-auto mt-2 max-w-lg text-corolla-on-surface-variant">
          Upload a CSV file to grant access to many users at once. Review
          validation results before submitting.
        </p>
      </div>

      {/* Upload Card */}
      <FileUploadCard
        onFileSelect={handleFileSelect}
        isUploading={state === 'uploading'}
        selectedFile={selectedFile}
        onClear={handleClear}
      />

      {/* Error State */}
      {state === 'error' && error && (
        <div
          className={cn(
            'rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-center',
            'duration-300 animate-in slide-in-from-top-4'
          )}
        >
          <p className="font-medium text-red-700">{error}</p>
          <button onClick={handleClear} className="corolla-btn-secondary mt-4">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Preview Table */}
      {state === 'preview' &&
        (validRows.length > 0 || errorRows.length > 0) && (
          <>
            <BulkPreviewTable validRows={validRows} errorRows={errorRows} />

            {/* Re-upload button when there are errors */}
            {errorRows.length > 0 && (
              <div className="text-center">
                <button onClick={handleClear} className="corolla-btn-secondary">
                  <RotateCcw className="h-4 w-4" />
                  Upload Corrected CSV
                </button>
              </div>
            )}
          </>
        )}

      {/* Insert Button (fixed at bottom) */}
      {(state === 'preview' || state === 'inserting') && canInsert && (
        <InsertGrantsButton
          count={validRows.length}
          onInsert={handleInsert}
          isInserting={state === 'inserting'}
          isSuccess={false}
        />
      )}

      {/* Help Text */}
      {state === 'idle' && (
        <div className="corolla-card p-6">
          <h3 className="mb-3 font-bold text-corolla-on-surface">
            CSV Format Guide
          </h3>
          <p className="mb-4 text-sm text-corolla-on-surface-variant">
            Your CSV file should contain the following columns:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                name: 'user_email',
                required: true,
                desc: "User's email address",
              },
              {
                name: 'system_name',
                required: true,
                desc: 'Name of the system',
              },
              {
                name: 'instance_name',
                required: false,
                desc: 'System instance (optional)',
              },
              {
                name: 'access_tier_name',
                required: true,
                desc: 'Access tier to grant',
              },
              {
                name: 'notes',
                required: false,
                desc: 'Additional notes (optional)',
              },
            ].map((col) => (
              <div
                key={col.name}
                className="flex items-start gap-2 rounded-xl bg-corolla-surface-variant/50 p-3"
              >
                <code className="rounded bg-corolla-surface-variant px-2 py-1 font-mono text-xs">
                  {col.name}
                </code>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-corolla-on-surface-variant">
                    {col.desc}
                  </p>
                  {col.required && (
                    <span className="mt-1 inline-block text-[10px] font-bold text-corolla-primary">
                      Required
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
