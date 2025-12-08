import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BulkPreviewTable } from '@/components/bulk/BulkPreviewTable';

describe('BulkPreviewTable', () => {
  const validRows = [
    {
      rowNumber: 1,
      rowData: {
        user_email: 'john@example.com',
        system_name: 'Magento',
        instance_name: 'Wellness',
        access_tier_name: 'Admin',
      },
      userId: 'user-1',
      systemId: 'system-1',
      instanceId: 'instance-1',
      tierId: 'tier-1',
    },
    {
      rowNumber: 2,
      rowData: {
        user_email: 'jane@example.com',
        system_name: 'Salesforce',
        instance_name: '',
        access_tier_name: 'Viewer',
      },
      userId: 'user-2',
      systemId: 'system-2',
      instanceId: null,
      tierId: 'tier-2',
    },
  ];

  const errorRows = [
    {
      rowNumber: 3,
      rowData: {
        user_email: 'unknown@example.com',
        system_name: 'InvalidSystem',
        instance_name: '',
        access_tier_name: 'Admin',
      },
      errors: ['Unknown user_email'],
    },
  ];

  it('renders table header columns', () => {
    render(<BulkPreviewTable validRows={validRows} errorRows={[]} />);

    expect(screen.getByText('Row')).toBeInTheDocument();
    expect(screen.getByText('User Email')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Instance')).toBeInTheDocument();
    expect(screen.getByText('Tier')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows correct row count in summary', () => {
    render(<BulkPreviewTable validRows={validRows} errorRows={errorRows} />);

    expect(screen.getByText('3 rows found in CSV')).toBeInTheDocument();
  });

  it('shows valid count', () => {
    render(<BulkPreviewTable validRows={validRows} errorRows={errorRows} />);

    expect(screen.getByText('2 valid')).toBeInTheDocument();
  });

  it('shows error count when there are errors', () => {
    render(<BulkPreviewTable validRows={validRows} errorRows={errorRows} />);

    // The summary shows "1 error" text
    const errorTexts = screen.getAllByText('1 error');
    expect(errorTexts.length).toBeGreaterThan(0);
  });

  it('shows error banner when there are errors', () => {
    render(<BulkPreviewTable validRows={validRows} errorRows={errorRows} />);

    expect(screen.getByText(/fix 1 error/i)).toBeInTheDocument();
  });

  it('does not show error banner when no errors', () => {
    render(<BulkPreviewTable validRows={validRows} errorRows={[]} />);

    expect(screen.queryByText(/fix.*error/i)).not.toBeInTheDocument();
  });

  it('renders all rows', () => {
    render(<BulkPreviewTable validRows={validRows} errorRows={errorRows} />);

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('unknown@example.com')).toBeInTheDocument();
  });

  it('shows ready message when all rows valid', () => {
    render(<BulkPreviewTable validRows={validRows} errorRows={[]} />);

    expect(screen.getByText('All rows valid')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('shows cannot insert message when there are errors', () => {
    render(<BulkPreviewTable validRows={validRows} errorRows={errorRows} />);

    expect(screen.getByText('Cannot insert grants')).toBeInTheDocument();
  });
});
