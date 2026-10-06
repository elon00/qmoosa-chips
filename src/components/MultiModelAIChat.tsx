import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Terminal, Cpu, ArrowRight, CornerDownLeft } from 'lucide-react';
import { MultiModelAgent, AIModelId, AI_MODELS, ChatMessage } from '../agents/MultiModelAgent';

interface MultiModelAIChatProps {
  agent: MultiModelAgent;
  onOpenQRWithAmount?: (amount: number, currency: string, resource: string) => void;
}

export const MultiModelAIChat: React.FC<MultiModelAIChatProps> = ({ agent, onOpenQRWithAmount }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => agent.getHistory());
  const [currentModel, setCurrentModel] = useState<AIModelId>('gemini-2-0-pro');
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async (textToSend = inputText) => {
    if (!textToSend.trim() || isThinking) return;
    setInputText('');
    setIsThinking(true);

    try {
      await agent.sendMessage(textToSend);
      setMessages([...agent.getHistory()]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSelectModel = (modelId: AIModelId) => {
    setCurrentModel(modelId);
    agent.setActiveModel(modelId);
  };

  const quickPrompts = [
    'Why is China hiding this machine?',
    'Query ASML High-NA EUV telemetry',
    'Trigger x402 quote for TSMC N2',
    'Run Conway automaton wafer defect simulation',
    'Generate UPI QR for 12.50 INR'
  ];

  return (
    <section className="bg-cyber-800/60 rounded-2xl border border-cyan-900/40 p-5 backdrop-blur-sm space-y-4 flex flex-col h-[640px]">
      {/* Chat Header & Model Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-900/60 pb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Multi-Model AI Agentics Chatbot
            </h2>
            <p className="text-xs text-slate-400">
              Autonomous multi-agent synthesis running across ICP canisters & Caffeine.ai
            </p>
          </div>
        </div>

        {/* Model Selector Tabs */}
        <div className="flex flex-wrap gap-1 font-mono text-xs">
          {Object.values(AI_MODELS).map((m) => {
            const isActive = currentModel === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSelectModel(m.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-cyber-700 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-cyber-900/70 border-cyan-900/50 text-slate-400 hover:text-slate-200'
                }`}
                title={m.description}
              >
                <span>{m.avatar}</span>
                <span className="hidden md:inline">{m.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Model Subtitle Banner */}
      <div className="bg-cyber-900/80 px-3 py-1.5 rounded-xl border border-cyan-900/60 text-xs font-mono flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-base">{AI_MODELS[currentModel].avatar}</span>
          <span className="font-bold text-cyan-300">{AI_MODELS[currentModel].name}:</span>
          <span className="text-slate-400 hidden sm:inline">{AI_MODELS[currentModel].badge}</span>
        </div>
        <span className="text-[10px] text-cyan-500 bg-cyan-950 px-2 py-0.5 rounded">
          Autonomous Agentic Mode
        </span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const modelProfile = AI_MODELS[msg.modelId] || AI_MODELS['gemini-2-0-pro'];

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-cyber-900/90 border border-cyan-800/60 text-slate-200 rounded-tl-none shadow-[0_0_15px_rgba(0,0,0,0.3)]'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between border-b border-cyan-900/60 pb-1.5 font-mono text-[11px] text-cyan-400">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span>{modelProfile.avatar}</span>
                      <span>{modelProfile.name}</span>
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {/* Tool Execution Badge */}
                {msg.toolCall && (
                  <div className="bg-black/50 border border-cyan-700/50 rounded-lg p-2 font-mono text-[11px] text-cyan-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Autonomous Tool Executed: {msg.toolCall.tool}()</span>
                    </div>
                    {msg.toolCall.result?.summary && (
                      <p className="text-slate-300 text-[10px]">{msg.toolCall.result.summary}</p>
                    )}
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap font-sans text-xs">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs bg-cyber-900/80 px-3 py-2 rounded-xl border border-cyan-800/50 w-fit">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Agentic Orchestrator is synthesizing wafer proofs & x402 quotes...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono no-scrollbar">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-cyber-900 hover:bg-cyber-700 text-cyan-300 border border-cyan-900/80 transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="flex items-center gap-2 pt-1 border-t border-cyan-900/60">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask ${AI_MODELS[currentModel].name} about global chips, x402, Conway automaton, or China's hidden machine...`}
          className="flex-1 bg-cyber-950 border border-cyan-800/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isThinking}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-40 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
