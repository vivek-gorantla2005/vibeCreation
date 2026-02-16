import React from 'react'
import { TabsList, TabsTrigger } from './ui/tabs'
import { Globe, Code2, Save } from 'lucide-react'
import { Button } from './ui/button'

export const PreviewHeader = () => {
    return (
        <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-muted/50 p-1 border">
                <TabsTrigger value="Preview" className="gap-2 rounded-md transition-all data-[state=active]:shadow-sm">
                    <Globe className="w-4 h-4" /> Preview
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2 rounded-md transition-all data-[state=active]:shadow-sm">
                    <Code2 className="w-4 h-4" /> Code
                </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
                <Button className="gap-2 rounded-md transition-all data-[state=active]:shadow-sm">
                    <Save className="w-4 h-4" /> Save
                </Button>
            </div>
        </div>
    )
}
