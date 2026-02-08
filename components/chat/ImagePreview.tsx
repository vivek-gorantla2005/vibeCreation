"use client"

import * as React from "react"
import { X, ZoomIn, Download, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImagePreviewProps {
    src: string
    alt?: string
    onRemove?: () => void
    showActions?: boolean
    className?: string
}

export function ImagePreview({
    src,
    alt = "Preview",
    onRemove,
    showActions = true,
    className
}: ImagePreviewProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <>
            <div className={cn("relative group animate-in zoom-in-95 duration-200", className)}>
                {/* Main Preview Thumbnail */}
                <div className="relative overflow-hidden rounded-2xl ring-1 ring-border shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:ring-primary/30">
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover aspect-square transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={() => setIsOpen(true)}
                        >
                            <Maximize2 className="size-4" />
                        </Button>
                        {onRemove && (
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-white hover:bg-destructive/80 rounded-full"
                                onClick={onRemove}
                            >
                                <X className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Floating Remove Button (Always visible if desired, or just use the hover one) */}
                {!isOpen && onRemove && (
                    <button
                        onClick={onRemove}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-all ring-2 ring-background z-10 sm:hidden group-hover:block"
                    >
                        <X className="size-3" />
                    </button>
                )}
            </div>

            {/* Lightbox / Fullscreen Dialog */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                >
                    {/* Close Button - Top Right of Viewport */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-all hover:scale-110 z-110"
                        aria-label="Close preview"
                    >
                        <X size={40} strokeWidth={1.5} />
                    </button>

                    {/* Download Button - Bottom Center or Top Right? Let's do next to Close */}
                    <div className="absolute top-6 left-6 z-110">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-white/70 hover:text-white hover:bg-white/10"
                            onClick={(e) => {
                                e.stopPropagation()
                                const link = document.createElement('a')
                                link.href = src
                                link.download = alt
                                link.click()
                            }}
                        >
                            <Download size={24} />
                        </Button>
                    </div>

                    <div
                        className="relative w-full h-full flex items-center justify-center p-4 md:p-12 animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={src}
                            alt={alt}
                            className="max-w-full max-h-full object-contain shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </>
    )
}
