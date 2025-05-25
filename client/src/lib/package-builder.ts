import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { TableFile, AdditionalFile, PackageSettings } from '@shared/schema';
import { sanitizeFileName, removeFileExtension, convertImageToPng } from './file-utils';

export class PackageBuilder {
  private zip: JSZip;
  private settings: PackageSettings;

  constructor(settings: PackageSettings) {
    this.zip = new JSZip();
    this.settings = settings;
  }

  private getCompressionLevel(): 'STORE' | 'DEFLATE' {
    return this.settings.compressionLevel === 'none' ? 'STORE' : 'DEFLATE';
  }

  private getCompressionOptions() {
    const compression = this.getCompressionLevel();
    if (compression === 'STORE') {
      return { compression, compressionOptions: { level: 0 } };
    }
    
    const levelMap = {
      fast: 1,
      normal: 6,
      maximum: 9
    };
    
    return {
      compression,
      compressionOptions: { level: levelMap[this.settings.compressionLevel as keyof typeof levelMap] || 6 }
    };
  }

  private getCategoryPath(category: AdditionalFile['category'], gameType: 'vpx' | 'fp'): string {
    const gameTypeName = gameType === 'vpx' ? 'Visual Pinball X' : 'Future Pinball';
    const basePath = `${this.settings.baseDirectory}/${gameTypeName}`;
    
    switch (category) {
      case 'cover':
        return `${basePath}/${this.settings.mediaFolder}/Covers`;
      case 'topper':
        return `${basePath}/${this.settings.mediaFolder}/Topper`;
      case 'tableVideo':
      case 'marqueeVideo':
        return `${basePath}/${this.settings.mediaFolder}/Videos`;
      case 'directb2s':
        return `${basePath}/DirectB2S`;
      case 'music':
        return `${basePath}/${this.settings.mediaFolder}/Music`;
      case 'scripts':
        return `${basePath}/Scripts`;
      default:
        return `${basePath}/${this.settings.mediaFolder}/Other`;
    }
  }

  private getFileName(originalName: string, tableName: string, category: string): string {
    if (!this.settings.renameFiles) {
      return originalName;
    }

    const sanitizedTableName = sanitizeFileName(tableName);
    const extension = originalName.split('.').pop();
    
    // Convert images to PNG if setting is enabled
    if (this.settings.convertImages && 
        (category === 'cover' || category === 'topper') &&
        extension && ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension.toLowerCase())) {
      return `${sanitizedTableName}.png`;
    }
    
    if (this.settings.preserveExtensions && extension) {
      return `${sanitizedTableName}.${extension}`;
    }
    
    return `${sanitizedTableName}.${extension || ''}`;
  }

  async addTableFile(tableFile: TableFile): Promise<void> {
    const gameTypeName = tableFile.type === 'vpx' ? 'Visual Pinball X' : 'Future Pinball';
    const filePath = `${this.settings.baseDirectory}/${gameTypeName}/${tableFile.file.name}`;
    
    this.zip.file(filePath, tableFile.file, this.getCompressionOptions());
  }

  async addAdditionalFile(file: AdditionalFile, tableName: string, gameType: 'vpx' | 'fp'): Promise<void> {
    const categoryPath = this.getCategoryPath(file.category, gameType);
    const fileName = this.getFileName(file.originalName, tableName, file.category);
    const filePath = `${categoryPath}/${fileName}`;
    
    let fileToAdd = file.file;
    
    // Convert image to PNG if needed
    if (this.settings.convertImages && 
        (file.category === 'cover' || file.category === 'topper') &&
        !file.originalName.toLowerCase().endsWith('.png')) {
      try {
        fileToAdd = await convertImageToPng(file.file);
      } catch (error) {
        console.warn('Failed to convert image to PNG, using original file:', error);
      }
    }
    
    this.zip.file(filePath, fileToAdd, this.getCompressionOptions());
  }

  async generateAndDownload(
    tableFile: TableFile,
    additionalFiles: AdditionalFile[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    // Add table file
    await this.addTableFile(tableFile);
    
    // Add additional files
    for (const file of additionalFiles) {
      await this.addAdditionalFile(file, tableFile.name, tableFile.type);
    }
    
    // Generate zip file
    const content = await this.zip.generateAsync(
      {
        type: 'blob',
        ...this.getCompressionOptions()
      },
      (metadata) => {
        if (onProgress) {
          onProgress(metadata.percent);
        }
      }
    );
    
    // Download the file
    const fileName = `${sanitizeFileName(tableFile.name)}_Package.zip`;
    saveAs(content, fileName);
  }
}
