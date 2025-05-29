import { useState, useCallback } from 'react';
import type { TableFile, AdditionalFile, PackageSettings } from '@shared/schema';
import { PackageBuilder } from '@/lib/package-builder';
import { generateUniqueId } from '@/lib/file-utils';
import { getTemplate } from '@/lib/settings-templates';

const getDefaultSettings = (): PackageSettings => {
  const pinballEmporiumTemplate = getTemplate('pinball-emporium');
  if (pinballEmporiumTemplate) {
    return pinballEmporiumTemplate;
  }
  
  // Fallback settings if template loading fails
  return {
    baseDirectory: 'Collection',
    mediaFolder: 'media',
    preserveExtensions: true,
    convertImages: false,
    convertVideos: false,
    imageCompression: 'none',
    videoCompression: 'none',
    compressionLevel: 'normal',
    includeTableFile: true,
    tableFileSettings: {
      useTableName: false,
      prefix: '',
      suffix: '',
      location: 'Collection\\Visual Pinball X\\Tables'
    },
    fileSettings: {
      cover: {
        useTableName: true,
        prefix: '',
        suffix: '',
        location: 'Collection\\Visual Pinball X\\media\\covers'
      },
      topper: {
        useTableName: true,
        prefix: '',
        suffix: '',
        location: 'Collection\\Visual Pinball X\\media\\topper'
      },
      tableVideo: {
        useTableName: true,
        prefix: '',
        suffix: '',
        location: 'Collection\\Visual Pinball X\\media\\table videos'
      },
      marqueeVideo: {
        useTableName: true,
        prefix: '',
        suffix: '',
        location: 'Collection\\Visual Pinball X\\media\\marquee videos'
      },
      directb2s: {
        useTableName: true,
        prefix: '',
        suffix: '',
        location: 'Collection\\Visual Pinball X\\directb2s'
      },
      music: {
        useTableName: true,
        prefix: '',
        suffix: '',
        location: 'Collection\\Visual Pinball X\\music'
      },
      scripts: {
        useTableName: true,
        prefix: '',
        suffix: '',
        location: 'Collection\\Visual Pinball X\\scripts'
      }
    }
  };
};

export function useFileProcessor() {
  const [tableFile, setTableFile] = useState<TableFile | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<AdditionalFile[]>([]);
  const [settings, setSettings] = useState<PackageSettings>(getDefaultSettings());

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