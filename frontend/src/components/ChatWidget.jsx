import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sendChat } from '../api/chat';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your environmental assistant. Ask me about HMPI, heavy metals, or your results.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll only when user is near the bottom
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (autoScroll) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, open, autoScroll]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const threshold = 40; // px from bottom to consider as "at bottom"
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setAutoScroll(atBottom);
  };

  const onSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await sendChat(next);
      setMessages([...next, { role: 'assistant', content: res.reply || '...' }]);
    } catch (e) {
      setMessages([...next, { role: 'assistant', content: 'Sorry, I had trouble answering. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <>
      {/* Floating chat PNG icon toggle (larger, fitted in circle) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-8 right-8 z-40 grid place-items-center w-20 h-20 rounded-full bg-white/10 border border-white/15 backdrop-blur hover:bg-white/20 transition overflow-hidden ring-1 ring-white/10 hover:ring-white/30 focus-visible:ring-white/40 p-2 transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
      >
        <img src="/src/assets/logo.png" alt="Logo" className="w-full h-full object-contain pointer-events-none" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="chatpanel"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, duration: 0.2 }}
            className="fixed bottom-24 right-6 z-40 w-[28rem] max-w-[95vw] bg-card/95 backdrop-blur border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/src/assets/logo.png" alt="Logo" className="w-5 h-5 rounded" />
                <div className="text-sm font-semibold">JalDrishti Assistant</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="px-2 py-1 rounded-md border border-white/15 hover:border-white/30 hover:bg-white/5 text-sm transition-colors"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
            <div
              ref={listRef}
              onScroll={onScroll}
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[60vh] h-96"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className={m.role === 'user' ? 'text-right' : 'text-left'}
                >
                  <div className={`inline-block px-3 py-2 rounded-lg text-sm whitespace-pre-wrap transition-colors ${m.role === 'user' ? 'bg-primary text-bg' : 'bg-white/5 border border-white/10'}`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-left">
                  <div className="inline-block px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 animate-pulse">Typing…</div>
                </motion.div>
              )}
            </div>
            <div className="p-3 border-t border-white/10 bg-white/5 flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={2}
                placeholder="Ask about HMPI results, limits, or mitigation…"
                className="flex-1 resize-none rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 transition"
              />
              <button
                onClick={onSend}
                disabled={loading}
                className="self-end rounded-md bg-primary text-bg px-3 py-2 text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
