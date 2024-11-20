import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageIcon, MapPin, Loader2 } from 'lucide-react';

interface FieldMapping {
  label: string;
  x: number;
  y: number;
}

interface PayslipLayoutReferenceProps {
  onFieldsDetected: (fields: FieldMapping[]) => void;
}

export default function PayslipLayoutReference({ onFieldsDetected }: PayslipLayoutReferenceProps) {
  const [image, setImage] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedPoints, setSelectedPoints] = React.useState<FieldMapping[]>([]);
  const [currentField, setCurrentField] = React.useState<string>('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
  });

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!currentField) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoint: FieldMapping = {
      label: currentField,
      x,
      y,
    };

    setSelectedPoints(prev => [...prev, newPoint]);
    setCurrentField('');
    onFieldsDetected([...selectedPoints, newPoint]);
  };

  const fields = [
    'Pay Period',
    'Regular Pay',
    'Hours Worked',
    'Overtime Hours',
    'Overtime Rate',
    'Commission',
    'Bonus',
    'Taxed Allowances',
    'Untaxed Allowances',
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Payslip Layout Reference</h3>
      
      {!image ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            {isProcessing ? (
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            ) : (
              <ImageIcon className="h-8 w-8 text-emerald-500" />
            )}
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-800 mb-1">Upload Payslip Template</p>
              <p>Drag and drop your payslip mockup image here, or click to select file</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {fields.map(field => (
              <button
                key={field}
                onClick={() => setCurrentField(field)}
                className={`
                  px-3 py-1 rounded-full text-sm
                  ${currentField === field
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                  }
                  border hover:bg-opacity-80 transition-colors
                `}
              >
                {field}
              </button>
            ))}
          </div>

          <div className="relative inline-block">
            <img
              src={image}
              alt="Payslip template"
              onClick={handleImageClick}
              className="max-w-full cursor-crosshair rounded-lg border border-gray-300"
            />
            {selectedPoints.map((point, index) => (
              <div
                key={index}
                className="absolute w-3 h-3 -ml-1.5 -mt-1.5"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                <MapPin className="h-6 w-6 text-emerald-500" />
                <div className="absolute left-6 top-0 bg-white px-2 py-1 rounded-md shadow-sm text-sm">
                  {point.label}
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-600">
            {currentField ? (
              <p>Click on the image where the "{currentField}" field is located</p>
            ) : (
              <p>Select a field from above to mark its location on the payslip</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}