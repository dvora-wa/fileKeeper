"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import { FolderProvider } from "../contexts/folder-context"
import { Button } from "../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { ArrowLeft, Home, Folder, FolderOpen, Calendar, User, LogOut } from "lucide-react"
import FolderTree from "../components/folders/FolderTree"
import CreateFolderModal from "../components/folders/CreateFolderModal"
import { useFolders } from "../contexts/folder-context"

function FoldersPageContent() {
    const [showCreateFolder, setShowCreateFolder] = useState(false)
    const { folders, loading } = useFolders()
    const navigate = useNavigate()

    const handleFolderClick = (folderId: string, folderName: string) => {
        navigate(`/files/${folderId}?name=${encodeURIComponent(folderName)}`)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/dashboard")}
                                className="flex items-center"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            <div className="h-6 w-px bg-gray-300" />
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                                <Folder className="h-6 w-6 ml-2 text-blue-600" />
                                Folder Management
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Welcome Card */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center">
                                <FolderOpen className="h-6 w-6 ml-2 text-blue-600" />
                                My Folders
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Here you can view and manage all your folders. Click on a folder to see the files within it.
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <Folder className="h-4 w-4 ml-2" />
                                    {folders.length} folders
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 ml-2" />
                                    Last updated today
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Folders Grid */}
                    <FolderTree
                        onCreateFolder={() => setShowCreateFolder(true)}
                        onFolderClick={handleFolderClick}
                    />

                    {/* Create Folder Modal */}
                    <CreateFolderModal
                        isOpen={showCreateFolder}
                        onClose={() => setShowCreateFolder(false)}
                    />
                </div>
            </main>
        </div>
    )
}

export default function FoldersPage() {
    const { user, loading } = useAuth()
    const navigate = useNavigate()

    if (!loading && !user) {
        navigate("/login")
        return null
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <FolderProvider>
            <FoldersPageContent />
        </FolderProvider>
    )
}