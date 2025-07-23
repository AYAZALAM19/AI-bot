'use client'
import React from 'react'

function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r p-4 h-full flex flex-col">
      <button className="bg-blue-600 text-white rounded px-4 py-2 mb-4 hover:bg-blue-700">
        + New Chat
      </button>

      <div className="space-y-2 overflow-y-auto">
        <div className="p-2 rounded hover:bg-gray-100 cursor-pointer">Chat 1</div>
        <div className="p-2 rounded hover:bg-gray-100 cursor-pointer">Chat 2</div>
        <div className="p-2 rounded hover:bg-gray-100 cursor-pointer">Chat 3</div>
      </div>
    </aside>
  )
}

export default Sidebar