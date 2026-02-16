import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
const Navbar = () => {
  return (
        <div>
            <div className="flex items-center justify-between m-2.5 p-2">
                <div>
                    <p className='text-xl font-bold'>Vibe Creation</p>
                </div>
                <div className='flex items-center gap-4'>
                    <Link href="/dashboard">
                    <Button>Dashboard</Button>
                    </Link>
                    <Button>Account</Button>
                </div>
            </div>
        </div>
  )
}

export default Navbar