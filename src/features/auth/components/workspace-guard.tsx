"use client"

import { useAuth } from '@workos-inc/authkit-nextjs/components'
import React from 'react'
import OnboardingWizard from './onboarding-wizard'



interface Props {
    children: React.ReactNode
}


const WorkspaceGuard = ({ children } : Props) => {

    const { organizationId } = useAuth({ ensureSignedIn: true })

    if (!organizationId) {
        return <OnboardingWizard />
    }
  return (
    <>
        {children}
    </>
  )
}

export default WorkspaceGuard