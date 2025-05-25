import { useState, useCallback } from 'react';
import type { TableFile, AdditionalFile, PackageSettings } from '@shared/schema';
import { PackageBuilder } from '@/lib/package-builder';
import { generateUniqueId } from '@/lib/file-utils';

const defaultSettings: PackageSettings = {
  baseDirectory: 'Collection',
  mediaFolder: 'media',
  renameFiles: true,
  preserveExtensions: true,
  convertImages: true,
  compressionLevel: 'normal'
};

export function useFileProcessor() {
  const [tableFile, setTableFile] = useState<TableFile | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<AdditionalFile[]>([]);
  const [settings, setSettings] = useState<PackageSettings>(defaultSettings);

  const addAdditionalFile = useCallback((file: File, category: AdditionalFile['category']) => {
    const newFile: AdditionalFile = {
      id: generateUniqueId(),
      file,
      originalName: file.name,
      category,
      size: file.size
    };
    
    setAdditionalFiles(prev => [...prev, newFile]);
  }, []);

  const removeAdditionalFile = useCallback((fileId: string) => {
    setAdditionalFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const updateSettings = useCallback((newSettings: PackageSettings) => {
    setSettings(newSettings);
  }, []);

  const clearAll = useCallback(() => {
    setTableFile(null);
    setAdditionalFiles([]);
  }, []);

  const generatePackage = useCallback(async (onProgress?: (progress: number) => void) => {
    if (!tableFile) {
      throw new Error('No table file selected');
    }

    const builder = new PackageBuilder(settings);
    await builder.generateAndDownload(tableFile, additionalFiles, onProgress);
  }, [tableFile, additionalFiles, settings]);

  return {
    tableFile,
    additionalFiles,
    settings,
    setTableFile,
    addAdditionalFile,
    removeAdditionalFile,
    updateSettings,
    clearAll,
    generatePackage
  };
}
