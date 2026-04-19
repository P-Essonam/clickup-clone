import React from 'react'
import { Doc } from '../../../../convex/_generated/dataModel'


interface Props {
  agent: Doc<"agents"> 
}
const TriggersSection = ({ agent } : Props) => {
  return (
    <div>TriggersSection</div>
  )
}

export default TriggersSection