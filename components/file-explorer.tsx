"use client"

import React, { useState, useMemo } from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TreeView } from './TreeView'
import MonacoEditor from './monaco-editor'

type FileCollection = Record<string, string>;

interface Props {
    files: FileCollection,
    fragmentId: string,
    projectId: string,
    sandboxId: string,
}



export const FileExplorer = ({ files, fragmentId, projectId, sandboxId }: Props) => {
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const selectedContent = selectedFile ? files[selectedFile] : ""

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

    return (
        <ResizablePanelGroup className="h-full w-full">
            <ResizablePanel defaultSize={25} minSize={15}>
                <div className="h-full w-full">
                    <TreeView files={files} onFileSelect={setSelectedFile} />
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={75}>
                <div className='bg-white h-full w-full'>
                    <MonacoEditor value={selectedContent} language={language} />
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
