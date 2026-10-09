export type GameStatus = 'idle' | 'waiting' | 'ready' | 'result' | 'false_start';

export type GameMode = 'lagos' | 'together' | 'classic';

export type TogetherSubMode = 'coop' | 'solo';

export interface LagosScenario {
  id: string;
  title: string;
  iconName: string;
  waitingContext: string;
  actionPrompt: string;
  earlyFineAmount: number;
  earlyPenaltyText: string;
  successText: string;
  slowThresholdMs: number;
  slowPenaltyText: string;
  rewardNaira: number;
}

export interface TogetherScenario {
  id: string;
  title: string;
  iconName: string;
  waitingContext: string;
  actionPrompt: string;
  earlyText: string;
  successText: string;
  slowThresholdMs: number;
  slowText: string;
  coopHarmonyTitle: string;
}

export interface CoopSyncResult {
  p1TimeMs: number;
  p2TimeMs: number;
  deltaMs: number;
  harmonyPercent: number;
  harmonyLabel: string;
}

export interface ReactionRecord {
  id: string;
  timestamp: number;
  timeMs: number;
  mode: GameMode;
  ratingLabel: string;
  scenarioTitle?: string;
  isFalseStart?: boolean;
}

export interface BenchmarkResult {
  rounds: number[];
  averageMs: number;
  bestMs: number;
  worstMs: number;
  stdDev: number;
  ratingLabel: string;
  date: number;
}

export type AppTab = 'games' | 'characters' | 'shop' | 'records';

export interface CharacterProfile {
  id: 'amina' | 'femi';
  name: string;
  subtitle: string;
  avatarUrl: string;
  accentColor: string;
  perkDescription: string;
  catchphrase: string;
  dialogue: {
    waiting: string;
    ready: string;
    falseStart: string;
    fastWin: string;
    slowLoss: string;
  };
}

export interface PlayerStats {
  bestSingleMs: number | null;
  bestBenchmarkAverageMs: number | null;
  totalAttempts: number;
  totalFalseStarts: number;
  currentStreak: number;
  longestStreak: number;
  survivalMaxLevel: number;
  lagosWalletNaira: number;
  lagosSurvivalStreak: number;
  lagosBestStreak: number;
  togetherBestSyncDelta: number | null;
  togetherTotalCouplesRounds: number;
  recentRecords: ReactionRecord[];
  savedBenchmarks: BenchmarkResult[];
}

export interface RatingTier {
  maxMs: number;
  label: string;
  grade: string;
  colorClass: string;
  bgClass: string;
  description: string;
  percentile: string;
}

