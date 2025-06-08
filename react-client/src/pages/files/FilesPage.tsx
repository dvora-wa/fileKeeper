import React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Plus, Upload } from 'lucide-react'
import { FileUpload, FileList, FileSearch } from '../../components/files'
import { Breadcrumbs } from '../../components/layout'
import { Button, Modal } from '../../components/ui'
import { useFiles, useFolders } from '../../hooks'
import { DocumentHead } from '../../components/DocumentHead'

export const FilesPage: React.FC = () => {
  const { folderId } = useParams<{ folderId?: string }>()
  const [searchParams] = useSearchParams()
  const [showUpload, setShowUpload] = React.useState(false)

  const currentFolderId = folderId || searchParams.get('folder') || 'root'
  const { currentFolder } = useFolders()
  const { searchFiles, isSearching } = useFiles(currentFolderId)

  // Generate breadcrumbs
  const breadcrumbs = React.useMemo(() => {
    const items = []
    if (currentFolder) {
      items.push({
        id: currentFolder.id,
        name: currentFolder.name,
        path: `/files/${currentFolder.id}`,
        isFolder: true
      })
    }
    return items
  }, [currentFolder])

  return (
    <>
      <DocumentHead
        title="הקבצים שלי - FileKeeper"
        description="נהל את הקבצים שלך בקלות"
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">הקבצים שלי</h1>
            <Breadcrumbs items={breadcrumbs} className="mt-2" />
          </div>

          <Button
            leftIcon={<Upload size={16} />}
            onClick={() => setShowUpload(true)}
          >
            העלה קבצים
          </Button>
        </div>

        {/* Search */}
        <FileSearch onSearch={searchFiles} isSearching={isSearching} />

        {/* File List */}
        <FileList folderId={currentFolderId} />

        {/* Upload Modal */}
        <Modal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          title="העלה קבצים"
          size="lg"
        >
          <FileUpload
            folderId={currentFolderId}
            onUploadComplete={() => setShowUpload(false)}
          />
        </Modal>
      </div>
    </>
  )
}
