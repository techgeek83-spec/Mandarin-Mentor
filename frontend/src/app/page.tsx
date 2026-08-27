// frontend/src/app/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PlayCircle, Loader2, Send, Mic, MicOff, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import ReactMarkdown from 'react-markdown';
import { BrandLogo } from '@/components/brand-logo';
import { SlidersHorizontal } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { SettingsDrawer } from '@/components/settings-drawer';
import { pinyin } from 'pinyin-pro';
import rehypeRaw from 'rehype-raw';

// Architecture Note: Unified headless audio controller handling both inline vocabulary and block-level dialogue. Removes the restrictive 'pill' background in favor of native font scaling and a minimal adjacent play icon.
const TTSPlayer = ({
  text,
  voice = 'zh-TW-HsiaoChenNeural',
  rate = '-25%',
  mode = 'inline',
  children,
}: {
  text: string;
  voice?: string;
  rate?: string;
  mode?: 'inline' | 'block';
  children?: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedVoiceRef = useRef<string>(voice);
  const loadedRateRef = useRef<string>(rate);

  const cleanText = text.trim();

  // Architecture Note: Dual-tier cache retrieval: DOM Audio instance -> SessionStorage base64 -> Backend edge-tts fetch
  const playAudio = async () => {
    if (
      audioRef.current &&
      loadedVoiceRef.current === voice &&
      loadedRateRef.current === rate
    ) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    const cacheKey = `tts_cache_${voice}_${rate}_${cleanText}`;
    const cachedAudio = sessionStorage.getItem(cacheKey);

    if (cachedAudio) {
      const audio = new Audio(`data:audio/mp3;base64,${cachedAudio}`);
      audioRef.current = audio;
      loadedVoiceRef.current = voice;
      loadedRateRef.current = rate;
      audio.play();
      return;
    }

    setLoading(true);
    try {
      // Architecture Note: Normalizes UI numeric speed selections into edge-tts compatible percentage strings to prevent 500 backend fetch failures.
      const normalizedRate = (String(rate) === '1' || String(rate) === '1.0') ? '+0%' : rate;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, voice, rate: normalizedRate }),
      });
      if (!res.ok) throw new Error('TTS fetch failed');

      const data = await res.json();
      const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
      audioRef.current = audio;
      loadedVoiceRef.current = voice;
      loadedRateRef.current = rate;
      audio.play();

      sessionStorage.setItem(cacheKey, data.audio as string);
    } catch (error) {
      console.error('Audio error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'block') {
    // Architecture Note: Converted <div> nodes to <span> elements with CSS block display utilities. ReactMarkdown automatically wraps loose text in <p> tags. The HTML specification strictly forbids <div> inside <p>, which triggers fatal React 18 hydration crashes when the LLM hallucinates a block tag inline mid-paragraph.
    return (
      <span className="block relative pl-4 border-l-4 border-jade bg-surface-bubble/30 py-3 pr-14 my-4 rounded-r-lg shadow-sm text-[1.05em]">
        <span className="inline-block">{children}</span>
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={playAudio}
            className="hover:text-emerald-300 text-emerald-500 transition-colors focus:outline-hidden cursor-pointer p-[0.4rem] bg-slate-800/80 rounded-full shadow-md border border-slate-700/50 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
          </button>
        </span>
      </span>
    );
  }

  // Architecture Note: Uses relative em units so Hanzi, Pinyin, and Play icon scale proportionally with chat font size without breaking line height bounds.
  return (
    <span className="inline-flex items-center gap-[0.2em] font-normal align-middle mx-[0.15em]">
      <span>{children || cleanText}</span>
      <button
        type="button"
        onClick={playAudio}
        className="hover:text-emerald-300 text-emerald-500 transition-colors focus:outline-hidden cursor-pointer inline-flex items-center justify-center translate-y-[-0.1em]"
        disabled={loading}
      >
        {loading ? <Loader2 className="w-[1.2em] h-[1.2em] animate-spin" /> : <PlayCircle className="w-[1.2em] h-[1.2em]" />}
      </button>
    </span>
  );
};

// parseInlineChinese regex utility removed: AudioPills are now bound 1:1 with markdown AST strong nodes

// Architecture Note: Sanitizes incoming stream markdown to strip LLM-generated parenthetical romanization right after bolded Hanzi
const sanitizePinyinLeak = (content: string): string => {
  return content.replace(/(\*\*[\u4e00-\u9fff]+\*\*)\s*\([a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s]+\)/g, '$1');
};

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings, updateSetting } = useSettings();

  useEffect(() => {
    setMounted(true);
  }, []);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Onboarding Wizard State
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState('');
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

 async function startRecording() {
    if (isRecording) return;
    try {
      // Architecture Note: Hardware-level downsampling to 16kHz mono. Whisper inherently processes at 16kHz. Doing this client-side slashes the binary payload size, directly reducing upload TTFB to the FastAPI backend.
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      
      // Architecture Note: Throttles bitrate to 32kbps. High fidelity is useless for STT; minimizing payload size is the primary lever for speed.
      const recorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 32000
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        try {
          if (audioChunksRef.current.length === 0) return;

          const mimeType = recorder.mimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          audioChunksRef.current = [];

          if (blob.size < 1000) return;

          setIsTranscribing(true);
          const formData = new FormData();
          formData.append('file', blob, 'audio.webm');

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transcribe`, {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Transcription failed [${res.status}]: ${errBody}`);
          }

          const data = await res.json();
          if (data.text) {
            setInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
          }
        } catch (error) {
          console.error('Transcription error:', error);
        } finally {
          setIsTranscribing(false);
          setIsRecording(false);
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
          }
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };
  
  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

useEffect(() => {
  const fetchSessionData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat`);
      if (!res.ok) throw new Error('Failed to fetch session data');

      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
        setOnboardingComplete(true);
      }
    } catch (error) {
      console.error("Session rehydration error:", error);
    }
  };

  fetchSessionData();
}, []);

const sendPayload = async (userPrompt: string) => {
  setIsStreaming(true);
  setMessages((prev) => [
    ...prev, 
    { role: 'user', content: userPrompt }, 
    { role: 'assistant', content: '' }
  ]);

  try {
    // Architecture Note: Pipes client proficiency state into the POST payload to drive backend dynamic prompt scaffolding. Defaults to Beginner if state is uninitialized.
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt, level: selectedLevel || "Level 1 (Beginner)" })
    });

    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';

    // Auto-play state and promise queue to prevent overlapping audio
    let lastScannedIndex = 0;
    let audioQueue: Promise<unknown> = Promise.resolve();

    // Architecture Note: Concurrency queue for SSE delta auto-play utilizing dynamic rate and voice preferences
    const queueAudio = (text: string) => {
      audioQueue = audioQueue.then(async () => {
        try {
          const cacheKey = `tts_cache_${settings.voice}_${settings.playbackRate}_${text}`;
          let b64 = sessionStorage.getItem(cacheKey);
          
          if (!b64) {
            const ttsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text, voice: settings.voice, rate: settings.playbackRate })
            });
            if (!ttsRes.ok) return;
            const data = await ttsRes.json();
            b64 = data.audio as string;
            sessionStorage.setItem(cacheKey, b64);
          }

          const audio = new Audio(`data:audio/mp3;base64,${b64}`);
          audio.playbackRate = 1.0;
          await new Promise((resolve) => {
            audio.onended = resolve;
            audio.onerror = resolve;
            audio.play().catch(resolve);
          });
        } catch (e) {
          console.error("Auto-play error:", e);
        }
      });
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            // Architecture Note: Speculatively prefetches binary audio for all bolded vocabulary tokens into sessionStorage
            const boldMatches = assistantMessage.match(/\*\*([\u4e00-\u9fff]+)\*\*/g);
            if (boldMatches) {
              const uniqueTokens = Array.from(new Set(boldMatches.map(m => m.replace(/\*\*/g, '').trim())));
              uniqueTokens.forEach(async (token) => {
                const cacheKey = `tts_cache_${settings.voice}_${settings.playbackRate}_${token}`;
                if (!sessionStorage.getItem(cacheKey)) {
                  try {
                    const prefetchRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tts`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ text: token, voice: settings.voice, rate: settings.playbackRate })
                    });
                    if (prefetchRes.ok) {
                      const data = await prefetchRes.json();
                      sessionStorage.setItem(cacheKey, data.audio);
                    }
                  } catch (e) {
                    // Fail silently on speculative background prefetch
                  }
                }
              });
            }

            if (settings.autoPlayZh) {
              const tail = assistantMessage.slice(lastScannedIndex);
              const tailMatch = tail.match(/[\u4e00-\u9fff]+/);
              if (tailMatch) queueAudio(tailMatch[0]);
            }
            break;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              assistantMessage += parsed.text;
              
              // Architecture Note: Auto-play queue scans exclusively for bolded vocabulary tokens to maintain cadence
              if (settings.autoPlayZh) {
                let unscanned = assistantMessage.slice(lastScannedIndex);
                let match = unscanned.match(/\*\*([\u4e00-\u9fff]+)\*\*/);
                
                while (match && match.index !== undefined) {
                  const phrase = match[1];
                  queueAudio(phrase);
                  lastScannedIndex += match.index + match[0].length;
                  unscanned = assistantMessage.slice(lastScannedIndex);
                  match = unscanned.match(/\*\*([\u4e00-\u9fff]+)\*\*/);
                }
              }
            }
            
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1].content = assistantMessage;
              return updated;
            });
          } catch (e) {
            // Ignore partial stream chunks
          }
        }
      }
    }
  } catch (error) {
    console.error("Chat error:", error);
  } finally {
    setIsStreaming(false);
  }
};


  const handleStartSession = () => {
    // 1. Execution lock to prevent double-firing race conditions
    if (onboardingComplete || isStreaming) return;
    
    const goal = selectedGoal === 'Other' ? customGoal : selectedGoal;
    if (!selectedLevel || !goal) return;

    setOnboardingComplete(true);
    const initialPrompt = `Hi! I am starting a session. My proficiency level is ${selectedLevel}, and my focus today is: ${goal}. Please introduce a tailored starting exercise.`;
    sendPayload(initialPrompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const prompt = input;
    setInput('');
    sendPayload(prompt);
  };

  return (
       <div className="flex justify-center h-screen bg-slate-900 md:py-6 overflow-hidden antialiased font-sans">
      <div className="flex flex-col h-full w-full max-w-2xl bg-surface-app md:rounded-3xl shadow-2xl md:border border-border-subtle overflow-hidden relative min-h-0">
        <header className="px-6 py-4 bg-surface-bubble/80 backdrop-blur-md border-b border-border-subtle sticky top-0 z-10 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={34} />
            <div className="flex flex-col">
              <span className="font-brand text-lg font-extrabold tracking-tight text-ink leading-none">
                Mandarin<span className="text-jade">Mentor</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-ink-muted">
                Taiwan Edition
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Architecture Note: Guard against empty string/null state rendering an orphaned border capsule when onboarding state is truthy. */}
            {onboardingComplete && Boolean(selectedLevel) && (
              <span className="text-xs bg-jade/10 text-jade border border-jade/20 px-3 py-1 rounded-full font-medium shadow-2xs">
                {selectedLevel}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl border border-border-subtle bg-surface-app text-ink hover:bg-border-subtle/50 transition-colors cursor-pointer"
              aria-label="Open settings"
            >
              <SlidersHorizontal className="w-5 h-5 text-ink-muted hover:text-ink" />
            </button>
          </div>
        </header>

      <main className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 bg-surface-app transition-colors">
        {/* Onboarding Wizard (Rendered before session starts) */}
        {!onboardingComplete && (
          <div className="bg-surface-bubble border border-border-subtle rounded-2xl p-6 shadow-sm space-y-6">
            <div>
            <h2 className="text-xl font-bold text-ink mb-1">
              <TTSPlayer text="歡迎" mode="inline" /> Welcome! Let's set up your session.
            </h2>
            <p className="text-sm text-ink-muted">Select your current level and what you want to practice today.</p>
          </div>

            {/* Step 1: Level Selection */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">1. Your Current Level</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'Beginner', desc: 'Pinyin, basic survival phrases' },
                  { id: 'Ordering Food', desc: 'Daily interactions, 7-11, taxis' },
                  { id: '我知道', desc: 'Conversational fluency, natural flow' }
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedLevel === lvl.id 
                        ? 'border-jade bg-jade/10 text-ink ring-2 ring-jade/20' 
                        : 'border-border-subtle hover:border-jade/40 bg-surface-app text-ink'
                    }`}
                  >
                    <div className="font-semibold text-sm">{lvl.id}</div>
                    <div className="text-xs text-ink-muted mt-0.5">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Goal Selection */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">2. Your Focus Today</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {[
                  'Real-World Scenario (Ordering, Shopping, Transit)',
                  'Grammar Mechanics (Particles: 了, 吧, 啦)',
                  'Sentence Polish (Sounding like a local)',
                  'Other'
                ].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setSelectedGoal(goal)}
                    className={`p-3 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer ${
                      selectedGoal === goal 
                        ? 'border-jade bg-jade/10 text-ink ring-2 ring-jade/20' 
                        : 'border-border-subtle hover:border-jade/40 bg-surface-app text-ink'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>

              {selectedGoal === 'Other' && (
                <input
                  type="text"
                  placeholder="Type your custom topic (e.g., Renting an apartment in Taichung)..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-surface-app p-3 text-sm text-ink placeholder-ink-muted focus:outline-none focus:border-jade"
                />
              )}
            </div>

            <button
              onClick={handleStartSession}
              disabled={!selectedLevel || !selectedGoal || (selectedGoal === 'Other' && !customGoal.trim())}
              className="w-full bg-jade text-white font-semibold py-3 rounded-xl hover:bg-jade-hover disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-5 h-5" /> Start Coaching Session
            </button>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-6 py-4 shadow-xs leading-[1.7] ${settings.fontSize} ${
              msg.role === 'user' 
                ? 'bg-jade text-white rounded-[18px_18px_4px_18px]' 
                : 'bg-surface-bubble border border-border-subtle text-ink rounded-[18px_18px_18px_4px]'
            }`}>
              {/* Architecture Note: Forces relative typography scaling for ruby annotations and expands line-height to prevent vertical text collision on mobile viewports. Ruby margin and wider tracking prevent pinyin characters from colliding over narrow Hanzi. */}
              <div className={`[&_ruby]:leading-loose [&_ruby]:mr-[0.15em] [&_rt]:text-[0.75em] [&_rt]:text-slate-400 [&_rt]:font-sans [&_rt]:tracking-widest ${!settings.showPinyin ? '[&_rt]:hidden' : ''}`}>
                 <ReactMarkdown
                   rehypePlugins={[rehypeRaw]}
                   // Architecture Note: Bypasses the AST TTS parser entirely for user messages to prevent UI collisions and STT execution against unsanitized client prompts.
                   components={msg.role === 'user' ? {} : {
                      // @ts-ignore - Architecture Note: Explicit custom HTML tag routing bypasses Markdown syntax collisions.
                      'tts-block': ({ children }: any) => {
                        // Architecture Note: Recursively extracts purely the Hanzi text (stripping <rt> pinyin nodes) from the HTML AST to feed the TTS block-level payload.
                        const extractHanzi = (nodes: React.ReactNode): string => {
                          let text = '';
                          React.Children.forEach(nodes, (node) => {
                            if (typeof node === 'string') {
                              text += node;
                            } else if (React.isValidElement(node) && node.type !== 'rt') {
                              text += extractHanzi((node as React.ReactElement<any>).props.children as React.ReactNode);
                            }
                          });
                          return text;
                        };
                        
                        // Architecture Note: Strips LLM whitespace and aggressively removes partial HTML tags (<ruby>, </rt>) that bleed into the string payload during active SSE streaming before the AST resolves.
                        const rawHanzi = extractHanzi(children)
                          .replace(/<[^>]*>?/gm, '')
                          .replace(/\s+/g, '');

                        return (
                          <TTSPlayer 
                            text={rawHanzi} 
                            voice={settings.voice} 
                            rate={settings.playbackRate}
                            mode="block"
                          >
                            {children}
                          </TTSPlayer>
                        );
                      },
                      // @ts-ignore
                      'tts-inline': ({ children }: any) => {
                        const extractHanzi = (nodes: React.ReactNode): string => {
                          let text = '';
                          React.Children.forEach(nodes, (node) => {
                            if (typeof node === 'string') {
                              text += node;
                            } else if (React.isValidElement(node) && node.type !== 'rt') {
                              text += extractHanzi((node as React.ReactElement<any>).props.children as React.ReactNode);
                            }
                          });
                          return text;
                        };
                      
                        const rawHanzi = extractHanzi(children)
                          .replace(/<[^>]*>?/gm, '')
                          .replace(/\s+/g, '');
                        
                        return (
                          <TTSPlayer
                            text={rawHanzi}
                            voice={settings.voice}
                            rate={settings.playbackRate}
                            mode="inline"
                          >
                            {children}
                          </TTSPlayer>
                        );
                      },
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                }}
              >
                {msg.role === 'assistant' ? sanitizePinyinLeak(msg.content) : msg.content}
              </ReactMarkdown>
            </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Persistent Chat Input */}
      <div className="p-4 bg-surface-bubble/95 backdrop-blur-md border-t border-border-subtle shadow-lg">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center w-full">
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-coral opacity-75 animate-ping pointer-events-none" />
            )}
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={(e) => {
                e.preventDefault();
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(50);
                }
                startRecording();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate([30, 50, 30]);
                }
                stopRecording();
              }}
              onContextMenu={(e) => e.preventDefault()}
              disabled={isTranscribing || !onboardingComplete}
              title="Hold to speak"
              aria-label="Hold to speak"
              className={`relative p-3 rounded-full transition-all select-none touch-none cursor-pointer ${
                isRecording
                  ? 'bg-coral text-white animate-pulse ring-4 ring-coral/30 ring-offset-1'
                  : 'bg-surface-app hover:bg-border-subtle/50 text-ink'
              } ${isTranscribing || !onboardingComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isTranscribing ? (
                <Loader2 className="w-5 h-5 animate-spin text-ink-muted" />
              ) : isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRecording 
                ? "Listening... Release when finished." 
                : isTranscribing 
                ? "Transcribing audio..." 
                : onboardingComplete 
                ? "Type or hold mic to speak..." 
                : "Select options above to begin..."
            }
            className={`flex-1 rounded-full border px-5 py-3 focus:outline-none transition-all shadow-inner text-sm ${
              isRecording 
                ? 'border-coral bg-coral/10 text-coral placeholder-coral focus:border-coral' 
                : 'border-border-subtle bg-surface-app text-ink placeholder-ink-muted focus:border-jade'
            }`}
            disabled={!onboardingComplete || isStreaming || isRecording || isTranscribing}
          />
          <button 
            type="submit" 
            disabled={!onboardingComplete || isStreaming || !input.trim()}
            className="bg-jade text-white p-3 rounded-full hover:bg-jade-hover disabled:opacity-50 transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
      </div>
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
      />
    </div>
  );
}