import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Image, Video, Music, Code, Plus } from "lucide-react";

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
  useTableName = true,
  onUseTableNameChange,
  category
}: FileUploadCardProps) {
  const IconComponent = iconMap[icon];
  const iconColor = iconColorMap[icon];

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
      <div className="space-y-3">
        <div
          {...getRootProps()}
          className={`
            border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer
            ${isDragActive ? 'border-blue-400 bg-blue-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-slate-700">{title}</h3>
            <IconComponent className={`h-4 w-4 ${iconColor}`} />
          </div>
          <p className="text-sm text-slate-500 mb-3">{description}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={open}
            className="w-full"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
        
        {onUseTableNameChange && (
          <div className="flex items-center space-x-2 px-1">
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

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`
          border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer
          ${isDragActive ? 'border-blue-400 bg-blue-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-slate-700">{title}</h3>
          <IconComponent className={`h-5 w-5 ${iconColor}`} />
        </div>
        <p className="text-sm text-slate-500 mb-3">{description}</p>
        <Button
          variant="secondary"
          onClick={open}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {title}
        </Button>
      </div>
      
      {onUseTableNameChange && (
        <div className="flex items-center space-x-2 px-1">
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
