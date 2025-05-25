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
import type { PackageSettings } from "@shared/schema";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Package Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Default Locations */}
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
            <h3 className="font-medium text-slate-900 mb-4">File Naming Options</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="renameFiles"
                  checked={localSettings.renameFiles}
                  onCheckedChange={(checked) => updateSetting('renameFiles', !!checked)}
                />
                <Label htmlFor="renameFiles" className="text-sm">
                  Rename files to match table name
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
