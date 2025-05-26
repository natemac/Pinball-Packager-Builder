import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import type { PackageSettings, FileLocationSettings } from "@shared/schema";

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
          <DialogTitle>File Locations & Naming</DialogTitle>
          <DialogDescription>
            Configure naming and location settings for each file type. Use backslashes (\) for Windows paths.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(localSettings.fileSettings) as Array<keyof PackageSettings['fileSettings']>).map(category =>
              renderFileSettingsCard(category)
            )}
          </div>
        </div>
        
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
