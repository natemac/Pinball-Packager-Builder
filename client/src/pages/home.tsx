import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, HelpCircle, Box, Download, Plus, FileText, Image, FolderPlus } from "lucide-react";
import DragDropZone from "@/components/drag-drop-zone";
import FileUploadCard from "@/components/file-upload-card";
import PackageStructure from "@/components/package-structure";
import AddedFilesList from "@/components/added-files-list";
import SettingsModal from "@/components/settings-modal";
import { useFileProcessor } from "@/hooks/use-file-processor";
import { getTemplate } from "@/lib/settings-templates";
import { generateUniqueId } from "@/lib/file-utils";
import type { TableFile, AdditionalFile, PackageSettings } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [customFiles, setCustomFiles] = useState<Array<{id: string, location: string, file?: File, useTableName?: boolean}>>([]);

  const {
    tableFile,
    additionalFiles,
    settings,
    setTableFile,
    addAdditionalFile,
    removeAdditionalFile,
    updateSettings,
    generatePackage,
    clearAll,
    setAdditionalFiles
  } = useFileProcessor();

  const handleTableFileUpload = (file: File) => {
    const fileName = file.name.toLowerCase();
    let fileType: 'vpx' | 'fp' | null = null;

    if (fileName.endsWith('.vpx')) {
      fileType = 'vpx';
    } else if (fileName.endsWith('.fp')) {
      fileType = 'fp';
    }

    if (!fileType) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a .vpx or .fp file.",
        variant: "destructive",
      });
      return;
    }

    const tableFileData: TableFile = {
      file,
      name: file.name.replace(/\.(vpx|fp)$/i, ''),
      type: fileType
    };

    setTableFile(tableFileData);

    toast({
      title: "File Detected",
      description: `${fileType.toUpperCase()} file detected successfully!`,
    });
  };

  const handleAdditionalFileUpload = (file: File, category: AdditionalFile['category']) => {
    addAdditionalFile(file, category);
    toast({
      title: "File Added",
      description: `${file.name} has been added to the package.`,
    });
  };

  const handleUseTableNameChange = (category: AdditionalFile['category'], use: boolean) => {
    updateSettings({
      ...settings,
      fileSettings: {
        ...settings.fileSettings,
        [category]: {
          ...settings.fileSettings[category],
          useTableName: use
        }
      }
    });
  };

  // Helper function to check if files exist for a specific category
  const hasFileForCategory = (category: AdditionalFile['category']) => {
    return additionalFiles.some(file => file.category === category);
  };

  // Helper function to get uploaded file by category
  const getFileForCategory = (category: AdditionalFile['category']) => {
    return additionalFiles.find(file => file.category === category)?.file;
  };

  // Custom files management
  const addCustomFileDialog = () => {
    const newId = `custom-${Date.now()}`;
    setCustomFiles(prev => [...prev, { id: newId, location: 'Collection/Custom Files', useTableName: false }]);
  };

  const updateCustomFileLocation = (id: string, location: string) => {
    setCustomFiles(prev => prev.map(cf => cf.id === id ? { ...cf, location } : cf));
    // Update the corresponding additional file's custom location
    setAdditionalFiles(prev => prev.map(f => 
      f.customFileId === id ? { ...f, customLocation: location } : f
    ));
  };

  const updateCustomFileUseTableName = (id: string, useTableName: boolean) => {
    setCustomFiles(prev => prev.map(cf => cf.id === id ? { ...cf, useTableName } : cf));
  };

  const handleCustomFileUpload = (id: string, file: File) => {
    setCustomFiles(prev => prev.map(cf => cf.id === id ? { ...cf, file } : cf));
    
    // Add to additional files for processing with custom category
    const customFile = customFiles.find(cf => cf.id === id);
    const newAdditionalFile: AdditionalFile = {
      id: generateUniqueId(),
      file,
      category: 'scripts', // We'll use scripts as base category but override location
      originalName: file.name,
      customLocation: customFile?.location || 'Collection/Custom Files',
      customFileId: id,
      size: file.size
    };
    
    // Remove any existing file for this custom file ID and add the new one
    setAdditionalFiles(prev => [...prev.filter(f => f.customFileId !== id), newAdditionalFile]);
    
    toast({
      title: "Custom File Added",
      description: `${file.name} has been added to the package.`,
    });
  };

  const removeCustomFile = (id: string) => {
    setCustomFiles(prev => prev.filter(cf => cf.id !== id));
    setAdditionalFiles(prev => prev.filter(f => f.customFileId !== id));
  };

  const handleGeneratePackage = async () => {
    if (!tableFile) {
      toast({
        title: "No Table File",
        description: "Please upload a table file first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const increment = Math.random() * 15;
          const newProgress = prev + increment;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 200);

      await generatePackage((progress) => {
        clearInterval(progressInterval);
        setGenerationProgress(progress);
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        toast({
          title: "Package Generated",
          description: "Your package has been generated and download started!",
        });
      }, 500);
    } catch (error) {
      setIsGenerating(false);
      setGenerationProgress(0);
      toast({
        title: "Generation Failed",
        description: "Failed to generate package. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalFiles = additionalFiles.length + (tableFile ? 1 : 0);
  const estimatedSize = calculateEstimatedSize();

  function calculateEstimatedSize(): string {
    let totalBytes = 0;

    if (tableFile) {
      totalBytes += tableFile.file.size;
    }

    additionalFiles.forEach(file => {
      totalBytes += file.size;
    });

    const mb = totalBytes / (1024 * 1024);
    return mb.toFixed(1) + ' MB';
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Box className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-slate-900">Pinball Package Builder</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSettings(true)}
                className="text-slate-600 hover:text-slate-900"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Workspace */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1: Table File Upload */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Upload Table File</h2>
                </div>

                <DragDropZone
                  onFileUpload={handleTableFileUpload}
                  acceptedTypes={['.vpx', '.fp']}
                  tableFile={tableFile}
                  settings={settings}
                  onSettingsChange={updateSettings}
                />
              </CardContent>
            </Card>

            {/* Step 2: Additional Files */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 ${tableFile ? 'bg-blue-600' : 'bg-slate-300'} text-white rounded-full flex items-center justify-center mr-3`}>
                    <Image className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Frontend Files</h2>
                </div>

                <div className="space-y-4">
                  <FileUploadCard
                    title="Cover Image"
                    description="Menu Select Image (.png, .jpg)"
                    icon="image"
                    onFileUpload={(file) => handleAdditionalFileUpload(file, 'cover')}
                    acceptedTypes={['.png', '.jpg', '.jpeg']}
                    useTableName={settings.fileSettings.cover.useTableName}
                    onUseTableNameChange={(use) => handleUseTableNameChange('cover', use)}
                    category="cover"
                    hasFile={hasFileForCategory('cover')}
                    uploadedFile={getFileForCategory('cover')}
                  />

                  <FileUploadCard
                    title="Topper Image"
                    description="Third Screen DMD Topper Image"
                    icon="image"
                    onFileUpload={(file) => handleAdditionalFileUpload(file, 'topper')}
                    acceptedTypes={['.png', '.jpg', '.jpeg']}
                    useTableName={settings.fileSettings.topper.useTableName}
                    onUseTableNameChange={(use) => handleUseTableNameChange('topper', use)}
                    category="topper"
                    hasFile={hasFileForCategory('topper')}
                    uploadedFile={getFileForCategory('topper')}
                  />

                  <FileUploadCard
                    title="Table Video"
                    description="Gameplay video/image (.mp4, .webm, .mov, .avi, .wmv, .flv, .mkv, .jpg, .png)"
                    icon="video"
                    onFileUpload={(file) => handleAdditionalFileUpload(file, 'tableVideo')}
                    acceptedTypes={['.mp4', '.webm', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.jpg', '.png']}
                    useTableName={settings.fileSettings.tableVideo.useTableName}
                    onUseTableNameChange={(use) => handleUseTableNameChange('tableVideo', use)}
                    category="tableVideo"
                    hasFile={hasFileForCategory('tableVideo')}
                    uploadedFile={getFileForCategory('tableVideo')}
                  />

                  <FileUploadCard
                    title="Marquee Video"
                    description="Backglass Menu Video (.mp4, .webm, .mov, .avi, .wmv, .flv, .mkv)"
                    icon="video"
                    onFileUpload={(file) => handleAdditionalFileUpload(file, 'marqueeVideo')}
                    acceptedTypes={['.mp4', '.webm', '.mov', '.avi', '.wmv', '.flv', '.mkv']}
                    useTableName={settings.fileSettings.marqueeVideo.useTableName}
                    onUseTableNameChange={(use) => handleUseTableNameChange('marqueeVideo', use)}
                    category="marqueeVideo"
                    hasFile={hasFileForCategory('marqueeVideo')}
                    uploadedFile={getFileForCategory('marqueeVideo')}
                  />
                </div>

              </CardContent>
            </Card>

            {/* VPX-Specific Files */}
            {tableFile?.type === 'vpx' && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-8 h-8 ${tableFile ? 'bg-purple-600' : 'bg-slate-300'} text-white rounded-full flex items-center justify-center text-sm font-bold mr-3`}>
                      ⭐
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">Visual Pinball X Specific Files</h2>
                  </div>

                  <div className="space-y-4">
                    <FileUploadCard
                      title="DirectB2S"
                      description="Backglass file (.directb2s)"
                      icon="code"
                      onFileUpload={(file) => handleAdditionalFileUpload(file, 'directb2s')}
                      acceptedTypes={['.directb2s']}
                      useTableName={settings.fileSettings.directb2s.useTableName}
                      onUseTableNameChange={(use) => handleUseTableNameChange('directb2s', use)}
                      category="directb2s"
                      hasFile={hasFileForCategory('directb2s')}
                      uploadedFile={getFileForCategory('directb2s')}
                    />

                    <FileUploadCard
                      title="Music"
                      description="Audio files (.mp3, .wav)"
                      icon="audio"
                      onFileUpload={(file) => handleAdditionalFileUpload(file, 'music')}
                      acceptedTypes={['.mp3', '.wav']}
                      useTableName={settings.fileSettings.music.useTableName}
                      onUseTableNameChange={(use) => handleUseTableNameChange('music', use)}
                      category="music"
                      hasFile={hasFileForCategory('music')}
                      uploadedFile={getFileForCategory('music')}
                    />

                    <FileUploadCard
                      title="Scripts"
                      description="Script files (.vbs, .txt)"
                      icon="code"
                      onFileUpload={(file) => handleAdditionalFileUpload(file, 'scripts')}
                      acceptedTypes={['.vbs', '.txt']}
                      useTableName={settings.fileSettings.scripts.useTableName}
                      onUseTableNameChange={(use) => handleUseTableNameChange('scripts', use)}
                      category="scripts"
                      hasFile={hasFileForCategory('scripts')}
                      uploadedFile={getFileForCategory('scripts')}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2.5: Custom Files */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 ${tableFile ? 'bg-blue-600' : 'bg-slate-300'} text-white rounded-full flex items-center justify-center mr-3`}>
                    <FolderPlus className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Custom Files</h2>
                </div>

                <div className="space-y-4">
                  {/* Add Custom File Button */}
                  <Button
                    onClick={addCustomFileDialog}
                    variant="outline"
                    className="w-full border-dashed border-2 border-slate-300 hover:border-blue-400 py-8"
                  >
                    <Plus className="h-6 w-6 mr-2 text-slate-400" />
                    Add Custom File
                  </Button>

                  {/* Custom File Upload Cards */}
                  {customFiles.map((customFile) => (
                    <div key={customFile.id} className="relative">
                      <FileUploadCard
                        title="Custom File"
                        description="Additional custom files (.any format)"
                        icon="code"
                        onFileUpload={(file) => handleCustomFileUpload(customFile.id, file)}
                        acceptedTypes={['*']}
                        useTableName={customFile.useTableName || false}
                        onUseTableNameChange={(use) => updateCustomFileUseTableName(customFile.id, use)}
                        category={`custom-${customFile.id}`}
                        hasFile={!!customFile.file}
                        uploadedFile={customFile.file}
                        showCustomLocation={true}
                        customLocation={customFile.location}
                        onCustomLocationChange={(location) => updateCustomFileLocation(customFile.id, location)}
                      />
                      {/* Remove button */}
                      <Button
                        onClick={() => removeCustomFile(customFile.id)}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PackageStructure
              tableFile={tableFile}
              additionalFiles={additionalFiles}
              settings={settings}
            />

            {/* Generate Package Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                  <Box className="h-5 w-5 mr-2" />
                  Generate Package
                </h3>

                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="font-medium text-slate-900 text-sm">
                      {tableFile ? `${tableFile.name}_Package.zip` : 'No file selected'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {totalFiles} file{totalFiles !== 1 ? 's' : ''} • {estimatedSize}
                    </p>
                  </div>

                  {/* Compression Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="imageComp" className="text-xs font-medium">Image Compression</Label>
                      <Select
                        value={settings.imageCompression}
                        onValueChange={(value: PackageSettings['imageCompression']) => 
                          updateSettings({ ...settings, imageCompression: value })
                        }
                      >
                        <SelectTrigger className="w-24 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Med</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="videoComp" className="text-xs font-medium">Video Compression</Label>
                      <Select
                        value={settings.videoCompression}
                        onValueChange={(value: PackageSettings['videoCompression']) => 
                          updateSettings({ ...settings, videoCompression: value })
                        }
                      >
                        <SelectTrigger className="w-24 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Med</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGeneratePackage}
                    disabled={!tableFile || isGenerating}
                    className="w-full"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Package
                  </Button>

                  {/* Progress Bar */}
                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Packaging...</span>
                        <span>{Math.round(generationProgress)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <AddedFilesList
              tableFile={tableFile}
              files={additionalFiles}
              settings={settings}
              onRemoveFile={removeAdditionalFile}
              onRemoveTableFile={() => setTableFile(null)}
            />

            {/* File Location Setup */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                  <span className="text-lg mr-2">⚡</span>
                  File Location Setup
                </h3>

                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Custom File Locations
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      const template = getTemplate('pinball-emporium');
                      if (template) {
                        updateSettings(template);
                        toast({
                          title: "Template Applied",
                          description: "Pinball Emporium settings have been applied.",
                        });
                      }
                    }}
                  >
                    <span className="mr-3">⚙️</span>
                    File defaults for Pinball Emporium
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      const template = getTemplate('pinup-popper');
                      if (template) {
                        updateSettings(template);
                        toast({
                          title: "Template Applied",
                          description: "PinUP Popper settings have been applied.",
                        });
                      }
                    }}
                  >
                    <span className="mr-3">⚙️</span>
                    File defaults for PinUP Popper
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={clearAll}
                  >
                    <span className="mr-3">🔄</span>
                    Clear All Files
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Content Creator */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                  <span className="text-lg mr-2">🎨</span>
                  Content Creator
                </h3>

                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => window.open('https://express.adobe.com/publishedV2/urn:aaid:sc:US:3cdb3532-3dbd-4e2c-9a1f-b75007ecea8d?promoid=Y69SGM5H&mv=other', '_blank')}
                  >
                    <span className="mr-3">📹</span>
                    Marquee Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
        settings={settings}
        onSettingsChange={updateSettings}
      />
    </div>
  );
}