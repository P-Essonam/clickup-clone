import { Preloaded } from 'convex/react';
import React from 'react'
import { api } from '../../../../convex/_generated/api';

interface Props {
    preloadedAgent: Preloaded<typeof api.agentsCreation.getAgentByThreadId>;
}
const AgentDetailsSidebar = ({ preloadedAgent } : Props) => {
  return (
    <div>AgentDetailsSidebar</div>
  )
}

export default AgentDetailsSidebar