"use client"

import { listViewParser, VIEW_PARAM } from '@/features/lists/lib/constants'
import { useParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import React from 'react'
import { Id } from '../../../../../../../convex/_generated/dataModel'
import TaskBoardView from '@/features/tasks/components/task-board-view'
import TaskListView from '@/features/tasks/components/task-list-view'

const page = () => {

  const params = useParams<{ listId: string }>()
  const [view] = useQueryState(VIEW_PARAM, listViewParser)
  const listId = params.listId as Id<"lists">


  return (
    <div className='flex flex-1 mt-4 overflow-hidden'>
      <div className='flex-1 overflow-hidden px-6 pb-6'>
        {view === "list" ? (
          <TaskListView listId={listId} />
        ) : (
          <TaskBoardView listId={listId} />
        )}
      </div>
    </div>
  )
}

export default page