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

  const getCategoryFolder = (category: string) => {
    switch (category) {
      case 'cover':
        return 'Covers';
      case 'topper':
        return 'Topper';
      case 'tableVideo':
      case 'marqueeVideo':
        return 'Videos';
      case 'directb2s':
        return 'DirectB2S';
      case 'music':
        return 'Music';
      case 'scripts':
        return 'Scripts';
      default:
        return 'Other';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
          <FolderTree className="h-4 w-4 mr-2 text-slate-600" />
          Package Structure
        </h3>
        
        <div className="space-y-2 text-sm font-mono">
          <div className="flex items-center text-slate-700">
            <Folder className="h-4 w-4 text-amber-500 mr-2" />
            {settings.baseDirectory}/
          </div>
          
          {tableFile && (
            <>
              <div className="ml-4 flex items-center text-slate-700">
                <Folder className="h-4 w-4 text-amber-500 mr-2" />
                {gameType}/
              </div>
              
              <div className="ml-8 flex items-center text-slate-700">
                <Folder className="h-4 w-4 text-amber-500 mr-2" />
                {settings.mediaFolder}/
              </div>
              
              {/* Show folders for each category that has files */}
              {additionalFiles.length > 0 && (
                <>
                  {Array.from(new Set(additionalFiles.map(f => getCategoryFolder(f.category)))).map(folder => (
                    <div key={folder}>
                      <div className="ml-12 flex items-center text-slate-600">
                        <Folder className="h-4 w-4 text-amber-500 mr-2" />
                        {folder}/
                      </div>
                      
                      {additionalFiles
                        .filter(f => getCategoryFolder(f.category) === folder)
                        .map(file => (
                          <div key={file.id} className="ml-16 flex items-center text-slate-500">
                            {getFileIcon(file.category)}
                            <span className="ml-2">
                              {settings.renameFiles ? tableName : file.originalName.replace(/\.[^/.]+$/, "")}
                              {getFileExtension(file.category)}
                            </span>
                          </div>
                        ))}
                    </div>
                  ))}
                </>
              )}
            </>
          )}
          
          {!tableFile && (
            <div className="ml-4 text-slate-400 italic">
              Upload a table file to see structure
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
