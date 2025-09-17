import React, { useEffect, useMemo, useRef, useState } from 'react';

type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  text: string;
};

const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="7" width="18" height="12" rx="6" className="fill-gray-200" />
    <circle cx="9" cy="13" r="1.75" className="fill-gray-500 animate-float" />
    <circle cx="15" cy="13" r="1.75" className="fill-gray-500 animate-float" style={{ animationDelay: '150ms' }} />
    <rect x="10.5" y="3" width="3" height="4" rx="1.5" className="fill-gray-300" />
  </svg>
);

const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1">
    <span className="h-2 w-2 rounded-full bg-gray-400 animate-typing" />
    <span className="h-2 w-2 rounded-full bg-gray-400 animate-typing" style={{ animationDelay: '150ms' }} />
    <span className="h-2 w-2 rounded-full bg-gray-400 animate-typing" style={{ animationDelay: '300ms' }} />
  </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; delay: number }> = ({ icon, title, description, delay }) => (
  <div 
    className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-soft hover:bg-white/80 transition-all duration-300 hover:scale-105 animate-fadeIn"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 text-indigo-600">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 text-sm mb-1">{title}</h3>
        <p className="text-gray-600 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: crypto.randomUUID(),
    role: 'bot',
    text: 'Hi! Ask me anything about the FAQs.',
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  async function sendMessage() {
    const question = input.trim();
    if (!question) return;
    setInput('');
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: question };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const resp = await fetch('http://127.0.0.1:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, top_k: 3 }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: { answer: string } = await resp.json();
      const botMsg: ChatMessage = { id: crypto.randomUUID(), role: 'bot', text: data.answer ?? 'No answer.' };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: unknown) {
      const botMsg: ChatMessage = { id: crypto.randomUUID(), role: 'bot', text: 'Sorry, something went wrong. Please try again.' };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && canSend) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Left Side - Features */}
      <div className="w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="mb-8 animate-fadeIn">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">FAQ Assistant</h1>
            <p className="text-lg text-gray-600 leading-relaxed">Get instant, accurate answers to your questions with our intelligent chatbot powered by advanced RAG technology.</p>
          </div>
          
          <div className="space-y-4">
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Instant Answers"
              description="Get immediate responses to your questions with our advanced AI-powered search"
              delay={200}
            />
            
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Lightning Fast"
              description="Optimized for speed with sub-second response times and real-time processing"
              delay={400}
            />
            
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Secure & Reliable"
              description="Enterprise-grade security with 99.9% uptime and data protection"
              delay={600}
            />
            
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Smart Context"
              description="Understands context and provides relevant follow-up suggestions"
              delay={800}
            />
          </div>
        </div>
      </div>

      {/* Right Side - Chatbot */}
      <div className="w-1/2 p-8 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-2xl shadow-soft border border-white/60 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
            <div className="h-9 w-9">
              <BotIcon className="h-9 w-9" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Chat Assistant</h2>
              <p className="text-sm text-gray-600">Ask me anything</p>
            </div>
          </div>

          <div ref={containerRef} className="h-[60vh] max-h-[60vh] overflow-y-auto px-5 py-6 bg-gradient-to-b from-gray-50/50 to-white/30">
            <div className="flex flex-col gap-3">
              {messages.map(m => (
                <div key={m.id} className={`w-full flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                    {m.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="w-full flex justify-start animate-fadeIn">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm bg-gray-100 text-gray-800 rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <TypingDots />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
              <button
                onClick={sendMessage}
                disabled={!canSend}
                className="group rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition focus:outline-none"
              >
                <span className="inline-flex items-center gap-2">
                  <span>Send</span>
                  <svg className="h-4 w-4 transition transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h13M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;


