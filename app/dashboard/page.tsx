"use client"
import React, { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'

const DashboardPage = () => {
    const [projects, setProjects] = useState<any[]>([])

    useEffect(() => {
        const fetchProjects = async () => {
            const { data } = await apiClient.projects.get()
            if (data) {
                setProjects(data)
            }
        }
        fetchProjects()
    }, [])

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p>Welcome to your dashboard. Here are your projects:</p>

            <div className="mt-6 grid gap-4">
                {projects.length === 0 ? (
                    <p className="text-gray-500 italic">No projects found.</p>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <Link href={`/projects/${project.id}`}>
                                <h2 className="font-semibold">{project.name}</h2>
                                <p className="text-sm text-gray-400">
                                    Created: {new Date(project.createdAt).toLocaleDateString()}
                                </p>
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default DashboardPage
