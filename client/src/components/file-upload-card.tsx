import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Image, Video, Music, Code, Plus, Check, X } from "lucide-react";

interface FileUploadCardProps {
  title: string;
  description: string;
  icon: 'image' | 'video' | 'audio' | 'code';
  onFileUpload: (file: File) => void;
  acceptedTypes: string[];
  compact?: boolean;
  useTableName?: boolean;
  onUseTableNameChange?: (use: boolean) => void;
  category?: string;
  hasFile?: boolean;
  uploadedFile?: File;
  onRemoveFile?: () => void;
}

const iconMap = {
  image: Image,
  video: Video,
  audio: Music,
  code: Code,
};

const iconColorMap = {
  image: 'text-blue-500',
  video: 'text-red-500',
  audio: 'text-amber-500',
  code: 'text-green-500',
};

export default function FileUploadCard({
  title,
  description,
  icon,
  onFileUpload,
  acceptedTypes,
  compact = false,
  category,
  useTableName,
  onUseTableNameChange,
  hasFile = false,
  uploadedFile,
  onRemoveFile
}: FileUploadCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = iconMap[icon];
  const iconColor = iconColorMap[icon];

  // Get custom button text based on category
  const getButtonText = () => {
    switch (category) {
      case 'directb2s':
        return '+ Add DirectB2S File';
      case 'music':
        return '+ Add Music Folder';
      case 'scripts':
        return '+ Add Script Files';
      default:
        return `+ Add ${title}`;
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc['application/octet-stream'] = acc['application/octet-stream'] || [];
      acc['application/octet-stream'].push(type);
      return acc;
    }, {} as Record<string, string[]>),
    multiple: false,
    noClick: true,
  });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className={`
          border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer
          ${isDragActive ? 'border-blue-400 bg-blue-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-700">{title}</h3>
            {hasFile && <Check className="h-4 w-4 text-green-500" />}
          </div>
          <div>
            <IconComponent className={`h-4 w-4 ${iconColor}`} />
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={open}
            className="flex-shrink-0"
          >
            {getButtonText()}
          </Button>
          
          {onUseTableNameChange && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${category}-useTableName`}
                checked={useTableName}
                onCheckedChange={(checked) => onUseTableNameChange(!!checked)}
              />
              <Label htmlFor={`${category}-useTableName`} className="text-xs text-slate-600">
                Use table name as filename
              </Label>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveFile) {
      onRemoveFile();
    }
  };

  return (
    <div className="space-y-3">
      {/* Title and Description */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-slate-700">{title}</h3>
          {hasFile && <Check className="h-4 w-4 text-green-500" />}
        </div>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      {/* Combined Upload Area with 16:9 Ratio */}
      <div
        {...getRootProps()}
        className={`
          relative aspect-video w-full rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400'}
          ${hasFile ? 'border-solid border-green-300 bg-green-50' : 'hover:bg-slate-50'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input {...getInputProps()} />
        
        {hasFile && uploadedFile ? (
          // File uploaded - show thumbnail with hover remove button
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            {uploadedFile.type.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(uploadedFile)}
                alt="Uploaded file"
                className="w-full h-full object-cover"
              />
            ) : uploadedFile.type.startsWith('video/') ? (
              <video
                src={URL.createObjectURL(uploadedFile)}
                className="w-full h-full object-cover"
                muted
              />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <IconComponent className={`h-8 w-8 ${iconColor} mx-auto mb-2`} />
                  <p className="text-sm font-medium text-slate-700">{uploadedFile.name}</p>
                </div>
              </div>
            )}
            
            {/* Hover overlay with remove button */}
            {isHovered && onRemoveFile && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <button
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="text-center text-white">
                  <p className="text-sm font-medium">Click to replace file</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // No file - show upload area
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <div className="mb-3">
              <Plus className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <IconComponent className={`h-6 w-6 ${iconColor} mx-auto`} />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">
              {getButtonText()}
            </p>
            <p className="text-xs text-slate-500">
              Drag & drop or click to browse
            </p>
          </div>
        )}
      </div>

      {/* Use table name checkbox */}
      {onUseTableNameChange && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${category}-useTableName`}
            checked={useTableName}
            onCheckedChange={(checked) => onUseTableNameChange(!!checked)}
          />
          <Label htmlFor={`${category}-useTableName`} className="text-xs text-slate-600">
            Use table name as filename
          </Label>
        </div>
      )}
    </div>
  );
}
