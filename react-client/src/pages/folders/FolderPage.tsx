import React from 'react'
import { useParams } from 'react-router-dom'
import { Folder as FolderIcon, Plus, Settings } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Modal } from '../../components/ui'
import { Breadcrumbs } from '../../components/layout'
import { useFolders } from '../../hooks'
import { CreateFolderModal } from '../../components/folders'
import { DocumentHead } from '../../components/DocumentHead'

export const FolderPage: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>()
  const [showCreateFolder, setShowCreateFolder] = React.useState(false)

  const { folders, currentFolder, setCurrentFolder } = useFolders(folderId)

  React.useEffect(() => {
    if (folderId && folders) {
      const folder = folders.find(f => f.id === folderId)
      if (folder) {
        setCurrentFolder(folder)
      }
    }
  }, [folderId, folders, setCurrentFolder])

  const breadcrumbs = React.useMemo(() => {
    const items = []
    if (currentFolder) {
      items.push({
        id: currentFolder.id,
        name: currentFolder.name,
        path: `/folders/${currentFolder.id}`,
        isFolder: true
      })
    }
    return items
  }, [currentFolder])

  return (
    <>
      <DocumentHead
        title="תיקיות - FileKeeper"
        description="נהל את התיקיות שלך בצורה מסודרת"
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">תיקיות</h1>
            <Breadcrumbs items={breadcrumbs} className="mt-2" />
          </div>

          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => setShowCreateFolder(true)}
          >
            צור תיקייה
          </Button>
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {folders?.map((folder) => (
            <Card key={folder.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: folder.color + '20' }}
                  >
                    <FolderIcon
                      size={24}
                      style={{ color: folder.color }}
                    />
                  </div>

                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings size={14} />
                  </Button>
                </div>

                <h3 className="font-medium truncate mb-1">{folder.name}</h3>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{folder.totalFilesCount} קבצים</p>
                  {folder.description && (
                    <p className="line-clamp-2">{folder.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )) || (
              <div className="col-span-full text-center py-12">
                <FolderIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">אין תיקיות עדיין</h3>
                <p className="text-muted-foreground mb-4">צור תיקייה ראשונה כדי להתחיל לארגן את הקבצים שלך</p>
                <Button onClick={() => setShowCreateFolder(true)}>
                  צור תיקייה ראשונה
                </Button>
              </div>
            )}
        </div>

        {/* Create Folder Modal */}
        <CreateFolderModal
          isOpen={showCreateFolder}
          onClose={() => setShowCreateFolder(false)}
          parentFolderId={folderId}
        />
      </div>
    </>
  )
}
