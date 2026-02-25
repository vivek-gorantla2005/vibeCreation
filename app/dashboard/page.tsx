"use client"
import React, { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { useAuth } from '@clerk/nextjs'

const DashboardPage = () => {
    const [projects, setProjects] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const { userId } = useAuth()

    useEffect(() => {
        const fetchProjects = async () => {
            if (!userId) return

            setLoading(true)
            try {
                const { data, error } = await apiClient.projects.get()
                if (error) {
                    console.error('[Dashboard] API Error:', error)
                    setError('Failed to fetch projects')
                } else if (Array.isArray(data)) {
                    setProjects(data)
                }
            } catch (err) {
                console.error('[Dashboard] Fetch Catch:', err)
                setError('An unexpected error occurred')
            } finally {
                setLoading(false)
            }
        }
        fetchProjects()
    }, [userId])

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30">
            <Navbar />

            <main className="max-w-6xl mx-auto pt-32 px-6 pb-20">
                <div className="flex flex-col gap-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
                        <p className="text-zinc-400">Manage your AI-engineered projects and components.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                            <div className="col-span-full p-12 text-center">
                                <p className="text-zinc-500 animate-pulse">Loading projects...</p>
                            </div>
                        ) : error ? (
                            <div className="col-span-full p-12 rounded-3xl border border-red-900/50 bg-red-900/10 flex flex-col items-center justify-center text-center">
                                <p className="text-red-400 mb-4">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-sm font-medium text-blue-500 hover:text-blue-400"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="col-span-full p-12 rounded-3xl border border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center text-center">
                                <p className="text-zinc-500 italic mb-4">No projects found.</p>
                                <Link href="/" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                                    Create your first project &rarr;
                                </Link>
                            </div>
                        ) : (
                            projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.id}`}
                                    className="group p-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all shadow-sm flex flex-col justify-between min-h-[160px]"
                                >
                                    <div>
                                        <h2 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{project.name}</h2>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Created {new Date(project.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600 group-hover:text-zinc-400 pt-4">
                                        View Project <span className="translate-x-0 group-hover:translate-x-1 transition-transform">&rarr;</span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default DashboardPage
