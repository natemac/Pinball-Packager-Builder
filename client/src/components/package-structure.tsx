import { Card, CardContent } from "@/components/ui/card";
import { FolderTree, Folder, FileImage, FileVideo, FileText } from "lucide-react";
import type { TableFile, AdditionalFile, PackageSettings } from "@shared/schema";

interface PackageStructureProps {
  tableFile: TableFile | null;
  additionalFiles: AdditionalFile[];
  settings: PackageSettings;
}

export default function PackageStructure({
  tableFile,
  additionalFiles,
  settings
}: PackageStructureProps) {
  const gameType = tableFile?.type === 'vpx' ? 'Visual Pinball X' : 'Future Pinball';
  const tableName = tableFile?.name || 'table_name';

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'cover':
      case 'topper':
        return <FileImage className="h-4 w-4 text-blue-500" />;
      case 'tableVideo':
      case 'marqueeVideo':
        return <FileVideo className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-green-500" />;
    }
  };

  const getFileExtension = (category: string) => {
    switch (category) {
      case 'cover':
      case 'topper':
        return '.png';
      case 'tableVideo':
      case 'marqueeVideo':
        return '.mp4';
      case 'directb2s':
        return '.directb2s';
      case 'music':
        return '.mp3';
      case 'scripts':
        return '.vbs';
      default:
        return '';
    }
  };

  const getCategoryPath = (category: AdditionalFile['category']) => {
    const fileSettings = settings.fileSettings[category];
    if (fileSettings?.location) {
      // Use the custom location if specified
      let location = fileSettings.location;
      
      // Replace game type placeholder if needed
      const gameTypeName = tableFile?.type === 'vpx' ? 'Visual Pinball X' : 'Future Pinball';
      location = location.replace(/Visual Pinball X|Future Pinball/g, gameTypeName);
      
      // Convert backslashes to forward slashes for display
      return location.replace(/\\/g, '/');
    }
    
    // Fallback to original logic
    const gameTypeName = tableFile?.type === 'vpx' ? 'Visual Pinball X' : 'Future Pinball';
    const basePath = `${settings.baseDirectory}/${gameTypeName}`;
    
    switch (category) {
      case 'cover':
        return `${basePath}/${settings.mediaFolder}/Covers`;
      case 'topper':
        return `${basePath}/${settings.mediaFolder}/Topper`;
      case 'tableVideo':
      case 'marqueeVideo':
        return `${basePath}/${settings.mediaFolder}/Videos`;
      case 'directb2s':
        return `${basePath}/DirectB2S`;
      case 'music':
        return `${basePath}/${settings.mediaFolder}/Music`;
      case 'scripts':
        return `${basePath}/Scripts`;
      default:
        return `${basePath}/${settings.mediaFolder}/Other`;
    }
  };

  const getDisplayFileName = (file: AdditionalFile) => {
    const fileSettings = settings.fileSettings[file.category];
    const extension = file.originalName.split('.').pop() || '';
    
    let fileName = '';
    
    if (fileSettings?.useTableName) {
      // Use table name with prefix/suffix
      const prefix = fileSettings.prefix || '';
      const suffix = fileSettings.suffix || '';
      fileName = `${prefix}${tableName}${suffix}`;
    } else {
      // Use original name with prefix/suffix
      const baseName = file.originalName.replace(/\.[^/.]+$/, '');
      const prefix = fileSettings?.prefix || '';
      const suffix = fileSettings?.suffix || '';
      fileName = `${prefix}${baseName}${suffix}`;
    }
    
    // Handle image conversion to PNG
    if (settings.convertImages && 
        (file.category === 'cover' || file.category === 'topper') &&
        extension && ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension.toLowerCase())) {
      return `${fileName}.png`;
    }
    
    // Add original extension
    if (settings.preserveExtensions && extension) {
      return `${fileName}.${extension}`;
    }
    
    return `${fileName}.${extension}`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
          <FolderTree className="h-4 w-4 mr-2 text-slate-600" />
          Package Structure
        </h3>
        
        <div className="space-y-2 text-sm font-mono">
          {!tableFile && (
            <div className="text-slate-400 italic">
              Upload a table file to see structure
            </div>
          )}
          
          {tableFile && additionalFiles.length === 0 && (
            <div className="text-slate-500">
              No additional files added yet
            </div>
          )}
          
          {tableFile && additionalFiles.length > 0 && (
            <>
              {/* Group files by their paths */}
              {Array.from(new Set(additionalFiles.map(f => getCategoryPath(f.category)))).map(path => {
                const filesInPath = additionalFiles.filter(f => getCategoryPath(f.category) === path);
                const pathParts = path.split('/');
                
                return (
                  <div key={path} className="mb-4">
                    {/* Show the full path */}
                    <div className="flex items-center text-slate-700 mb-2">
                      <Folder className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-xs break-all">{path}/</span>
                    </div>
                    
                    {/* Show files in this path */}
                    {filesInPath.map(file => (
                      <div key={file.id} className="ml-6 flex items-center text-slate-500">
                        {getFileIcon(file.category)}
                        <span className="ml-2 text-xs">
                          {getDisplayFileName(file)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
