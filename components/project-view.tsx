"use client"
import { CodeFragment, Message } from '@/lib/generated/prisma/client'
import React, { useState, useEffect, useRef } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatInput } from "@/components/chat/ChatInput"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bot, Code2, Globe, Maximize2, RotateCcw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MessageCard } from "@/components/message-card"
import { FileExplorer } from "@/components/file-explorer"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { ProjectsHeader } from './ProjectsHeader'
import { getFiles } from '@/lib/actions/get-files'
import { ChatSection } from './ChatSection'
import { PreviewHeader } from './PreviewHeader'
import { PreviewSection } from './PreviewSection'
import { CodeSection } from './CodeSection'

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

    const [fragmentData, setFragmentData] = useState<{
        files: Record<string, string>;
        sandboxId: string;
        sandboxUrl: string;
    } | null>(null)

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const data = await getFiles({ projectId })
                console.log("Fetched files:", data)
                if (data) {
                    setFragmentData(data as any)
                }
            } catch (error) {
                console.error("Failed to fetch files:", error)
            }
        }
        fetchFiles()
    }, [projectId])

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
        }, 2000) 

        return () => clearInterval(pollInterval)
    }, [isAIResponding, messages.length, projectId])

    return (
        <div className="h-screen w-full bg-background overflow-hidden flex flex-col">

            {/* ProjectHeader */}
            <ProjectsHeader projectId={projectId} />

            <ResizablePanelGroup orientation="horizontal" className="flex-1">
                <ResizablePanel
                    defaultSize={500}
                    minSize={500}
                    maxSize={500}
                    className="flex flex-col overflow-hidden bg-muted/10 border-r min-w-[300px]"
                >
                    {/* ChatSection */}
                    <ChatSection projectId={projectId} messages={messages} isAIResponding={isAIResponding} handleMessageSent={handleMessageSent} handleCodeFragmentClick={handleCodeFragmentClick} />
                </ResizablePanel>


                <ResizableHandle withHandle className="w-1 bg-border/50 hover:bg-primary/20 transition-colors" />

                <ResizablePanel defaultSize={50} className="bg-background">
                    <div className="h-full flex flex-col p-4">
                        <Tabs value={tabState} onValueChange={(v) => setTabState(v as any)} className="w-full h-full flex flex-col">

                            {/* PreviewHeader */}
                            <PreviewHeader />

                            <div className="flex-1 min-h-0 relative">

                                {/* PreviewSection */}

                                <PreviewSection activeCodeFragment={activeCodeFragment}/>


                                {/* CodeSection */}
                                <CodeSection activeCodeFragment={activeCodeFragment} fragmentData={fragmentData} projectId={projectId} />
                            </div>
                        </Tabs>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
