import { RatingTier } from '../types/game';

export const RATING_TIERS: RatingTier[] = [
  {
    maxMs: 160,
    label: 'Godlike Reflexes',
    grade: 'S+',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10 border-amber-400/30',
    description: 'Pro esports level reaction speed. Top 0.1% tier.',
    percentile: 'Top 0.1%',
  },
  {
    maxMs: 195,
    label: 'Superhuman',
    grade: 'S',
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-400/10 border-emerald-400/30',
    description: 'Blazing fast sensory processing. Top 1% tier.',
    percentile: 'Top 1%',
  },
  {
    maxMs: 235,
    label: 'Lightning Fast',
    grade: 'A',
    colorClass: 'text-teal-400',
    bgClass: 'bg-teal-400/10 border-teal-400/30',
    description: 'Well above average. Sharp and agile reflexes.',
    percentile: 'Top 15%',
  },
  {
    maxMs: 280,
    label: 'Above Average',
    grade: 'B',
    colorClass: 'text-sky-400',
    bgClass: 'bg-sky-400/10 border-sky-400/30',
    description: 'Faster than typical human average (~270ms).',
    percentile: 'Top 40%',
  },
  {
    maxMs: 340,
    label: 'Normal Human',
    grade: 'C',
    colorClass: 'text-indigo-300',
    bgClass: 'bg-indigo-300/10 border-indigo-300/30',
    description: 'Standard everyday reaction window.',
    percentile: 'Average 50%',
  },
  {
    maxMs: 420,
    label: 'Casual Pace',
    grade: 'D',
    colorClass: 'text-orange-400',
    bgClass: 'bg-orange-400/10 border-orange-400/30',
    description: 'Slightly slow reaction. Take a breath and refocus.',
    percentile: 'Bottom 25%',
  },
  {
    maxMs: Infinity,
    label: 'Relaxed Snail',
    grade: 'F',
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-400/10 border-rose-400/30',
    description: 'Laggy response. Make sure you are alert and ready.',
    percentile: 'Bottom 5%',
  },
];

export function getRatingTier(timeMs: number): RatingTier {
  return RATING_TIERS.find((tier) => timeMs <= tier.maxMs) || RATING_TIERS[RATING_TIERS.length - 1];
}

export function calculateStats(times: number[]) {
  if (times.length === 0) {
    return { average: 0, best: 0, worst: 0, stdDev: 0 };
  }
  const sum = times.reduce((acc, curr) => acc + curr, 0);
  const average = Math.round(sum / times.length);
  const best = Math.min(...times);
  const worst = Math.max(...times);

  const variance =
    times.reduce((acc, curr) => acc + Math.pow(curr - average, 2), 0) / times.length;
  const stdDev = Math.round(Math.sqrt(variance));

  return { average, best, worst, stdDev };
}
