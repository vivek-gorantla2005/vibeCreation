import React from 'react'
import { CodeFragment } from '@/lib/generated/prisma/client'
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCard } from "@/components/message-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot } from "lucide-react"
import { ChatInput } from './chat/ChatInput'
import { useInngestSubscription } from "@inngest/realtime/hooks"
import { fetchRealtimeSubscriptionToken } from "@/lib/actions/get-inngest-sub-token"

export const ChatSection = ({ projectId, messages, isAIResponding, handleMessageSent, handleCodeFragmentClick }: { projectId: string, messages: any[], isAIResponding: boolean, handleMessageSent: (newMessage: { content: string; role: "USER"; type: "RESULT" }) => void, handleCodeFragmentClick: (codeFragment: CodeFragment) => void }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const { latestData } = useInngestSubscription({
        refreshToken: () => fetchRealtimeSubscriptionToken(projectId)
    });

    const [currentStatus, setCurrentStatus] = React.useState<string | null>(null);

    // Auto-scroll to bottom
    React.useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isAIResponding]);

    React.useEffect(() => {
        if (latestData && 'data' in latestData && typeof latestData.data === 'string') {
            setCurrentStatus(latestData.data);
        }
    }, [latestData]);

    React.useEffect(() => {
        if (!isAIResponding) {
            setCurrentStatus(null);
        }
    }, [isAIResponding]);

    return (
        <div className="flex-1 flex flex-col min-h-0 relative">
            <ScrollArea ref={scrollRef} className="flex-1 min-h-0">
                <div className="space-y-6 max-w-3xl mx-auto py-4 px-4">
                    {messages.map((message) => (
                        <MessageCard
                            key={message.id}
                            content={message.content}
                            createdAt={message.createdAt}
                            role={message.role}
                            type={message.type}
                            codeFragment={message.codeFragment}
                            onCodeFragmentClick={handleCodeFragmentClick}
                        />
                    ))}

                    {isAIResponding && (
                        <div className="flex gap-4 animate-in fade-in duration-500 max-w-2xl">
                            <div className="relative shrink-0">
                                <Avatar className="w-10 h-10 border-2 bg-background relative z-10">
                                    <AvatarFallback>
                                        <Bot className="w-5 h-5 text-primary" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
                            </div>

                            <div className="flex flex-col gap-2 flex-1 pt-1">
                                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                    <Bot className="w-4 h-4 text-primary" />
                                    AI Assistant
                                </div>
                                <div className="bg-background dark:bg-muted/30 border border-border/50 rounded-2xl rounded-tl-none p-4 shadow-sm backdrop-blur-md relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-linear-to-r from-transparent via-primary/50 to-transparent animate-shimmer" />

                                    <div className="flex flex-col gap-3">
                                        <div className="space-y-2">
                                            <div className="h-2 w-3/4 bg-muted animate-pulse rounded-full" />
                                            <div className="h-2 w-1/2 bg-muted animate-pulse rounded-full" />
                                        </div>

                                        {currentStatus && (
                                            <div className="flex items-center gap-2 py-1 px-3 rounded-lg bg-primary/5 border border-primary/10 w-fit animate-in slide-in-from-left-2 duration-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                                                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold tracking-tight uppercase">
                                                    {currentStatus}
                                                </span>
                                            </div>
                                        )}

                                        <div className="bg-muted/20 h-1.5 w-full rounded-full overflow-hidden">
                                            <div className="bg-primary h-full w-1/3 rounded-full animate-[progress_2s_ease-in-out_infinite]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 shrink-0 bg-linear-to-t from-background via-background/95 to-transparent border-t backdrop-blur-sm">
                <ChatInput projectId={projectId} onMessageSent={handleMessageSent} />
            </div>

        </div>
    )
}
