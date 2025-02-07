import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // NEW: Enables bold, italics, and lists

interface Message {
  id: number;
  text: string;
  timestamp: Date;
  sender: "user" | "bot";
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        text: inputText.trim(),
        timestamp: new Date(),
        sender: "user",
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInputText("");

      // Show "Typing..." message
      const typingMessage: Message = {
        id: Date.now() + 1,
        text: "Typing...",
        timestamp: new Date(),
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, typingMessage]);

      try {
        const response = await axios.post("http://127.0.0.1:8000/chat", {
          text: userMessage.text,
        });

        const botMessage: Message = {
          id: Date.now() + 2,
          text: response.data.response,
          timestamp: new Date(),
          sender: "bot",
        };

        // Replace "Typing..." message with the actual response
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.text === "Typing..." ? botMessage : msg
          )
        );
      } catch (error) {
        console.error("Error fetching response:", error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg flex flex-col flex-grow overflow-hidden">
        {/* Chat Header */}
        <div className="bg-indigo-600 p-4 text-white text-xl font-semibold">
          Medical AI Chat
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`${
                  message.sender === "user"
                    ? "bg-indigo-500 text-white"
                    : "bg-green-500 text-white"
                } rounded-lg py-2 px-4 max-w-xl break-words whitespace-pre-wrap shadow`}
              >
                {/* Use ReactMarkdown with remarkGfm for proper markdown formatting */}
                <ReactMarkdown
                  className="whitespace-pre-wrap"
                  remarkPlugins={[remarkGfm]}
                >
                  {message.text}
                </ReactMarkdown>
                <p className="text-xs mt-1 opacity-80">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-center space-x-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 resize-none border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
