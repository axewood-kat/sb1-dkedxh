import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, Loader2 } from 'lucide-react';
import { parsePayslip } from '../utils/pdfParser';
import type { PayslipData } from '../types';

interface PDFUploaderProps {
  onPayslipParsed: (payslip: PayslipData) => void;
  onError: (error: string) => void;
}

export default function PDFUploader({ onPayslipParsed, onError }: PDFUploaderProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const payslipData = await parsePayslip(file);
      onPayslipParsed(payslipData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process PDF file';
      setError(errorMessage);
      onError(errorMessage);
      console.error('PDF processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [onPayslipParsed, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'}
          ${isProcessing ? 'cursor-not-allowed opacity-75' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {isProcessing ? (
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          ) : (
            <FileUp className="h-8 w-8 text-emerald-500" />
          )}
          <div className="text-sm text-gray-600">
            {isProcessing ? (
              <p>Processing payslip...</p>
            ) : isDragActive ? (
              <p>Drop your payslip PDF here</p>
            ) : (
              <div>
                <p className="font-medium text-gray-800 mb-1">Upload Payslip PDF</p>
                <p>Drag and drop your payslip here, or click to select file</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}