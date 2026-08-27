'use client';

import { useState, useEffect } from 'react';

export type FontSize = 'text-sm' | 'text-base' | 'text-lg';

// Architecture Note: Expanded AppSettings voice union to support all three official zh-TW neural models.
export interface AppSettings {
  voice: 'zh-TW-HsiaoChenNeural' | 'zh-TW-HsiaoYuNeural' | 'zh-TW-YunJheNeural';
  playbackRate: string; // e.g. '-50%', '-25%', '0%', '+25%'
  autoPlayZh: boolean;
  showPinyin: boolean;
  fontSize: FontSize;
}

const DEFAULT_SETTINGS: AppSettings = {
  voice: 'zh-TW-HsiaoChenNeural',
  playbackRate: '-25%',
  autoPlayZh: false,
  showPinyin: true,
  fontSize: 'text-base',
};

const STORAGE_KEY = 'mandarin_mentor_settings_v1';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to parse user settings from localStorage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to persist user settings to localStorage:', e);
      }
      return next;
    });
  };

  return { settings, updateSetting, isHydrated };
}