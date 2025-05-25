import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListChecks, FileImage, FileVideo, Music, FileCode, Trash2 } from "lucide-react";
import type { AdditionalFile } from "@shared/schema";

interface AddedFilesListProps {
  files: AdditionalFile[];
  onRemoveFile: (fileId: string) => void;
}

export default function AddedFilesList({ files, onRemoveFile }: AddedFilesListProps) {
  const getFileIcon = (category: string) => {
    switch (category) {
      case 'cover':
      case 'topper':
        return <FileImage className="h-5 w-5 text-blue-500" />;
      case 'tableVideo':
      case 'marqueeVideo':
        return <FileVideo className="h-5 w-5 text-red-500" />;
      case 'music':
        return <Music className="h-5 w-5 text-amber-500" />;
      case 'directb2s':
      case 'scripts':
        return <FileCode className="h-5 w-5 text-green-500" />;
      default:
        return <FileCode className="h-5 w-5 text-slate-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getCategoryDisplayName = (category: string): string => {
    switch (category) {
      case 'cover':
        return 'Cover';
      case 'topper':
        return 'Topper';
      case 'tableVideo':
        return 'Table Video';
      case 'marqueeVideo':
        return 'Marquee Video';
      case 'directb2s':
        return 'DirectB2S';
      case 'music':
        return 'Music';
      case 'scripts':
        return 'Scripts';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
          <ListChecks className="h-4 w-4 mr-2 text-slate-600" />
          Added Files
          <Badge variant="secondary" className="ml-auto">
            {files.length}
          </Badge>
        </h3>
        
        {files.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileImage className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No additional files added yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Upload files to see them listed here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center flex-1 min-w-0">
                  {getFileIcon(file.category)}
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {file.originalName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-slate-500">
                        {formatFileSize(file.size)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryDisplayName(file.category)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFile(file.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
