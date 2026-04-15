import SecondarySidebar from '@/components/secondary-sidebar'
import { Button } from '@/components/ui/button'
import AgentsSidebarList from '@/features/agents/components/agents-sidebar-list'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'


interface Props {
    children: React.ReactNode
}



const Layout = ({ children } : Props) => {
  return (
    <div className='flex flex-1 overflow-hidden'>
        <SecondarySidebar title='AI agents'>
            <div className='flex flex-col gap-2 p-2'>
                <Button
                    size={"sm"}
                    className='w-full justify-start gap-2'
                    asChild
                >
                    <Link href="/dashboard/agents" prefetch={true}>
                        <Plus className='size-4'/>
                        New Super Agent
                    </Link>
                </Button>
                <AgentsSidebarList />
            </div>
        </SecondarySidebar>
        <div className='flex-1'>
            {children}
        </div>
    </div>
  )
}

export default Layout