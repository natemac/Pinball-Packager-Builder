import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, HelpCircle, Box, Download, Plus, Check } from "lucide-react";
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
  const [showCustomFileForm, setShowCustomFileForm] = useState(false);
  const [useTableNameForCustom, setUseTableNameForCustom] = useState(false);

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

  const handleCustomFileUpload = (file: File, customLocation: string) => {
    addAdditionalFile(file, 'custom', customLocation);
    toast({
      title: "Custom File Added",
      description: `${file.name} has been added to your package.`,
    });
  };

  const handleUseTableNameChange = (category: AdditionalFile['category'], use: boolean) => {
    // Skip updating settings for custom files as they don't have predefined settings
    if (category === 'custom') return;
    
    updateSettings({
      ...settings,
      fileSettings: {
        ...settings.fileSettings,
        [category]: {
          ...settings.fileSettings[category as keyof typeof settings.fileSettings],
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

  const totalFiles = additionalFiles.length + (tableFile && settings.includeTableFile !== false ? 1 : 0);
  const estimatedSize = calculateEstimatedSize();

  function calculateEstimatedSize(): string {
    let totalBytes = 0;

    if (tableFile && settings.includeTableFile !== false) {
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

            {/* Custom Files Card */}
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    +
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Custom Files</h2>
                </div>

                <div className="space-y-4">
                  {/* Show existing custom files */}
                  {additionalFiles.filter(file => file.category === 'custom').map((file) => (
                    <div key={file.id} className="border border-green-300 bg-green-50 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-slate-700">{file.originalName}</h3>
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                          <p className="text-sm text-slate-500 mb-3">Location: {file.customLocation}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAdditionalFile(file.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add Custom File - matches other file upload cards */}
                  <div className={`
                    border border-slate-200 rounded-lg p-6 bg-white hover:border-blue-300 transition-colors cursor-pointer
                    ${showCustomFileForm ? 'border-blue-400 bg-blue-50' : ''}
                  `}>
                    <div className="flex items-start justify-between">
                      {/* Left side - Content justified left */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-slate-700">Add Custom File</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">Upload any additional file for your package</p>

                        {/* File Location Input - only show when form is expanded */}
                        {showCustomFileForm && (
                          <div className="mb-3">
                            <Label htmlFor="customLocation" className="text-sm font-medium">
                              File Location
                            </Label>
                            <Input
                              id="customLocation"
                              placeholder="Collection\Visual Pinball X\custom"
                              className="mt-1"
                              defaultValue="Collection\Visual Pinball X\custom"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              Example: Collection\Visual Pinball X\Tables or custom\subfolder
                            </p>
                          </div>
                        )}

                        {/* Use table name checkbox - only show when form is expanded */}
                        {showCustomFileForm && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="useTableNameCustom"
                              checked={useTableNameForCustom}
                              onCheckedChange={(checked) => setUseTableNameForCustom(!!checked)}
                            />
                            <Label htmlFor="useTableNameCustom" className="text-xs text-slate-600">
                              Use table name as filename
                            </Label>
                          </div>
                        )}
                      </div>

                      {/* Right side - Upload Button (matches other cards) */}
                      <div className="flex flex-col items-center gap-3 ml-4">
                        {!showCustomFileForm ? (
                          <Button
                            variant="secondary"
                            onClick={() => setShowCustomFileForm(true)}
                            className="p-3 pl-[75px] pr-[75px] pt-[47px] pb-[47px] mt-[-9px] mb-[-9px] ml-[-5px] mr-[-5px]"
                          >
                            <Plus className="h-6 w-6 text-slate-400" />
                          </Button>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => document.getElementById('custom-file-input')?.click()}
                              className="px-4 py-2"
                            >
                              Choose File
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowCustomFileForm(false)}
                              className="px-4 py-2"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <input
                      id="custom-file-input"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        const locationInput = document.getElementById('customLocation') as HTMLInputElement;
                        if (file && locationInput?.value.trim()) {
                          handleCustomFileUpload(file, locationInput.value.trim());
                          e.target.value = '';
                          locationInput.value = 'Collection\\Visual Pinball X\\custom';
                          setShowCustomFileForm(false);
                        }
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VPX-Specific Files */}
            {tableFile?.type === 'vpx' && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
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

                  {/* Include Table File Checkbox */}
                  <div className="mb-4 p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeTableFile"
                        checked={settings.includeTableFile ?? true}
                        onCheckedChange={(checked) => 
                          updateSettings({ ...settings, includeTableFile: !!checked })
                        }
                      />
                      <Label htmlFor="includeTableFile" className="text-sm font-medium">
                        Include Table File
                      </Label>
                    </div>
                    <p className="text-xs text-slate-500 ml-6 mt-1">
                      When unchecked, only the frontend files will be packaged
                    </p>
                  </div>

                  {/* Convert & Compress Sections */}
                  <div className="space-y-4 mb-4">
                    {/* Images and Videos Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Images Section */}
                      <div className="border border-slate-200 rounded-lg p-3 bg-white">
                        <h4 className="font-medium text-slate-900 mb-3">Images</h4>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="convertImages"
                              checked={settings.convertImages}
                              onCheckedChange={(checked) => 
                                updateSettings({ ...settings, convertImages: !!checked })
                              }
                            />
                            <Label htmlFor="convertImages" className="text-sm">
                              Convert to PNG
                            </Label>
                          </div>
                          <div>
                            <Label htmlFor="imageCompression" className="text-sm font-medium">
                              Compression
                            </Label>
                            <Select
                              value={settings.imageCompression}
                              onValueChange={(value: PackageSettings['imageCompression']) => 
                                updateSettings({ ...settings, imageCompression: value })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Do not Compress</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Videos Section */}
                      <div className="border border-slate-200 rounded-lg p-3 bg-white">
                        <h4 className="font-medium text-slate-900 mb-3">Videos</h4>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="convertVideos"
                              checked={settings.convertVideos}
                              onCheckedChange={(checked) => 
                                updateSettings({ ...settings, convertVideos: !!checked })
                              }
                            />
                            <Label htmlFor="convertVideos" className="text-sm">
                              Convert to MP4
                            </Label>
                          </div>
                          <div>
                            <Label htmlFor="videoCompression" className="text-sm font-medium">
                              Compression
                            </Label>
                            <Select
                              value={settings.videoCompression}
                              onValueChange={(value: PackageSettings['videoCompression']) => 
                                updateSettings({ ...settings, videoCompression: value })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Do not Compress</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
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
                  Generate Package
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
              tableFile={tableFile}
              onRemoveFile={removeAdditionalFile}
              onRemoveTableFile={() => setTableFile(null)}
              settings={settings}
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