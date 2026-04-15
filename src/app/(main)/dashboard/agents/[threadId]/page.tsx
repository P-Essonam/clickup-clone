import { withAuth } from '@workos-inc/authkit-nextjs';
import { preloadQuery } from 'convex/nextjs';
import React from 'react'
import { api } from '../../../../../../convex/_generated/api';
import AgentChatSection from '@/features/agents/components/agent-chat-section';
import AgentDetailsSidebar from '@/features/agents/components/agent-details-sidebar';


interface Props {
  params: Promise<{ threadId: string }>;
}

const page = async({ params } : Props) => {

 const { threadId } = await params;
 const { accessToken } = await withAuth({ ensureSignedIn: true });

 const preloadedAgent  = await preloadQuery(
    api.agentsCreation.getAgentByThreadId,
    { threadId },
    { token: accessToken}
 )


  return (
    <div className='flex size-full overflow-hidden'>
      <AgentChatSection threadId={threadId} />
      <AgentDetailsSidebar preloadedAgent={preloadedAgent} />
    </div>
  )
}

export default page