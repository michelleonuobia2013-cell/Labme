import React from 'react';
import { PlayerStats } from '../types/game';
import { X, Trophy, Flame, AlertTriangle, Zap, RotateCcw, Clock } from 'lucide-react';
import { RATING_TIERS } from '../utils/ratings';

interface StatsModalProps {
  stats: PlayerStats;
  isOpen: boolean;
  onClose: () => void;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  stats,
  isOpen,
  onClose,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const falseStartRate =
    stats.totalAttempts > 0
      ? Math.round((stats.totalFalseStarts / (stats.totalAttempts + stats.totalFalseStarts)) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white font-display">
              Reaction Statistics & Records
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Fastest Click</span>
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono-numbers">
                {stats.bestSingleMs !== null ? `${stats.bestSingleMs}ms` : '—'}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lagos Survival Funds</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono-numbers">
                ₦{stats.lagosWalletNaira.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Lagos Best Streak</span>
              </div>
              <div className="text-2xl font-black text-orange-400 font-mono-numbers">
                {stats.lagosBestStreak}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Trophy className="w-3.5 h-3.5 text-pink-400" />
                <span>Best Couple Sync</span>
              </div>
              <div className="text-2xl font-black text-pink-400 font-mono-numbers">
                {stats.togetherBestSyncDelta !== null ? `${stats.togetherBestSyncDelta}ms` : '—'}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Couple Rounds</span>
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono-numbers">
                {stats.togetherTotalCouplesRounds}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>False Start Rate</span>
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono-numbers">
                {falseStartRate}%
              </div>
            </div>
          </div>

          {/* Rating Tiers Reference Guide */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Standard Reaction Tiers Reference
            </div>
            <div className="space-y-2 text-xs">
              {RATING_TIERS.map((tier) => (
                <div
                  key={tier.grade}
                  className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold w-7 ${tier.colorClass}`}>
                      {tier.grade}
                    </span>
                    <span className="text-slate-300 font-medium">{tier.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-mono">
                    <span>
                      {tier.maxMs === Infinity ? '>420ms' : `<${tier.maxMs}ms`}
                    </span>
                    <span className="text-slate-500 text-[11px] w-16 text-right">
                      {tier.percentile}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent History Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Recent Attempts ({stats.recentRecords.length})
              </div>
            </div>
            {stats.recentRecords.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                No recent attempts recorded.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40 divide-y divide-slate-850">
                {stats.recentRecords.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3.5 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono-numbers font-bold text-white">
                        {item.timeMs}ms
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{item.ratingLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-mono">
                      <span>{item.mode}</span>
                      <span>·</span>
                      <span>
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Reset all saved reaction records and high scores?')) {
                onResetStats();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Data</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
