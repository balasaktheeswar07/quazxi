'use client';

import { MessageSquare, Pin, PinOff, Plus, PanelLeftClose, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatConversation } from '@/lib/chat-types';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeId: string | null;
  expanded: boolean;
  mobileOpen: boolean;
  assistantName: string;
  assistantTagline: string;
  onToggleExpanded: () => void;
  onCloseMobile: () => void;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  expanded,
  mobileOpen,
  assistantName,
  assistantTagline,
  onToggleExpanded,
  onCloseMobile,
  onNewChat,
  onSelect,
  onTogglePin,
  onDelete,
}: ChatSidebarProps) {
  const pinned = conversations.filter((conversation) => conversation.pinned);
  const recent = conversations.filter((conversation) => !conversation.pinned);

  const selectConversation = (id: string) => {
    onSelect(id);
    onCloseMobile();
  };

  const renderConversation = (conversation: ChatConversation) => (
    <div
      key={conversation.id}
      className={cn(
        'group flex min-w-0 items-center rounded-lg transition-colors',
        activeId === conversation.id ? 'bg-white/[0.09]' : 'hover:bg-white/[0.055]'
      )}
    >
      <button
        type="button"
        title={conversation.title}
        onClick={() => selectConversation(conversation.id)}
        className="min-w-0 flex-1 truncate px-3 py-2.5 text-left text-[15px] text-zinc-300"
      >
        {conversation.title}
      </button>
      <button
        type="button"
        aria-label={conversation.pinned ? `Unpin ${conversation.title}` : `Pin ${conversation.title}`}
        title={conversation.pinned ? 'Unpin chat' : 'Pin chat'}
        onClick={() => onTogglePin(conversation.id)}
        className={cn(
          'mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-md text-zinc-500 hover:bg-white/10 hover:text-zinc-100',
          conversation.pinned ? 'text-[var(--personal-accent)]' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
        )}
      >
        {conversation.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
      </button>
      <button
        type="button"
        aria-label={`Delete ${conversation.title}`}
        title="Delete chat"
        onClick={() => onDelete(conversation.id)}
        className="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-md text-zinc-500 opacity-0 hover:bg-white/10 hover:text-red-300 group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-[min(88vw,292px)] shrink-0 flex-col border-r border-white/[0.08] bg-[#171815] transition-[width,transform] duration-200 md:relative md:z-auto',
        expanded ? 'md:w-[272px]' : 'md:w-[68px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
    >
      <div className={cn('flex h-16 shrink-0 items-center border-b border-white/[0.06]', expanded ? 'justify-between px-4' : 'justify-center')}>
        <div className={cn('flex items-center gap-3 overflow-hidden', !expanded && 'md:hidden')}>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--personal-accent)] text-[#171815]">
            <MessageSquare className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-100">{assistantName}</p>
            <p className="truncate text-xs text-[var(--personal-accent)]">{assistantTagline}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          onClick={onToggleExpanded}
          className="hidden h-9 w-9 shrink-0 text-zinc-400 hover:bg-white/5 hover:text-zinc-100 md:inline-flex"
        >
          <PanelLeftClose className={cn('h-[18px] w-[18px]', !expanded && 'rotate-180')} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Close sidebar"
          onClick={onCloseMobile}
          className="h-9 w-9 shrink-0 text-zinc-400 hover:bg-white/5 hover:text-zinc-100 md:hidden"
        >
          <PanelLeftClose className="h-[18px] w-[18px]" />
        </Button>
      </div>

      <div className={cn('shrink-0 px-3 py-4', !expanded && 'md:px-2')}>
        <Button
          onClick={onNewChat}
          title="New chat"
          className={cn(
            'h-11 justify-start gap-3 rounded-xl border border-white/[0.09] bg-white/[0.04] text-[15px] font-medium text-zinc-100 hover:bg-white/[0.09]',
            !expanded && 'md:justify-center md:px-0'
          )}
        >
          <Plus className="h-[18px] w-[18px] shrink-0" />
          <span className={!expanded ? 'md:hidden' : ''}>New chat</span>
        </Button>
      </div>

      {expanded ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          {pinned.length > 0 && (
            <section className="mb-5">
              <h2 className="px-3 pb-2 pt-1 text-xs font-semibold uppercase text-zinc-500">Pinned</h2>
              <div className="space-y-1">{pinned.map(renderConversation)}</div>
            </section>
          )}
          <section>
            <h2 className="px-3 pb-2 pt-1 text-xs font-semibold uppercase text-zinc-500">Recent</h2>
            {recent.length > 0 ? (
              <div className="space-y-1">{recent.map(renderConversation)}</div>
            ) : pinned.length === 0 ? (
              <p className="px-3 py-2 text-sm text-zinc-500">Your chats will appear here.</p>
            ) : null}
          </section>
        </div>
      ) : (
        <div className="hidden min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto px-2 pb-4 md:flex">
          {pinned.map((conversation) => (
            <Button
              key={conversation.id}
              variant="ghost"
              size="icon"
              title={conversation.title}
              aria-label={`Open pinned chat: ${conversation.title}`}
              onClick={() => selectConversation(conversation.id)}
              className={cn('h-10 w-10 shrink-0 text-zinc-400 hover:bg-white/10 hover:text-zinc-100', activeId === conversation.id && 'bg-white/10 text-[var(--personal-accent)]')}
            >
              <Pin className="h-4 w-4" />
            </Button>
          ))}
          {recent.map((conversation) => (
            <Button
              key={conversation.id}
              variant="ghost"
              size="icon"
              title={conversation.title}
              aria-label={`Open chat: ${conversation.title}`}
              onClick={() => selectConversation(conversation.id)}
              className={cn('h-10 w-10 shrink-0 text-zinc-500 hover:bg-white/10 hover:text-zinc-100', activeId === conversation.id && 'bg-white/10 text-[var(--personal-accent)]')}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          ))}
        </div>
      )}

      <div className={cn('shrink-0 border-t border-white/[0.06] p-4 text-xs text-zinc-600', !expanded && 'md:hidden')}>
        Saved in this browser
      </div>
    </aside>
  );
}
