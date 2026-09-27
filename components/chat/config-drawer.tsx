'use client';

import { useState } from 'react';
import { Brain, BookOpen, Code, Settings, Sparkles } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChatSettings, MODEL_OPTIONS } from '@/lib/chat-types';

const categoryIcons: Record<string, React.ReactNode> = {
  Reasoning: <Brain className="h-3.5 w-3.5" />,
  Coding: <Code className="h-3.5 w-3.5" />,
  Research: <BookOpen className="h-3.5 w-3.5" />,
  Uncensored: <Sparkles className="h-3.5 w-3.5" />,
};

const accentColors = [
  { name: 'Coral', value: '#f18d72' },
  { name: 'Jade', value: '#65b99a' },
  { name: 'Sky', value: '#75aee8' },
  { name: 'Gold', value: '#d6ad5c' },
];

interface ConfigDrawerProps {
  settings: ChatSettings;
  onChange: (patch: Partial<ChatSettings>) => void;
}

export function ConfigDrawer({ settings, onChange }: ConfigDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Personalize assistant"
          className="h-9 w-9 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l border-white/10 bg-[#171815] p-0 text-zinc-100 sm:max-w-md"
      >
        <SheetHeader className="border-b border-white/10 px-6 py-5 text-left">
          <SheetTitle className="text-base font-semibold text-zinc-100">Make it yours</SheetTitle>
          <SheetDescription className="text-xs text-zinc-500">
            Shape your assistant, your way.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-6 py-6">
          <section className="flex flex-col gap-2">
            <Label className="text-xs font-medium uppercase text-zinc-400">Model</Label>
            <Select value={settings.model} onValueChange={(model) => onChange({ model })}>
              <SelectTrigger className="border-white/10 bg-white/5 text-zinc-100 focus:ring-[var(--personal-accent)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#20211d] text-zinc-100">
                <SelectGroup>
                  {MODEL_OPTIONS.map((model) => (
                    <SelectItem key={model.id} value={model.id} className="focus:bg-white/10">
                      <span className="flex items-center gap-2.5">
                        <span className="text-[var(--personal-accent)]">{categoryIcons[model.category]}</span>
                        <span>{model.label}</span>
                        <span className="text-xs text-zinc-500">{model.description}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </section>

          <section className="flex flex-col gap-4 border-t border-white/10 pt-5">
            <h3 className="text-xs font-medium uppercase text-zinc-400">Assistant identity</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor="assistant-name" className="text-xs text-zinc-500">Name</Label>
              <Input
                id="assistant-name"
                value={settings.assistantName}
                maxLength={32}
                onChange={(event) => onChange({ assistantName: event.target.value })}
                className="border-white/10 bg-white/5 text-zinc-100 focus-visible:ring-[var(--personal-accent)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="assistant-tagline" className="text-xs text-zinc-500">Tagline</Label>
              <Input
                id="assistant-tagline"
                value={settings.assistantTagline}
                maxLength={48}
                onChange={(event) => onChange({ assistantTagline: event.target.value })}
                className="border-white/10 bg-white/5 text-zinc-100 focus-visible:ring-[var(--personal-accent)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="assistant-personality" className="text-xs text-zinc-500">Personality</Label>
              <Textarea
                id="assistant-personality"
                value={settings.assistantPersonality}
                onChange={(event) => onChange({ assistantPersonality: event.target.value })}
                rows={3}
                className="resize-none border-white/10 bg-white/5 text-sm text-zinc-100 focus-visible:ring-[var(--personal-accent)]"
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 border-t border-white/10 pt-5">
            <h3 className="text-xs font-medium uppercase text-zinc-400">About you</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor="response-preferences" className="text-xs text-zinc-500">How you like replies</Label>
              <Textarea
                id="response-preferences"
                value={settings.responsePreferences}
                onChange={(event) => onChange({ responsePreferences: event.target.value })}
                rows={2}
                className="resize-none border-white/10 bg-white/5 text-sm text-zinc-100 focus-visible:ring-[var(--personal-accent)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="personal-notes" className="text-xs text-zinc-500">Things to remember</Label>
              <Textarea
                id="personal-notes"
                value={settings.personalNotes}
                onChange={(event) => onChange({ personalNotes: event.target.value })}
                rows={3}
                maxLength={1600}
                placeholder="Your interests, goals, projects, or useful context..."
                className="resize-none border-white/10 bg-white/5 text-sm text-zinc-100 focus-visible:ring-[var(--personal-accent)]"
              />
              <p className="text-[11px] leading-relaxed text-zinc-500">
                Saved in this browser and sent to the AI with your messages. Avoid adding sensitive information.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3 border-t border-white/10 pt-5">
            <Label className="text-xs font-medium uppercase text-zinc-400">Accent color</Label>
            <div className="flex items-center gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  aria-label={`${color.name} accent`}
                  aria-pressed={settings.accentColor === color.value}
                  onClick={() => onChange({ accentColor: color.value })}
                  className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 aria-pressed:border-white"
                  style={{ backgroundColor: color.value, borderColor: settings.accentColor === color.value ? 'white' : 'transparent' }}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-5 border-t border-white/10 pt-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium uppercase text-zinc-400">Temperature</Label>
                <span className="font-mono text-xs text-zinc-300">{settings.temperature.toFixed(2)}</span>
              </div>
              <Slider min={0} max={1} step={0.01} value={[settings.temperature]} onValueChange={([temperature]) => onChange({ temperature })} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium uppercase text-zinc-400">Top-P</Label>
                <span className="font-mono text-xs text-zinc-300">{settings.topP.toFixed(2)}</span>
              </div>
              <Slider min={0} max={1} step={0.01} value={[settings.topP]} onValueChange={([topP]) => onChange({ topP })} />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
