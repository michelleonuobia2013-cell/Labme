import { BenchmarkResult, PlayerStats, ReactionRecord } from '../types/game';

const STORAGE_KEY = 'reflex_rush_player_stats_v1';

const defaultStats: PlayerStats = {
  bestSingleMs: null,
  bestBenchmarkAverageMs: null,
  totalAttempts: 0,
  totalFalseStarts: 0,
  currentStreak: 0,
  longestStreak: 0,
  survivalMaxLevel: 0,
  lagosWalletNaira: 100000,
  lagosSurvivalStreak: 0,
  lagosBestStreak: 0,
  togetherBestSyncDelta: null,
  togetherTotalCouplesRounds: 0,
  recentRecords: [],
  savedBenchmarks: [],
};

export function loadPlayerStats(): PlayerStats {
  if (typeof window === 'undefined') return defaultStats;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    return {
      ...defaultStats,
      ...parsed,
      lagosWalletNaira: typeof parsed.lagosWalletNaira === 'number' ? parsed.lagosWalletNaira : 100000,
      lagosSurvivalStreak: parsed.lagosSurvivalStreak || 0,
      lagosBestStreak: parsed.lagosBestStreak || 0,
      togetherBestSyncDelta: parsed.togetherBestSyncDelta ?? null,
      togetherTotalCouplesRounds: parsed.togetherTotalCouplesRounds || 0,
      recentRecords: Array.isArray(parsed.recentRecords) ? parsed.recentRecords : [],
      savedBenchmarks: Array.isArray(parsed.savedBenchmarks) ? parsed.savedBenchmarks : [],
    };
  } catch {
    return defaultStats;
  }
}

export function savePlayerStats(stats: PlayerStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // LocalStorage full or blocked
  }
}

export function recordLagosOutcome(
  stats: PlayerStats,
  netNairaDelta: number,
  isSuccess: boolean
): PlayerStats {
  const newWallet = Math.max(0, stats.lagosWalletNaira + netNairaDelta);
  const newSurvivalStreak = isSuccess ? stats.lagosSurvivalStreak + 1 : 0;
  const newBestStreak = Math.max(stats.lagosBestStreak, newSurvivalStreak);

  const updated: PlayerStats = {
    ...stats,
    lagosWalletNaira: newWallet,
    lagosSurvivalStreak: newSurvivalStreak,
    lagosBestStreak: newBestStreak,
  };
  savePlayerStats(updated);
  return updated;
}

export function recordTogetherSyncOutcome(
  stats: PlayerStats,
  deltaMs: number
): PlayerStats {
  const isBetterSync =
    stats.togetherBestSyncDelta === null || deltaMs < stats.togetherBestSyncDelta;
  const newBestSync = isBetterSync ? deltaMs : stats.togetherBestSyncDelta;

  const updated: PlayerStats = {
    ...stats,
    togetherBestSyncDelta: newBestSync,
    togetherTotalCouplesRounds: stats.togetherTotalCouplesRounds + 1,
  };
  savePlayerStats(updated);
  return updated;
}

export function recordReactionAttempt(
  stats: PlayerStats,
  record: ReactionRecord,
  isSub300Success: boolean
): PlayerStats {
  const isNewSingleBest =
    stats.bestSingleMs === null || record.timeMs < stats.bestSingleMs;
  const newBestSingle = isNewSingleBest ? record.timeMs : stats.bestSingleMs;

  const newCurrentStreak = isSub300Success ? stats.currentStreak + 1 : 0;
  const newLongestStreak = Math.max(stats.longestStreak, newCurrentStreak);

  const updatedRecords = [record, ...stats.recentRecords].slice(0, 50);

  const updated: PlayerStats = {
    ...stats,
    bestSingleMs: newBestSingle,
    totalAttempts: stats.totalAttempts + 1,
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    recentRecords: updatedRecords,
  };

  savePlayerStats(updated);
  return updated;
}

export function recordFalseStart(stats: PlayerStats): PlayerStats {
  const updated: PlayerStats = {
    ...stats,
    totalFalseStarts: stats.totalFalseStarts + 1,
    currentStreak: 0,
  };
  savePlayerStats(updated);
  return updated;
}

export function recordBenchmarkResult(
  stats: PlayerStats,
  benchmark: BenchmarkResult
): PlayerStats {
  const isNewBestBenchmark =
    stats.bestBenchmarkAverageMs === null ||
    benchmark.averageMs < stats.bestBenchmarkAverageMs;

  const newBestBenchmark = isNewBestBenchmark
    ? benchmark.averageMs
    : stats.bestBenchmarkAverageMs;

  const updated: PlayerStats = {
    ...stats,
    bestBenchmarkAverageMs: newBestBenchmark,
    savedBenchmarks: [benchmark, ...stats.savedBenchmarks].slice(0, 20),
  };
  savePlayerStats(updated);
  return updated;
}

export function updateSurvivalMaxLevel(stats: PlayerStats, level: number): PlayerStats {
  const updated: PlayerStats = {
    ...stats,
    survivalMaxLevel: Math.max(stats.survivalMaxLevel, level),
  };
  savePlayerStats(updated);
  return updated;
}

export function resetPlayerStats(): PlayerStats {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return defaultStats;
}
