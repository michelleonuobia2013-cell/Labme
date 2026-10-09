import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameStatus } from '../types/game';
import { getRatingTier } from '../utils/ratings';
import { soundController } from '../utils/audio';
import { Zap, AlertTriangle, Play, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReactionAreaProps {
  onSuccessReaction: (timeMs: number) => void;
  onFalseStart: () => void;
  bestTimeMs: number | null;
  modeLabel?: string;
  roundIndicator?: string;
}

export const ReactionArea: React.FC<ReactionAreaProps> = ({
  onSuccessReaction,
  onFalseStart,
  bestTimeMs,
  modeLabel,
  roundIndicator,
}) => {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [lastTimeMs, setLastTimeMs] = useState<number | null>(null);
  const [falseStartCount, setFalseStartCount] = useState<number>(0);

  const startTimeRef = useRef<number>(0);
  const timeoutIdRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clear pending timers safely
  const clearPendingTimer = useCallback(() => {
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPendingTimer();
    };
  }, [clearPendingTimer]);

  const startWaitingRound = useCallback(() => {
    clearPendingTimer();
    setStatus('waiting');
    soundController.playWaitingPing();

    // Random unpredictable delay between 1.8s and 5.0s
    const delay = Math.floor(Math.random() * 3200) + 1800;

    timeoutIdRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      setStatus('ready');
      soundController.playGreenCue();
    }, delay);
  }, [clearPendingTimer]);

  const handlePointerOrKeyPress = useCallback(() => {
    if (status === 'idle') {
      startWaitingRound();
    } else if (status === 'waiting') {
      // FALSE START!
      clearPendingTimer();
      setStatus('false_start');
      setFalseStartCount((c) => c + 1);
      soundController.playFalseStart();
      onFalseStart();
    } else if (status === 'ready') {
      // SUCCESSFUL REACTION!
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTimeRef.current);
      setLastTimeMs(elapsed);
      setStatus('result');

      soundController.playSuccessChime(elapsed);

      // Celebrate especially impressive times (<200ms) or new personal best
      if (elapsed < 200 || (bestTimeMs !== null && elapsed < bestTimeMs)) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b'],
          });
        } catch {
          // Ignore
        }
      }

      onSuccessReaction(elapsed);
    } else if (status === 'result' || status === 'false_start') {
      // Restart next attempt
      startWaitingRound();
    }
  }, [status, startWaitingRound, clearPendingTimer, onFalseStart, bestTimeMs, onSuccessReaction]);

  // Global spacebar listener for gaming reflex accuracy
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        // Prevent default page scroll
        e.preventDefault();
        handlePointerOrKeyPress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePointerOrKeyPress]);

  const tier = lastTimeMs !== null ? getRatingTier(lastTimeMs) : null;
  const deltaVsAverage = lastTimeMs !== null ? 250 - lastTimeMs : null;

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Top contextual indicator */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
        <div className="flex items-center gap-2">
          {modeLabel && (
            <span className="font-semibold text-slate-300 uppercase tracking-wide">
              {modeLabel}
            </span>
          )}
          {roundIndicator && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 font-mono-numbers font-medium">
                {roundIndicator}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {bestTimeMs !== null && (
            <span className="text-slate-400">
              Best:{' '}
              <span className="text-amber-400 font-mono-numbers font-semibold">
                {bestTimeMs}ms
              </span>
            </span>
          )}
          <span className="text-slate-500 hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 text-[10px] font-mono">SPACEBAR</kbd> or click
          </span>
        </div>
      </div>

      {/* Main Interactive Button / Box */}
      <div
        ref={containerRef}
        onPointerDown={(e) => {
          // Use onPointerDown for fastest sub-millisecond response time
          e.preventDefault();
          handlePointerOrKeyPress();
        }}
        className={`w-full h-80 sm:h-96 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-150 relative overflow-hidden shadow-xl ${
          status === 'idle'
            ? 'bg-slate-900 border-2 border-slate-700 hover:border-emerald-500/60 hover:bg-slate-850'
            : status === 'waiting'
            ? 'bg-rose-950 border-2 border-rose-600/80'
            : status === 'ready'
            ? 'bg-emerald-500 border-2 border-emerald-300 text-slate-950 shadow-emerald-500/30'
            : status === 'false_start'
            ? 'bg-red-900 border-2 border-red-500'
            : 'bg-slate-900 border-2 border-slate-700'
        }`}
      >
        {/* State: IDLE */}
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center max-w-md animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 shadow-inner">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mb-2">
              Click to Start
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
              The screen will turn red. When it turns{' '}
              <strong className="text-emerald-400 font-semibold">GREEN</strong>, click
              or press Spacebar as fast as you can.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md">
              <Play className="w-4 h-4 fill-current" />
              <span>Ready · Click to Begin</span>
            </div>
          </div>
        )}

        {/* State: WAITING FOR GREEN */}
        {status === 'waiting' && (
          <div className="flex flex-col items-center justify-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-rose-900/60 border border-rose-500/40 flex items-center justify-center text-rose-300 mb-5 animate-pulse">
              <span className="w-6 h-6 rounded-full bg-rose-500"></span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-3 tracking-wide">
              Wait for Green...
            </h2>
            <p className="text-rose-200/80 text-sm">
              Keep your finger steady. Do not click early!
            </p>
          </div>
        )}

        {/* State: READY (GREEN TRIGGER!) */}
        {status === 'ready' && (
          <div className="flex flex-col items-center justify-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-white text-emerald-600 flex items-center justify-center mb-4 shadow-lg animate-bounce">
              <Zap className="w-12 h-12 fill-current" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-slate-950 font-display tracking-tight uppercase">
              CLICK NOW!
            </h2>
            <p className="text-slate-900 font-semibold text-lg sm:text-xl mt-2">
              Press anywhere or hit Spacebar!
            </p>
          </div>
        )}

        {/* State: FALSE START */}
        {status === 'false_start' && (
          <div className="flex flex-col items-center justify-center max-w-md animate-shake">
            <div className="w-16 h-16 rounded-2xl bg-red-800/80 border border-red-400/50 flex items-center justify-center text-red-200 mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-2">
              Too Soon!
            </h2>
            <p className="text-red-200 text-sm sm:text-base mb-6">
              You clicked before it turned green. Take a deep breath and wait for the signal.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl shadow-md hover:bg-slate-100 transition-colors">
              <RotateCcw className="w-4 h-4" />
              <span>Click to Try Again</span>
            </div>
          </div>
        )}

        {/* State: RESULT */}
        {status === 'result' && lastTimeMs !== null && tier && (
          <div className="flex flex-col items-center justify-center max-w-md animate-fadeIn">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${tier.bgClass} ${tier.colorClass}`}>
                {tier.grade} Tier · {tier.percentile}
              </span>
            </div>

            {/* Giant Reaction Time */}
            <div className="my-2">
              <span className="text-5xl sm:text-7xl font-black text-white font-mono-numbers tracking-tight">
                {lastTimeMs}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-slate-400 ml-2">ms</span>
            </div>

            <h3 className={`text-xl sm:text-2xl font-bold font-display ${tier.colorClass} mb-1`}>
              {tier.label}
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm max-w-xs mb-4">
              {tier.description}
            </p>

            {/* Delta vs Human Average */}
            {deltaVsAverage !== null && (
              <div className="text-xs text-slate-400 mb-5">
                {deltaVsAverage > 0 ? (
                  <span className="text-emerald-400 font-medium">
                    ⚡ {deltaVsAverage}ms faster than human average (250ms)
                  </span>
                ) : deltaVsAverage < 0 ? (
                  <span className="text-slate-400">
                    {Math.abs(deltaVsAverage)}ms off human average (250ms)
                  </span>
                ) : (
                  <span>Exactly on average human benchmark (250ms)</span>
                )}
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-md transition-all">
              <RotateCcw className="w-4 h-4" />
              <span>Click or Spacebar for Next Round</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
