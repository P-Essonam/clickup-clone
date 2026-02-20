"use client" 

import React from 'react'
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
import { RefreshAuth } from '@/components/refresh-auth'


interface Props {
    children: React.ReactNode
}


const AuthGuard = ({ children } : Props) => {
  return (
    <>
        <AuthLoading>
            <div className='flex flex-col min-h-screen items-center justify-center gap-2 space-y-3'>
                <div className='animate-spin rounded-full size-7 text-muted-foreground border-b-2 border-foreground'/>
            </div>
        </AuthLoading>
        <Authenticated>
            {children}
        </Authenticated>
        <Unauthenticated>
            <RefreshAuth />
        </Unauthenticated>
    </>
  )
}

export default AuthGuard