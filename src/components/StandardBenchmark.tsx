import React, { useState } from 'react';
import { ReactionArea } from './ReactionArea';
import { calculateStats, getRatingTier } from '../utils/ratings';
import { BenchmarkResult } from '../types/game';
import { Award, RotateCcw, Share2, Check, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StandardBenchmarkProps {
  onBenchmarkComplete: (result: BenchmarkResult) => void;
  bestBenchmarkMs: number | null;
}

export const StandardBenchmark: React.FC<StandardBenchmarkProps> = ({
  onBenchmarkComplete,
  bestBenchmarkMs,
}) => {
  const [trials, setTrials] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSuccessReaction = (timeMs: number) => {
    const updated = [...trials, timeMs];
    setTrials(updated);

    if (updated.length >= 5) {
      // 5-trial benchmark finished!
      const stats = calculateStats(updated);
      const tier = getRatingTier(stats.average);
      const result: BenchmarkResult = {
        rounds: updated,
        averageMs: stats.average,
        bestMs: stats.best,
        worstMs: stats.worst,
        stdDev: stats.stdDev,
        ratingLabel: tier.label,
        date: Date.now(),
      };
      setIsCompleted(true);
      onBenchmarkComplete(result);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
        });
      } catch {
        // Ignore
      }
    }
  };

  const handleFalseStart = () => {
    // False start does not count as a valid trial, player tries round again
  };

  const handleResetBenchmark = () => {
    setTrials([]);
    setIsCompleted(false);
    setCopied(false);
  };

  const stats = calculateStats(trials);
  const tier = isCompleted ? getRatingTier(stats.average) : null;

  const handleShare = () => {
    if (!tier) return;
    const shareText = `ReflexRush 5-Trial Reaction Test:\n⚡ Average: ${stats.average}ms\n🏆 Rank: ${tier.grade} (${tier.label})\n🎯 Best: ${stats.best}ms\nCan you beat my reaction time?`;
    navigator.clipboard?.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Round progress bar */}
      <div className="w-full max-w-xl flex items-center justify-between gap-2 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          5-Trial Benchmark
        </span>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((roundNum) => {
            const hasPlayed = trials.length >= roundNum;
            const isCurrent = trials.length === roundNum - 1 && !isCompleted;
            return (
              <div
                key={roundNum}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  hasPlayed
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : isCurrent
                    ? 'border-2 border-emerald-400 text-emerald-400 bg-emerald-950/40 animate-pulse'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {hasPlayed ? '✓' : roundNum}
              </div>
            );
          })}
        </div>
      </div>

      {!isCompleted ? (
        <ReactionArea
          onSuccessReaction={handleSuccessReaction}
          onFalseStart={handleFalseStart}
          bestTimeMs={trials.length > 0 ? Math.min(...trials) : null}
          modeLabel="5-Trial Cognitive Benchmark"
          roundIndicator={`Trial ${Math.min(trials.length + 1, 5)} of 5`}
        />
      ) : (
        /* Benchmark Summary Card */
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <Award className="w-9 h-9" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Official Benchmark Report
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-1">
            Test Complete
          </h2>

          {tier && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-semibold mb-6 border bg-slate-800/80 border-slate-700">
              <span className={tier.colorClass}>Grade {tier.grade}:</span>
              <span className="text-white">{tier.label}</span>
              <span className="text-slate-400">({tier.percentile})</span>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl mb-6">
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="text-[11px] uppercase font-semibold text-slate-400">Average</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono-numbers mt-1">
                {stats.average}
                <span className="text-xs text-slate-400 ml-1">ms</span>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="text-[11px] uppercase font-semibold text-slate-400">Fastest Trial</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-mono-numbers mt-1">
                {stats.best}
                <span className="text-xs text-slate-400 ml-1">ms</span>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="text-[11px] uppercase font-semibold text-slate-400">Slowest Trial</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-300 font-mono-numbers mt-1">
                {stats.worst}
                <span className="text-xs text-slate-400 ml-1">ms</span>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="text-[11px] uppercase font-semibold text-slate-400">Consistency</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono-numbers mt-1">
                ±{stats.stdDev}
                <span className="text-xs text-slate-400 ml-1">ms</span>
              </div>
            </div>
          </div>

          {/* Individual Trials Breakdown */}
          <div className="w-full max-w-xl bg-slate-950/60 border border-slate-800 rounded-xl p-4 mb-6">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-left">
              Trial Progression
            </div>
            <div className="flex items-center justify-between gap-2">
              {trials.map((ms, index) => (
                <div
                  key={index}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-center"
                >
                  <div className="text-[10px] text-slate-500 font-mono">T{index + 1}</div>
                  <div className="text-sm sm:text-base font-bold font-mono-numbers text-slate-200">
                    {ms}ms
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleResetBenchmark}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Test Again</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Share Score Card'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
