import { NextRequest, NextResponse } from 'next/server';
import { bulkUploadService } from '@/server/services/bulkUploadService';
import { BulkUploadRequestSchema } from '@/lib/validation/bulkUpload';
import { handleApiError } from '@/lib/api/errors';
import { generateCsvTemplate } from '@/lib/csv/parseCsv';

/**
 * POST /api/access-grants/bulk
 * Bulk upload access grants via CSV file or JSON array.
 *
 * Supports two input formats:
 *
 * 1. Multipart form data with CSV file:
 *    Content-Type: multipart/form-data
 *    Body: file (CSV file)
 *
 * 2. JSON array:
 *    Content-Type: application/json
 *    Body: { rows: [{ user_email, system_name, instance_name?, access_tier_name, notes? }] }
 *
 * CSV Columns:
 * - user_email (required) - Must match existing user
 * - system_name (required) - Must match existing system
 * - instance_name (optional) - Must belong to the system if provided
 * - access_tier_name (required) - Must exist and belong to the system
 * - notes (optional) - Additional notes for the grant
 *
 * Behavior:
 * - If ANY row has validation errors, NO records are inserted
 * - Returns detailed validation results with row-level errors
 * - On success, creates all grants in a single transaction
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    const grantedBy = request.headers.get('x-user-id') ?? 'system-admin';

    // Handle multipart/form-data (CSV file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          {
            error: 'MISSING_FILE',
            message: 'No CSV file provided. Include a file field in form data.',
          },
          { status: 400 }
        );
      }

      // Validate file type
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv')) {
        return NextResponse.json(
          {
            error: 'INVALID_FILE_TYPE',
            message: 'File must be a CSV file (.csv extension)',
          },
          { status: 400 }
        );
      }

      // Read file content
      const csvContent = await file.text();
      if (!csvContent.trim()) {
        return NextResponse.json(
          {
            error: 'EMPTY_FILE',
            message: 'CSV file is empty',
          },
          { status: 400 }
        );
      }

      // Process CSV
      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        grantedBy
      );

      return NextResponse.json(result, {
        status: result.success ? 201 : 200,
      });
    }

    // Handle application/json (JSON array)
    if (contentType.includes('application/json') || contentType === '') {
      const body = await request.json();

      // Validate JSON structure
      const parseResult = BulkUploadRequestSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: parseResult.error.issues.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }

      // Process JSON rows
      const result = await bulkUploadService.processJsonUpload(
        parseResult.data.rows,
        grantedBy
      );

      return NextResponse.json(result, {
        status: result.success ? 201 : 200,
      });
    }

    // Unsupported content type
    return NextResponse.json(
      {
        error: 'UNSUPPORTED_CONTENT_TYPE',
        message:
          'Content-Type must be multipart/form-data (for CSV) or application/json',
      },
      { status: 415 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/access-grants/bulk
 * Returns the CSV template for bulk upload.
 *
 * Response: CSV file download with example content
 */
export async function GET() {
  const template = generateCsvTemplate();

  return new NextResponse(template, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition':
        'attachment; filename="access_grants_template.csv"',
    },
  });
}

