import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUploadCard } from '@/components/bulk/FileUploadCard';

describe('FileUploadCard', () => {
  const defaultProps = {
    onFileSelect: vi.fn(),
    isUploading: false,
    selectedFile: null,
    onClear: vi.fn(),
  };

  it('renders upload prompt in idle state', () => {
    render(<FileUploadCard {...defaultProps} />);

    expect(screen.getByText(/drag csv here/i)).toBeInTheDocument();
    expect(screen.getByText(/download csv template/i)).toBeInTheDocument();
  });

  it('shows loading state when uploading', () => {
    render(<FileUploadCard {...defaultProps} isUploading={true} />);

    expect(screen.getByText(/processing csv/i)).toBeInTheDocument();
    expect(screen.getByText(/validating rows/i)).toBeInTheDocument();
  });

  it('shows selected file when file is selected', () => {
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    render(<FileUploadCard {...defaultProps} selectedFile={file} />);

    expect(screen.getByText('test.csv')).toBeInTheDocument();
    expect(screen.getByText(/ready to process/i)).toBeInTheDocument();
  });

  it('calls onClear when clear button clicked', () => {
    const onClear = vi.fn();
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    render(
      <FileUploadCard {...defaultProps} selectedFile={file} onClear={onClear} />
    );

    // Find the clear button (X icon button)
    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    expect(onClear).toHaveBeenCalled();
  });

  it('handles drag over state', () => {
    render(<FileUploadCard {...defaultProps} />);

    const dropZone = screen.getByText(/drag csv here/i).closest('div');

    fireEvent.dragOver(dropZone!);

    // Should show different text when dragging
    expect(screen.getByText(/drop your csv file here/i)).toBeInTheDocument();
  });

  it('handles drag leave state', () => {
    render(<FileUploadCard {...defaultProps} />);

    const dropZone = screen.getByText(/drag csv here/i).closest('div');

    fireEvent.dragOver(dropZone!);
    fireEvent.dragLeave(dropZone!);

    // Should revert to normal text
    expect(screen.getByText(/drag csv here/i)).toBeInTheDocument();
  });

  it('calls onFileSelect when file is dropped', () => {
    const onFileSelect = vi.fn();
    render(<FileUploadCard {...defaultProps} onFileSelect={onFileSelect} />);

    const dropZone = screen.getByText(/drag csv here/i).closest('div');

    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const dataTransfer = {
      files: [file],
    };

    fireEvent.drop(dropZone!, { dataTransfer });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('ignores non-CSV files on drop', () => {
    const onFileSelect = vi.fn();
    render(<FileUploadCard {...defaultProps} onFileSelect={onFileSelect} />);

    const dropZone = screen.getByText(/drag csv here/i).closest('div');

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const dataTransfer = {
      files: [file],
    };

    fireEvent.drop(dropZone!, { dataTransfer });

    expect(onFileSelect).not.toHaveBeenCalled();
  });
});

