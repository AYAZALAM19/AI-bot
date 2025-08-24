"use client";
import { Bot, User, Send, Sparkles, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Stream() {
  const [conversationHistory, setConversationHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [conversationHistory, isStreaming]);

  const handleEnterPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleChat();
    }
  };

  const handleChat = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    // Add user message immediately
    setConversationHistory((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);

    setMessage("");
    setLoading(true);
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          history: conversationHistory 
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // Add empty bot message placeholder
      let botMessageIndex;
      setConversationHistory((prev) => {
        const updated = [...prev, { role: "bot", text: "" }];
        botMessageIndex = updated.length - 1;
        return updated;
      });

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          console.log("Raw line:", trimmedLine);

          // Handle different SSE formats
          if (trimmedLine.startsWith('data: ')) {
            const jsonStr = trimmedLine.slice(6); // Remove 'data: '
            
            if (jsonStr === '[DONE]') {
              console.log("Stream completed");
              break;
            }

            try {
              const data = JSON.parse(jsonStr);
              console.log("Parsed data:", data);

              // Handle different possible response structures
              let textContent = "";
              
              // Try different paths for Gemini API response
              if (data.candidates && data.candidates[0]) {
                const candidate = data.candidates[0];
                if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
                  textContent = candidate.content.parts[0].text || "";
                } else if (candidate.text) {
                  textContent = candidate.text;
                }
              } else if (data.text) {
                textContent = data.text;
              } else if (data.content) {
                textContent = data.content;
              }

              if (textContent) {
                console.log("Extracted text:", textContent);
                
                setConversationHistory((prev) => {
                  const updated = [...prev];
                  if (botMessageIndex !== undefined && updated[botMessageIndex]) {
                    updated[botMessageIndex] = {
                      ...updated[botMessageIndex],
                      text: updated[botMessageIndex].text + textContent,
                    };
                  }
                  return updated;
                });
              }
            } catch (parseError) {
              console.error("JSON parse error:", parseError, "Raw:", jsonStr);
              
              // If it's not JSON, treat it as plain text
              if (jsonStr && !jsonStr.startsWith('{') && !jsonStr.startsWith('[')) {
                setConversationHistory((prev) => {
                  const updated = [...prev];
                  if (botMessageIndex !== undefined && updated[botMessageIndex]) {
                    updated[botMessageIndex] = {
                      ...updated[botMessageIndex],
                      text: updated[botMessageIndex].text + jsonStr,
                    };
                  }
                  return updated;
                });
              }
            }
          } else if (trimmedLine.startsWith('{') || trimmedLine.startsWith('[')) {
            // Direct JSON without 'data: ' prefix
            try {
              const data = JSON.parse(trimmedLine);
              console.log("Direct JSON parsed:", data);
              
              let textContent = "";
              if (data.candidates && data.candidates[0]) {
                const candidate = data.candidates[0];
                if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
                  textContent = candidate.content.parts[0].text || "";
                }
              }
              
              if (textContent) {
                setConversationHistory((prev) => {
                  const updated = [...prev];
                  if (botMessageIndex !== undefined && updated[botMessageIndex]) {
                    updated[botMessageIndex] = {
                      ...updated[botMessageIndex],
                      text: updated[botMessageIndex].text + textContent,
                    };
                  }
                  return updated;
                });
              }
            } catch (parseError) {
              console.error("Direct JSON parse error:", parseError);
            }
          }
        }
      }

      // Handle any remaining buffer
      if (buffer.trim()) {
        console.log("Processing remaining buffer:", buffer);
        try {
          if (buffer.startsWith('data: ')) {
            const jsonStr = buffer.slice(6);
            if (jsonStr !== '[DONE]') {
              const data = JSON.parse(jsonStr);
              let textContent = "";
              if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                textContent = data.candidates[0].content.parts[0]?.text || "";
              }
              if (textContent) {
                setConversationHistory((prev) => {
                  const updated = [...prev];
                  if (botMessageIndex !== undefined && updated[botMessageIndex]) {
                    updated[botMessageIndex] = {
                      ...updated[botMessageIndex],
                      text: updated[botMessageIndex].text + textContent,
                    };
                  }
                  return updated;
                });
              }
            }
          }
        } catch (e) {
          console.error("Buffer processing error:", e);
        }
      }

    } catch (error) {
      console.error("Stream error:", error);
      setConversationHistory((prev) => [
        ...prev,
        { role: "bot", text: `Error: ${error.message}. Please try again.` },
      ]);
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
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
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${isStreaming ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Streaming Assistant</h1>
            <p className="text-sm text-white/70">
              {isStreaming ? "Thinking..." : "Ready to help"}
            </p>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Welcome Message */}
        {conversationHistory.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">AI Streaming Chat</h2>
              <p className="text-lg text-white/70 mb-8 max-w-md">
                Experience real-time AI responses with streaming technology
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {[
                  "Write a story about space",
                  "Explain quantum physics",
                  "Create a poem",
                  "Help me code"
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessage(suggestion)}
                    className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    <MessageCircle className="w-5 h-5 mb-2 mx-auto" />
                    <span className="text-sm">{suggestion}</span>
                  </button>
                ))}
              </div>
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
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                    {msg.role === "bot" && idx === conversationHistory.length - 1 && isStreaming && (
                      <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse"></span>
                    )}
                  </p>
                </div>
                <div className={`text-xs text-white/50 mt-2 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}>
                  {msg.role === "user" ? "You" : "AI"} • {isStreaming && msg.role === "bot" && idx === conversationHistory.length - 1 ? "streaming..." : "now"}
                </div>
              </div>
            </div>
          ))}
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
                  disabled={loading}
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