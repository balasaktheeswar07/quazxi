'use client';

import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ConfigDrawer } from './config-drawer';
import { ChatSettings, MODEL_OPTIONS } from '@/lib/chat-types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  settings: ChatSettings;
  onChange: (patch: Partial<ChatSettings>) => void;
  sidebarExpanded: boolean;
  onToggleSidebar: () => void;
}

export function ChatHeader({ settings, onChange, sidebarExpanded, onToggleSidebar }: ChatHeaderProps) {
  const model = MODEL_OPTIONS.find((m) => m.id === settings.model);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#10110f]/90 px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          title={sidebarExpanded ? 'Collapse chat history' : 'Expand chat history'}
          onClick={onToggleSidebar}
          className="h-9 w-9 text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
        >
          <span className="hidden md:block">
            {sidebarExpanded ? <PanelLeftClose className="h-[18px] w-[18px]" /> : <PanelLeftOpen className="h-[18px] w-[18px]" />}
          </span>
          <Menu className="h-[18px] w-[18px] md:hidden" />
        </Button>
        <div className="ml-1 flex min-w-0 flex-col leading-tight md:hidden">
          <span className="truncate text-sm font-semibold text-zinc-100">{settings.assistantName || 'Your AI'}</span>
          <span className="truncate text-[11px] text-[var(--personal-accent)]">{settings.assistantTagline}</span>
        </div>
        <Select value={settings.model} onValueChange={(value) => onChange({ model: value })}>
          <SelectTrigger aria-label="Choose AI model" className="h-9 w-[min(42vw,210px)] border-white/10 bg-white/[0.04] text-xs text-zinc-200 focus:ring-[var(--personal-accent)]">
            <SelectValue placeholder={model?.label ?? 'Choose model'} />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#20211d] text-zinc-100">
            {MODEL_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ConfigDrawer settings={settings} onChange={onChange} />
      </div>
    </header>
  );
}
