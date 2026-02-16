"use client"
import React, { useState } from 'react'
import { FolderIcon } from 'lucide-react'
import { FileText } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

type Folder = {
    name: string,
    folders?: Folder[]
}

function buildFolderTree(files: Record<string, string>) {
    const root: Folder[] = []
    for (const path in files) {
        const parts = path.split('/')
        let level = root

        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1
            let node = level.find(f => f.name === part)

            if (!node) {
                node = isFile ? { name: part } : { name: part, folders: [] }
                level.push(node)
            }

            if (!isFile) level = node.folders!
        })
    }

    return root
}

export const TreeView = ({ files, onFileSelect }: { files: Record<string, string>, onFileSelect: (file: string) => void }) => {
    const folders = buildFolderTree(files)
    return (
        <div className='p-2 max-w-sm mx-auto'>
            <ul className='pl-2'>
                {
                    folders.map((folder: Folder) => (
                        <Folder key={folder.name} folder={folder} onFileSelect={onFileSelect} parentPath="" />
                    ))
                }
            </ul>
        </div>
    )
}

function Folder({ folder, onFileSelect, parentPath }: { folder: Folder, onFileSelect: (file: string) => void, parentPath: string }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const hasSubfolders = folder.folders && folder.folders.length > 0

    const currentPath = parentPath ? `${parentPath}/${folder.name}` : folder.name

    const isFile = !hasSubfolders

    return (
        <li className='my-1' key={folder.name}>
            <div
                className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors ${hasSubfolders ? 'cursor-pointer hover:bg-gray-100/80' : 'cursor-default'}`}
                onClick={() => {
                    if (isFile) {
                        onFileSelect(currentPath)
                    } else {
                        setIsExpanded(!isExpanded)
                    }
                }}
            >
                <div className='w-4 flex items-center justify-center'>
                    {hasSubfolders && (
                        <ChevronRight
                            className={`size-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                    )}
                </div>
                {
                    folder.folders ? (
                        <img src="/folder.png" alt="folder" className="size-4 object-contain" />
                    ) : (
                        <FileText className='size-4 text-gray-600 cursor-pointer' />
                    )
                }
                <span className={`text-sm select-none cursor-pointer ${folder.folders ? 'font-medium text-gray-700' : 'text-gray-600'}`}>
                    {folder.name}
                </span>
            </div>
            {
                isExpanded && hasSubfolders && (
                    <ul className='pl-4 border-l border-gray-100 ml-[1.1rem] mt-0.5'>
                        {
                            folder?.folders?.map((subFolder: Folder) => (
                                <Folder key={subFolder.name} folder={subFolder} onFileSelect={onFileSelect} parentPath={currentPath} />
                            ))
                        }
                    </ul>
                )
            }
        </li>
    )
}
