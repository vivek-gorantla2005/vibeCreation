"use client"
import { CodeFragment, Message } from '@/lib/generated/prisma/client'
import React, { useState, useEffect, useRef } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatInput } from "@/components/chat/ChatInput"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bot, Code2, Globe, Maximize2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MessageCard } from "@/components/message-card"
import { apiClient } from "@/lib/api-client"

interface Props {
    projectId: string
    initialMessages: any[] | null
}



export const ProjectView = ({ projectId, initialMessages }: Props) => {
    const [activeCodeFragment, setActiveCodeFragment] = useState<CodeFragment | null>(null)
    const [tabState, setTabState] = useState<"code" | "Preview">("Preview")
    const [messages, setMessages] = useState(initialMessages || [])
    const [isAIResponding, setIsAIResponding] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Update active code fragment when a new message with one arrives
    useEffect(() => {
        const lastMessageWithCode = [...messages].reverse().find(m => m.codeFragment)
        if (lastMessageWithCode?.codeFragment) {
            setActiveCodeFragment(lastMessageWithCode.codeFragment)
        }
    }, [messages])

    const handleCodeFragmentClick = (codeFragment: CodeFragment) => {
        setActiveCodeFragment(codeFragment)
        setTabState("Preview")
    }

    const handleMessageSent = (newMessage: { content: string; role: "USER"; type: "RESULT" }) => {
        // Add optimistic message immediately
        const optimisticMessage = {
            id: `temp-${Date.now()}`,
            content: newMessage.content,
            role: newMessage.role,
            type: newMessage.type,
            createdAt: new Date(),
            updatedAt: new Date(),
            projectId,
            codeFragment: null
        }
        setMessages(prev => [...prev, optimisticMessage])
        setIsAIResponding(true)
    }

    // Poll for new messages
    useEffect(() => {
        if (!isAIResponding) return

        const pollInterval = setInterval(async () => {
            try {
                const { data } = await apiClient.messages.get({ query: { projectId } })
                if (data && data.length > messages.length) {
                    setMessages(data)
                    setIsAIResponding(false)
                }
            } catch (error) {
                console.error('Failed to poll messages:', error)
            }
        }, 2000) // Poll every 2 seconds

        return () => clearInterval(pollInterval)
    }, [isAIResponding, messages.length, projectId])

    return (
        <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
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

            <ResizablePanelGroup orientation="horizontal" className="flex-1">
                <ResizablePanel
                    defaultSize={500}
                    minSize={500}
                    maxSize={500}
                    className="flex flex-col overflow-hidden bg-muted/10 border-r min-w-[300px]"
                >
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
                </ResizablePanel>


                <ResizableHandle withHandle className="w-1 bg-border/50 hover:bg-primary/20 transition-colors" />

                <ResizablePanel defaultSize={50} className="bg-background">
                    <div className="h-full flex flex-col p-4">
                        <Tabs value={tabState} onValueChange={(v) => setTabState(v as any)} className="w-full h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <TabsList className="bg-muted/50 p-1 border">
                                    <TabsTrigger value="Preview" className="gap-2 rounded-md transition-all data-[state=active]:shadow-sm">
                                        <Globe className="w-4 h-4" /> Preview
                                    </TabsTrigger>
                                    <TabsTrigger value="code" className="gap-2 rounded-md transition-all data-[state=active]:shadow-sm">
                                        <Code2 className="w-4 h-4" /> Code
                                    </TabsTrigger>
                                </TabsList>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-lg">
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-lg">
                                        <Maximize2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 relative">
                                <TabsContent value="Preview" className="h-full m-0 rounded-2xl overflow-hidden border bg-white shadow-xl ring-1 ring-border/50">
                                    {activeCodeFragment ? (
                                        <iframe
                                            src={activeCodeFragment.sandboxUrl}
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
                                <TabsContent value="code" className="h-full m-0 rounded-2xl overflow-hidden border bg-[#0d0d0d] shadow-2xl p-6 ring-1 ring-border/50">
                                    <div className="h-full flex flex-col text-[#d4d4d4] font-mono text-[13px] overflow-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                                        {activeCodeFragment ? (
                                            <pre className="whitespace-pre-wrap leading-relaxed opacity-90">
                                                {JSON.stringify(activeCodeFragment.files, null, 2)}
                                            </pre>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 gap-4">
                                                <Code2 className="w-12 h-12 stroke-[1.5]" />
                                                <p className="text-sm font-medium tracking-wide">Source code will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
