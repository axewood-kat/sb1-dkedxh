import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, Loader2, AlertTriangle } from 'lucide-react';
import { processPayslipImage } from '../utils/payslipProcessor';
import type { PayslipData } from '../types';

interface PayslipUploaderProps {
  onPayslipProcessed: (data: PayslipData) => void;
  onError: (error: string) => void;
}

export default function PayslipUploader({ onPayslipProcessed, onError }: PayslipUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size exceeds 10MB limit');
      }

      const reader = new FileReader();
      
      const readerPromise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
      });

      reader.readAsDataURL(file);
      
      const base64Data = await readerPromise;
      
      if (typeof base64Data !== 'string') {
        throw new Error('Invalid file data');
      }

      const data = await processPayslipImage(base64Data);
      onPayslipProcessed(data);
    } catch (error) {
      console.error('Upload error:', error);
      onError(error instanceof Error ? error.message : 'Failed to process payslip');
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
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
    disabled: isProcessing,
    maxSize: 10 * 1024 * 1024, // 10MB
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
              <p className="text-sm text-gray-600">Processing payslip...</p>
            </>
          ) : (
            <>
              <FileUp className="h-8 w-8 text-emerald-500" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-800 mb-1">Upload Payslip</p>
                <p>Drag and drop your payslip here, or click to select file</p>
                <p className="mt-2 text-xs text-gray-500">
                  Supported formats: PDF, PNG, JPEG (max 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
          <p>
            Your payslip data is processed securely and never stored. 
            For best results, ensure the payslip image is clear and all text is readable.
          </p>
        </div>
      </div>
    </div>
  );
}