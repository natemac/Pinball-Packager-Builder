import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { CloudUpload, CheckCircle } from "lucide-react";
import type { TableFile } from "@shared/schema";

interface DragDropZoneProps {
  onFileUpload: (file: File) => void;
  acceptedTypes: string[];
  tableFile: TableFile | null;
}

export default function DragDropZone({ onFileUpload, acceptedTypes, tableFile }: DragDropZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
    setDragActive(false);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': acceptedTypes,
    },
    multiple: false,
    noClick: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer
          ${isDragActive || dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <CloudUpload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <p className="font-medium text-slate-700 mb-1">Drop your table file here</p>
        <p className="text-xs text-slate-500">
          Supports .vpx (Visual Pinball X) and .fp (Future Pinball) files
        </p>
      </div>

      {/* File Detection Result */}
      {tableFile && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">{tableFile.file.name}</p>
              <p className="text-xs text-green-600">
                {tableFile.type === 'vpx' ? 'Visual Pinball X' : 'Future Pinball'} Table Detected
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
