'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble, ChatMessage } from './message-bubble';

interface ChatMessagesProps {
  messages: ChatMessage[];
  assistantName: string;
  streamingId?: string;
  onRegenerate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ChatMessages({
  messages,
  assistantName,
  streamingId,
  onRegenerate,
  onDelete,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAutoScroll(distFromBottom < 80);
  };

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, autoScroll]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    setAutoScroll(true);
  };

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-[#171815]" style={{ backgroundColor: 'var(--personal-accent)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
            </svg>
          </div>
          <h2 className="mb-3 text-2xl font-semibold text-zinc-100 md:text-3xl">
            A little space for you and {assistantName || 'your AI'}
          </h2>
          <p className="text-base leading-7 text-zinc-400">
            Think out loud, work through a problem, or follow a question wherever it leads.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scroll-smooth"
      >
        <div className="mx-auto w-full max-w-4xl space-y-8 px-5 py-8 md:px-10 md:py-10">
          {messages.map((msg) => (
            <div key={msg.id} className="group">
              <MessageBubble
                message={msg}
                assistantName={assistantName}
                isStreaming={msg.id === streamingId}
                onRegenerate={msg.role === 'assistant' ? () => onRegenerate?.(msg.id) : undefined}
                onDelete={() => onDelete?.(msg.id)}
              />
            </div>
          ))}
          <div ref={bottomRef} className="h-px" />
        </div>
      </div>

      <AnimatePresence>
        {!autoScroll && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-[#1c1c20] px-3 py-1.5 text-xs text-zinc-300 shadow-lg hover:bg-[#26262b]"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            Latest
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
