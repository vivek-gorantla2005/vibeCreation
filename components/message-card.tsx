"use client"
import { CodeFragment, MessageRole, MessageType } from '@/lib/generated/prisma/client'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Bot, Code2, ExternalLink, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Props {
    content: string
    createdAt: Date | string
    role: MessageRole
    type: MessageType
    codeFragment?: CodeFragment | null
    onCodeFragmentClick?: (codeFragment: CodeFragment) => void
}

export const MessageCard = ({
    content,
    createdAt,
    role,
    type,
    codeFragment,
    onCodeFragmentClick
}: Props) => {
    const files = codeFragment?.files ? Object.keys(codeFragment.files as any) : []
    return (
        <div className={cn(
            "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
            role === "USER" ? "flex-row-reverse" : "flex-row"
        )}>
            <Avatar className={cn("w-8 h-8 border shrink-0", role === "USER" ? "bg-primary text-primary-foreground" : "bg-background")}>
                {role === "USER" ? (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="w-4 h-4" />
                    </AvatarFallback>
                ) : (
                    <AvatarFallback>
                        <Bot className="w-4 h-4" />
                    </AvatarFallback>
                )}
            </Avatar>
            <div className={cn(
                "flex flex-col gap-2 max-w-[85%]",
                role === "USER" ? "items-end" : "items-start"
            )}>
                <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ring-1",
                    role === "USER"
                        ? "bg-primary text-primary-foreground rounded-tr-none ring-primary/20"
                        : "bg-background text-foreground rounded-tl-none ring-border/50"
                )}>
                    {content.replace(/<task_summary>|<\/task_summary>/g, "").trim()}
                </div>

                {codeFragment && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm",
                                "hover:bg-muted/80 transition-all cursor-pointer group",
                                role === "USER" ? "flex-row-reverse" : "flex-row"
                            )}
                                onClick={() => onCodeFragmentClick?.(codeFragment)}
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Code2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-semibold text-foreground">{codeFragment.title}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {files.length} files
                                        </span>
                                    </div>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Code2 className="w-5 h-5 text-primary" />
                                    {codeFragment.title}
                                </DialogTitle>
                                <DialogDescription>
                                    The following files were created in this code fragment.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                                {files.map((file) => (
                                    <div
                                        key={file}
                                        className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                                            <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium truncate text-foreground">
                                                {file.split('/').pop()}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground truncate">
                                                {file.includes('/') ? file : `./${file}`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {codeFragment.sandboxUrl && (
                                <div className="mt-4">
                                    <Button
                                        className="w-full gap-2"
                                        asChild
                                        onClick={() => onCodeFragmentClick?.(codeFragment)}
                                    >
                                        <a href={codeFragment.sandboxUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-4 h-4" />
                                            Open Sandbox
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                )}

                <div className={cn(
                    "flex items-center gap-2",
                    role === "USER" ? "flex-row-reverse" : "flex-row"
                )}>
                    <span className="text-[10px] text-muted-foreground/60 font-medium px-1">
                        {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {type === "ERROR" && (
                        <Badge variant="destructive" className="h-4 text-[9px] px-1.5">Error</Badge>
                    )}
                </div>
            </div>
        </div>
    )
}
