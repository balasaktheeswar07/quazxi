'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, RefreshCw, Trash2, User } from 'lucide-react';
import { Markdown } from './markdown';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface MessageBubbleProps {
  message: ChatMessage;
  assistantName: string;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onDelete?: () => void;
}

function ThinkingDots({ assistantName }: { assistantName: string }) {
  return (
    <div className="flex items-center gap-2 py-1 text-xs text-zinc-400">
      <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: 'var(--personal-accent)' }}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
        />
      ))}
      </span>
      <span>{assistantName} is thinking</span>
    </div>
  );
}

export const MessageBubble = memo(function MessageBubble({
  message,
  assistantName,
  isStreaming,
  onRegenerate,
  onDelete,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn('flex w-full gap-3', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          isUser
            ? 'bg-zinc-700 text-zinc-300'
            : 'bg-gradient-to-br from-zinc-600 to-zinc-800 text-zinc-200'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkle />}
      </div>

      {/* Bubble */}
      <div className={cn('flex max-w-[92%] flex-col gap-1 md:max-w-[88%]', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-5 py-3 text-base leading-7',
            isUser
              ? 'bg-zinc-700/60 text-zinc-100'
              : 'border border-white/5 bg-white/[0.03] text-zinc-200'
          )}
        >
          {isStreaming && !message.content ? (
            <ThinkingDots assistantName={assistantName} />
          ) : isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <Markdown content={message.content} />
          )}
          {isStreaming && message.content && (
            <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-zinc-400 align-middle" />
          )}
        </div>

        {/* Action toolbar */}
        {!isUser && !isStreaming && message.content && (
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <ActionButton onClick={copyText} label="Copy">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </ActionButton>
            {onRegenerate && (
              <ActionButton onClick={onRegenerate} label="Regenerate">
                <RefreshCw className="h-3.5 w-3.5" />
              </ActionButton>
            )}
            {onDelete && (
              <ActionButton onClick={onDelete} label="Delete" danger>
                <Trash2 className="h-3.5 w-3.5" />
              </ActionButton>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

function ActionButton({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/5',
        danger ? 'hover:text-red-400' : 'hover:text-zinc-200'
      )}
    >
      {children}
    </button>
  );
}

function Sparkle() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
    </svg>
  );
}
