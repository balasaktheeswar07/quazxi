'use client';

import { useRef, useEffect, useState } from 'react';
import { ArrowUp, Square, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  onClear: () => void;
  isStreaming: boolean;
  hasMessages: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  onClear,
  isStreaming,
  hasMessages,
  disabled,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  };

  useEffect(autoResize, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || isStreaming || disabled) return;
    onSend(text);
    setValue('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="w-full shrink-0 px-4 pb-5 pt-3 md:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div
          className={cn(
            'relative flex items-end gap-2 rounded-3xl border border-white/10 bg-[#1c1c20]/90 p-3 shadow-[0_8px_40px_rgba(0,0,0,0.22)] transition-colors',
            'focus-within:border-white/20'
          )}
        >
          {hasMessages && !isStreaming && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              title="Clear chat"
              className="h-9 w-9 shrink-0 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-white/5"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <Textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={disabled ? 'Configure the server key to start chatting' : 'Message Quazxi'}
            disabled={disabled}
            className="min-h-[52px] flex-1 resize-none border-0 bg-transparent px-3 py-3 text-base leading-7 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{ height: 'auto' }}
          />

          {isStreaming ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onStop}
              title="Stop generating"
              className="h-9 w-9 shrink-0 rounded-xl bg-white/10 text-zinc-200 hover:bg-white/20"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={submit}
              disabled={!value.trim() || disabled}
              title="Send"
              className="h-9 w-9 shrink-0 rounded-xl text-[#171815] hover:brightness-110 disabled:opacity-30"
              style={{ backgroundColor: 'var(--personal-accent)' }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-zinc-600">
          Enter to send, Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
