import React, { useState } from 'react';
import { ReactionArea } from './ReactionArea';
import { Heart, Flame, ShieldAlert, RotateCcw, Trophy } from 'lucide-react';
import { soundController } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SurvivalModeProps {
  onGameOver: (maxLevelReached: number) => void;
  bestLevel: number;
}

const LEVEL_CUTOFFS = [
  450, // Lvl 1
  400, // Lvl 2
  360, // Lvl 3
  320, // Lvl 4
  290, // Lvl 5
  265, // Lvl 6
  245, // Lvl 7
  225, // Lvl 8
  205, // Lvl 9
  185, // Lvl 10
  170, // Lvl 11
  155, // Lvl 12 (Godlike)
];

export const SurvivalMode: React.FC<SurvivalModeProps> = ({ onGameOver, bestLevel }) => {
  const [level, setLevel] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const currentCutoff =
    LEVEL_CUTOFFS[Math.min(level - 1, LEVEL_CUTOFFS.length - 1)];

  const handleSuccessReaction = (timeMs: number) => {
    if (timeMs <= currentCutoff) {
      // Level cleared!
      soundController.playLevelSuccess();
      const nextLvl = level + 1;
      setLevel(nextLvl);
      setLastFeedback(`Passed! ${timeMs}ms is under ${currentCutoff}ms limit.`);

      if (nextLvl > bestLevel && nextLvl > 5) {
        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.6 },
          });
        } catch {
          // Ignore
        }
      }
    } else {
      // Too slow for cutoff!
      const remainingLives = lives - 1;
      setLives(remainingLives);
      setLastFeedback(`Too slow! ${timeMs}ms exceeded ${currentCutoff}ms cutoff.`);

      if (remainingLives <= 0) {
        setIsGameOver(true);
        onGameOver(level);
      }
    }
  };

  const handleFalseStart = () => {
    const remainingLives = lives - 1;
    setLives(remainingLives);
    setLastFeedback(`False start! Clicked before green light. Lost 1 life.`);

    if (remainingLives <= 0) {
      setIsGameOver(true);
      onGameOver(level);
    }
  };

  const handleRestart = () => {
    setLevel(1);
    setLives(3);
    setIsGameOver(false);
    setLastFeedback(null);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Survival HUD */}
      <div className="w-full max-w-xl flex items-center justify-between gap-2 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-white font-display">
            Level {level}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-amber-400 font-mono-numbers font-medium">
            Cutoff: &lt;{currentCutoff}ms
          </span>
        </div>

        {/* Lives Counter */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((heartIndex) => (
            <Heart
              key={heartIndex}
              className={`w-5 h-5 transition-transform ${
                heartIndex <= lives
                  ? 'text-rose-500 fill-rose-500 scale-100'
                  : 'text-slate-700 scale-90'
              }`}
            />
          ))}
        </div>
      </div>

      {lastFeedback && !isGameOver && (
        <div className="text-xs font-medium text-slate-300 mb-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-md">
          {lastFeedback}
        </div>
      )}

      {!isGameOver ? (
        <ReactionArea
          onSuccessReaction={handleSuccessReaction}
          onFalseStart={handleFalseStart}
          bestTimeMs={null}
          modeLabel={`Speed Gate — Level ${level}`}
          roundIndicator={`Cutoff: <${currentCutoff}ms`}
        />
      ) : (
        /* Game Over Screen */
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-1">
            Elimination
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-1">
            Game Over
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            You reached <strong className="text-amber-400 font-bold">Level {level}</strong> before running out of lives.
          </p>

          <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="text-xs text-slate-400 uppercase font-medium">This Run</div>
              <div className="text-2xl font-bold text-white mt-1">Level {level}</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="text-xs text-slate-400 uppercase font-medium">Record Level</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                Level {Math.max(level, bestLevel)}
              </div>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Speed Gate Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
