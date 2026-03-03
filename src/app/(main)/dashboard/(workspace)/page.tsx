import { Layers } from 'lucide-react'
import React from 'react'

const page = () => {
  return (
    <div className='flex h-full flex-col items-center justify-center gap-2 p-8 text-center'>
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <Layers className="size-5 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">Welcome to Spaces</h2>
      <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
        Spaces help you organize your tasks and lists. <br />
        Create or select a space in the sidebar to get started.
      </p>
    </div>
  )
}

export default page