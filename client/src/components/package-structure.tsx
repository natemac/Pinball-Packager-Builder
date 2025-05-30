import { Card, CardContent } from "@/components/ui/card";
import { FolderTree, Folder, FileImage, FileVideo, FileText } from "lucide-react";
import type { TableFile, AdditionalFile, PackageSettings } from "@shared/schema";

interface PackageStructureProps {
  tableFile: TableFile | null;
  additionalFiles: AdditionalFile[];
  settings: PackageSettings;
  customFiles?: Array<{id: string, location: string, file?: File, useTableName?: boolean}>;
}

export default function PackageStructure({
  tableFile,
  additionalFiles,
  settings,
  customFiles = []
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

  const getTableFilePath = () => {
    if (!tableFile) return '';
    
    const fileSettings = settings.tableFileSettings;
    if (fileSettings?.location) {
      // Use the custom location if specified
      let location = fileSettings.location;
      
      // Replace game type placeholder if needed
      const gameTypeName = tableFile.type === 'vpx' ? 'Visual Pinball X' : 'Future Pinball';
      location = location.replace(/Visual Pinball X|Future Pinball/g, gameTypeName);
      
      // Convert backslashes to forward slashes for display
      return location.replace(/\\/g, '/');
    }
    
    // Fallback to original logic
    const gameTypeName = tableFile.type === 'vpx' ? 'Visual Pinball X' : 'Future Pinball';
    return `${settings.baseDirectory}/${gameTypeName}`;
  };

  const getCategoryPath = (category: AdditionalFile['category'], customLocation?: string) => {
    // Use custom location if provided (for custom files)
    if (customLocation) {
      // Replace game type placeholder if needed
      const gameTypeName = tableFile?.type === 'vpx' ? 'Visual Pinball X' : 'Future Pinball';
      let location = customLocation.replace(/Visual Pinball X|Future Pinball/g, gameTypeName);
      
      // Convert backslashes to forward slashes for display
      return location.replace(/\\/g, '/');
    }
    
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
    const extension = file.originalName.split('.').pop() || '';
    
    let fileName = '';
    let useTableName = false;
    let prefix = '';
    let suffix = '';
    
    // Handle custom files differently
    if (file.customFileId) {
      // Find the corresponding custom file to get its useTableName setting
      const customFile = customFiles.find(cf => cf.id === file.customFileId);
      useTableName = customFile?.useTableName || false;
      
      if (useTableName) {
        // Use table name for custom files
        fileName = tableName;
      } else {
        // Use original name for custom files
        const baseName = file.originalName.replace(/\.[^/.]+$/, '');
        fileName = baseName;
      }
    } else {
      // Regular file categories
      const fileSettings = settings.fileSettings[file.category];
      useTableName = fileSettings?.useTableName || false;
      prefix = fileSettings?.prefix || '';
      suffix = fileSettings?.suffix || '';
      
      if (useTableName) {
        // Use table name with prefix/suffix
        fileName = `${prefix}${tableName}${suffix}`;
      } else {
        // Use original name with prefix/suffix
        const baseName = file.originalName.replace(/\.[^/.]+$/, '');
        fileName = `${prefix}${baseName}${suffix}`;
      }
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

  interface TreeNode {
    name: string;
    type: 'folder' | 'file';
    children: TreeNode[];
    file?: AdditionalFile;
    path: string;
    uniqueKey?: string;
  }

  const buildFileTree = () => {
    if (!tableFile) return [];

    const root: TreeNode = {
      name: 'Package',
      type: 'folder',
      children: [],
      path: ''
    };

    // Add table file using the table file settings (only if includeTableFile is true)
    if (settings.includeTableFile) {
      const tableFilePath = getTableFilePath();
      const pathParts = tableFilePath.split('/').filter(part => part);
      
      let currentNode = root;
      let currentPath = '';

      // Navigate/create path for table file
      pathParts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        let existingNode = currentNode.children.find(child => 
          child.name === part && child.type === 'folder'
        );

        if (!existingNode) {
          existingNode = {
            name: part,
            type: 'folder',
            children: [],
            path: currentPath
          };
          currentNode.children.push(existingNode);
        }

        currentNode = existingNode;
      });

      // Add the table file itself
      currentNode.children.push({
        name: tableFile.file.name,
        type: 'file',
        children: [],
        path: `${tableFilePath}/${tableFile.file.name}`
      });
    }

    // Build tree structure from file paths
    additionalFiles.forEach(file => {
      const fullPath = getCategoryPath(file.category, file.customLocation);
      const pathParts = fullPath.split('/').filter(part => part);
      const fileName = getDisplayFileName(file);

      let currentNode = root;
      let currentPath = '';

      // Navigate/create path
      pathParts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        let existingNode = currentNode.children.find(child => 
          child.name === part && child.type === 'folder'
        );

        if (!existingNode) {
          existingNode = {
            name: part,
            type: 'folder',
            children: [],
            path: currentPath
          };
          currentNode.children.push(existingNode);
        }

        currentNode = existingNode;
      });

      // Add file to final directory with unique key using file ID
      currentNode.children.push({
        name: fileName,
        type: 'file',
        children: [],
        file,
        path: `${fullPath}/${fileName}`,
        uniqueKey: file.id // Add unique identifier for React key
      });
    });

    return renderTreeNode(root, 0);
  };

  const renderTreeNode = (node: TreeNode, depth: number): JSX.Element[] => {
    const indent = depth * 16; // 16px per level
    const elements: JSX.Element[] = [];

    if (depth > 0) { // Don't render the root "Package" node
      elements.push(
        <div 
          key={node.uniqueKey || node.path} 
          className="flex items-center text-slate-700"
          style={{ paddingLeft: `${indent}px` }}
        >
          {node.type === 'folder' ? (
            <Folder className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
          ) : (
            node.file ? getFileIcon(node.file.category) : 
            <FileText className="h-4 w-4 text-slate-500 mr-2 flex-shrink-0" />
          )}
          <span className="text-xs truncate" title={node.name}>
            {node.name}
            {node.type === 'folder' ? '/' : ''}
          </span>
        </div>
      );
    }

    // Sort children: folders first, then files
    const sortedChildren = [...node.children].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    // Render children
    sortedChildren.forEach(child => {
      elements.push(...renderTreeNode(child, depth + 1));
    });

    return elements;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
          <FolderTree className="h-4 w-4 mr-2 text-slate-600" />
          Package Structure
        </h3>
        
        <div className="text-sm font-mono">
          {!tableFile && (
            <div className="text-slate-400 italic">
              Upload a table file to see structure
            </div>
          )}
          
          {tableFile && (
            <div className="space-y-1">
              {buildFileTree()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
