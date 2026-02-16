import React from 'react'
import { CodeFragment } from '@/lib/generated/prisma/client'
import { TabsContent } from './ui/tabs'
import { Code2 } from 'lucide-react'
import { FileExplorer } from './file-explorer'

interface Props {
    activeCodeFragment: CodeFragment | null
    fragmentData: any
    projectId: string
}

export const CodeSection = ({ activeCodeFragment, fragmentData, projectId }: Props) => {
    return (
        <TabsContent value="code" className="h-full m-0 rounded-2xl overflow-hidden border bg-background shadow-2xl ring-1 ring-border/50">
            {activeCodeFragment ? (
                <FileExplorer
                    files={(fragmentData?.files || activeCodeFragment.files) as Record<string, string>}
                    projectId={projectId}
                    sandboxId={activeCodeFragment.sandboxId || ""}
                    fragmentId={activeCodeFragment.id}
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
