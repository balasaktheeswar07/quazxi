'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { useChatSettings } from '@/hooks/use-chat-settings';
import { ChatMessage } from '@/components/chat/message-bubble';
import type { UIMessage } from 'ai';
import { CONVERSATIONS_STORAGE_KEY, MESSAGES_STORAGE_KEY } from '@/lib/chat-types';
import type { ChatConversation } from '@/lib/chat-types';
import type { ChatSettings } from '@/lib/chat-types';

function getTextFromParts(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text!)
    .join('');
}

function makeConversationId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeConversationTitle(text: string): string {
  const title = text.trim().replace(/\s+/g, ' ');
  return title.length > 44 ? `${title.slice(0, 44).trimEnd()}...` : title || 'New chat';
}

function getConversationTitle(messages: UIMessage[]): string {
  const firstUserMessage = messages.find((message) => message.role === 'user');
  return firstUserMessage
    ? makeConversationTitle(getTextFromParts(firstUserMessage.parts))
    : 'New chat';
}

export default function ChatPage() {
  const { settings, update, loaded } = useChatSettings();
  const [keyConfigured, setKeyConfigured] = useState<boolean | null>(null);

  const settingsRef = useRef<ChatSettings>(settings);
  settingsRef.current = settings;

  const transport = useRef(
    new DefaultChatTransport({
      api: '/api/chat',
      body: () => ({
        model: settingsRef.current.model,
        assistantName: settingsRef.current.assistantName,
        assistantPersonality: settingsRef.current.assistantPersonality,
        responsePreferences: settingsRef.current.responsePreferences,
        personalNotes: settingsRef.current.personalNotes,
        temperature: settingsRef.current.temperature,
        topP: settingsRef.current.topP,
      }),
    })
  );

  const { messages, sendMessage, stop, setMessages, regenerate, status, error } =
    useChat({ transport: transport.current });
  const [messagesReady, setMessagesReady] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/chat')
      .then((response) => response.json())
      .then((data: { configured?: boolean }) => setKeyConfigured(Boolean(data.configured)))
      .catch(() => setKeyConfigured(false));
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      const storedConversations = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      let savedConversations: ChatConversation[] = [];

      if (storedConversations) {
        const parsed: unknown = JSON.parse(storedConversations);
        if (Array.isArray(parsed)) {
          savedConversations = parsed.filter(
            (conversation): conversation is ChatConversation =>
              Boolean(conversation?.id) && Array.isArray(conversation?.messages)
          );
        }
      } else {
        const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
        if (storedMessages) {
          const parsed: unknown = JSON.parse(storedMessages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const oldMessages = parsed as UIMessage[];
            savedConversations = [{
              id: makeConversationId(),
              title: getConversationTitle(oldMessages),
              pinned: false,
              updatedAt: Date.now(),
              messages: oldMessages,
            }];
          }
          localStorage.removeItem(MESSAGES_STORAGE_KEY);
        }
      }

      setConversations(savedConversations);
      const activeConversation = savedConversations[0];
      if (activeConversation) {
        setActiveConversationId(activeConversation.id);
        setMessages(activeConversation.messages);
      }
    } catch {
      localStorage.removeItem(CONVERSATIONS_STORAGE_KEY);
    }

    setMessagesReady(true);
  }, [loaded, setMessages]);

  useEffect(() => {
    if (!messagesReady) return;

    try {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    } catch {
      // Ignore storage errors so chatting still works.
    }
  }, [conversations, messagesReady]);

  useEffect(() => {
    if (!messagesReady || !activeConversationId || messages.length === 0) return;

    setConversations((current) => {
      const active = current.find((conversation) => conversation.id === activeConversationId);
      if (!active) return current;

      const updated = {
        ...active,
        title: active.title === 'New chat' ? getConversationTitle(messages) : active.title,
        updatedAt: Date.now(),
        messages,
      };
      return [updated, ...current.filter((conversation) => conversation.id !== activeConversationId)];
    });
  }, [messages, messagesReady, activeConversationId]);

  const isStreaming = status === 'streaming' || status === 'submitted';

  const onSend = useCallback(
    (text: string) => {
      const title = makeConversationTitle(text);
      if (!activeConversationId) {
        const id = makeConversationId();
        setActiveConversationId(id);
        setConversations((current) => [{
          id,
          title,
          pinned: false,
          updatedAt: Date.now(),
          messages: [],
        }, ...current]);
      } else if (messages.length === 0) {
        setConversations((current) => current.map((conversation) =>
          conversation.id === activeConversationId
            ? { ...conversation, title, updatedAt: Date.now() }
            : conversation
        ));
      }
      sendMessage({ text });
    },
    [activeConversationId, messages.length, sendMessage],
  );

  const onClear = useCallback(() => {
    stop();
    setMessages([]);
    setConversations((current) => current.filter((conversation) => conversation.id !== activeConversationId));
    setActiveConversationId(null);
  }, [activeConversationId, setMessages, stop]);

  const onDelete = useCallback(
    (id: string) => {
      setMessages(messages.filter((m) => m.id !== id));
    },
    [messages, setMessages]
  );

  const onRegenerate = useCallback(
    (id: string) => {
      regenerate({ messageId: id });
    },
    [regenerate]
  );

  const onNewChat = useCallback(() => {
    stop();
    setActiveConversationId(null);
    setMessages([]);
    setMobileSidebarOpen(false);
  }, [setMessages, stop]);

  const onSelectConversation = useCallback((id: string) => {
    const conversation = conversations.find((item) => item.id === id);
    if (!conversation) return;
    stop();
    setActiveConversationId(id);
    setMessages(conversation.messages);
  }, [conversations, setMessages, stop]);

  const onTogglePin = useCallback((id: string) => {
    setConversations((current) => current.map((conversation) =>
      conversation.id === id ? { ...conversation, pinned: !conversation.pinned } : conversation
    ));
  }, []);

  const onDeleteConversation = useCallback((id: string) => {
    setConversations((current) => current.filter((conversation) => conversation.id !== id));
    if (id === activeConversationId) {
      stop();
      setActiveConversationId(null);
      setMessages([]);
    }
  }, [activeConversationId, setMessages, stop]);

  const onToggleSidebar = useCallback(() => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      setSidebarExpanded(true);
      setMobileSidebarOpen(true);
    } else {
      setSidebarExpanded((expanded) => !expanded);
    }
  }, []);

  const chatMessages: ChatMessage[] = messages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: getTextFromParts(m.parts),
  }));

  const streamingId = useRef<string | null>(null);
  const lastMsg = messages[messages.length - 1];
  if (lastMsg && lastMsg.role === 'assistant' && isStreaming) {
    streamingId.current = lastMsg.id;
  } else {
    streamingId.current = null;
  }

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0b]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
      </div>
    );
  }

  return (
    <div
      className="relative flex h-screen w-full overflow-hidden bg-[#10110f] text-zinc-100"
      style={{
        '--personal-accent': settings.accentColor,
        backgroundImage: 'radial-gradient(ellipse at 50% 36%, color-mix(in srgb, var(--personal-accent) 7%, transparent), transparent 62%)',
      } as React.CSSProperties}
    >
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close chat history"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/55 md:hidden"
        />
      )}
      <ChatSidebar
        conversations={conversations}
        activeId={activeConversationId}
        expanded={sidebarExpanded}
        mobileOpen={mobileSidebarOpen}
        assistantName={settings.assistantName}
        assistantTagline={settings.assistantTagline}
        onToggleExpanded={() => setSidebarExpanded((expanded) => !expanded)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onNewChat={onNewChat}
        onSelect={onSelectConversation}
        onTogglePin={onTogglePin}
        onDelete={onDeleteConversation}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ChatHeader
          settings={settings}
          onChange={update}
          sidebarExpanded={sidebarExpanded}
          onToggleSidebar={onToggleSidebar}
        />
        <ChatMessages
          messages={chatMessages}
          assistantName={settings.assistantName}
          streamingId={streamingId.current ?? undefined}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
        />
        {error && (
          <div className="mx-auto mb-2 w-full max-w-4xl px-5 md:px-10">
            <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              {error.message || 'The AI request failed. Check your server key and model settings.'}
            </p>
          </div>
        )}
        {keyConfigured === false && (
          <div className="mx-auto mb-2 w-full max-w-4xl px-5 md:px-10 text-center">
            <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
              Add OPENROUTER_API_KEY to .env.local, then restart the development server.
            </p>
          </div>
        )}
        <ChatInput
          key={activeConversationId ?? 'new-chat'}
          onSend={onSend}
          onStop={stop}
          onClear={onClear}
          isStreaming={isStreaming}
          hasMessages={chatMessages.length > 0}
          disabled={keyConfigured !== true}
        />
      </main>
    </div>
  );
}
