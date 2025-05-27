import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Image, Video, Music, Code, Plus, Check } from "lucide-react";

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
  hasFile = false
}: FileUploadCardProps) {
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
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-700">{title}</h3>
            {hasFile && <Check className="h-4 w-4 text-green-500" />}
          </div>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <IconComponent className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
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
