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
    onSave?: () => void,
    setLiveFiles: React.Dispatch<React.SetStateAction<FileCollection>>,
    selectedFile: string | null,
    setSelectedFile: React.Dispatch<React.SetStateAction<string | null>>
}

export const FileExplorer = ({
    files,
    fragmentId,
    projectId,
    sandboxId,
    onSave,
    setLiveFiles,
    selectedFile,
    setSelectedFile
}: Props) => {
    const [isSaving, setIsSaving] = useState(false)

    const saveChanges = async (currentFiles: FileCollection) => {
        try {
            setIsSaving(true)
            await apiClient.fragments({ fragmentId }).patch({
                files: currentFiles,
                projectId,
                sandboxId
            })
            if (onSave) onSave()
        } catch (error) {
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    // Auto-save logic
    useEffect(() => {
        // We only save if there are files effectively present
        if (Object.keys(files).length === 0) return;

        const timer = setTimeout(() => {
            saveChanges(files)
        }, 2000) // Auto-save after 2 seconds of inactivity

        return () => clearTimeout(timer)
    }, [files])


    const selectedContent = useMemo(() => {
        if (!selectedFile) return ""
        return files[selectedFile] || ""
    }, [selectedFile, files])

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
            setLiveFiles(prev => ({
                ...prev,
                [selectedFile]: newValue
            }))
        }
    }

    const onManualSave = () => {
        saveChanges(files)
    }

    return (
        <>
            <ResizablePanelGroup className="h-full w-full">
                <ResizablePanel defaultSize={25} minSize={15}>
                    <div className="h-full w-full border-r">
                        <TreeView files={files} onFileSelect={setSelectedFile} />
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
                                <div className="flex items-center gap-2">
                                    {isSaving && (
                                        <span className="text-[10px] text-gray-500 animate-pulse">
                                            Saving...
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onManualSave}
                                        disabled={isSaving}
                                        className="h-7 text-xs text-gray-300 hover:text-white hover:bg-[#37373d]"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                        ) : (
                                            <Save className="h-3 w-3 mr-1" />
                                        )}
                                        {isSaving ? "Saving" : "Save"}
                                    </Button>
                                </div>
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
            </ResizablePanelGroup >
        </>
    )
}
