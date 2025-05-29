import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  uploadedFile?: File;
  customLocation?: string;
  onCustomLocationChange?: (location: string) => void;
  showCustomLocation?: boolean;
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
  customLocation,
  onCustomLocationChange,
  showCustomLocation = false
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
    accept: acceptedTypes.includes('*') ? undefined : acceptedTypes.reduce((acc, type) => {
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

  // Helper function to create thumbnail preview
  const createThumbnail = (file: File) => {
    if (file.type.startsWith('video/')) {
      return (
        <video
          src={URL.createObjectURL(file)}
          className="absolute inset-0 w-full h-full object-cover rounded-md"
          muted
        />
      );
    } else {
      return (
        <div className="absolute inset-0 w-full h-full bg-slate-100 rounded-md flex items-center justify-center">
          <IconComponent className={`h-6 w-6 ${iconColor}`} />
        </div>
      );
    }
  };

  return (
    <div
      {...getRootProps()}
      className={`
        border border-slate-200 rounded-lg p-6 bg-white hover:border-blue-300 transition-colors cursor-pointer
        ${isDragActive ? 'border-blue-400 bg-blue-50' : ''}
        ${hasFile ? 'border-green-300 bg-green-50' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex items-start justify-between">
        {/* Left side - Content justified left */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-slate-700">{title}</h3>
            {hasFile && <Check className="h-4 w-4 text-green-500" />}
          </div>
          <p className="text-sm text-slate-500 mb-3">{description}</p>
          
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
          
          {showCustomLocation && onCustomLocationChange && (
            <div className="space-y-1 mt-2">
              <Label htmlFor={`${category}-customLocation`} className="text-xs text-slate-600">
                File Location
              </Label>
              <Input
                id={`${category}-customLocation`}
                value={customLocation || 'Collection/Custom Files'}
                onChange={(e) => onCustomLocationChange(e.target.value)}
                placeholder="Collection/Custom Files"
                className="text-xs"
              />
            </div>
          )}
        </div>
        
        {/* Right side - Combined Upload Button */}
        <div className="flex flex-col items-center gap-3 ml-4">
          {hasFile && uploadedFile ? (
            <Button
              variant="outline"
              onClick={open}
              className="relative p-3 pl-[75px] pr-[75px] pt-[47px] pb-[47px] mt-[-9px] mb-[-9px] ml-[-5px] mr-[-5px] overflow-hidden"
            >
              {createThumbnail(uploadedFile)}
            </Button>
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
    </div>
  );
}
