'use client'
import React, { useState } from 'react'

function ChatInput({ onSend }) {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    onSend(input)
    setInput('')
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center p-4 border-t bg-white"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 border rounded mr-2"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Send
      </button>
    </form>
  )
}

export default ChatInput