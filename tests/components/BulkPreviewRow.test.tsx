import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BulkPreviewRow } from '@/components/bulk/BulkPreviewRow';

describe('BulkPreviewRow', () => {
  const validRow = {
    rowNumber: 1,
    rowData: {
      user_email: 'john@example.com',
      system_name: 'Magento',
      instance_name: 'Wellness',
      access_tier_name: 'Admin',
      notes: 'Test note',
    },
    userId: 'user-1',
    systemId: 'system-1',
    instanceId: 'instance-1',
    tierId: 'tier-1',
  };

  const errorRow = {
    rowNumber: 2,
    rowData: {
      user_email: 'unknown@example.com',
      system_name: 'InvalidSystem',
      instance_name: '',
      access_tier_name: 'InvalidTier',
    },
    errors: ['Unknown user_email', 'Unknown system_name'],
  };

  it('renders valid row with correct styling', () => {
    render(<BulkPreviewRow row={validRow} isError={false} />);

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Magento')).toBeInTheDocument();
    expect(screen.getByText('Wellness')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('renders row number badge', () => {
    render(<BulkPreviewRow row={validRow} isError={false} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders error row with error styling', () => {
    render(<BulkPreviewRow row={errorRow} isError={true} />);

    expect(screen.getByText('unknown@example.com')).toBeInTheDocument();
    expect(screen.getByText('InvalidSystem')).toBeInTheDocument();
    expect(screen.getByText('2 errors')).toBeInTheDocument();
  });

  it('renders error messages for error row', () => {
    render(<BulkPreviewRow row={errorRow} isError={true} />);

    expect(screen.getByText('Unknown user_email')).toBeInTheDocument();
    expect(screen.getByText('Unknown system_name')).toBeInTheDocument();
  });

  it('shows dash for missing instance', () => {
    const rowWithoutInstance = {
      ...validRow,
      rowData: { ...validRow.rowData, instance_name: '' },
    };
    render(<BulkPreviewRow row={rowWithoutInstance} isError={false} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows Missing text for required fields that are empty', () => {
    const rowWithMissingFields = {
      rowNumber: 3,
      rowData: {
        user_email: '',
        system_name: '',
        instance_name: '',
        access_tier_name: '',
      },
      errors: ['Missing required fields'],
    };

    render(<BulkPreviewRow row={rowWithMissingFields} isError={true} />);

    // Should show "Missing" for empty required fields
    const missingElements = screen.getAllByText('Missing');
    expect(missingElements.length).toBeGreaterThan(0);
  });
});
