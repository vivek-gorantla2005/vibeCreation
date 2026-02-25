"use client"

import { ChatInput } from "@/components/chat/ChatInput"
import Navbar from "@/components/navbar"
import { motion, useScroll, useTransform } from "motion/react"
import { Sparkles, Zap, Code, Layout, ArrowRight, Shield, Globe, Cpu } from "lucide-react"
import React from "react"
import { Button } from "@/components/ui/button"
import { PricingTable } from '@clerk/nextjs'

const SUGGESTED_PROMPTS = [
  "Build a modern SaaS landing page for an AI startup",
  "Create a sleek data dashboard with dark mode and charts",
  "A minimalist personal portfolio for a product designer",
  "Financial app interface with clean typography"
]

export default function Home() {
  const containerRef = React.useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Removed the aggressive opacity fade to prevent content from becoming invisible prematurely
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.98])

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
      <Navbar />

      {/* High-End Ambient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <motion.section
          style={{ scale }}
          className="flex flex-col items-center justify-center min-h-[90vh] px-4 pt-32 pb-20"
        >
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center">

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 mb-8"
            >
              <div className="size-1 rounded-full bg-blue-500 animate-pulse" />
              Intelligence meets Creativity
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold tracking-[-0.04em] leading-[0.95] text-center mb-10"
            >
              Engineer your ideas <br />
              <span className="text-slate-500 font-medium">at the speed of thought.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto text-center leading-relaxed mb-12"
            >
              VibeCreation is the professional engine for AI-assisted frontend engineering.
              Deploy production-ready components from natural language in seconds.
            </motion.p>

            <div className="w-full max-w-3xl">
              <ChatInput />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 flex flex-wrap justify-center gap-2 px-4"
              >
                {SUGGESTED_PROMPTS.map((label, i) => (
                  <button
                    key={i}
                    className="text-[11px] font-medium text-slate-500 hover:text-white border border-white/5 hover:border-white/20 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-all"
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem',marginBottom: '2rem'}}>
          <PricingTable />
        </div>


        {/* Brand/Trust Section */}
        <section className="py-24 border-t border-white/5 bg-black/20">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-bold text-center mb-12">
              The Engine for Modern Teams
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
              {['Vercel', 'Linear', 'GitHub', 'Stripe'].map(brand => (
                <div key={brand} className="flex justify-center items-center text-xl font-bold tracking-tighter hover:text-white transition-colors">
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="py-32 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px]">
            <div className="md:col-span-2 row-span-2 p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-end gap-4 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 text-blue-500/20 group-hover:text-blue-500/40 transition-colors">
                <Cpu size={120} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold">Real-time Sandbox</h3>
                <p className="text-slate-400 max-w-md">Edit and preview your code instantly in a secure, isolated cloud environment. Zero configuration required.</p>
              </div>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-between group hover:border-zinc-700 transition-colors">
              <Zap className="text-amber-500 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg font-bold">Instant Dev</h3>
                <p className="text-sm text-slate-500">From prompt to preview in under 60s.</p>
              </div>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-between group hover:border-zinc-700 transition-colors">
              <Shield className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg font-bold">Cloud Native</h3>
                <p className="text-sm text-slate-500">Deployment ready architecture.</p>
              </div>
            </div>
            <div className="md:col-span-3 p-8 rounded-[2rem] bg-blue-600 flex flex-col md:flex-row items-center justify-between gap-8 group cursor-pointer hover:bg-blue-500 transition-colors">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold tracking-tight">Ready to build the future?</h3>
                <p className="text-blue-100/70">Join 10,000+ developers shipping faster with VibeCreation.</p>
              </div>
              <Button className="rounded-full h-14 px-10 bg-white text-blue-600 hover:bg-blue-50 font-bold group-hover:translate-x-1 transition-transform">
                Get Started for Free <ArrowRight className="ml-2 size-5" />
              </Button>
            </div>
          </div>
        </section>

        <footer className="py-20 border-t border-white/5 text-center text-slate-600 text-xs">
          <p>&copy; {new Date().getFullYear()} VibeCreation Labs. Built with precision.</p>
        </footer>
      </main>
    </div>
  );
}
