'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ChatSettings,
  DEFAULT_SETTINGS,
  STORAGE_KEY,
} from '@/lib/chat-types';

const LEGACY_DEFAULT_SYSTEM_PROMPT =
  'You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and well-structured responses. When sharing code, use proper markdown code blocks with language tags.';

export function useChatSettings() {
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ChatSettings> & {
          apiKey?: string;
          systemPrompt?: string;
        };
        const { apiKey, systemPrompt, ...savedSettings } = parsed;
        const savedPersonality = savedSettings.assistantPersonality ?? systemPrompt;
        const next = {
          ...DEFAULT_SETTINGS,
          ...savedSettings,
          assistantName:
            savedSettings.assistantName === 'Mira'
              ? DEFAULT_SETTINGS.assistantName
              : savedSettings.assistantName ?? DEFAULT_SETTINGS.assistantName,
          assistantTagline: savedSettings.assistantTagline ?? DEFAULT_SETTINGS.assistantTagline,
          assistantPersonality:
            savedPersonality === LEGACY_DEFAULT_SYSTEM_PROMPT
              ? DEFAULT_SETTINGS.assistantPersonality
              : savedPersonality ?? DEFAULT_SETTINGS.assistantPersonality,
        };
        setSettings(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  const update = useCallback(
    (patch: Partial<ChatSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore quota errors
        }
        return next;
      });
    },
    []
  );

  return { settings, update, loaded };
}
