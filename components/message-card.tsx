"use client"
import { CodeFragment, MessageRole, MessageType } from '@/lib/generated/prisma/client'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Bot, Code2, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
                    {content}
                </div>

                {codeFragment && (
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
                                    {Object.keys(codeFragment.files as any).length} files
                                </span>
                            </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
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
