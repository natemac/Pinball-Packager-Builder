import type { PackageSettings } from "@shared/schema";
import { saveAs } from 'file-saver';

// Import template JSON files
import pinballEmporiumTemplate from '@/templates/settings/Pinball Emporium.json';
import pinupPopperTemplate from '@/templates/settings/PinUP Popper.json';

export interface SettingsTemplate {
  templateName: string;
  settings: PackageSettings;
}

export const TEMPLATE_OPTIONS = [
  { value: 'custom', label: 'Custom...' },
  { value: 'pinball-emporium', label: 'Pinball Emporium' },
  { value: 'pinup-popper', label: 'PinUP Popper' }
];

export const getTemplate = (templateId: string): PackageSettings | null => {
  switch (templateId) {
    case 'pinball-emporium':
      return extractSettingsFromTemplate(pinballEmporiumTemplate);
    case 'pinup-popper':
      return extractSettingsFromTemplate(pinupPopperTemplate);
    default:
      return null;
  }
};

const extractSettingsFromTemplate = (template: any): PackageSettings => {
  const { templateName, ...templateData } = template;
  
  // Handle the nested fileSettings structure from JSON templates
  let processedSettings: PackageSettings;
  if (templateData.fileSettings && templateData.fileSettings.tableFileSettings) {
    // New nested structure - extract tableFileSettings and move other fileSettings up
    const { tableFileSettings, ...otherFileSettings } = templateData.fileSettings;
    processedSettings = {
      ...templateData,
      tableFileSettings,
      fileSettings: otherFileSettings
    };
  } else {
    // Fallback to defaults if structure is unexpected
    processedSettings = {
      baseDirectory: 'Collection',
      mediaFolder: 'media',
      preserveExtensions: true,
      convertImages: false,
      convertVideos: false,
      imageCompression: 'none',
      videoCompression: 'none',
      compressionLevel: 'normal',
      tableFileSettings: {
        useTableName: true,
        prefix: '',
        suffix: '',
        location: 'Collection\\Visual Pinball X\\Tables'
      },
      fileSettings: {
        cover: { useTableName: true, prefix: '', suffix: '', location: 'Collection\\Visual Pinball X\\media\\covers' },
        topper: { useTableName: true, prefix: '', suffix: '', location: 'Collection\\Visual Pinball X\\media\\toppers' },
        tableVideo: { useTableName: true, prefix: '', suffix: '', location: 'Collection\\Visual Pinball X\\media\\videos' },
        marqueeVideo: { useTableName: true, prefix: '', suffix: '', location: 'Collection\\Visual Pinball X\\media\\marquee' },
        directb2s: { useTableName: true, prefix: '', suffix: '', location: 'Collection\\Visual Pinball X\\Tables' },
        music: { useTableName: true, prefix: '', suffix: '', location: 'Collection\\Visual Pinball X\\Music' },
        scripts: { useTableName: true, prefix: '', suffix: '', location: 'Collection\\Visual Pinball X\\Scripts' }
      },
      ...templateData
    };
  }
  
  return processedSettings as PackageSettings;
};

export const downloadSettingsAsJson = (settings: PackageSettings, filename: string = 'package-settings.json') => {
  // Remove baseDirectory and mediaFolder from export as they're not user settings
  const { baseDirectory, mediaFolder, ...exportSettings } = settings;
  const settingsWithTemplateName = {
    templateName: 'Custom',
    ...exportSettings
  };
  
  const blob = new Blob([JSON.stringify(settingsWithTemplateName, null, 2)], {
    type: 'application/json'
  });
  
  saveAs(blob, filename);
};

export const loadSettingsFromJson = (file: File): Promise<PackageSettings> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Validate that it has the required structure
        if (!parsed.fileSettings || typeof parsed.fileSettings !== 'object') {
          throw new Error('Invalid settings file format');
        }
        
        const settings = extractSettingsFromTemplate(parsed);
        resolve(settings);
      } catch (error) {
        reject(new Error('Failed to parse settings file: ' + error));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};