import { Code2, RotateCcw, Globe } from 'lucide-react'
import { Button } from './ui/button'

export const ProjectsHeader = ({ projectId }: { projectId: string }) => {
    return (
<header className="h-14 border-b flex items-center justify-between px-6 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Code2 className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h1 className="font-bold tracking-tight text-foreground">VibeCreation <span className="text-muted-foreground font-normal text-sm ml-2">/ Project {projectId.slice(0, 8)}</span></h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full gap-2">
                        <Globe className="w-4 h-4" /> Share
                    </Button>
                </div>
            </header>
    )
}