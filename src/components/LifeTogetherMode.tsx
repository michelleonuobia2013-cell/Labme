import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TogetherScenario, GameStatus, PlayerStats, TogetherSubMode, CharacterProfile } from '../types/game';
import { TOGETHER_SCENARIOS } from '../data/togetherScenarios';
import { soundController } from '../utils/audio';
import { recordTogetherSyncOutcome, recordReactionAttempt } from '../utils/storage';
import { CharacterSpeechBubble } from './CharacterSpeechBubble';
import {
  Heart,
  Coffee,
  MessageSquareHeart,
  Pizza,
  Hand,
  Home,
  Moon,
  Utensils,
  Users,
  User,
  Sparkles,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LifeTogetherModeProps {
  stats: PlayerStats;
  onStatsUpdated: (newStats: PlayerStats) => void;
  character: CharacterProfile;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Coffee: <Coffee className="w-5 h-5" />,
  MessageSquareHeart: <MessageSquareHeart className="w-5 h-5" />,
  Pizza: <Pizza className="w-5 h-5" />,
  Hand: <Hand className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Moon: <Moon className="w-5 h-5" />,
  Utensils: <Utensils className="w-5 h-5" />,
};

function calculateHarmony(deltaMs: number): { percent: number; label: string; color: string } {
  if (deltaMs <= 50) return { percent: 100, label: 'Telepathic Soulmates! 💖', color: 'text-rose-400' };
  if (deltaMs <= 110) return { percent: 92, label: 'Deep Chemistry ✨', color: 'text-pink-400' };
  if (deltaMs <= 190) return { percent: 80, label: 'In Sync! 💕', color: 'text-purple-400' };
  if (deltaMs <= 300) return { percent: 65, label: 'Good Rhythm 🙂', color: 'text-indigo-400' };
  return { percent: 45, label: 'Love Lag Detected! 🙈', color: 'text-slate-400' };
}

export const LifeTogetherMode: React.FC<LifeTogetherModeProps> = ({ stats, onStatsUpdated, character }) => {
  const [subMode, setSubMode] = useState<TogetherSubMode>('coop');
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  const [status, setStatus] = useState<GameStatus>('idle');

  // Co-op reaction timing state
  const [p1PressedAt, setP1PressedAt] = useState<number | null>(null);
  const [p2PressedAt, setP2PressedAt] = useState<number | null>(null);
  const [p1Ms, setP1Ms] = useState<number | null>(null);
  const [p2Ms, setP2Ms] = useState<number | null>(null);
  const [syncDeltaMs, setSyncDeltaMs] = useState<number | null>(null);
  const [earlyPartner, setEarlyPartner] = useState<'p1' | 'p2' | null>(null);

  // Solo reaction state
  const [soloMs, setSoloMs] = useState<number | null>(null);

  const scenario = TOGETHER_SCENARIOS[scenarioIndex % TOGETHER_SCENARIOS.length];
  const startTimeRef = useRef<number>(0);
  const timeoutIdRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const startTogetherRound = useCallback(() => {
    clearTimer();
    setStatus('waiting');
    setP1PressedAt(null);
    setP2PressedAt(null);
    setP1Ms(null);
    setP2Ms(null);
    setSyncDeltaMs(null);
    setEarlyPartner(null);
    setSoloMs(null);
    soundController.playWaitingPing();

    const delay = Math.floor(Math.random() * 2600) + 1800;
    timeoutIdRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      setStatus('ready');
      soundController.playGreenCue();
    }, delay);
  }, [clearTimer]);

  // Handle Partner 1 (Left) or Solo press
  const handlePartner1Trigger = useCallback(() => {
    if (status === 'idle') {
      startTogetherRound();
      return;
    }

    if (status === 'waiting') {
      clearTimer();
      setStatus('false_start');
      setEarlyPartner('p1');
      soundController.playFalseStart();
      return;
    }

    if (status === 'ready') {
      const now = performance.now();
      const elapsed = Math.round(now - startTimeRef.current);

      if (subMode === 'solo') {
        setSoloMs(elapsed);
        setStatus('result');
        soundController.playSuccessChime(elapsed);
        const updated = recordReactionAttempt(
          stats,
          {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: Date.now(),
            timeMs: elapsed,
            mode: 'together',
            ratingLabel: `${scenario.title} (${elapsed}ms)`,
            scenarioTitle: scenario.title,
          },
          elapsed <= 300
        );
        onStatsUpdated(updated);
        return;
      }

      // In co-op mode: record P1 time
      setP1PressedAt(now);
      setP1Ms(elapsed);

      if (p2PressedAt !== null) {
        // Both have now clicked!
        const delta = Math.abs(Math.round(now - p2PressedAt));
        setSyncDeltaMs(delta);
        setStatus('result');
        soundController.playLevelSuccess();

        const updated = recordTogetherSyncOutcome(stats, delta);
        onStatsUpdated(updated);

        if (delta <= 110) {
          try {
            confetti({
              particleCount: 60,
              spread: 60,
              colors: ['#f43f5e', '#ec4899', '#a855f7'],
            });
          } catch {}
        }
      }
    } else if (status === 'result' || status === 'false_start') {
      setScenarioIndex((idx) => (idx + 1) % TOGETHER_SCENARIOS.length);
      startTogetherRound();
    }
  }, [
    status,
    clearTimer,
    startTogetherRound,
    subMode,
    p2PressedAt,
    stats,
    onStatsUpdated,
    scenario,
  ]);

  // Handle Partner 2 (Right) press
  const handlePartner2Trigger = useCallback(() => {
    if (subMode === 'solo') return;

    if (status === 'idle') {
      startTogetherRound();
      return;
    }

    if (status === 'waiting') {
      clearTimer();
      setStatus('false_start');
      setEarlyPartner('p2');
      soundController.playFalseStart();
      return;
    }

    if (status === 'ready') {
      const now = performance.now();
      const elapsed = Math.round(now - startTimeRef.current);

      setP2PressedAt(now);
      setP2Ms(elapsed);

      if (p1PressedAt !== null) {
        // Both have now clicked!
        const delta = Math.abs(Math.round(now - p1PressedAt));
        setSyncDeltaMs(delta);
        setStatus('result');
        soundController.playLevelSuccess();

        const updated = recordTogetherSyncOutcome(stats, delta);
        onStatsUpdated(updated);

        if (delta <= 110) {
          try {
            confetti({
              particleCount: 60,
              spread: 60,
              colors: ['#f43f5e', '#ec4899', '#a855f7'],
            });
          } catch {}
        }
      }
    } else if (status === 'result' || status === 'false_start') {
      setScenarioIndex((idx) => (idx + 1) % TOGETHER_SCENARIOS.length);
      startTogetherRound();
    }
  }, [
    subMode,
    status,
    clearTimer,
    startTogetherRound,
    p1PressedAt,
    stats,
    onStatsUpdated,
  ]);

  // Keyboard controls: Key A (Partner 1), Key L (Partner 2), Spacebar (Solo/Start)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'KeyQ') {
        e.preventDefault();
        handlePartner1Trigger();
      } else if (e.code === 'KeyL' || e.code === 'KeyP') {
        e.preventDefault();
        handlePartner2Trigger();
      } else if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (subMode === 'solo') {
          handlePartner1Trigger();
        } else if (status === 'idle' || status === 'result' || status === 'false_start') {
          startTogetherRound();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePartner1Trigger, handlePartner2Trigger, subMode, status, startTogetherRound]);

  const harmony = syncDeltaMs !== null ? calculateHarmony(syncDeltaMs) : null;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Mode Sub-Navigation Toggle */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setSubMode('coop');
              setStatus('idle');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              subMode === 'coop'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2-Player Co-op Sync</span>
          </button>
          <button
            onClick={() => {
              setSubMode('solo');
              setStatus('idle');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              subMode === 'solo'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Single-Player Rhythm</span>
          </button>
        </div>

        {/* Couple Harmony Stats */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">Best Sync Delta:</span>
          <span className="font-mono-numbers font-bold text-rose-400 bg-slate-800 px-2 py-0.5 rounded">
            {stats.togetherBestSyncDelta !== null ? `${stats.togetherBestSyncDelta}ms` : '—'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">Rounds: {stats.togetherTotalCouplesRounds}</span>
        </div>
      </div>

      {/* Scenario Header with Artwork */}
      <div className="w-full relative rounded-2xl overflow-hidden border border-slate-800 mb-4 bg-slate-900 shadow-xl">
        <img
          src="/src/assets/images/life_together_banner_1791545234417.jpg"
          alt="Life Together Couple Illustration"
          className="w-full h-36 sm:h-44 object-cover object-center opacity-40 mix-blend-luminosity hover:opacity-60 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-4 sm:p-6 flex flex-col justify-end">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
              {ICON_MAP[scenario.iconName] || <Heart className="w-4 h-4" />}
              <span>
                Scenario {(scenarioIndex % TOGETHER_SCENARIOS.length) + 1} of {TOGETHER_SCENARIOS.length}
              </span>
            </div>
            <button
              onClick={() => {
                setScenarioIndex((idx) => (idx + 1) % TOGETHER_SCENARIOS.length);
                setStatus('idle');
              }}
              className="text-xs text-slate-400 hover:text-white underline transition-colors"
            >
              Next Scenario →
            </button>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            {scenario.title}
          </h2>
        </div>
      </div>

      {/* Live Character Speech Bubble */}
      <CharacterSpeechBubble character={character} status={status} />

      {/* Interactive Play Arena */}
      {subMode === 'solo' ? (
        /* SOLO PLAYER MODE */
        <div
          onPointerDown={(e) => {
            e.preventDefault();
            handlePartner1Trigger();
          }}
          className={`w-full min-h-[320px] rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-150 relative overflow-hidden select-none shadow-2xl ${
            status === 'idle'
              ? 'bg-slate-900 border-2 border-slate-700 hover:border-rose-400/70'
              : status === 'waiting'
              ? 'bg-rose-950/90 border-2 border-rose-600'
              : status === 'ready'
              ? 'bg-emerald-500 border-2 border-emerald-200 text-slate-950 shadow-emerald-500/30'
              : status === 'false_start'
              ? 'bg-rose-950 border-2 border-rose-600'
              : 'bg-slate-900 border-2 border-slate-700'
          }`}
        >
          {status === 'idle' && (
            <div className="flex flex-col items-center max-w-md animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
                {ICON_MAP[scenario.iconName] || <Heart className="w-7 h-7" />}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Relationship Reflex Challenge
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {scenario.waitingContext}
              </p>
              <div className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2">
                <Heart className="w-4 h-4 fill-current" />
                <span>Start Moment · Spacebar / Click</span>
              </div>
            </div>
          )}

          {status === 'waiting' && (
            <div className="flex flex-col items-center max-w-md">
              <div className="w-12 h-12 rounded-full border-2 border-rose-400 border-t-transparent animate-spin mb-4" />
              <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-200 mb-2">
                Anticipating the Moment...
              </h3>
              <p className="text-rose-100/90 text-sm italic leading-relaxed">
                "{scenario.waitingContext}"
              </p>
            </div>
          )}

          {status === 'ready' && (
            <div className="flex flex-col items-center max-w-lg">
              <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mb-4 shadow-lg animate-bounce">
                <Sparkles className="w-10 h-10 fill-current" />
              </div>
              <h3 className="text-3xl sm:text-5xl font-black text-slate-950 uppercase tracking-tight font-display">
                {scenario.actionPrompt}
              </h3>
              <div className="mt-3 font-bold text-lg text-slate-900">
                CLICK OR HIT SPACEBAR NOW!
              </div>
            </div>
          )}

          {status === 'false_start' && (
            <div className="flex flex-col items-center max-w-md animate-shake">
              <AlertCircle className="w-14 h-14 text-rose-400 mb-3" />
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display mb-2">
                Too Eager! Early Click!
              </h3>
              <p className="text-rose-200 text-sm leading-relaxed mb-6">
                {scenario.earlyText}
              </p>
              <div className="px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl shadow-md">
                Try Moment Again
              </div>
            </div>
          )}

          {status === 'result' && soloMs !== null && (
            <div className="flex flex-col items-center max-w-md animate-fadeIn">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
              <div className="text-4xl sm:text-6xl font-black text-white font-mono-numbers my-1">
                {soloMs}
                <span className="text-2xl text-slate-400 ml-1">ms</span>
              </div>
              <div className="text-sm font-semibold text-rose-300 mb-3">
                {scenario.coopHarmonyTitle}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-5">
                {scenario.successText}
              </p>
              <div className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl shadow-md transition-all">
                Next Couple Scenario
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 2-PLAYER CO-OP SIDE-BY-SIDE SYNC MODE */
        <div className="w-full flex flex-col items-center">
          <div className="w-full h-80 sm:h-96 grid grid-cols-2 gap-3 relative select-none">
            {/* PARTNER 1 (LEFT) */}
            <div
              onPointerDown={(e) => {
                e.preventDefault();
                handlePartner1Trigger();
              }}
              className={`rounded-2xl p-4 flex flex-col items-center justify-between cursor-pointer border-2 transition-all duration-100 ${
                p1PressedAt !== null
                  ? 'bg-rose-900/60 border-rose-400 text-white'
                  : status === 'ready'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-200'
                  : status === 'waiting'
                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                  : 'bg-slate-900 border-slate-800 hover:border-rose-400/60 text-slate-300'
              }`}
            >
              <div className="w-full flex items-center justify-between text-xs font-bold text-rose-400">
                <span>PARTNER 1</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800/80 rounded border border-slate-700 text-[10px]">
                  KEY A
                </kbd>
              </div>

              <div className="text-center">
                {p1PressedAt !== null ? (
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono-numbers">
                      {p1Ms}ms
                    </div>
                    <div className="text-xs text-rose-200 font-medium mt-1">Locked in! Waiting for Partner 2...</div>
                  </div>
                ) : status === 'ready' ? (
                  <div className="font-black text-2xl sm:text-3xl uppercase tracking-wider animate-bounce">
                    CLICK NOW!
                  </div>
                ) : status === 'waiting' ? (
                  <div className="font-bold text-sm text-slate-400">Wait for Green...</div>
                ) : (
                  <div className="font-semibold text-xs sm:text-sm text-slate-400">
                    Tap or Press 'A' to Start
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500">Left Side Screen / Key A</div>
            </div>

            {/* PARTNER 2 (RIGHT) */}
            <div
              onPointerDown={(e) => {
                e.preventDefault();
                handlePartner2Trigger();
              }}
              className={`rounded-2xl p-4 flex flex-col items-center justify-between cursor-pointer border-2 transition-all duration-100 ${
                p2PressedAt !== null
                  ? 'bg-purple-900/60 border-purple-400 text-white'
                  : status === 'ready'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-200'
                  : status === 'waiting'
                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                  : 'bg-slate-900 border-slate-800 hover:border-purple-400/60 text-slate-300'
              }`}
            >
              <div className="w-full flex items-center justify-between text-xs font-bold text-purple-400">
                <span>PARTNER 2</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800/80 rounded border border-slate-700 text-[10px]">
                  KEY L
                </kbd>
              </div>

              <div className="text-center">
                {p2PressedAt !== null ? (
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono-numbers">
                      {p2Ms}ms
                    </div>
                    <div className="text-xs text-purple-200 font-medium mt-1">Locked in! Waiting for Partner 1...</div>
                  </div>
                ) : status === 'ready' ? (
                  <div className="font-black text-2xl sm:text-3xl uppercase tracking-wider animate-bounce">
                    CLICK NOW!
                  </div>
                ) : status === 'waiting' ? (
                  <div className="font-bold text-sm text-slate-400">Wait for Green...</div>
                ) : (
                  <div className="font-semibold text-xs sm:text-sm text-slate-400">
                    Tap or Press 'L' to Start
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500">Right Side Screen / Key L</div>
            </div>

            {/* Central Overlay for Co-op Result */}
            {status === 'result' && harmony && syncDeltaMs !== null && (
              <div className="absolute inset-0 m-auto w-80 sm:w-96 bg-slate-950/95 border border-slate-700 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-2xl z-20 animate-fadeIn pointer-events-none">
                <Heart className="w-7 h-7 text-rose-500 fill-current mb-1" />
                <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Sync Delta Difference
                </div>
                <div className="text-4xl font-black text-white font-mono-numbers my-0.5">
                  {syncDeltaMs}
                  <span className="text-xl text-slate-400 ml-1">ms</span>
                </div>
                <div className={`text-base font-bold ${harmony.color} mb-1`}>
                  {harmony.label} ({harmony.percent}% Harmony)
                </div>
                <p className="text-xs text-slate-300 mb-3 px-2">
                  {scenario.successText}
                </p>
                <div className="text-[11px] text-slate-400 font-medium bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  Tap either side or Spacebar for next scenario
                </div>
              </div>
            )}

            {/* Central Overlay for False Start */}
            {status === 'false_start' && (
              <div className="absolute inset-0 m-auto w-80 sm:w-96 bg-slate-950/95 border border-rose-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-2xl z-20 animate-fadeIn pointer-events-none">
                <AlertCircle className="w-7 h-7 text-rose-400 mb-1" />
                <div className="text-base font-bold text-white mb-1">
                  False Start by Partner {earlyPartner === 'p1' ? '1' : '2'}!
                </div>
                <p className="text-xs text-rose-200 mb-3 px-2">
                  {scenario.earlyText}
                </p>
                <div className="text-[11px] text-slate-400 font-medium bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  Tap either side to retry
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
