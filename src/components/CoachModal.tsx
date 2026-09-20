import React, { useState } from 'react';
import { CoachMessage } from '../types';
import { X, Send, Sparkles, User, Bot, Mic, MicOff } from 'lucide-react';

interface CoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  wellnessScore: number;
}

export const CoachModal: React.FC<CoachModalProps> = ({ isOpen, onClose, wellnessScore }) => {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'm1',
      role: 'bot',
      text: `Hello David! I'm your AegisHabit Health Coach. Your composite readiness is 84% and wellness score is currently ${wellnessScore}. How can I support your nutrition, exercise, or lab questions today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    'Why is my wellness score 78?',
    'What should I eat for dinner with 6.3% HbA1c?',
    'How does a 10-min walk lower blood sugar?',
    'Any tips for my borderline LDL cholesterol?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query) return;

    if (!textToSend) setInput('');

    const userMsg: CoachMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text,
      }));

      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          userContext: {
            name: 'David',
            age: 48,
            readiness: 84,
            wellnessScore,
            hba1c: '6.3%',
            ldl: '132 mg/dL',
            recentMeal: 'Dal Bowl',
          },
        }),
      });

      const data = await res.json();
      const botReply: CoachMessage = {
        id: `b-${Date.now()}`,
        role: 'bot',
        text: data.reply || "I'm tracking your vitals. Maintaining your post-lunch walks and high-fibre nutrition will continue to protect your glycemic baseline.",
      };
      setMessages((prev) => [...prev, botReply]);
    } catch {
      const botFallback: CoachMessage = {
        id: `b-${Date.now()}`,
        role: 'bot',
        text: "Your daily consistency is your strongest asset. Combining 100 steps of Shatapadi after meals with a 10:30 PM sleep window directly blunts insulin resistance.",
      };
      setMessages((prev) => [...prev, botFallback]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    const windowObj = window as any;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser environment.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInput(text);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#22271F]/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-xl bg-[#FBFAF3] border-2 border-[#22271F] rounded-lg shadow-2xl flex flex-col h-[600px] max-h-[92vh] animate-fade-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#F1EFE6] border-b border-[#CFC9B4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2C3E66] text-[#FBFAF3] flex items-center justify-center font-serif font-bold text-sm">
              <Sparkles className="w-4 h-4 text-[#B5822A]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#22271F] leading-tight">
                AegisHabit AI Health Coach
              </h3>
              <p className="text-[11px] font-mono text-[#8B8776]">Powered by Gemini 2.5 • Context-Aware</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded border border-[#22271F] flex items-center justify-center hover:bg-[#22271F] hover:text-[#FBFAF3] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#FBFAF3] border-b border-[#CFC9B4] flex gap-1.5 overflow-x-auto text-[11px]">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-full border border-[#CFC9B4] hover:border-[#2C3E66] hover:text-[#2C3E66] whitespace-nowrap cursor-pointer text-[#55584C] transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs text-[#22271F]">
          {messages.map((m) => {
            const isBot = m.role === 'bot';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                    isBot ? 'bg-[#2C3E66] text-[#FBFAF3]' : 'bg-[#22271F] text-[#FBFAF3]'
                  }`}
                >
                  {isBot ? <Bot className="w-3.5 h-3.5 text-[#B5822A]" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-lg p-3 leading-relaxed ${
                    isBot
                      ? 'bg-[#F1EFE6] border border-[#CFC9B4] text-[#22271F]'
                      : 'bg-[#22271F] text-[#FBFAF3]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#8B8776] pl-9">
              <div className="w-3.5 h-3.5 border-2 border-[#2C3E66] border-t-transparent rounded-full animate-spin" />
              Coach is formulating advice...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#F1EFE6] border-t border-[#CFC9B4] space-y-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about your blood tests, diet, or habits..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 text-xs bg-[#FBFAF3] border border-[#CFC9B4] rounded px-3 py-2 outline-none focus:border-[#22271F]"
            />
            <button
              onClick={toggleListening}
              className={`p-2 border rounded cursor-pointer transition-colors ${
                isListening ? 'bg-[#FEF2F2] border-[#A8452C] text-[#A8452C]' : 'border-[#CFC9B4] text-[#55584C]'
              }`}
              title="Speak query"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleSendMessage()}
              className="px-3.5 py-2 bg-[#22271F] text-[#FBFAF3] text-xs font-mono font-semibold rounded hover:bg-[#2C3E66] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-[#8B8776] text-center italic">
            Coach provides lifestyle & preventive wellness education. Always verify clinical diagnoses with your physician.
          </p>
        </div>
      </div>
    </div>
  );
};
