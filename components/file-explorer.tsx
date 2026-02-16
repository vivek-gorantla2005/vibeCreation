"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TreeView } from './TreeView'
import MonacoEditor from './monaco-editor'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'

type FileCollection = Record<string, string>;

interface Props {
    files: FileCollection,
    fragmentId: string,
    projectId: string,
    sandboxId: string,
}

export const FileExplorer = ({ files: initialFiles, fragmentId, projectId, sandboxId }: Props) => {
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [localFiles, setLocalFiles] = useState<FileCollection>(initialFiles)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setLocalFiles(initialFiles)
    }, [initialFiles])

    const selectedContent = useMemo(() => {
        if (!selectedFile) return ""
        return localFiles[selectedFile] || ""
    }, [selectedFile, localFiles])

    const language = useMemo(() => {
        if (!selectedFile) return "typescript"
        const ext = selectedFile.split('.').pop()?.toLowerCase()
        const map: Record<string, string> = {
            js: 'javascript',
            jsx: 'javascript',
            ts: 'typescript',
            tsx: 'typescript',
            css: 'css',
            html: 'html',
            json: 'json',
            md: 'markdown',
            py: 'python'
        }
        return map[ext || ""] || "typescript"
    }, [selectedFile])

    const handleCodeChange = (newValue: string) => {
        if (selectedFile) {
            setLocalFiles(prev => ({
                ...prev,
                [selectedFile]: newValue
            }))
        }
    }

    const saveChanges = async () => {
        try {
            setIsLoading(true)
            await apiClient.fragments({ fragmentId }).patch({
                files: localFiles,
                projectId,
                sandboxId
            })
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ResizablePanelGroup className="h-full w-full">
            <ResizablePanel defaultSize={25} minSize={15}>
                <div className="h-full w-full border-r">
                    <TreeView files={localFiles} onFileSelect={setSelectedFile} />
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={75}>
                <div className='flex flex-col h-full w-full bg-[#1e1e1e]'>
                    <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
                        <span className="text-xs text-gray-400 truncate">
                            {selectedFile || "Select a file"}
                        </span>
                        {selectedFile && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={saveChanges}
                                disabled={isLoading}
                                className="h-7 text-xs text-gray-300 hover:text-white hover:bg-[#37373d]"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                    <Save className="h-3 w-3 mr-1" />
                                )}
                                Save
                            </Button>
                        )}
                    </div>
                    <div className='flex-1 relative'>
                        <MonacoEditor
                            value={selectedContent}
                            language={language}
                            onChange={handleCodeChange}
                        />
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
