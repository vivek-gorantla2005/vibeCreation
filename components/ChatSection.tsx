import React from 'react'
import { CodeFragment } from '@/lib/generated/prisma/client'
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCard } from "@/components/message-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot } from "lucide-react"
import { ChatInput } from './chat/ChatInput'

export const ChatSection = ({projectId,messages, isAIResponding,handleMessageSent,handleCodeFragmentClick}: {projectId: string,messages: any[], isAIResponding: boolean, handleMessageSent: (newMessage: { content: string; role: "USER"; type: "RESULT" }) => void, handleCodeFragmentClick: (codeFragment: CodeFragment) => void}) => {
    return (
        <div className="flex-1 flex flex-col min-h-0 relative">
            <ScrollArea className="flex-1 min-h-0">
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
                        <div className="flex gap-3 animate-in fade-in duration-300">
                            <Avatar className="w-8 h-8 border shrink-0 bg-background">
                                <AvatarFallback>
                                    <Bot className="w-4 h-4" />
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-none bg-background shadow-sm ring-1 ring-border/50">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                                </div>
                                <span className="text-xs text-muted-foreground ml-1">
                                    AI is thinking...
                                </span>
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
