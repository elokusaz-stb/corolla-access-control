/**
 * CSV Parser Utility
 * Parses CSV content into structured row objects.
 */

export interface ParsedCsvRow {
  user_email: string;
  system_name: string;
  instance_name?: string;
  access_tier_name: string;
  notes?: string;
}

export interface CsvParseResult {
  rows: ParsedCsvRow[];
  errors: string[];
}

/**
 * Required columns for bulk upload CSV
 */
const REQUIRED_COLUMNS = ['user_email', 'system_name', 'access_tier_name'];
const OPTIONAL_COLUMNS = ['instance_name', 'notes'];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

/**
 * Parse CSV content into structured rows
 * @param csvContent - Raw CSV string content
 * @returns Parsed rows and any parsing errors
 */
export function parseCsv(csvContent: string): CsvParseResult {
  const errors: string[] = [];
  const rows: ParsedCsvRow[] = [];

  // Normalize line endings and split into lines
  const lines = csvContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: ['CSV file is empty'] };
  }

  // Parse header row
  const headerLine = lines[0];
  if (!headerLine) {
    return { rows: [], errors: ['CSV file is empty'] };
  }

  const headers = parseRow(headerLine).map((h) => h.toLowerCase().trim());

  // Validate required columns exist
  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !headers.includes(col)
  );
  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    return { rows: [], errors };
  }

  // Warn about unknown columns (but continue parsing)
  const unknownColumns = headers.filter((h) => !ALL_COLUMNS.includes(h));
  if (unknownColumns.length > 0) {
    errors.push(
      `Warning: Unknown columns will be ignored: ${unknownColumns.join(', ')}`
    );
  }

  // Create column index map
  const columnIndexMap: Record<string, number> = {};
  headers.forEach((header, index) => {
    if (ALL_COLUMNS.includes(header)) {
      columnIndexMap[header] = index;
    }
  });

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.trim().length === 0) continue;

    const values = parseRow(line);
    const rowNumber = i + 1; // 1-indexed for user-friendly error messages

    // Check for row length mismatch
    if (values.length !== headers.length) {
      errors.push(
        `Row ${rowNumber}: Column count mismatch (expected ${headers.length}, got ${values.length})`
      );
      continue;
    }

    // Extract values by column name
    const row: ParsedCsvRow = {
      user_email: getValue(values, columnIndexMap, 'user_email'),
      system_name: getValue(values, columnIndexMap, 'system_name'),
      access_tier_name: getValue(values, columnIndexMap, 'access_tier_name'),
    };

    // Add optional fields if present and non-empty
    const instanceName = getValue(values, columnIndexMap, 'instance_name');
    if (instanceName) {
      row.instance_name = instanceName;
    }

    const notes = getValue(values, columnIndexMap, 'notes');
    if (notes) {
      row.notes = notes;
    }

    rows.push(row);
  }

  return { rows, errors };
}

/**
 * Parse a single CSV row, handling quoted values
 */
function parseRow(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // End of quoted section
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  // Don't forget the last value
  values.push(current.trim());

  return values;
}

/**
 * Get value from parsed row by column name
 */
function getValue(
  values: string[],
  columnIndexMap: Record<string, number>,
  columnName: string
): string {
  const index = columnIndexMap[columnName];
  if (index === undefined) return '';
  return values[index]?.trim() ?? '';
}

/**
 * Generate CSV template content
 */
export function generateCsvTemplate(): string {
  const headers = ALL_COLUMNS.join(',');
  const exampleRow =
    'john.doe@example.com,GitHub,Production,Admin,Approved by manager';
  return `${headers}\n${exampleRow}`;
}

/**
 * Validate that a string is valid CSV format
 */
export function isValidCsv(content: string): boolean {
  try {
    const result = parseCsv(content);
    return result.errors.length === 0 || result.rows.length > 0;
  } catch {
    return false;
  }
}
