import React from 'react'
import { Id } from '../../../../convex/_generated/dataModel'


interface Props {
    listId: Id<"lists">
}

const TaskBoardView = ({ listId } : Props) => {
  return (
    <div>TaskBoardView</div>
  )
}

export default TaskBoardView