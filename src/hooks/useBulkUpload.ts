'use client';

import { useState, useCallback } from 'react';
import { mutate } from 'swr';

export interface BulkUploadRow {
  user_email: string;
  system_name: string;
  instance_name?: string;
  access_tier_name: string;
  notes?: string;
}

export interface ValidRow {
  rowNumber: number;
  rowData: BulkUploadRow;
  userId: string;
  systemId: string;
  instanceId: string | null;
  tierId: string;
}

export interface ErrorRow {
  rowNumber: number;
  rowData: BulkUploadRow;
  errors: string[];
}

export interface BulkUploadResponse {
  validRows: ValidRow[];
  errorRows: ErrorRow[];
  insertedCount?: number;
}

export type UploadState =
  | 'idle'
  | 'uploading'
  | 'preview'
  | 'inserting'
  | 'success'
  | 'error';

export function useBulkUpload() {
  const [state, setState] = useState<UploadState>('idle');
  const [validRows, setValidRows] = useState<ValidRow[]>([]);
  const [errorRows, setErrorRows] = useState<ErrorRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [insertedCount, setInsertedCount] = useState<number>(0);

  const reset = useCallback(() => {
    setState('idle');
    setValidRows([]);
    setErrorRows([]);
    setError(null);
    setInsertedCount(0);
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setState('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/access-grants/bulk', {
        method: 'POST',
        body: formData,
      });

      const data: BulkUploadResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          (data as unknown as { message?: string }).message || 'Upload failed'
        );
      }

      setValidRows(data.validRows);
      setErrorRows(data.errorRows);
      setState('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setState('error');
    }
  }, []);

  const insertGrants = useCallback(async () => {
    if (validRows.length === 0 || errorRows.length > 0) return;

    setState('inserting');
    setError(null);

    try {
      // Convert validRows to the format expected by the API
      const rows = validRows.map((row) => row.rowData);

      const response = await fetch('/api/access-grants/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, insert: true }),
      });

      const data: BulkUploadResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          (data as unknown as { message?: string }).message || 'Insert failed'
        );
      }

      setInsertedCount(data.insertedCount ?? validRows.length);
      setState('success');

      // Revalidate access grants list
      mutate(
        (key) => typeof key === 'string' && key.startsWith('/api/access-grants')
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Insert failed');
      setState('error');
    }
  }, [validRows, errorRows]);

  return {
    state,
    validRows,
    errorRows,
    error,
    insertedCount,
    uploadFile,
    insertGrants,
    reset,
    hasErrors: errorRows.length > 0,
    canInsert: validRows.length > 0 && errorRows.length === 0,
  };
}

