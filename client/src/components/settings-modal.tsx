import { useState, useRef } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PackageSettings, FileLocationSettings } from "@shared/schema";
import { 
  TEMPLATE_OPTIONS, 
  getTemplate, 
  downloadSettingsAsJson, 
  loadSettingsFromJson 
} from "@/lib/settings-templates";

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
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSave = () => {
    onSettingsChange(localSettings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setSelectedTemplate('custom');
    onOpenChange(false);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId !== 'custom') {
      const templateSettings = getTemplate(templateId);
      if (templateSettings) {
        setLocalSettings(templateSettings);
        toast({
          title: "Template Applied",
          description: `${TEMPLATE_OPTIONS.find(t => t.value === templateId)?.label} settings have been loaded.`,
        });
      }
    }
  };

  const handleDownloadSettings = () => {
    downloadSettingsAsJson(localSettings, `${selectedTemplate === 'custom' ? 'custom' : selectedTemplate}-settings.json`);
    toast({
      title: "Settings Downloaded",
      description: "Your settings have been downloaded as a JSON file.",
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const uploadedSettings = await loadSettingsFromJson(file);
      setLocalSettings(uploadedSettings);
      setSelectedTemplate('custom');
      toast({
        title: "Settings Imported",
        description: "Your custom settings have been loaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import settings file.",
        variant: "destructive",
      });
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const updateTableFileSettings = (
    key: keyof FileLocationSettings,
    value: string | boolean
  ) => {
    setLocalSettings(prev => ({
      ...prev,
      tableFileSettings: {
        ...prev.tableFileSettings,
        [key]: value
      }
    }));
  };

  const getCategoryDisplayName = (category: keyof PackageSettings['fileSettings'] | 'table'): string => {
    const names = {
      table: 'Table File',
      cover: 'Cover Image',
      topper: 'Topper Image',
      tableVideo: 'Table Video',
      marqueeVideo: 'Marquee Video',
      directb2s: 'DirectB2S File',
      music: 'Music Files',
      scripts: 'Script Files'
    };
    return names[category as keyof typeof names];
  };

  const renderTableFileSettingsCard = () => {
    const settings = localSettings.tableFileSettings;
    const displayName = getCategoryDisplayName('table');

    return (
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-slate-900 mb-3">{displayName}</h4>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="table-prefix" className="text-xs text-slate-600">
                  Prefix
                </Label>
                <Input
                  id="table-prefix"
                  value={settings.prefix}
                  onChange={(e) => updateTableFileSettings('prefix', e.target.value)}
                  placeholder="prefix_"
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="table-suffix" className="text-xs text-slate-600">
                  Suffix
                </Label>
                <Input
                  id="table-suffix"
                  value={settings.suffix}
                  onChange={(e) => updateTableFileSettings('suffix', e.target.value)}
                  placeholder="_suffix"
                  className="text-sm"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="table-location" className="text-xs text-slate-600">
                File Location
              </Label>
              <Input
                id="table-location"
                value={settings.location}
                onChange={(e) => updateTableFileSettings('location', e.target.value)}
                placeholder="Collection\Visual Pinball X\Tables"
                className="text-sm font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
          {/* Template Selection */}
          <div className="mb-6">
            <Label htmlFor="template-select" className="text-sm font-medium">
              Use Template Settings
            </Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(localSettings.fileSettings) as Array<keyof PackageSettings['fileSettings']>).map(category =>
              renderFileSettingsCard(category)
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* JSON Import/Export */}
        <div className="flex justify-between items-center py-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadSettings}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Settings .json
            </Button>
            
            <Button
              variant="outline"
              onClick={handleUploadClick}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Settings .json
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
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
