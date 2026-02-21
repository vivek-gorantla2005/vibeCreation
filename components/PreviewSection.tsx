import React from 'react'
import { CodeFragment } from '@/lib/generated/prisma/client'
import { TabsContent } from './ui/tabs'
import { Globe } from 'lucide-react'

interface Props {
    activeCodeFragment: CodeFragment | null
    previewKey?: number
}

export const PreviewSection = ({ activeCodeFragment, previewKey = 0 }: Props) => {
    return (
        <TabsContent value="Preview" className="h-full m-0 rounded-2xl overflow-hidden border bg-white shadow-xl ring-1 ring-border/50">
            {activeCodeFragment ? (
                <iframe
                    src={`${activeCodeFragment.sandboxUrl}?v=${previewKey}`}
                    className="w-full h-full border-none"
                    title="Preview"
                />
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 animate-in fade-in duration-700">
                    <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center mb-2 ring-1 ring-border/50">
                        <Globe className="w-10 h-10 opacity-20" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">No preview available yet</p>
                    <p className="text-xs max-w-xs text-center text-muted-foreground/80 font-medium">Ask the AI to generate some code to see the results here live.</p>
                </div>
            )}
        </TabsContent>
    )
}
