"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TreeView } from './TreeView'
import MonacoEditor from './monaco-editor'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import { Protect, useUser } from '@clerk/nextjs'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { PricingTable } from '@clerk/nextjs'

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
    const { user, isLoaded } = useUser()
    const [isSaving, setIsSaving] = useState(false)

    const isPro = isLoaded && user?.publicMetadata?.plan === 'pro'

    const saveChanges = async (currentFiles: FileCollection, isAutoSave = false) => {
        // Auto-save logic: only save if user is Pro.
        // Manual save: Proceed (the button itself is hidden for non-pro users via <Protect>)
        if (isAutoSave && !isPro) return;

        try {
            setIsSaving(true)
            await apiClient.fragments({ fragmentId }).patch({
                files: currentFiles,
                projectId,
                sandboxId
            })
            if (onSave) onSave()

            if (!isAutoSave) {
                const { toast } = await import('sonner')
                toast.success('Changes saved successfully')
            }
        } catch (error) {
            console.error(error)
            if (!isAutoSave) {
                const { toast } = await import('sonner')
                toast.error('Failed to save changes')
            }
        } finally {
            setIsSaving(false)
        }
    }

    // Auto-save logic
    useEffect(() => {
        // We only save if there are files effectively present
        if (Object.keys(files).length === 0) return;

        const timer = setTimeout(() => {
            saveChanges(files, true)
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

                                    <Protect
                                        plan="pro"
                                        fallback={
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs text-gray-300 hover:text-white hover:bg-[#37373d]"
                                                    >
                                                        <Save className="h-3 w-3 mr-1" />
                                                        Save
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="max-w-5xl w-full bg-[#0f172a] border-slate-800 text-white max-h-[90vh] overflow-y-auto">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                                            Upgrade to Pro
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="text-slate-400">
                                                            Manual saving is a Pro feature. Choose a plan to continue building your project.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <div className="py-6 w-full flex justify-center">
                                                        <div className="w-full">
                                                            <PricingTable />
                                                        </div>
                                                    </div>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
                                                            Maybe Later
                                                        </AlertDialogCancel>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        }
                                    >


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
                                    </Protect>
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
