"use client";
import { Bot, User, Send, Sparkles,Code , MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [conversationHistory, setConversationHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  const handleEnterPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleChat();
    }
  };

  const handleChat = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", text: message };
    setConversationHistory((prev) => [...prev, userMessage]);

    setMessage("");
    setLoading(true);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      // Simulate typing delay for better UX
      setTimeout(() => {
        const botMessage = { role: "bot", text: data.response };
        setConversationHistory((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        const errorMessage = { role: "bot", text: "I apologize, but I encountered an error. Please try again." };
        setConversationHistory((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/10 border-b border-white/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Assistant</h1>
            <p className="text-sm text-white/70">Always here to help you</p>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Welcome Message */}
        {conversationHistory.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to AI Chat</h2>
              <p className="text-lg text-white/70 mb-4 max-w-md">
                Start a conversation and experience the power of AI assistance
              </p>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
          style={{ minHeight: conversationHistory.length > 0 ? "400px" : "auto" }}
        >
          {conversationHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-4 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              } animate-in slide-in-from-bottom duration-500`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                msg.role === "user" 
                  ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                  : "bg-gradient-to-r from-blue-500 to-purple-600"
              }`}>
                {msg.role === "user" ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] ${
                msg.role === "user" ? "text-right" : "text-left"
              }`}>
                <div className={`inline-block px-6 py-4 rounded-2xl shadow-lg ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-md"
                    : "bg-white/95 backdrop-blur-sm text-gray-800 rounded-bl-md border border-white/20"
                }`}>
                  <p className="text-lg font-semibold leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
                <div className={`text-xs text-white/50 mt-2 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}>
                  {msg.role === "user" ? "You" : "AI Assistant"} • now
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4 animate-in slide-in-from-bottom duration-300">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl rounded-bl-md px-6 py-4 shadow-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 backdrop-blur-sm bg-white/5 border-t border-white/20">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <textarea
                  className="w-full resize-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 min-h-[60px] max-h-32"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  onKeyDown={handleEnterPress}
                  rows={1}
                />
              </div>
              
              <button
                onClick={handleChat}
                disabled={loading || !message.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-4 rounded-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 shadow-lg group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-6 h-6 group-hover:translate-x-0.5 transition-transform duration-200" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}