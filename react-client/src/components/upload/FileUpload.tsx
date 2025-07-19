"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "../ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Alert, AlertDescription } from "../ui/alert"
import {
  Upload,
  X,
  FileText,
  ImageIcon,
  Video,
  Music,
  AlertCircle,
  Zap,
  Cloud,
  HardDrive,
  Settings,
  Calendar,
  Book,
  Palette,
  Monitor,
  FileType,
  Database,
  Presentation,
  FileSpreadsheet,
  Code,
  FileArchive,
  Shield,
  Brain,
  Loader2,
  Tag,
  Eye
} from "lucide-react"
import { useFiles } from "../../contexts/file-context"
import { formatFileSize } from "../../lib/utils"
import type { UploadMethod } from "../../lib/api"
import { analyzePdfDocument, analyzeTextDocument, analyzeWithGoogleVision } from "../../lib/googleVision"

interface FileUploadProps {
  folderId: string
  onUploadComplete?: () => void
}

export interface FileWithPreview {
  id: string
  preview?: string
  type: string
  name: string
  size: number
  file: File
  lastModified: number
  lastModifiedDate: Date
  webkitRelativePath: string
  aiAnalysis?: {
    description: string
    tags: string[]
    extractedText?: string
    confidence?: number
  }
}

export default function FileUpload({ folderId, onUploadComplete }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("direct")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadFiles, error, uploadProgress, clearError } = useFiles()

  // AI Analysis Function
  const analyzeFile = async (file: File): Promise<{ description: string; tags: string[] }> => {
    try {
      if (file.type.startsWith('image/')) {
        return await analyzeImage(file);
      } else if (file.type === 'application/pdf') {
        return await analyzeDocument(file);
      } else if (file.type.startsWith('text/')) {
        return await analyzeTextFile(file);
      } else {
        return generateSmartFallbackAnalysis(file);
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return generateSmartFallbackAnalysis(file);
    }
  }

  // Enhanced image analysis
  const analyzeImage = async (file: File): Promise<{ description: string; tags: string[] }> => {
    try {
      return await analyzeWithGoogleVision(file);
    } catch (error) {
      console.error('Real AI analysis failed, using fallback:', error);
      return performAdvancedImageAnalysis(file, document.createElement('canvas'), null);
    }
  }

  // Document analysis
  const analyzeDocument = async (file: File): Promise<{ description: string; tags: string[] }> => {
    const fileName = file.name.toLowerCase();
    let description = "A document file";
    const tags: string[] = ['document', 'file'];

    if (file.type === 'application/pdf') {
      tags.push('pdf');

      if (fileName.includes('resume') || fileName.includes('cv')) {
        description = "A resume or CV document";
        tags.push('resume', 'cv', 'career', 'professional');
      } else if (fileName.includes('report')) {
        description = "A report document";
        tags.push('report', 'business', 'analysis');
      } else if (fileName.includes('manual') || fileName.includes('guide')) {
        description = "A manual or guide document";
        tags.push('manual', 'guide', 'instructions');
      } else if (fileName.includes('invoice') || fileName.includes('bill')) {
        description = "An invoice or billing document";
        tags.push('invoice', 'billing', 'finance');
      } else if (fileName.includes('contract') || fileName.includes('agreement')) {
        description = "A contract or agreement document";
        tags.push('contract', 'legal', 'agreement');
      } else {
        description = "A PDF document";
      }
    }

    const res = await analyzePdfDocument(file);
    if (res) {
      description = res.description;
      tags.push(...res.tags);
    }

    return { description, tags };
  }

  // Text file analysis
  const analyzeTextFile = async (file: File): Promise<{ description: string; tags: string[] }> => {
    try {
      const content = await file.text();
      const fileName = file.name.toLowerCase();
      let description = "A text file";
      const tags: string[] = ['text', 'file'];

      if (fileName.endsWith('.md')) {
        description = "A Markdown document";
        tags.push('markdown', 'documentation');
      } else if (fileName.endsWith('.json')) {
        description = "A JSON data file";
        tags.push('json', 'data', 'config');
      } else if (fileName.endsWith('.csv')) {
        description = "A CSV data file";
        tags.push('csv', 'data', 'spreadsheet');
      } else if (fileName.endsWith('.log')) {
        description = "A log file";
        tags.push('log', 'system', 'debug');
      }

      const contentLower = content.toLowerCase();
      if (contentLower.includes('todo') || contentLower.includes('task')) {
        tags.push('todo', 'tasks', 'planning');
      }
      if (contentLower.includes('meeting') || contentLower.includes('minutes')) {
        tags.push('meeting', 'notes', 'business');
      }
      const res = await analyzeTextDocument(file);
      if (res) {
        description = res.description;
        tags.push(...res.tags);
      }
      return { description, tags };
    } catch {
      return generateSmartFallbackAnalysis(file);
    }
  }

  // Advanced image analysis
  const performAdvancedImageAnalysis = (file: File, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D | null): { description: string; tags: string[] } => {
    const fileName = file.name.toLowerCase();
    let description = "An image file";
    const tags: string[] = ['image', 'visual', 'media'];

    if (fileName.includes('screenshot')) {
      description = "A screenshot image";
      tags.push('screenshot', 'capture', 'screen');
    } else if (fileName.includes('photo')) {
      description = "A photograph";
      tags.push('photograph', 'camera', 'picture');
    } else if (fileName.includes('logo')) {
      description = "A logo image";
      tags.push('logo', 'branding', 'design');
    } else if (fileName.includes('icon')) {
      description = "An icon image";
      tags.push('icon', 'interface', 'ui');
    } else if (fileName.includes('chart') || fileName.includes('graph')) {
      description = "A chart or graph image";
      tags.push('chart', 'graph', 'data', 'visualization');
    }

    if (ctx && canvas.width && canvas.height) {
      const aspectRatio = canvas.width / canvas.height;

      if (aspectRatio > 2) {
        tags.push('wide', 'panoramic');
      } else if (aspectRatio < 0.5) {
        tags.push('tall', 'portrait');
      } else if (Math.abs(aspectRatio - 1) < 0.1) {
        tags.push('square');
      }

      const totalPixels = canvas.width * canvas.height;
      if (totalPixels > 2000000) {
        tags.push('high-resolution', 'large');
      } else if (totalPixels < 100000) {
        tags.push('small', 'thumbnail');
      }
    }

    if (file.type === 'image/png') {
      tags.push('png', 'transparent');
    } else if (file.type === 'image/jpeg') {
      tags.push('jpeg', 'compressed');
    } else if (file.type === 'image/gif') {
      tags.push('gif', 'animated');
      description = "A GIF image";
    } else if (file.type === 'image/svg+xml') {
      tags.push('svg', 'vector', 'scalable');
      description = "A vector SVG image";
    }

    return { description, tags };
  }

  // Smart fallback analysis
  const generateSmartFallbackAnalysis = (file: File): { description: string; tags: string[] } => {
    const fileType = file.type.split('/')[0];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const fileName = file.name.toLowerCase();

    let description = `A ${fileType} file`;
    const tags: string[] = [fileType, 'file'];

    if (extension) {
      tags.push(extension);
    }

    switch (fileType) {
      case 'video':
        description = "A video file";
        tags.push('media', 'video', 'movie');
        if (fileName.includes('trailer')) tags.push('trailer');
        if (fileName.includes('tutorial')) tags.push('tutorial', 'education');
        break;
      case 'audio':
        description = "An audio file";
        tags.push('media', 'audio', 'sound');
        if (fileName.includes('music')) tags.push('music');
        if (fileName.includes('podcast')) tags.push('podcast');
        break;
      case 'application':
        if (['zip', 'rar', '7z'].includes(extension)) {
          description = "An archive file";
          tags.push('archive', 'compressed', 'zip');
        } else if (['exe', 'dmg', 'app'].includes(extension)) {
          description = "An executable file";
          tags.push('executable', 'software', 'program');
        }
        break;
    }

    const dateRegex = /(\d{4}[-_]\d{2}[-_]\d{2})|(\d{2}[-_]\d{2}[-_]\d{4})/;
    if (dateRegex.test(fileName)) {
      tags.push('dated', 'organized');
    }

    if (fileName.includes('work') || fileName.includes('business')) {
      tags.push('work', 'business', 'professional');
    }

    return { description, tags };
  }

  // Handle file selection with AI analysis
  const handleFiles = useCallback(async (files: FileList) => {
    console.log("Selected files:", files)
    const fileArray = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      type: file.type,
      name: file.name,
      size: file.size,
      file: file,
      lastModified: file.lastModified,
      lastModifiedDate: new Date(file.lastModified),
      webkitRelativePath: file.webkitRelativePath,
    }))

    setSelectedFiles((prev) => [...prev, ...fileArray as FileWithPreview[]])
    clearError()

    // Analyze each file
    for (const file of fileArray) {
      setAnalyzing(file.id)
      try {
        const analysis = await analyzeFile(file.file)
        console.log("AI Analysis result:", analysis)

        setSelectedFiles(prev => prev.map(f =>
          f.id === file.id
            ? { ...f, aiAnalysis: analysis }
            : f
        ))
      } catch (error) {
        console.error('AI Analysis failed for file:', file.name, error)
      } finally {
        setAnalyzing(null)
      }
    }
  }, [clearError])

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  // File input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  // Remove file from selection
  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((file) => file.id !== fileId)
      const fileToRemove = prev.find((file) => file.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return updated
    })
  }

  // Upload files with AI data
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    try {
      setUploading(true)

      // Prepare files with AI analysis data
      const filesWithAI = selectedFiles.map(file => ({
        ...file,
        aiAnalysis: file.aiAnalysis || { description: "", tags: [] }
      }))

      await uploadFiles(filesWithAI, folderId, uploadMethod)

      // Clear selected files
      selectedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
      setSelectedFiles([])

      onUploadComplete?.()
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setUploading(false)
    }
  }

  // Get file icon
  const getFileIcon = (file: FileWithPreview) => {
    const contentType = file.type || ""
    const fileName = file.name || ""
    const extension = fileName.toLowerCase().split('.').pop() || ""

    // Images
    if (contentType.startsWith("image/") ||
      ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff'].includes(extension)) {
      return <ImageIcon className="w-6 h-6 text-blue-500" />
    }

    // Videos
    if (contentType.startsWith("video/") ||
      ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp'].includes(extension)) {
      return <Video className="w-6 h-6 text-purple-500" />
    }

    // Audio
    if (contentType.startsWith("audio/") ||
      ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'].includes(extension)) {
      return <Music className="w-6 h-6 text-green-500" />
    }

    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'dmg'].includes(extension)) {
      return <FileArchive className="w-6 h-6 text-orange-500" />
    }

    // Code files
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'sass', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'vue', 'svelte', 'json', 'xml', 'yaml', 'yml', 'sql', 'sh', 'bat', 'ps1'].includes(extension)) {
      return <Code className="w-6 h-6 text-indigo-500" />
    }

    // PDFs
    if (extension === 'pdf' || contentType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-500" />
    }

    // Documents
    if (['doc', 'docx', 'odt', 'rtf'].includes(extension)) {
      return <FileText className="w-6 h-6 text-blue-600" />
    }

    // Spreadsheets
    if (['xls', 'xlsx', 'ods', 'csv'].includes(extension)) {
      return <FileSpreadsheet className="w-6 h-6 text-green-600" />
    }

    // Presentations
    if (['ppt', 'pptx', 'odp'].includes(extension)) {
      return <Presentation className="w-6 h-6 text-orange-600" />
    }

    // Database files
    if (['db', 'sqlite', 'sqlite3', 'mdb', 'accdb'].includes(extension)) {
      return <Database className="w-6 h-6 text-purple-600" />
    }

    // Text files
    if (['txt', 'md', 'readme', 'log', 'cfg', 'conf', 'ini'].includes(extension) ||
      contentType.startsWith("text/")) {
      return <FileType className="w-6 h-6 text-gray-600" />
    }

    // Executable files
    if (['exe', 'msi', 'app', 'deb', 'rpm', 'pkg', 'run'].includes(extension)) {
      return <Monitor className="w-6 h-6 text-gray-800" />
    }

    // Design files
    if (['psd', 'ai', 'sketch', 'fig', 'xd', 'indd'].includes(extension)) {
      return <Palette className="w-6 h-6 text-pink-500" />
    }

    // Ebook files
    if (['epub', 'mobi', 'azw', 'azw3', 'fb2'].includes(extension)) {
      return <Book className="w-6 h-6 text-amber-600" />
    }

    // Calendar files
    if (['ics', 'ical', 'vcs'].includes(extension)) {
      return <Calendar className="w-6 h-6 text-blue-400" />
    }

    // Configuration files
    if (['config', 'properties', 'env', 'gitignore', 'dockerignore', 'editorconfig'].includes(extension)) {
      return <Settings className="w-6 h-6 text-gray-500" />
    }

    // Security/Certificate files
    if (['pem', 'crt', 'cer', 'der', 'p12', 'pfx', 'key', 'pub'].includes(extension)) {
      return <Shield className="w-6 h-6 text-yellow-600" />
    }

    // Power/Script files
    if (['ps1', 'psm1', 'bash', 'zsh', 'fish', 'cmd'].includes(extension)) {
      return <Zap className="w-6 h-6 text-yellow-500" />
    }

    // Disk/Image files
    if (['img', 'vhd', 'vmdk', 'qcow2'].includes(extension)) {
      return <HardDrive className="w-6 h-6 text-gray-700" />
    }

    // Default file icon
    return <FileText className="w-6 h-6 text-gray-500" />
  }

  return (
    <div className="space-y-4">
      {/* Upload Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            AI-Enhanced File Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Direct Upload */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${uploadMethod === "direct" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              onClick={() => setUploadMethod("direct")}
            >
              <div className="flex items-center mb-2">
                <Zap className="w-5 h-5 text-orange-500 mr-2" />
                <h3 className="font-medium">Fast upload</h3>
                {uploadMethod === "direct" && <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />}
              </div>
              <p className="text-sm text-gray-600 mb-2">Upload via our server</p>
              <div className="text-xs text-gray-500">
                ✅ Faster for small files
                <br />✅ simpler
                <br />
                ⚠️ Limited by file size
              </div>
            </div>

            {/* Presigned Upload */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${uploadMethod === "presigned" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              onClick={() => setUploadMethod("presigned")}
            >
              <div className="flex items-center mb-2">
                <Cloud className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="font-medium">direct upload</h3>
                {uploadMethod === "presigned" && <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />}
              </div>
              <p className="text-sm text-gray-600 mb-2">Direct upload to cloud storage</p>
              <div className="text-xs text-gray-500">
                ✅ Better for large files
                <br />✅Saves server bandwidth
                <br />
                ⚠️ a more complex process
              </div>
            </div>
          </div>

          <Alert className="mt-4">
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Files will be automatically analyzed by AI to generate descriptions and tags!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Upload className={`w-12 h-12 mb-4 ${dragActive ? "text-blue-500" : "text-gray-400"}`} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {dragActive ? "Drop files here" : "AI-Enhanced File Upload"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">Drag and drop files here, or click to select files</p>
          <p className="text-xs text-blue-600 mb-4">
            🤖 Files will be analyzed automatically for better organization
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Select files
          </Button>
          <input ref={fileInputRef} type="file" multiple onChange={handleInputChange} className="hidden" accept="*/*" />
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Selected files ({selectedFiles.length})</h4>
              <Button onClick={handleUpload} disabled={uploading} className="bg-green-600 hover:bg-green-700">
                {uploading ? "Uploading..." : "Upload everything"}
              </Button>
            </div>

            <div className="space-y-3">
              {selectedFiles.map((file) => (
                <div key={file.id} className="flex items-start space-x-3 p-4 border rounded-lg bg-gray-50">
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>

                    {/* AI Analysis Results */}
                    {analyzing === file.id && (
                      <div className="mt-2 flex items-center text-sm text-blue-600">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Analyzing with AI...
                      </div>
                    )}

                    {file.aiAnalysis && (
                      <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Eye className="w-4 h-4 text-purple-600 mr-1" />
                          <span className="text-xs font-medium text-purple-800">AI Analysis:</span>
                        </div>
                        <p className="text-xs text-purple-700 mb-1">{file.aiAnalysis.description}</p>
                        <div className="flex items-center">
                          <Tag className="w-3 h-3 text-purple-600 mr-1" />
                          <span className="text-xs text-purple-600">
                            {file.aiAnalysis.tags.join(', ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={uploading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Upload progress</h4>
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}