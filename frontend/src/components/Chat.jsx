import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatApi } from '../services/api';

export default function Chat({
  onTimestampClick,
  onPageClick,
  onOpenUpload,
  activeDocument,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [feedback, setFeedback] = useState({}); // { [msgIndex]: 'up' | 'down' }
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchHistory = async () => {
    try {
      const data = await chatApi.getHistory();
      const hist = [];
      data.forEach((chat) => {
        hist.push({ role: 'user', content: chat.question, id: `u-${chat.id}` });
        hist.push({
          role: 'assistant',
          content: chat.answer,
          id: `a-${chat.id}`,
          sources: [],
        });
      });
      setMessages(hist);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const userMessage = { role: 'user', content: query, id: `u-${Date.now()}` };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatApi.sendQuestion(query);
      const assistantMessage = {
        role: 'assistant',
        content: res.answer,
        sources: res.sources || [],
        id: `a-${Date.now()}`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, an error occurred while generating your answer. Please ensure your backend is connected and Groq API key is valid.',
          isError: true,
          id: `err-${Date.now()}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    if (
      !window.confirm(
        'Are you sure you want to clear your chat history for this project?'
      )
    ) {
      return;
    }
    try {
      await chatApi.deleteHistory();
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFeedback = (index, type) => {
    setFeedback((prev) => ({
      ...prev,
      [index]: prev[index] === type ? null : type,
    }));
  };

  // Parse citation tags in text: [01:23], [12:45], [Page 14], [1], [2]
  const renderMessageContent = (content, sources = []) => {
    // Regex matches [HH:MM:SS], [MM:SS], [Page X], or numeric citations [1]
    const tokenRegex =
      /(\[\d{1,2}:\d{2}(?::\d{2})?\]|\[Page\s*\d+\]|\[\d+\])/gi;
    const parts = content.split(tokenRegex);

    return parts.map((part, i) => {
      // 1. Timestamp citation like [01:23]
      const timeMatch = part.match(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]$/);
      if (timeMatch) {
        const timeStr = timeMatch[1];
        const segments = timeStr.split(':').map(Number);
        let seconds = 0;
        if (segments.length === 3) {
          seconds = segments[0] * 3600 + segments[1] * 60 + segments[2];
        } else if (segments.length === 2) {
          seconds = segments[0] * 60 + segments[1];
        }

        // Try to identify document ID from sources if available
        let docId = null;
        if (sources && sources.length > 0) {
          const mediaSrc = sources.find(
            (s) => s.type === 'media' || s.type === 'audio' || s.type === 'video'
          );
          if (mediaSrc?.source) {
            const parts = mediaSrc.source.split('_');
            if (parts[1]) docId = parseInt(parts[1]);
          }
        }

        return (
          <button
            key={i}
            onClick={() => onTimestampClick && onTimestampClick(seconds, docId)}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 my-0.5 mx-1 rounded-md text-xs font-semibold bg-secondary-container/15 text-secondary border border-secondary-container/30 hover:bg-secondary-container/30 transition-all cursor-pointer"
            title={`Seek media to ${timeStr}`}
          >
            <span className="material-symbols-outlined text-[13px]">play_circle</span>
            <span>{part}</span>
          </button>
        );
      }

      // 2. Page citation like [Page 14]
      const pageMatch = part.match(/^\[Page\s*(\d+)\]$/i);
      if (pageMatch) {
        const pageNum = parseInt(pageMatch[1]);
        return (
          <button
            key={i}
            onClick={() => onPageClick && onPageClick(pageNum)}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 my-0.5 mx-1 rounded-md text-xs font-semibold bg-primary-fixed/30 text-primary border border-primary-fixed hover:bg-primary-fixed/50 transition-all cursor-pointer"
            title={`Jump to Page ${pageNum}`}
          >
            <span className="material-symbols-outlined text-[13px]">
              description
            </span>
            <span>{part}</span>
          </button>
        );
      }

      // 3. Numbered citation like [1], [2]
      const numMatch = part.match(/^\[(\d+)\]$/);
      if (numMatch) {
        const citeIndex = parseInt(numMatch[1]) - 1;
        const matchedSource = sources && sources[citeIndex];

        return (
          <button
            key={i}
            onClick={() => {
              if (matchedSource?.timestamp && onTimestampClick) {
                onTimestampClick(matchedSource.timestamp);
              } else if (matchedSource?.page && onPageClick) {
                onPageClick(matchedSource.page);
              }
            }}
            className="inline-flex items-center justify-center px-1.5 py-0.2 mx-0.5 rounded text-[11px] font-bold bg-secondary-container/20 text-on-secondary-container hover:bg-secondary-container/40 border border-secondary-container/30 transition-colors cursor-pointer"
            title={
              matchedSource
                ? `Source: ${matchedSource.source || 'Document'} ${
                    matchedSource.page ? `(Page ${matchedSource.page})` : ''
                  }`
                : `Citation [${numMatch[1]}]`
            }
          >
            {part}
          </button>
        );
      }

      // Plain text or markdown chunk
      return (
        <ReactMarkdown
          key={i}
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <span className="leading-relaxed">{children}</span>,
            strong: ({ children }) => (
              <strong className="font-semibold text-on-surface">{children}</strong>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
            ),
            li: ({ children }) => <li className="text-on-surface-variant">{children}</li>,
          }}
        >
          {part}
        </ReactMarkdown>
      );
    });
  };

  return (
    <section className="flex-1 flex flex-col h-full bg-surface-bright border-r border-outline-variant relative overflow-hidden">
      {/* Session Header / Controls */}
      <div className="px-6 py-2.5 border-b border-outline-variant/60 bg-surface/80 backdrop-blur-xs flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          <span className="text-xs font-semibold text-on-surface">
            Verified Q&amp;A Session
          </span>
          <span className="text-[11px] text-on-surface-variant hidden sm:inline">
            • RAG Engine Online
          </span>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-md transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
            <span>Clear Thread</span>
          </button>
        )}
      </div>

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-36 custom-scrollbar">
        {/* Session Greeting Badge */}
        <div className="text-center my-2">
          <span className="inline-block px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-medium border border-outline-variant/40">
            Session Started • Ask verified questions across all active documents
          </span>
        </div>

        {messages.length === 0 && (
          <div className="max-w-md mx-auto text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center mx-auto mb-3 text-primary">
              <span className="material-symbols-outlined text-[28px]">
                auto_awesome
              </span>
            </div>
            <h3 className="text-base font-bold text-on-surface mb-1">
              Ask Nexus-AI Anything
            </h3>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Synthesize insights, compare figures, extract quotes, or jump to exact
              video timestamps and PDF pages with verified accuracy.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'Summarize key risk factors and financials',
                'What was discussed at 01:23?',
                'Explain OpEx breakdown from the report',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="text-xs bg-surface-container-low hover:bg-surface-container border border-outline-variant/70 text-on-surface px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id || index}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start gap-3'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center shrink-0 border border-outline-variant text-primary shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">
                    smart_toy
                  </span>
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[78%] ${
                  isUser ? 'space-y-1' : 'space-y-2'
                }`}
              >
                <div
                  className={`p-4 ambient-shadow ${
                    isUser
                      ? 'bg-primary text-on-primary rounded-2xl rounded-tr-sm text-sm'
                      : 'bg-surface-container-lowest border border-outline-variant text-on-surface rounded-2xl rounded-tl-sm text-sm'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="space-y-2 text-on-surface-variant">
                      {renderMessageContent(msg.content, msg.sources)}
                    </div>
                  )}
                </div>

                {/* Assistant Message Actions */}
                {!isUser && !msg.isError && (
                  <div className="flex items-center gap-1 px-1">
                    <button
                      onClick={() => copyToClipboard(msg.content, index)}
                      className="p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-xs flex items-center gap-1"
                      title="Copy Answer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copiedIndex === index ? 'check' : 'content_copy'}
                      </span>
                      {copiedIndex === index && (
                        <span className="text-[10px] text-tertiary font-medium">
                          Copied
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleFeedback(index, 'up')}
                      className={`p-1.5 rounded-md hover:bg-surface-container transition-colors cursor-pointer ${
                        feedback[index] === 'up'
                          ? 'text-primary'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      title="Helpful"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        thumb_up
                      </span>
                    </button>

                    <button
                      onClick={() => handleFeedback(index, 'down')}
                      className={`p-1.5 rounded-md hover:bg-surface-container transition-colors cursor-pointer ${
                        feedback[index] === 'down'
                          ? 'text-error'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      title="Not helpful"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        thumb_down
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* AI Processing Shimmer State */}
        {loading && (
          <div className="flex justify-start w-full gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center shrink-0 border border-outline-variant text-primary shadow-xs">
              <span className="material-symbols-outlined text-[18px]">
                smart_toy
              </span>
            </div>
            <div className="w-[70%] max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl rounded-tl-sm p-4 ambient-shadow space-y-2.5">
              <div className="flex items-center gap-2 mb-2 text-primary font-medium text-xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span>Synthesizing verified answer...</span>
              </div>
              <div className="w-full h-3.5 shimmer-bg rounded-md"></div>
              <div className="w-4/5 h-3.5 shimmer-bg rounded-md"></div>
              <div className="w-1/2 h-3.5 shimmer-bg rounded-md"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Prompt Input Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-surface-bright via-surface-bright/95 to-transparent pt-8 z-20">
        <form
          onSubmit={handleSend}
          className="bg-surface-container-lowest border border-outline-variant rounded-xl ambient-shadow p-2 focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary transition-all flex flex-col"
        >
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeDocument
                ? `Ask about ${activeDocument.filename} or all sources...`
                : 'Ask anything about your sources (e.g., summarize risks, find citations)...'
            }
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-xs md:text-sm text-on-surface p-2 placeholder-on-surface-variant/70 leading-relaxed"
          />

          <div className="flex justify-between items-center px-2 pb-1 pt-1 border-t border-outline-variant/30">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenUpload}
                className="text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-md hover:bg-surface-container cursor-pointer"
                title="Attach Source File"
              >
                <span className="material-symbols-outlined text-[18px]">
                  attach_file
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                input.trim() && !loading
                  ? 'bg-primary text-on-primary hover:bg-surface-tint shadow-xs'
                  : 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed'
              }`}
            >
              <span>Send</span>
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
        </form>

        <div className="text-center mt-2">
          <span className="text-[11px] text-on-surface-variant">
            Nexus-AI extracts verified citations. Always verify critical decisions.
          </span>
        </div>
      </div>
    </section>
  );
}
