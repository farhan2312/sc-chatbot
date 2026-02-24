'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Package, Truck, ArrowUp, Plus, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/* 
  Defines the available agents with their respective configurations.
*/
const agents = [
  {
    id: 'material',
    name: 'Material AI',
    icon: Package,
    description: 'Inventory & Materials Expert',
    webhookUrl: process.env.NEXT_PUBLIC_MATERIAL_WEBHOOK || '',
  },
  {
    id: 'logistics',
    name: 'Logistics AI',
    icon: Truck,
    description: 'Shipping & Routing Expert',
    webhookUrl: process.env.NEXT_PUBLIC_LOGISTICS_WEBHOOK || '',
  },
];

type AgentId = 'material' | 'logistics';

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const suggestions = [
  'Check Material Availability',
  'Track Shipment #123',
  'Logistics Report',
];

export default function Home() {
  const [activeAgentId, setActiveAgentId] = useState<AgentId>('material');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Start with empty messages to show the Welcome View
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];
  const activeAgentName = activeAgent.name;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleAgentChange = (id: AgentId) => {
    setActiveAgentId(id);
    setMessages([]); // Clear chat effectively starts new session
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add User Message
    const newUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookUrl: activeAgent.webhookUrl,
          message: text,
          agent: activeAgent.name,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      let aiContent = '';

      if (typeof data === 'object' && data !== null) {
        if (data.output) aiContent = String(data.output);
        else if (data.message) aiContent = String(data.message);
        else if (data.text) aiContent = String(data.text);
        else aiContent = JSON.stringify(data);
      } else {
        aiContent = String(data);
      }

      const newAiMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiContent,
      };

      setMessages(prev => [...prev, newAiMessage]);

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: Date.now() + 2,
        role: 'system',
        content: "Detailed error: Unable to connect to the agent. Please try again later.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (text) {
      setInputValue('');
      // Reset textarea height back to single-line after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      sendMessage(text);
    }
  };

  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
  };



  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans text-slate-900">

      {/* 
        SIDEBAR 
        Width: 280px (fixed)
      */}
      <aside className="w-[280px] bg-gray-50 border-r border-gray-100 flex-shrink-0 flex flex-col h-full z-20">

        {/* Branding Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative h-8 w-8 rounded-full overflow-hidden shadow-sm ring-1 ring-gray-200">
              <Image
                src="/nesr-logo.jpg"
                alt="NESR Logo"
                fill
                className="object-cover"
              />
            </div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Supply Chain AI</h1>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => setMessages([])}
            className="w-full flex items-center justify-start gap-3 bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 text-gray-700 transition-all py-2.5 px-4 rounded-xl shadow-sm hover:shadow text-sm font-medium group"
          >
            <Plus size={18} className="text-gray-400 group-hover:text-nesr-green transition-colors" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Agents
          </div>

          {agents.map((agent) => {
            const isActive = activeAgentId === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => handleAgentChange(agent.id as AgentId)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm font-medium relative group ${isActive
                  ? 'bg-nesr-green/10 text-gray-900 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                {/* Active Indicator Border */}
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-nesr-green rounded-r-md" />
                )}

                {/* Icon */}
                <agent.icon
                  size={20}
                  className={`transition-colors ${isActive ? 'text-nesr-green' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                />

                {/* Name */}
                <div className="flex flex-col items-start text-left">
                  <span className={isActive ? 'font-semibold text-nesr-green' : ''}>
                    {agent.name}
                  </span>
                  {isActive && <span className="text-[10px] text-gray-500 font-normal opacity-80 leading-tight">{agent.description}</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* User Profile + Sign Out */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-1">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#307c4c]/40 to-[#307c4c]/20 ring-2 ring-white flex items-center justify-center text-xs font-bold text-[#307c4c]">
              A
            </div>
            <div className="text-sm flex-1 min-w-0">
              <p className="font-medium text-gray-700 truncate">Admin</p>
              <p className="text-xs text-gray-400">NESR Internal</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150 group"
          >
            <LogOut size={15} className="transition-colors group-hover:text-red-500" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 
        MAIN CHAT AREA 
      */}
      <main className="flex-1 flex flex-col h-full relative bg-white">

        {/* Header */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-gray-50 bg-white/80 backdrop-blur-md sticky top-0 z-10 text-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Chatting with</span>
            <div className="flex items-center gap-2 bg-nesr-green/5 px-3 py-1 rounded-full border border-nesr-green/10">
              <activeAgent.icon size={14} className="text-nesr-green" />
              <span className="text-nesr-green font-semibold text-sm">
                {activeAgentName}
              </span>
            </div>
          </div>
          <div className="flex gap-4 text-gray-400">
            {/* Header Actions Placeholder */}
          </div>
        </header>

        {/* Message Container / Welcome View */}
        {/* Added extra padding bottom (pb-40) to ensure last messages are visible above the floating input */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-40 scroll-smooth">

          {messages.length === 0 ? (
            /* Welcome View (Gemini Style) */
            <div className="h-full flex flex-col items-center justify-center -mt-10 animate-in fade-in duration-500">
              <div className="relative h-24 w-24 rounded-full overflow-hidden shadow-xl mb-8 ring-4 ring-gray-50 bg-white p-1">
                <div className="relative h-full w-full rounded-full overflow-hidden">
                  <Image
                    src="/nesr-logo.jpg"
                    alt="NESR Logo"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              <h2 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                Hello, I am {activeAgentName}.
              </h2>
              <p className="text-lg text-gray-400 font-medium mb-12 text-center max-w-md leading-relaxed">
                {activeAgent.description}. <br />
                <span className="text-base opacity-80">How can I help you optimize logistics today?</span>
              </p>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl px-4">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-lg text-sm font-medium text-gray-600 hover:border-nesr-green hover:text-nesr-green transition-all hover:bg-nesr-green/5 hover:shadow-md"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message List */
            <div className="max-w-3xl mx-auto flex flex-col gap-6 pt-8">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col gap-1 max-w-[85%]">
                    {/* Name label for clarity */}
                    <span className={`text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.role === 'user' ? 'You' : activeAgentName}
                    </span>

                    <div
                      className={`relative px-6 py-4 text-sm leading-relaxed shadow-sm transition-all duration-200 hover:shadow-md ${msg.role === 'user'
                        ? 'bg-nesr-green text-white rounded-2xl rounded-br-sm'
                        : msg.role === 'system'
                          ? 'bg-red-50 text-red-600 rounded-xl border border-red-100'
                          : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100'
                        }`}
                    >
                      {msg.role === 'user' ? (
                        // Plain text for user — white text on green bg
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      ) : (
                        // Rich markdown for AI / system responses
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>
                            ),
                            table: ({ children }) => (
                              <table className="w-full text-sm text-left text-gray-700 border-collapse my-4 block overflow-x-auto border border-gray-200 rounded-lg">
                                {children}
                              </table>
                            ),
                            thead: ({ children }) => (
                              <thead className="text-xs uppercase text-gray-700">
                                {children}
                              </thead>
                            ),
                            th: ({ children }) => (
                              <th className="px-6 py-2 font-semibold whitespace-nowrap bg-gray-100/50 border-b border-gray-200">{children}</th>
                            ),
                            td: ({ children }) => (
                              <td className="px-6 py-1.5 border-b border-gray-100 last:border-0 whitespace-nowrap">{children}</td>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-gray-700">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-gray-900">{children}</strong>
                            ),
                            code: ({ children }) => (
                              <code className="bg-gray-200 text-gray-800 rounded px-1 py-0.5 font-mono text-xs">{children}</code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-gray-800 text-gray-100 rounded-lg p-4 my-3 overflow-x-auto text-xs font-mono">{children}</pre>
                            ),
                            h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2">{children}</h3>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex w-full justify-start mt-2">
                  <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-bl-sm border border-gray-100 px-6 py-4 flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}

        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pt-0 pointer-events-none bg-gradient-to-t from-white via-white/80 to-transparent z-20">
          <div className="max-w-[700px] mx-auto pointer-events-auto mt-4">
            <div className="relative shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-shadow duration-300 rounded-2xl bg-white/90 backdrop-blur-xl ring-1 ring-gray-200 group focus-within:ring-2 focus-within:ring-nesr-green/20">


              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  autoResize();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Message ${activeAgentName}...`}
                className="w-full min-h-[52px] max-h-40 py-3.5 px-5 pr-14 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-400 text-gray-700 font-medium resize-none overflow-y-auto"
                rows={1}
              />

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`absolute right-3 bottom-3 h-9 w-9 rounded-lg flex items-center justify-center text-white transition-all duration-200 ${inputValue.trim() && !isLoading
                  ? 'bg-nesr-green hover:bg-[#28663E] shadow-sm hover:scale-105 active:scale-95'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
              >
                <ArrowUp size={18} strokeWidth={3} />
              </button>
            </div>

            <p className="text-center text-[10px] text-gray-400 mt-3 font-medium tracking-wide">
              Supply Chain AI Internal Tool • Verify critical logistics data before shipping
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
