import { useCallback, useState, useEffect, createContext, useContext, ReactNode } from 'react';

let audioContext: AudioContext | null = null;
let globalVolume = 0.3;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function setGlobalVolume(volume: number) {
  globalVolume = Math.max(0, Math.min(1, volume));
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Apply global volume scaling
  const scaledVolume = volume * globalVolume;
  gainNode.gain.setValueAtTime(scaledVolume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration / 1000);
}

export function playSuccess() {
  // Ensure audio context is initialized
  getAudioContext();

  // Happy ascending chord C5-E5-G5 to E5-G5-C6
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 150, 'sine', 0.2), i * 50);
  });
  setTimeout(() => {
    [659.25, 783.99, 1046.5].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 200, 'sine', 0.15), i * 30);
    });
  }, 150);
}

export function playClick() {
  playTone(800, 50, 'square', 0.1);
}

export function playNotification() {
  playTone(880, 100, 'sine', 0.2);
  setTimeout(() => playTone(1100, 150, 'sine', 0.15), 100);
}

export function playWarning() {
  // Two-tone descending alert
  playTone(660, 100, 'triangle', 0.2);
  setTimeout(() => playTone(440, 150, 'triangle', 0.18), 120);
}

export function playTyping() {
  // Short keyboard click sound
  playTone(1200, 20, 'square', 0.05);
}

export function playError() {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(200, ctx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const scaledVolume = 0.2 * globalVolume;
  gainNode.gain.setValueAtTime(scaledVolume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.3);
}

// Context for global sound state
interface SoundContextValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  playSuccess: () => void;
  playClick: () => void;
  playNotification: () => void;
  playWarning: () => void;
  playTyping: () => void;
  playError: () => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

interface SoundProviderProps {
  children: ReactNode;
  volume?: number;
}

export function SoundProvider({ children, volume = 0.3 }: SoundProviderProps) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('demoscript-sound-enabled');
      return stored !== 'false';
    }
    return true;
  });

  // Update global volume when prop changes
  useEffect(() => {
    setGlobalVolume(volume);
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('demoscript-sound-enabled', String(enabled));
  }, [enabled]);

  const wrappedPlaySuccess = useCallback(() => {
    if (enabled) playSuccess();
  }, [enabled]);

  const wrappedPlayClick = useCallback(() => {
    if (enabled) playClick();
  }, [enabled]);

  const wrappedPlayNotification = useCallback(() => {
    if (enabled) playNotification();
  }, [enabled]);

  const wrappedPlayWarning = useCallback(() => {
    if (enabled) playWarning();
  }, [enabled]);

  const wrappedPlayTyping = useCallback(() => {
    if (enabled) playTyping();
  }, [enabled]);

  const wrappedPlayError = useCallback(() => {
    if (enabled) playError();
  }, [enabled]);

  return (
    <SoundContext.Provider
      value={{
        enabled,
        setEnabled,
        playSuccess: wrappedPlaySuccess,
        playClick: wrappedPlayClick,
        playNotification: wrappedPlayNotification,
        playWarning: wrappedPlayWarning,
        playTyping: wrappedPlayTyping,
        playError: wrappedPlayError,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundEffects() {
  const context = useContext(SoundContext);
  if (!context) {
    // Return no-op functions if not in provider
    return {
      enabled: false,
      setEnabled: () => {},
      playSuccess: () => {},
      playClick: () => {},
      playNotification: () => {},
      playWarning: () => {},
      playTyping: () => {},
      playError: () => {},
    };
  }
  return context;
}

export function SoundToggle() {
  const { enabled, setEnabled, playClick } = useSoundEffects();

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    if (newEnabled) {
      playClick();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
        enabled
          ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400'
          : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
      }`}
      title={enabled ? 'Sound enabled' : 'Sound disabled'}
    >
      {enabled ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
          />
        </svg>
      )}
    </button>
  );
}
