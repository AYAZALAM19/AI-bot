'use client'
import React from 'react'

function ChatWindow({ messages = [] }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`max-w-xl px-4 py-2 rounded-lg ${
            msg.role === 'user'
              ? 'bg-blue-100 self-end text-right ml-auto'
              : 'bg-gray-200 self-start text-left mr-auto'
          }`}
        >
          <div className="inline-block bg-white rounded px-3 py-2 shadow">
            {msg.content}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ChatWindow