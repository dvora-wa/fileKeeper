"use client"

import { Button } from "../ui/Button"
import FileUpload from "../upload/FileUpload"

interface UploadSectionProps {
  currentFolderName: string
  currentFolderId: string
  showUpload: boolean
  onToggleUpload: () => void
  onUploadComplete: () => void
}

export default function UploadSection({
  currentFolderName,
  currentFolderId,
  showUpload,
  onToggleUpload,
  onUploadComplete,
}: UploadSectionProps) {
  if (showUpload) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Uploading files to a folder "{currentFolderName}"</h3>
          <Button variant="outline" onClick={onToggleUpload}>
            Cancel
          </Button>
        </div>
        <FileUpload folderId={currentFolderId} onUploadComplete={onUploadComplete} />
      </div>
    )
  }

  // return (
  //   <Card>
  //     <CardContent className="p-6 text-center">
  //       <h3 className="text-lg font-medium mb-2">העלאת קבצים</h3>
  //       <p className="text-gray-600 mb-4">העלה קבצים לתיקייה "{currentFolderName}"</p>
  //       <Button onClick={onToggleUpload} className="bg-blue-600 hover:bg-blue-700">
  //         <Upload className="w-4 h-4 mr-2" />
  //         התחל העלאה
  //       </Button>
  //     </CardContent>
  //   </Card>
  // )
}
