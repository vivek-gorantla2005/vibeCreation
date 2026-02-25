"use client"

import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { motion } from 'motion/react'

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

const Navbar = () => {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center py-6 px-4 pointer-events-none"
        >
            <nav className="w-full max-w-5xl flex items-center justify-between px-6 py-3 rounded-2xl border border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl pointer-events-auto shadow-2xl">
                <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                    <div className="size-8 rounded-xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        V
                    </div>
                    <span className="text-sm font-bold tracking-tight text-white">
                        VibeCreation
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {['Features', 'Templates', 'Docs', 'Pricing'].map((item) => (
                        <Link key={item} href="#" className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">
                            {item}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <span className="text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer">
                                Log in
                            </span>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button size="sm" className="h-9 rounded-full bg-blue-600 text-white hover:bg-blue-500 text-xs px-5 border-none font-semibold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                                Get Started
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </SignedIn>
                </div>
            </nav>
        </motion.header>
    )
}

export default Navbar