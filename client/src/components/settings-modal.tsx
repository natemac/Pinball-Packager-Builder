import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PackageSettings, FileLocationSettings, AdditionalFile } from "@shared/schema";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: PackageSettings;
  onSettingsChange: (settings: PackageSettings) => void;
}

export default function SettingsModal({
  open,
  onOpenChange,
  settings,
  onSettingsChange
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<PackageSettings>(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onOpenChange(false);
  };

  const updateSetting = <K extends keyof PackageSettings>(
    key: K,
    value: PackageSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateFileSettings = (
    category: keyof PackageSettings['fileSettings'],
    key: keyof FileLocationSettings,
    value: string | boolean
  ) => {
    setLocalSettings(prev => ({
      ...prev,
      fileSettings: {
        ...prev.fileSettings,
        [category]: {
          ...prev.fileSettings[category],
          [key]: value
        }
      }
    }));
  };

  const getCategoryDisplayName = (category: keyof PackageSettings['fileSettings']): string => {
    const names = {
      cover: 'Cover Image',
      topper: 'Topper Image',
      tableVideo: 'Table Video',
      marqueeVideo: 'Marquee Video',
      directb2s: 'DirectB2S File',
      music: 'Music Files',
      scripts: 'Script Files'
    };
    return names[category];
  };

  const renderFileSettingsCard = (category: keyof PackageSettings['fileSettings']) => {
    const settings = localSettings.fileSettings[category];
    const displayName = getCategoryDisplayName(category);

    return (
      <Card key={category}>
        <CardContent className="p-4">
          <h4 className="font-medium text-slate-900 mb-3">{displayName}</h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${category}-useTableName`}
                checked={settings.useTableName}
                onCheckedChange={(checked) => updateFileSettings(category, 'useTableName', !!checked)}
              />
              <Label htmlFor={`${category}-useTableName`} className="text-sm">
                Use table name as filename
              </Label>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor={`${category}-prefix`} className="text-xs text-slate-600">
                  Prefix
                </Label>
                <Input
                  id={`${category}-prefix`}
                  value={settings.prefix}
                  onChange={(e) => updateFileSettings(category, 'prefix', e.target.value)}
                  placeholder="prefix_"
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor={`${category}-suffix`} className="text-xs text-slate-600">
                  Suffix
                </Label>
                <Input
                  id={`${category}-suffix`}
                  value={settings.suffix}
                  onChange={(e) => updateFileSettings(category, 'suffix', e.target.value)}
                  placeholder="_suffix"
                  className="text-sm"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor={`${category}-location`} className="text-xs text-slate-600">
                File Location
              </Label>
              <Input
                id={`${category}-location`}
                value={settings.location}
                onChange={(e) => updateFileSettings(category, 'location', e.target.value)}
                placeholder="Collection\Visual Pinball X\media\covers"
                className="text-sm font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Package Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="py-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="files">File Locations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 mt-6">
            {/* Default Package Structure */}
            <div>
              <h3 className="font-medium text-slate-900 mb-4">Default Package Structure</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="baseDirectory">Base Directory</Label>
                  <Input
                    id="baseDirectory"
                    value={localSettings.baseDirectory}
                    onChange={(e) => updateSetting('baseDirectory', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="mediaFolder">Media Folder Name</Label>
                  <Input
                    id="mediaFolder"
                    value={localSettings.mediaFolder}
                    onChange={(e) => updateSetting('mediaFolder', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* File Naming */}
            <div>
              <h3 className="font-medium text-slate-900 mb-4">Global File Options</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="renameFiles"
                    checked={localSettings.renameFiles}
                    onCheckedChange={(checked) => updateSetting('renameFiles', !!checked)}
                  />
                  <Label htmlFor="renameFiles" className="text-sm">
                    Rename files to match table name (legacy setting)
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preserveExtensions"
                    checked={localSettings.preserveExtensions}
                    onCheckedChange={(checked) => updateSetting('preserveExtensions', !!checked)}
                  />
                  <Label htmlFor="preserveExtensions" className="text-sm">
                    Preserve original file extensions
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="convertImages"
                    checked={localSettings.convertImages}
                    onCheckedChange={(checked) => updateSetting('convertImages', !!checked)}
                  />
                  <Label htmlFor="convertImages" className="text-sm">
                    Convert images to PNG format
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Compression Settings */}
            <div>
              <h3 className="font-medium text-slate-900 mb-4">Compression Settings</h3>
              <div>
                <Label htmlFor="compressionLevel">Compression Level</Label>
                <Select
                  value={localSettings.compressionLevel}
                  onValueChange={(value: PackageSettings['compressionLevel']) => 
                    updateSetting('compressionLevel', value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Compression</SelectItem>
                    <SelectItem value="fast">Fast</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="maximum">Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="files" className="space-y-4 mt-6">
            <div className="mb-4">
              <h3 className="font-medium text-slate-900 mb-2">Individual File Settings</h3>
              <p className="text-sm text-slate-600">
                Configure naming and location settings for each file type. Use backslashes (\) for Windows paths.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(localSettings.fileSettings) as Array<keyof PackageSettings['fileSettings']>).map(category =>
                renderFileSettingsCard(category)
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
