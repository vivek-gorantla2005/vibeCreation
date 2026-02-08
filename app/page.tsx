"use client"

import { ChatInput } from "@/components/chat/ChatInput"

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-black flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-position-[bottom_1px_center] opacity-20 pointer-events-none" />
      <div className="relative z-10 w-full max-w-4xl flex flex-col gap-8 items-center">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Vibe Chat AI
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto font-medium">
            A minimalist, high-performance input for your next AI integration.
          </p>
        </div>

        <ChatInput />
      </div>
    </main>
  );
}
