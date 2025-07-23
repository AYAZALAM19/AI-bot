'use client'
import { useState } from 'react'
import ChatWindow from '@/app/components/ChatWindow'
import ChatInput from '@/app/components/ChatInput'
import { fetchChatResponse } from '@/app/lib/api'

export default function ChatPage({ params }) {
  const [messages, setMessages] = useState([
    { role: 'user', content: 'Hi!' },
    { role: 'assistant', content: 'Hello there!' }
  ]);

  const handleSend = async (message) => {
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);

    const reply = await fetchChatResponse(message);
    const botMessage = { role: 'assistant', content: reply };
    setMessages(prev => [...prev, botMessage]);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatWindow messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}
