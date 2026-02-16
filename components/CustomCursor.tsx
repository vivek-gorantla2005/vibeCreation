"use client"

import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export default function CustomCursor({ isTyping = false }: { isTyping?: boolean }) {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springX = useSpring(mouseX, { stiffness: 500, damping: 40 })
    const springY = useSpring(mouseY, { stiffness: 500, damping: 40 })

    useEffect(() => {
        const move = (e: MouseEvent) => {
            mouseX.set(e.clientX - 8)
            mouseY.set(e.clientY - 8)
        }

        window.addEventListener("mousemove", move)
        return () => window.removeEventListener("mousemove", move)
    }, [mouseX, mouseY])

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            <motion.div
                className="w-4 h-4 rounded-full bg-blue-500 mix-blend-difference"
                style={{
                    translateX: springX,
                    translateY: springY,
                }}
                animate={{
                    scale: isTyping ? [1, 1.5, 1] : 1,
                    opacity: isTyping ? 1 : 0.6,
                }}
                transition={{
                    scale: {
                        repeat: isTyping ? Infinity : 0,
                        duration: 0.8
                    }
                }}
            />

            <AnimatePresence>
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 25 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-tighter"
                        style={{
                            translateX: springX,
                            translateY: springY,
                        }}
                    >
                        AI Generating...
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
