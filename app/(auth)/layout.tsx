import React from 'react'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
            {/* Background elements for premium feel */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full flex items-center justify-center p-4">
                <div className="w-full max-w-md flex flex-col items-center gap-8">
                    {/* Brand / Logo */}
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white font-bold text-2xl">V</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white mt-2">VibeCreation</h1>
                        <p className="text-zinc-400 text-sm">Create your digital vibe with AI</p>
                    </div>

                    {/* Clerk Components will be rendered here */}
                    {children}

                    {/* Footer / Info */}
                    <div className="text-zinc-500 text-xs text-center mt-4">
                        &copy; {new Date().getFullYear()} VibeCreation. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    )
}
