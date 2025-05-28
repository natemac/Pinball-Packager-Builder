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
    return this.settings.compressionLevel === 'low' ? 'STORE' : 'DEFLATE';
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
    const fileSettings = this.settings.fileSettings[category];
    if (fileSettings?.location) {
      // Use the custom location if specified
      let location = fileSettings.location;
      
      // Replace game type placeholder if needed
      const gameTypeName = gameType === 'vpx' ? 'Visual Pinball X' : 'Future Pinball';
      location = location.replace(/Visual Pinball X|Future Pinball/g, gameTypeName);
      
      // Convert backslashes to forward slashes for consistent path handling
      return location.replace(/\\/g, '/');
    }
    
    // Return empty string if no location is set - let the settings define all paths
    return '';
  }

  private getFileName(originalName: string, tableName: string, category: AdditionalFile['category']): string {
    const fileSettings = this.settings.fileSettings[category];
    const extension = originalName.split('.').pop() || '';
    
    let fileName = '';
    
    if (fileSettings?.useTableName) {
      // Use table name with prefix/suffix
      const sanitizedTableName = sanitizeFileName(tableName);
      const prefix = fileSettings.prefix || '';
      const suffix = fileSettings.suffix || '';
      
      fileName = `${prefix}${sanitizedTableName}${suffix}`;
    } else {
      // Use original name with prefix/suffix
      const baseName = removeFileExtension(originalName);
      const prefix = fileSettings?.prefix || '';
      const suffix = fileSettings?.suffix || '';
      
      fileName = `${prefix}${baseName}${suffix}`;
    }
    
    // Handle image conversion to PNG
    if (this.settings.convertImages && 
        (category === 'cover' || category === 'topper') &&
        extension && ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension.toLowerCase())) {
      return `${fileName}.png`;
    }
    
    // Add original extension
    if (this.settings.preserveExtensions && extension) {
      return `${fileName}.${extension}`;
    }
    
    return `${fileName}.${extension}`;
  }

  async addTableFile(tableFile: TableFile): Promise<void> {
    const tableFileSettings = this.settings.tableFileSettings;
    
    if (!tableFileSettings?.location || this.settings.includeTableFile === false) {
      // Skip adding table file if no location is set in settings or if includeTableFile is false
      return;
    }
    
    // Use the custom location from settings
    let location = tableFileSettings.location;
    
    // Replace game type placeholder if needed
    const gameTypeName = tableFile.type === 'vpx' ? 'Visual Pinball X' : 'Future Pinball';
    location = location.replace(/Visual Pinball X|Future Pinball/g, gameTypeName);
    
    // Convert backslashes to forward slashes for consistent path handling
    location = location.replace(/\\/g, '/');
    
    // Get the filename with prefix/suffix
    let fileName = tableFile.file.name;
    if (tableFileSettings.useTableName) {
      const extension = tableFile.file.name.split('.').pop() || '';
      const sanitizedTableName = sanitizeFileName(tableFile.name);
      const prefix = tableFileSettings.prefix || '';
      const suffix = tableFileSettings.suffix || '';
      fileName = `${prefix}${sanitizedTableName}${suffix}.${extension}`;
    } else {
      const baseName = removeFileExtension(tableFile.file.name);
      const extension = tableFile.file.name.split('.').pop() || '';
      const prefix = tableFileSettings.prefix || '';
      const suffix = tableFileSettings.suffix || '';
      fileName = `${prefix}${baseName}${suffix}.${extension}`;
    }
    
    const filePath = `${location}/${fileName}`;
    this.zip.file(filePath, tableFile.file, this.getCompressionOptions());
  }

  private async processImageFile(file: File): Promise<File> {
    let processedFile = file;
    
    // Convert to PNG if enabled
    if (this.settings.convertImages && !file.name.toLowerCase().endsWith('.png')) {
      try {
        processedFile = await convertImageToPng(file);
      } catch (error) {
        console.warn('Failed to convert image to PNG, using original file:', error);
      }
    }
    
    // Apply image compression if enabled
    if (this.settings.imageCompression !== 'none') {
      try {
        processedFile = await this.compressImage(processedFile, this.settings.imageCompression);
      } catch (error) {
        console.warn('Failed to compress image, using original file:', error);
      }
    }
    
    return processedFile;
  }

  private async processVideoFile(file: File): Promise<File> {
    let processedFile = file;
    
    // Convert to MP4 if enabled
    if (this.settings.convertVideos && !file.name.toLowerCase().endsWith('.mp4')) {
      try {
        processedFile = await this.convertVideoToMp4(file);
      } catch (error) {
        console.warn('Failed to convert video to MP4, using original file:', error);
      }
    }
    
    // Apply video compression if enabled
    if (this.settings.videoCompression !== 'none') {
      try {
        processedFile = await this.compressVideo(processedFile, this.settings.videoCompression);
      } catch (error) {
        console.warn('Failed to compress video, using original file:', error);
      }
    }
    
    return processedFile;
  }

  private async compressImage(file: File, compressionLevel: 'low' | 'medium' | 'high'): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // Compression quality based on level
          const qualityMap = {
            low: 0.8,
            medium: 0.6,
            high: 0.4
          };
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: 'image/png' });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/png', qualityMap[compressionLevel]);
        } else {
          resolve(file);
        }
      };
      
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }

  private async convertVideoToMp4(file: File): Promise<File> {
    // Note: Video conversion would typically require FFmpeg or similar
    // For now, we'll return the original file as browser-based video conversion is limited
    console.warn('Video conversion to MP4 is not yet implemented in browser environment');
    return file;
  }

  private async compressVideo(file: File, compressionLevel: 'low' | 'medium' | 'high'): Promise<File> {
    // Note: Video compression would typically require FFmpeg or similar
    // For now, we'll return the original file as browser-based video compression is limited
    console.warn('Video compression is not yet implemented in browser environment');
    return file;
  }

  async addAdditionalFile(file: AdditionalFile, tableName: string, gameType: 'vpx' | 'fp'): Promise<void> {
    let categoryPath: string;
    let fileName: string;
    
    // Handle custom files with custom locations
    if (file.category === 'custom' && file.customLocation) {
      categoryPath = file.customLocation.replace(/\\/g, '/');
      fileName = file.originalName;
    } else {
      categoryPath = this.getCategoryPath(file.category, gameType);
      
      // Skip adding file if no location is set in settings
      if (!categoryPath) {
        return;
      }
      
      fileName = this.getFileName(file.originalName, tableName, file.category);
    }
    
    const filePath = `${categoryPath}/${fileName}`;
    
    let fileToAdd = file.file;
    
    // Process images
    if (file.category === 'cover' || file.category === 'topper') {
      fileToAdd = await this.processImageFile(file.file);
    }
    
    // Process videos
    if (file.category === 'tableVideo' || file.category === 'marqueeVideo') {
      fileToAdd = await this.processVideoFile(file.file);
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
        ...this.getCompressionOptions(),
        platform: 'UNIX'
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
