"use client"

import * as React from "react"
import { Send, Image as ImageIcon, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImagePreview } from "@/components/chat/ImagePreview"
import { cn } from "@/lib/utils"
import { useUploadThing } from "@/lib/uploadthing"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

interface Props {
    projectId?: string
}

export function ChatInput({ projectId }: Props) {
    const [input, setInput] = React.useState("")
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const router = useRouter()

    const { startUpload, isUploading } = useUploadThing('designImageUploader', {
        onClientUploadComplete: (res) => {
            console.log("Files: ", res);
            toast.success("Image uploaded successfully")
        },
        onUploadError: (error: Error) => {
            console.error("Upload error:", error);
            toast.error(`Upload failed: ${error.message}`)
        },
    })

    const handleSend = async () => {
        if (!input.trim() && !selectedFile) return

        let currentProjectId = projectId
        let imageUrl: string | undefined = undefined

        try {
            if (!currentProjectId) {
                const { data, error } = await apiClient.projects.post()
                if (error || !data) {
                    toast.error("Failed to create project")
                    return
                }
                currentProjectId = data.id
            }
            if (selectedFile) {
                const uploadRes = await startUpload([selectedFile])
                if (uploadRes && uploadRes[0]) {
                    imageUrl = uploadRes[0].url
                } else {
                    return 
                }
            }

            const { error: msgError } = await apiClient.messages.post({
                projectId: currentProjectId,
                content: input,
                image: imageUrl
            })

            if (msgError) {
                toast.error("Failed to send message")
                return
            }

            if (!projectId && currentProjectId) {
                router.push(`/projects/${currentProjectId}`)
            }

            setInput("")
            setPreviewUrl(null)
            setSelectedFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ""

        } catch (err) {
            console.error(err)
            toast.error("An unexpected error occurred")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeSelectedImage = () => {
        setPreviewUrl(null)
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-3 bg-background/50 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl ring-1 ring-border/20">
            {previewUrl && (
                <ImagePreview
                    src={previewUrl}
                    onRemove={removeSelectedImage}
                    className="size-24 ml-2"
                />
            )}

            <div className={cn(
                "flex items-end gap-2 rounded-2xl bg-muted/30 border border-border/50 p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background transition-all duration-300",
                isUploading && "opacity-50 pointer-events-none"
            )}>
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
                    size="icon-sm"
                    className="rounded-xl shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/5 h-10 w-10 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    <ImageIcon className="size-5" />
                </Button>

                <div className="flex-1 min-w-0">
                    <Textarea
                        placeholder={isUploading ? "Uploading image..." : "Message AI..."}
                        className="w-full bg-transparent border-none focus-visible:ring-0 min-h-[40px] py-2.5 shadow-none resize-none leading-relaxed text-sm"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isUploading}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                    />
                </div>

                <Button
                    size="icon"
                    className="h-10 w-10 rounded-xl shrink-0 transition-all active:scale-95 shadow-md hover:shadow-primary/20 disabled:opacity-30"
                    onClick={handleSend}
                    disabled={(!input.trim() && !selectedFile) || isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Send className="size-4" />
                    )}
                </Button>
            </div>

            {isUploading && (
                <div className="flex items-center gap-2 px-2">
                    <Loader2 className="size-3 animate-spin text-primary" />
                    <span className="text-[10px] font-medium text-primary animate-pulse">Uploading to secure storage...</span>
                </div>
            )}

            <p className="text-[10px] text-center text-muted-foreground font-medium tracking-tight">
                {isUploading ? "Please wait while we process your image..." : "Multi-modal input ready for your messages."}
            </p>
        </div>
    )
}
