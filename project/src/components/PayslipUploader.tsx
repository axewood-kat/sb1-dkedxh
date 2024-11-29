import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, Loader2, AlertTriangle } from 'lucide-react';
import { parsePayslip } from '../utils/payslipParser';
import type { PayslipData } from '../types';

interface PayslipUploaderProps {
  onPayslipProcessed: (data: PayslipData) => void;
  onError: (error: string) => void;
}

export default function PayslipUploader({ onPayslipProcessed, onError }: PayslipUploaderProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setUploadError(null);

    try {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit. Please upload a smaller file.');
      }

      // Validate file type
      if (file.type !== 'application/pdf') {
        throw new Error('Invalid file type. Please upload a PDF file.');
      }

      const data = await parsePayslip(file);
      onPayslipProcessed(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payslip';
      setUploadError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    await processFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing,
    maxSize: 10 * 1024 * 1024
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
            <>
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              <div className="text-sm text-gray-600">
                <p>Processing payslip...</p>
                <p className="text-xs text-gray-500 mt-1">This may take a few moments...</p>
              </div>
            </>
          ) : uploadError ? (
            <>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-amber-600 mb-1">Upload Failed</p>
                <div className="whitespace-pre-line">{uploadError}</div>
                <p className="mt-2">Click or drag a new file to try again</p>
              </div>
            </>
          ) : (
            <>
              <FileUp className="h-8 w-8 text-emerald-500" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-800 mb-1">Upload Payslip</p>
                <p>Drag and drop your payslip here, or click to select file</p>
                <p className="mt-2 text-xs text-gray-500">
                  Supported format: PDF (max 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}