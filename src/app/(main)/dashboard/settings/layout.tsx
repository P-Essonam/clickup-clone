"use client"

import SecondarySidebar from '@/components/secondary-sidebar';
import { cn } from '@/lib/utils';
import { Clock, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'


interface Props {
  children: React.ReactNode;
}


const settingsNavItems = [
  { title: "General", url: "/dashboard/settings", icon: Settings },
  { title: "Members", url: "/dashboard/settings/members", icon: Users },
  { title: "Invitations", url: "/dashboard/settings/invitations", icon: Clock },
];

const Layout = ({ children } : Props) => {

    const pathname = usePathname()


    const isActive = (url: string) => {
    if (url === "/dashboard/settings") return pathname === "/dashboard/settings";
    return pathname.startsWith(url);
  };

  return (
    <div className='flex flex-1 overflow-hidden'>
        <SecondarySidebar
            title='Settings'
        >
            <nav className='flex flex-col gap-2'>
                {settingsNavItems.map((item) => {
                    const active = isActive(item.url)

                    return (
                        <Link
                            key={item.title}
                            prefetch={true}
                            href={item.url}
                            className={cn(
                                "flex items-center gap-2 rounded-md p-3 text-sm font-medium text-muted-foreground hover:bg-muted",
                                active && "bg-muted text-foreground"
                            )}
                        >
                            <item.icon className='size-4'/>
                            <span>
                                {item.title}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </SecondarySidebar>
        <div className='flex-1 overflow-auto p-4'>
            {children}
        </div>
    </div>
  )
}

export default Layout