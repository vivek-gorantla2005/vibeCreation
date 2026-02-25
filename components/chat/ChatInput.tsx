"use client"

import * as React from "react"
import { Send, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImagePreview } from "@/components/chat/ImagePreview"
import { cn } from "@/lib/utils"
import { useUploadThing } from "@/lib/uploadthing"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { motion } from 'motion/react'
import { Code } from "lucide-react"
import { useAuth, useClerk } from "@clerk/nextjs"

interface Props {
    projectId?: string
    onMessageSent?: (message: { content: string; role: "USER"; type: "RESULT" }) => void
}


export function ChatInput({ projectId, onMessageSent }: Props) {
    const [input, setInput] = React.useState("")
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const router = useRouter()
    const { isSignedIn } = useAuth()
    const { openSignIn } = useClerk()

    const { startUpload, isUploading } = useUploadThing('designImageUploader', {
        onClientUploadComplete: (res) => {
            console.log("Files: ", res);
            toast.success("Image uploaded")
        },
        onUploadError: (error: Error) => {
            console.error("Upload error:", error);
            toast.error(`Upload failed`)
        },
    })


    const [isRedirecting, setIsRedirecting] = React.useState(false)

    const handleSend = async () => {
        if (!isSignedIn) {
            toast.info("Please sign in to start creating")
            openSignIn({ afterSignInUrl: window.location.href })
            return
        }

        if (!input.trim() && !selectedFile) return
        const messageContent = input.trim()
        onMessageSent?.({ content: messageContent, role: "USER", type: "RESULT" })
        setInput("")
        // Reset height for auto-resize
        if (typeof window !== 'undefined') {
            const textareas = document.querySelectorAll('textarea');
            textareas.forEach(ta => {
                if (ta.placeholder.includes("Describe")) {
                    ta.style.height = '44px';
                }
            });
        }

        try {
            if (!projectId) {
                setIsRedirecting(true)
                const project = await apiClient.projects.post({ message: messageContent })
                if (project.data) {
                    router.push(`/projects/${(project.data as any).id}`)
                } else {

                    setIsRedirecting(false)
                }
                return
            }
            await apiClient.messages.post({ message: messageContent, projectId: projectId })
        } catch (err) {
            console.error(err)
            toast.error("Failed to send")
            setInput(messageContent)
            setIsRedirecting(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => setPreviewUrl(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const removeSelectedImage = () => {
        setPreviewUrl(null)
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative group"
        >
            <div className="relative z-10 flex flex-col bg-zinc-900/50 backdrop-blur-3xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden focus-within:border-white/10 transition-all duration-300">
                {previewUrl && isSignedIn && (
                    <div className="p-3 border-b border-white/5 bg-black/20">
                        <ImagePreview
                            src={previewUrl}
                            onRemove={removeSelectedImage}
                            className="size-20"
                        />
                    </div>
                )}

                <div className="flex items-end gap-2 p-3">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-lg h-9 w-9 text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                        onClick={() => {
                            if (!isSignedIn) {
                                toast.info("Please sign in to upload images")
                                openSignIn()
                                return
                            }
                            fileInputRef.current?.click()
                        }}
                        disabled={isUploading}
                    >
                        <ImageIcon className="size-4" />
                    </Button>

                    <div className="flex-1 min-w-0">
                        <Textarea
                            placeholder={isUploading ? "Uploading..." : "Describe a component or feature..."}
                            className="bg-transparent border-none focus-visible:ring-0 min-h-[44px] py-1.5 shadow-none leading-relaxed text-sm placeholder:text-zinc-600 font-medium text-white transition-all duration-200 block w-full overflow-hidden"
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                                const target = e.currentTarget;
                                target.style.height = 'auto';
                                target.style.height = `${target.scrollHeight}px`;
                            }}
                            disabled={isUploading}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                            onClick={handleSend}
                            disabled={(!input.trim() && !selectedFile) || isUploading}
                        >
                            {isUploading ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3 mr-2" />}
                            {isSignedIn ? 'Generate' : 'Sign in to Create'}
                        </Button>
                    </div>
                </div>

                {isUploading && (
                    <div className="h-0.5 w-full bg-blue-900/20">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            className="h-full bg-blue-500"
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                )}
            </div>

            {/* Bottom Keyboard Hint */}
            <div className="mt-3 flex justify-center">
                <p className="text-[10px] font-medium text-zinc-600 flex items-center gap-1.5 uppercase tracking-widest">
                    <span>Press</span>
                    <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] text-zinc-400 font-mono">Return</kbd>
                    <span>to engineer</span>
                </p>
            </div>

            {/* Premium Loading Overlay */}
            {isRedirecting && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#020617]/90 backdrop-blur-2xl"
                >
                    <div className="relative">
                        {/* High-end Loader */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative size-32"
                        >
                            <div className="absolute inset-0 rounded-full bg-linear-to-tr from-blue-600 to-purple-600 animate-spin transition-all duration-1000" style={{ padding: '3px' }}>
                                <div className="size-full rounded-full bg-[#020617]" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Code className="size-10 text-white animate-pulse" />
                            </div>

                            {/* Orbiting particles */}
                            {[0, 72, 144, 216, 288].map((degree, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute top-1/2 left-1/2 size-1.5 bg-blue-400 rounded-full"
                                    animate={{
                                        rotate: [degree, degree + 360],
                                        x: [-2, 60, -2],
                                        y: [-2, 60, -2],
                                    }}
                                    transition={{
                                        duration: 3 + i,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    style={{ marginLeft: '-0.75px', marginTop: '-0.75px' }}
                                />
                            ))}
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-12 text-center px-6"
                    >
                        <h2 className="text-3xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-linear-to-b from-white to-white/50">
                            Engineering Project
                        </h2>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="h-px w-8 bg-linear-to-r from-transparent to-blue-500/50" />
                            <p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                                VibeCreation AI Engine
                            </p>
                            <span className="h-px w-8 bg-linear-to-l from-transparent to-blue-500/50" />
                        </div>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                            Securing isolated sandbox, bootstrapping development environment, and initializing AI engineering agents...
                        </p>
                    </motion.div>

                    {/* Interactive background elements */}
                    <div className="absolute top-1/4 left-1/4 size-64 bg-blue-600/10 blur-[100px] -z-10" />
                    <div className="absolute bottom-1/4 right-1/4 size-64 bg-purple-600/10 blur-[100px] -z-10" />
                </motion.div>
            )}

            {/* Subtle Glow Behind */}
            <div className="absolute -inset-1 bg-blue-500/10 blur-2xl rounded-2xl -z-10 group-focus-within:bg-blue-500/20 transition-all duration-500" />
        </motion.div>
    )
}
