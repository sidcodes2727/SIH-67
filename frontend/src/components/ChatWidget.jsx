import { useEffect, useRef, useState } from 'react';
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
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-emerald-600 text-white shadow-lg px-4 py-3 hover:bg-emerald-700"
        aria-label="Open chatbot"
      >
        {open ? 'Close Chat' : 'Chat'}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-40 w-96 max-w-[95vw] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-semibold">
            HMPI Assistant
          </div>
          <div
            ref={listRef}
            onScroll={onScroll}
            onWheel={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[60vh] h-96"
          >
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-100'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-left">
                <div className="inline-block px-3 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 animate-pulse">Typing…</div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={2}
              placeholder="Ask about HMPI results, limits, or mitigation…"
              className="flex-1 resize-none rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={onSend}
              disabled={loading}
              className="self-end rounded-md bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
