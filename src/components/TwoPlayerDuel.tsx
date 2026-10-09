import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStatus } from '../types/game';
import { soundController } from '../utils/audio';
import { Users, RotateCcw, Trophy, Zap, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const TwoPlayerDuel: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [lastWinner, setLastWinner] = useState<'p1' | 'p2' | null>(null);
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);
  const [matchWinner, setMatchWinner] = useState<'p1' | 'p2' | null>(null);
  const [faultMessage, setFaultMessage] = useState<string | null>(null);

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

  const startDuelRound = useCallback(() => {
    clearTimer();
    setStatus('waiting');
    setLastWinner(null);
    setLastReactionMs(null);
    setFaultMessage(null);
    soundController.playWaitingPing();

    const delay = Math.floor(Math.random() * 3000) + 1800;
    timeoutIdRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      setStatus('ready');
      soundController.playGreenCue();
    }, delay);
  }, [clearTimer]);

  const handlePlayerTrigger = useCallback(
    (player: 'p1' | 'p2') => {
      if (matchWinner) return;

      if (status === 'idle') {
        startDuelRound();
        return;
      }

      if (status === 'waiting') {
        // FALSE START by this player! The OTHER player gets the point!
        clearTimer();
        setStatus('result');
        soundController.playFalseStart();
        const opponent = player === 'p1' ? 'p2' : 'p1';
        setFaultMessage(
          `False start by Player ${player === 'p1' ? '1' : '2'}! Point to Player ${
            opponent === 'p1' ? '1' : '2'
          }.`
        );
        setLastWinner(opponent);

        const newScore = opponent === 'p1' ? p1Score + 1 : p2Score + 1;
        if (opponent === 'p1') {
          setP1Score(newScore);
          if (newScore >= 5) setMatchWinner('p1');
        } else {
          setP2Score(newScore);
          if (newScore >= 5) setMatchWinner('p2');
        }
        return;
      }

      if (status === 'ready') {
        // Successful reaction!
        const elapsed = Math.round(performance.now() - startTimeRef.current);
        setStatus('result');
        setLastWinner(player);
        setLastReactionMs(elapsed);
        soundController.playSuccessChime(elapsed);

        const newScore = player === 'p1' ? p1Score + 1 : p2Score + 1;
        if (player === 'p1') {
          setP1Score(newScore);
          if (newScore >= 5) {
            setMatchWinner('p1');
            try {
              confetti({ particleCount: 70, spread: 60 });
            } catch {}
          }
        } else {
          setP2Score(newScore);
          if (newScore >= 5) {
            setMatchWinner('p2');
            try {
              confetti({ particleCount: 70, spread: 60 });
            } catch {}
          }
        }
      } else if (status === 'result') {
        startDuelRound();
      }
    },
    [status, matchWinner, clearTimer, p1Score, p2Score, startDuelRound]
  );

  // Keyboard shortcut: Player 1 = Key 'A' or 'Q', Player 2 = Key 'L' or 'P'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'KeyQ') {
        e.preventDefault();
        handlePlayerTrigger('p1');
      } else if (e.code === 'KeyL' || e.code === 'KeyP') {
        e.preventDefault();
        handlePlayerTrigger('p2');
      } else if (e.code === 'Space' && (status === 'idle' || status === 'result')) {
        e.preventDefault();
        startDuelRound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayerTrigger, status, startDuelRound]);

  const resetMatch = () => {
    setP1Score(0);
    setP2Score(0);
    setMatchWinner(null);
    setLastWinner(null);
    setLastReactionMs(null);
    setStatus('idle');
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Duel Scoreboard */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 flex items-center justify-between">
        <div className="flex flex-col items-start">
          <div className="text-xs uppercase font-bold text-sky-400">Player 1 (Left)</div>
          <div className="text-3xl font-extrabold text-white font-mono-numbers">
            {p1Score} <span className="text-xs text-slate-500 font-sans">/ 5 pts</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Press 'A' or Tap Left</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Split-Screen Duel
          </div>
          <div className="text-xs text-emerald-400 font-medium">First to 5 Points</div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-xs uppercase font-bold text-indigo-400">Player 2 (Right)</div>
          <div className="text-3xl font-extrabold text-white font-mono-numbers">
            {p2Score} <span className="text-xs text-slate-500 font-sans">/ 5 pts</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Press 'L' or Tap Right</div>
        </div>
      </div>

      {matchWinner ? (
        /* Match Finished View */
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-xl animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
            <Trophy className="w-9 h-9" />
          </div>
          <h2 className="text-3xl font-black text-white font-display mb-1">
            Player {matchWinner === 'p1' ? '1' : '2'} Wins the Duel!
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Final Score: {p1Score} to {p2Score}
          </p>
          <button
            onClick={resetMatch}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rematch</span>
          </button>
        </div>
      ) : (
        /* Split-zone Interactive Screen */
        <div className="w-full max-w-2xl h-80 sm:h-96 grid grid-cols-2 gap-2 relative">
          {/* Player 1 Button Zone */}
          <div
            onPointerDown={(e) => {
              e.preventDefault();
              handlePlayerTrigger('p1');
            }}
            className={`rounded-2xl p-4 flex flex-col items-center justify-between cursor-pointer border-2 transition-all duration-100 ${
              status === 'ready'
                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                : status === 'waiting'
                ? 'bg-rose-950/70 border-rose-800/80 text-rose-200'
                : 'bg-slate-900 border-slate-700/80 hover:border-sky-500/50 text-slate-300'
            }`}
          >
            <div className="w-full flex items-center justify-between text-xs font-bold text-sky-400">
              <span>PLAYER 1</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800/80 rounded border border-slate-700 text-[10px]">
                KEY A
              </kbd>
            </div>
            <div className="text-center">
              {status === 'ready' ? (
                <div className="font-black text-3xl uppercase tracking-wider animate-bounce">
                  TAP NOW!
                </div>
              ) : status === 'waiting' ? (
                <div className="font-bold text-lg text-rose-300">Wait for Green...</div>
              ) : (
                <div className="font-semibold text-sm text-slate-400">Tap to start or react</div>
              )}
            </div>
            <div className="text-[11px] text-slate-500">Tap anywhere on left side</div>
          </div>

          {/* Player 2 Button Zone */}
          <div
            onPointerDown={(e) => {
              e.preventDefault();
              handlePlayerTrigger('p2');
            }}
            className={`rounded-2xl p-4 flex flex-col items-center justify-between cursor-pointer border-2 transition-all duration-100 ${
              status === 'ready'
                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                : status === 'waiting'
                ? 'bg-rose-950/70 border-rose-800/80 text-rose-200'
                : 'bg-slate-900 border-slate-700/80 hover:border-indigo-500/50 text-slate-300'
            }`}
          >
            <div className="w-full flex items-center justify-between text-xs font-bold text-indigo-400">
              <span>PLAYER 2</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800/80 rounded border border-slate-700 text-[10px]">
                KEY L
              </kbd>
            </div>
            <div className="text-center">
              {status === 'ready' ? (
                <div className="font-black text-3xl uppercase tracking-wider animate-bounce">
                  TAP NOW!
                </div>
              ) : status === 'waiting' ? (
                <div className="font-bold text-lg text-rose-300">Wait for Green...</div>
              ) : (
                <div className="font-semibold text-sm text-slate-400">Tap to start or react</div>
              )}
            </div>
            <div className="text-[11px] text-slate-500">Tap anywhere on right side</div>
          </div>

          {/* Central Overlay Indicator for Round Outcome */}
          {status === 'result' && (
            <div className="absolute inset-0 m-auto w-72 h-36 bg-slate-950/95 border border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-2xl z-20 animate-fadeIn pointer-events-none">
              {faultMessage ? (
                <>
                  <AlertCircle className="w-5 h-5 text-rose-400 mb-1" />
                  <div className="text-xs text-rose-300 font-semibold mb-2">{faultMessage}</div>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-emerald-400 mb-1" />
                  <div className="text-sm font-bold text-white mb-0.5">
                    Player {lastWinner === 'p1' ? '1' : '2'} Reacted First!
                  </div>
                  {lastReactionMs !== null && (
                    <div className="text-xs font-mono text-emerald-400 font-bold mb-2">
                      {lastReactionMs}ms
                    </div>
                  )}
                </>
              )}
              <div className="text-[11px] text-slate-400 font-medium">
                Tap either side for next round
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
