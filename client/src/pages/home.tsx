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
import { Settings, HelpCircle, Box, Download } from "lucide-react";
import DragDropZone from "@/components/drag-drop-zone";
import FileUploadCard from "@/components/file-upload-card";
import PackageStructure from "@/components/package-structure";
import AddedFilesList from "@/components/added-files-list";
import SettingsModal from "@/components/settings-modal";
import { useFileProcessor } from "@/hooks/use-file-processor";
import { getTemplate } from "@/lib/settings-templates";
import type { TableFile, AdditionalFile, PackageSettings } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const {
    tableFile,
    additionalFiles,
    settings,
    setTableFile,
    addAdditionalFile,
    removeAdditionalFile,
    updateSettings,
    generatePackage,
    clearAll
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
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    1
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Upload Table File</h2>
                </div>

                <DragDropZone
                  onFileUpload={handleTableFileUpload}
                  acceptedTypes={['.vpx', '.fp']}
                  tableFile={tableFile}
                />
              </CardContent>
            </Card>

            {/* Step 2: Additional Files */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 ${tableFile ? 'bg-blue-600' : 'bg-slate-300'} text-white rounded-full flex items-center justify-center text-sm font-bold mr-3`}>
                    2
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
                  />

                  <FileUploadCard
                    title="Table Video"
                    description="Gameplay video/image (.mp4, .jpg, .png)"
                    icon="video"
                    onFileUpload={(file) => handleAdditionalFileUpload(file, 'tableVideo')}
                    acceptedTypes={['.mp4', '.jpg', '.png']}
                    useTableName={settings.fileSettings.tableVideo.useTableName}
                    onUseTableNameChange={(use) => handleUseTableNameChange('tableVideo', use)}
                    category="tableVideo"
                    hasFile={hasFileForCategory('tableVideo')}
                  />

                  <FileUploadCard
                    title="Marquee Video"
                    description="Backglass Menu Video (.mp4)"
                    icon="video"
                    onFileUpload={(file) => handleAdditionalFileUpload(file, 'marqueeVideo')}
                    acceptedTypes={['.mp4', '.avi', '.mov']}
                    useTableName={settings.fileSettings.marqueeVideo.useTableName}
                    onUseTableNameChange={(use) => handleUseTableNameChange('marqueeVideo', use)}
                    category="marqueeVideo"
                    hasFile={hasFileForCategory('marqueeVideo')}
                  />
                </div>

                {/* VPX-Specific Files */}
                {tableFile?.type === 'vpx' && (
                  <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h3 className="font-medium text-indigo-900 mb-3 flex items-center">
                      <span className="text-yellow-500 mr-2">⭐</span>
                      Visual Pinball X Specific Files
                    </h3>
                    <div className="space-y-4">
                      <div className="border border-indigo-200 rounded-lg p-4 bg-white">
                        <FileUploadCard
                          title="DirectB2S"
                          description="Backglass file (.directb2s)"
                          icon="code"
                          onFileUpload={(file) => handleAdditionalFileUpload(file, 'directb2s')}
                          acceptedTypes={['.directb2s']}
                          compact
                          useTableName={settings.fileSettings.directb2s.useTableName}
                          onUseTableNameChange={(use) => handleUseTableNameChange('directb2s', use)}
                          category="directb2s"
                          hasFile={hasFileForCategory('directb2s')}
                        />
                      </div>

                      <div className="border border-indigo-200 rounded-lg p-4 bg-white">
                        <FileUploadCard
                          title="Music"
                          description="Audio files (.mp3, .wav)"
                          icon="audio"
                          onFileUpload={(file) => handleAdditionalFileUpload(file, 'music')}
                          acceptedTypes={['.mp3', '.wav']}
                          compact
                          useTableName={settings.fileSettings.music.useTableName}
                          onUseTableNameChange={(use) => handleUseTableNameChange('music', use)}
                          category="music"
                          hasFile={hasFileForCategory('music')}
                        />
                      </div>

                      <div className="border border-indigo-200 rounded-lg p-4 bg-white">
                        <FileUploadCard
                          title="Scripts"
                          description="Script files (.vbs, .txt)"
                          icon="code"
                          onFileUpload={(file) => handleAdditionalFileUpload(file, 'scripts')}
                          acceptedTypes={['.vbs', '.txt']}
                          compact
                          useTableName={settings.fileSettings.scripts.useTableName}
                          onUseTableNameChange={(use) => handleUseTableNameChange('scripts', use)}
                          category="scripts"
                          hasFile={hasFileForCategory('scripts')}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Package Generation */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 ${tableFile ? 'bg-blue-600' : 'bg-slate-300'} text-white rounded-full flex items-center justify-center text-sm font-bold mr-3`}>
                    3
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Generate Package</h2>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        Package: {tableFile ? `${tableFile.name}_Package.zip` : 'No file selected'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {totalFiles} file{totalFiles !== 1 ? 's' : ''} ready for packaging
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Estimated size</p>
                      <p className="font-medium text-slate-900">{estimatedSize}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="compressionLevel" className="text-sm font-medium">
                        Compression Level
                      </Label>
                      <Select
                        value={settings.compressionLevel}
                        onValueChange={(value: PackageSettings['compressionLevel']) => 
                          updateSettings({ ...settings, compressionLevel: value })
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

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="convertImages"
                          checked={settings.convertImages}
                          onCheckedChange={(checked) => 
                            updateSettings({ ...settings, convertImages: !!checked })
                          }
                        />
                        <Label htmlFor="convertImages" className="text-sm">
                          Convert images to PNG
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="preserveExtensions"
                          checked={settings.preserveExtensions}
                          onCheckedChange={(checked) => 
                            updateSettings({ ...settings, preserveExtensions: !!checked })
                          }
                        />
                        <Label htmlFor="preserveExtensions" className="text-sm">
                          Preserve file extensions
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGeneratePackage}
                  disabled={!tableFile || isGenerating}
                  className="w-full py-3"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate & Download Package
                </Button>

                {/* Progress Bar */}
                {isGenerating && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                      <span>Packaging files...</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                  </div>
                )}
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

            <AddedFilesList
              files={additionalFiles}
              onRemoveFile={removeAdditionalFile}
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