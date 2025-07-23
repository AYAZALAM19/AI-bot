import React from 'react'
import Sidebar from '@/app/components/Sidebar'


function ChatLayout({children}) {
  return (
      <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}

export default ChatLayout