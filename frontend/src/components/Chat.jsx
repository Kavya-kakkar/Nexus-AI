import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Clock, FileText, Loader2, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function Chat({ token, onTimestampClick }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_URL}/chat/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const hist = [];
        res.data.forEach(chat => {
          hist.push({ role: 'user', content: chat.question });
          hist.push({ role: 'assistant', content: chat.answer });
        });
        setMessages(hist);
      })
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat/`, { question: userMsg.content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const assistantMsg = { 
        role: 'assistant', 
        content: res.data.answer,
        sources: res.data.sources
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, an error occurred while processing your request." }]);
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    if (!window.confirm("Are you sure you want to delete your entire chat history?")) return;
    try {
      await axios.delete(`${API_URL}/chat/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([]);
    } catch (err) {
      console.error(err);
      alert("Failed to clear history.");
    }
  };

  const renderContent = (content, sources) => {
    const parts = content.split(/(\[\d{2}:\d{2}\])/g);
    return parts.map((part, i) => {
      if (part.match(/\[\d{2}:\d{2}\]/)) {
        const timeStr = part.replace(/[\[\]]/g, '');
        const [mins, secs] = timeStr.split(':').map(Number);
        const timeInSeconds = mins * 60 + secs;
        
        let docId = null;
        if (sources && sources.length > 0) {
            const mediaSource = sources.find(s => s.type === "media");
            if (mediaSource) {
                docId = parseInt(mediaSource.source.split('_')[1]);
            }
        }

        return (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            key={i}
            className="inline-flex items-center gap-1 text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md text-sm font-medium mx-1 hover:bg-purple-500/20 transition-colors"
            onClick={() => onTimestampClick(timeInSeconds, docId)}
          >
            <Clock className="w-3 h-3" />
            {part}
          </motion.button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Top Bar Actions */}
      <div className="absolute top-4 right-4 z-20">
        {messages.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-400 bg-black/40 hover:text-red-400 hover:bg-white/10 rounded-lg border border-white/10 transition-colors backdrop-blur-md"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Chat
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32 custom-scrollbar scroll-smooth">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <div className="bg-white/5 p-4 rounded-2xl shadow-inner border border-white/10">
              <Bot className="w-12 h-12 text-purple-400 opacity-50" />
            </div>
            <p className="text-sm">Ask me anything about your uploaded documents or media.</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-tr from-blue-600 to-blue-400' 
                    : 'bg-gradient-to-tr from-purple-600 to-purple-400'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                
                <div className={`p-4 rounded-2xl ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/20 shadow-xl' 
                    : 'bg-white/10 text-gray-200 border border-white/10 rounded-tl-none backdrop-blur-md shadow-xl'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed text-[15px]">{renderContent(m.content, m.sources)}</div>
                  
                  {m.sources && m.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400 flex flex-wrap gap-2">
                          <span className="flex items-center gap-1 font-medium text-gray-500"><FileText className="w-3 h-3"/> Sources:</span>
                          {Array.from(new Set(m.sources.map(s => s.source))).map((src, idx) => (
                            <span key={idx} className="bg-black/30 px-2 py-0.5 rounded-full border border-white/5">{src}</span>
                          ))}
                      </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex max-w-[80%] gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-tr from-purple-600 to-purple-400">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-4 rounded-2xl bg-white/10 text-gray-200 border border-white/10 rounded-tl-none backdrop-blur-md flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-sm text-gray-400">Analyzing knowledge base...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pt-12">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[24px] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-[#111] border border-white/10 rounded-3xl p-1 shadow-2xl">
            <input 
              className="flex-1 bg-transparent px-5 py-4 text-white placeholder-gray-500 focus:outline-none"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question about your documents..."
            />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading || !input.trim()}
              className="bg-white text-black p-3 rounded-2xl mr-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors" 
              onClick={sendMessage}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
