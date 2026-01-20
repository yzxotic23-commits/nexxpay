'use client'

import Sidebar from '@/components/Sidebar'
import { useUIStore } from '@/lib/stores/uiStore'

export default function DashboardLayout({ children }) {
  const { sidebarCollapsed } = useUIStore()
  
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-6 lg:ml-0 overflow-x-hidden overflow-y-auto transition-all duration-300">{children}</main>
      </div>
    </div>
  )
}
