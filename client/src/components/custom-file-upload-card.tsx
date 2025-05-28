import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FileText, X } from "lucide-react";

interface CustomFileUploadCardProps {
  onFileUpload: (file: File, customLocation: string) => void;
}

export default function CustomFileUploadCard({ onFileUpload }: CustomFileUploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customLocation, setCustomLocation] = useState("Collection\\Visual Pinball X\\custom");
  const [isUploaded, setIsUploaded] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    noKeyboard: true
  });

  const handleUpload = () => {
    if (selectedFile && customLocation.trim()) {
      onFileUpload(selectedFile, customLocation.trim());
      setIsUploaded(true);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setIsUploaded(false);
    setCustomLocation("Collection\\Visual Pinball X\\custom");
  };

  if (isUploaded) {
    return (
      <div className="border border-green-300 rounded-lg p-6 bg-green-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-green-800">Custom File Added</h3>
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-sm text-green-600 mb-2">{selectedFile?.name}</p>
            <p className="text-xs text-green-600">Location: {customLocation}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="ml-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border border-slate-200 rounded-lg p-6 bg-white hover:border-blue-300 transition-colors cursor-pointer
        ${isDragActive ? 'border-blue-400 bg-blue-50' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-slate-700 mb-1">Add Additional File</h3>
            <p className="text-sm text-slate-500 mb-3">Upload any additional file for your package</p>
          </div>
          
          <div className="flex flex-col items-center gap-3 ml-4">
            {selectedFile ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg border border-blue-200 flex items-center justify-center mb-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-xs text-slate-600 truncate max-w-20">{selectedFile.name}</p>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={open}
                className="p-3 pl-[75px] pr-[75px] pt-[47px] pb-[47px] mt-[-9px] mb-[-9px] ml-[-5px] mr-[-5px]"
              >
                <Plus className="h-6 w-6 text-slate-400" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="customLocation" className="text-sm font-medium">
              File Location
            </Label>
            <Input
              id="customLocation"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Collection\Visual Pinball X\custom"
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Example: Collection\Visual Pinball X\Tables or Collection\Visual Pinball X\custom\subfolder
            </p>
          </div>

          {selectedFile && (
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!customLocation.trim()}
                size="sm"
                className="flex-1"
              >
                Add File
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedFile(null)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}