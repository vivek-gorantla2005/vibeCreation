import React from 'react'
import { CodeFragment } from '@/lib/generated/prisma/client'
import { TabsContent } from './ui/tabs'
import { Code2 } from 'lucide-react'
import { FileExplorer } from './file-explorer'

interface Props {
    activeCodeFragment: CodeFragment | null
    fragmentData: any
    projectId: string
    onSave?: () => void
    liveFiles: Record<string, string>
    setLiveFiles: React.Dispatch<React.SetStateAction<Record<string, string>>>
    selectedFile: string | null
    setSelectedFile: React.Dispatch<React.SetStateAction<string | null>>
}

export const CodeSection = ({
    activeCodeFragment,
    fragmentData,
    projectId,
    onSave,
    liveFiles,
    setLiveFiles,
    selectedFile,
    setSelectedFile
}: Props) => {
    return (
        <TabsContent value="code" className="h-full m-0 rounded-2xl overflow-hidden border bg-background shadow-2xl ring-1 ring-border/50">
            {activeCodeFragment ? (
                <FileExplorer
                    files={liveFiles}
                    projectId={projectId}
                    sandboxId={activeCodeFragment.sandboxId || ""}
                    fragmentId={activeCodeFragment.id}
                    onSave={onSave}
                    setLiveFiles={setLiveFiles}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                />
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 gap-4">
                    <Code2 className="w-12 h-12 stroke-[1.5]" />
                    <p className="text-sm font-medium tracking-wide">Source code will appear here</p>
                </div>
            )}
        </TabsContent>
    )
}
