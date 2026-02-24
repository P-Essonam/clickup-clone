import React from 'react'
import DashboardSidebarClient from './dashboard-sidebar-client'

interface Props {
    children: React.ReactNode
}

const DashboardSidebar = ({ children } : Props) => {
  return (
    <DashboardSidebarClient>
        {children}
    </DashboardSidebarClient>
  )
}

export default DashboardSidebar