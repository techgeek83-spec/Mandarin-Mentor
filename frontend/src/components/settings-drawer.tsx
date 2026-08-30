'use client';

import React from 'react';
import { X, Volume2, Sparkles, Sun, Moon, Monitor, PlayCircle, Gauge, Trash2, Type, RotateCcw } from 'lucide-react';
// Architecture Note: Removed deprecated PhoneticSystem type import following refactor to boolean showPinyin flag
import { AppSettings, FontSize } from '@/hooks/use-settings';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export function SettingsDrawer({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
}: SettingsDrawerProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div className="relative w-full max-w-sm bg-surface-bubble border-l border-border-subtle h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div className="flex items-center gap-2 text-ink font-bold font-brand text-lg">
              <Sparkles className="w-5 h-5 text-jade" />
              Settings
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-app transition-colors cursor-pointer"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-jade" /> TTS Voice Model
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onUpdateSetting('voice', 'zh-TW-HsiaoChenNeural')}
            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
              settings.voice === 'zh-TW-HsiaoChenNeural'
                ? 'border-jade bg-jade/10 text-ink ring-2 ring-jade/20'
                : 'border-border-subtle hover:border-jade/40 bg-surface-app text-ink'
            }`}
          >
            <div>HsiaoChen</div>
            <div className="text-[10px] text-ink-muted font-normal mt-0.5">Female · Native TW</div>
          </button>
          <button
            type="button"
            onClick={() => onUpdateSetting('voice', 'zh-TW-HsiaoYuNeural')}
            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
              settings.voice === 'zh-TW-HsiaoYuNeural'
                ? 'border-jade bg-jade/10 text-ink ring-2 ring-jade/20'
                : 'border-border-subtle hover:border-jade/40 bg-surface-app text-ink'
            }`}
          >
            <div>HsiaoYu</div>
            <div className="text-[10px] text-ink-muted font-normal mt-0.5">Female · Native TW</div>
          </button>
          <button
            type="button"
            onClick={() => onUpdateSetting('voice', 'zh-TW-YunJheNeural')}
            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
              settings.voice === 'zh-TW-YunJheNeural'
                ? 'border-jade bg-jade/10 text-ink ring-2 ring-jade/20'
                : 'border-border-subtle hover:border-jade/40 bg-surface-app text-ink'
            }`}
          >
            <div>YunJhe</div>
            <div className="text-[10px] text-ink-muted font-normal mt-0.5">Male · Native TW</div>
          </button>
        </div>
      </div>

            {/* Playback Speed */}
            <div className="space-y-2 pt-4 border-t border-border-subtle">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-jade" /> Playback Speed
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '0.5x', value: '-50%' },
                  { label: '0.75x', value: '-25%' },
                  { label: '1.0x', value: '0%' },
                  { label: '1.25x', value: '+25%' },
                ].map((rate) => (
                  <button
                    key={rate.value}
                    type="button"
                    onClick={() => onUpdateSetting('playbackRate', rate.value)}
                    className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                      settings.playbackRate === rate.value
                        ? 'border-jade bg-jade/10 text-ink ring-2 ring-jade/20'
                        : 'border-border-subtle bg-surface-app text-ink-muted hover:text-ink'
                    }`}
                  >
                    {rate.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interaction & Display Toggles */}
            <div className="space-y-2 pt-4 border-t border-border-subtle">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4 text-jade" /> Audio & Annotation
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface-app text-sm cursor-pointer hover:border-jade/40 transition-colors">
                  <span className="font-semibold text-ink">Show Pinyin annotations</span>
                  <input
                    type="checkbox"
                    checked={settings.showPinyin}
                    onChange={(e) => onUpdateSetting('showPinyin', e.target.checked)}
                    className="w-4 h-4 text-jade rounded focus:ring-jade accent-jade cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface-app text-sm cursor-pointer hover:border-jade/40 transition-colors">
                  <span className="font-semibold text-ink">Auto-play audio pills</span>
                  <input
                    type="checkbox"
                    checked={settings.autoPlayZh}
                    onChange={(e) => onUpdateSetting('autoPlayZh', e.target.checked)}
                    className="w-4 h-4 text-jade rounded focus:ring-jade accent-jade cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Architecture Note: Modifies global typography scale via Tailwind prose classes in the chat feed */}
            <div className="space-y-2 pt-4 border-t border-border-subtle">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <Type className="w-4 h-4 text-jade" /> Chat Font Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Small', value: 'text-sm' as FontSize },
                  { label: 'Normal', value: 'text-base' as FontSize },
                  { label: 'Large', value: 'text-lg' as FontSize },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdateSetting('fontSize', opt.value)}
                    className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                      settings.fontSize === opt.value
                        ? 'border-jade bg-jade/10 text-ink ring-2 ring-jade/20'
                        : 'border-border-subtle bg-surface-app text-ink-muted hover:text-ink'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {mounted && (
              <div className="space-y-2 pt-4 border-t border-border-subtle">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-jade" /> Appearance
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-2 rounded-xl border flex justify-center items-center transition-all cursor-pointer ${
                      theme === 'light' ? 'border-jade bg-jade/10 text-jade ring-2 ring-jade/20' : 'border-border-subtle bg-surface-app text-ink-muted hover:text-ink'
                    }`}
                    title="Light Mode"
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-2 rounded-xl border flex justify-center items-center transition-all cursor-pointer ${
                      theme === 'dark' ? 'border-jade bg-jade/10 text-jade ring-2 ring-jade/20' : 'border-border-subtle bg-surface-app text-ink-muted hover:text-ink'
                    }`}
                    title="Dark Mode"
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`p-2 rounded-xl border flex justify-center items-center transition-all cursor-pointer ${
                      theme === 'system' ? 'border-jade bg-jade/10 text-jade ring-2 ring-jade/20' : 'border-border-subtle bg-surface-app text-ink-muted hover:text-ink'
                    }`}
                    title="System Preference"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Cache & Session Management */}
            <div className="space-y-2 pt-4 border-t border-border-subtle">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-jade" /> Data & Session
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.clear();
                    alert('TTS audio cache purged.');
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-border-subtle bg-surface-app text-ink-muted hover:text-ink text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Purge Audio
                </button>
                {/* Architecture Note: Executes asynchronous backend session purge before flushing client storage and triggering full hard reload */}
            <button
              type="button"
              onClick={async () => {
                if (confirm('Reset current chat session and start over?')) {
                  try {
                    // Purge active session state across PostgreSQL via backend API route
                    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                    const sid = localStorage.getItem('sessionId') || '';
                    const res = await fetch(`${apiBase}/api/reset`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ session_id: sid })
                    });
                    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                    window.location.reload();
                  } catch (err) {
                    console.error('Failed to unlink backend session file:', err);
                  } finally {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                      }
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Session
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-ink-muted border-t border-border-subtle pt-4">
          MandarinMentor Taiwan v0.1.6
        </div>
      </div>
    </div>
  );
}