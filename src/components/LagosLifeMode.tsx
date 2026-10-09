import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LagosScenario, GameStatus, PlayerStats, CharacterProfile } from '../types/game';
import { LAGOS_SCENARIOS } from '../data/lagosScenarios';
import { soundController } from '../utils/audio';
import { recordLagosOutcome, recordReactionAttempt } from '../utils/storage';
import { CharacterSpeechBubble } from './CharacterSpeechBubble';
import {
  Zap,
  Bus,
  ShieldAlert,
  AlertTriangle,
  CloudRain,
  ShoppingBag,
  Fuel,
  Wallet,
  Flame,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LagosLifeModeProps {
  stats: PlayerStats;
  onStatsUpdated: (newStats: PlayerStats) => void;
  character: CharacterProfile;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5" />,
  Bus: <Bus className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5" />,
  CloudRain: <CloudRain className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Fuel: <Fuel className="w-5 h-5" />,
};

function getStreetCredTitle(streak: number): { title: string; color: string } {
  if (streak >= 10) return { title: 'King of Lagos Streets 👑', color: 'text-amber-400' };
  if (streak >= 6) return { title: 'Oshodi Hustler Extraordinaire 🔥', color: 'text-emerald-400' };
  if (streak >= 3) return { title: 'Danfo Veteran 🚌', color: 'text-teal-400' };
  if (streak >= 1) return { title: 'Lekki-Epe Commuter 🚗', color: 'text-sky-400' };
  return { title: 'Fresh JJC (Just Come to Town) 🎒', color: 'text-slate-400' };
}

export const LagosLifeMode: React.FC<LagosLifeModeProps> = ({ stats, onStatsUpdated, character }) => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [lastElapsedMs, setLastElapsedMs] = useState<number | null>(null);
  const [outcomeMessage, setOutcomeMessage] = useState<string | null>(null);
  const [nairaDelta, setNairaDelta] = useState<number>(0);
  const [isSlowResponse, setIsSlowResponse] = useState<boolean>(false);

  const scenario = LAGOS_SCENARIOS[currentScenarioIndex % LAGOS_SCENARIOS.length];
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

  const startScenario = useCallback(() => {
    clearTimer();
    setStatus('waiting');
    setLastElapsedMs(null);
    setOutcomeMessage(null);
    setNairaDelta(0);
    setIsSlowResponse(false);
    soundController.playWaitingPing();

    // Random unpredictable delay between 1.8s and 4.6s
    const delay = Math.floor(Math.random() * 2800) + 1800;
    timeoutIdRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      setStatus('ready');
      soundController.playGreenCue();
    }, delay);
  }, [clearTimer]);

  const handleTrigger = useCallback(() => {
    if (status === 'idle') {
      startScenario();
      return;
    }

    if (status === 'waiting') {
      // FALSE START / EARLY CLICK!
      clearTimer();
      setStatus('false_start');
      soundController.playFalseStart();

      const fine = scenario.earlyFineAmount;
      setNairaDelta(-fine);
      setOutcomeMessage(scenario.earlyPenaltyText);

      const updated = recordLagosOutcome(stats, -fine, false);
      onStatsUpdated(updated);
      return;
    }

    if (status === 'ready') {
      // SUCCESSFUL REACTION!
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setLastElapsedMs(elapsed);
      setStatus('result');

      const isTooSlow = elapsed > scenario.slowThresholdMs;
      setIsSlowResponse(isTooSlow);

      if (isTooSlow) {
        // Slow reaction penalty
        soundController.playFalseStart();
        const slowPenalty = Math.round(scenario.earlyFineAmount * 0.4);
        setNairaDelta(-slowPenalty);
        setOutcomeMessage(`${scenario.slowPenaltyText} (${elapsed}ms is over the ${scenario.slowThresholdMs}ms cutoff!)`);

        const updated = recordLagosOutcome(stats, -slowPenalty, false);
        onStatsUpdated(updated);
      } else {
        // Quick reaction success!
        soundController.playSuccessChime(elapsed);
        const reward = scenario.rewardNaira;
        setNairaDelta(reward);
        setOutcomeMessage(scenario.successText);

        const updated = recordLagosOutcome(stats, reward, true);
        const withRecord = recordReactionAttempt(
          updated,
          {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: Date.now(),
            timeMs: elapsed,
            mode: 'lagos',
            ratingLabel: `${scenario.title} (${elapsed}ms)`,
            scenarioTitle: scenario.title,
          },
          elapsed <= 300
        );
        onStatsUpdated(withRecord);

        if (elapsed < 250) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#eab308', '#22c55e', '#ffffff'],
            });
          } catch {}
        }
      }
    } else if (status === 'result' || status === 'false_start') {
      // Advance to next scenario
      setCurrentScenarioIndex((idx) => (idx + 1) % LAGOS_SCENARIOS.length);
      startScenario();
    }
  }, [
    status,
    clearTimer,
    startScenario,
    scenario,
    stats,
    onStatsUpdated,
  ]);

  // Spacebar support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleTrigger();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTrigger]);

  const nextScenario = () => {
    setCurrentScenarioIndex((idx) => (idx + 1) % LAGOS_SCENARIOS.length);
    setStatus('idle');
    setLastElapsedMs(null);
    setOutcomeMessage(null);
  };

  const cred = getStreetCredTitle(stats.lagosSurvivalStreak);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Lagos Street HUD Strip */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Wallet */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Lagos Survival Funds
              </div>
              <div className="text-xl font-black text-emerald-400 font-mono-numbers">
                ₦{stats.lagosWalletNaira.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Street Cred */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Street Cred & Rank
              </div>
              <div className={`text-sm font-bold ${cred.color}`}>{cred.title}</div>
            </div>
          </div>

          {/* Survival Streak */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Survival Streak:</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-amber-400 font-mono-numbers font-bold">
              {stats.lagosSurvivalStreak} in a row
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500 font-mono">Best: {stats.lagosBestStreak}</span>
          </div>
        </div>
      </div>

      {/* Scenario Header with Banner Artwork */}
      <div className="w-full relative rounded-2xl overflow-hidden border border-slate-800 mb-4 bg-slate-900 shadow-xl">
        <img
          src="/src/assets/images/lagos_life_banner_1791545220845.jpg"
          alt="Lagos Street Scene Danfo"
          className="w-full h-36 sm:h-44 object-cover object-center opacity-40 mix-blend-luminosity hover:opacity-60 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-4 sm:p-6 flex flex-col justify-end">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              {ICON_MAP[scenario.iconName] || <Zap className="w-4 h-4" />}
              <span>Scenario {((currentScenarioIndex % LAGOS_SCENARIOS.length) + 1)} of {LAGOS_SCENARIOS.length}</span>
            </div>
            <button
              onClick={nextScenario}
              className="text-xs text-slate-400 hover:text-white transition-colors underline"
            >
              Skip Scenario →
            </button>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            {scenario.title}
          </h2>
        </div>
      </div>

      {/* Live Character Speech Bubble Reaction */}
      <CharacterSpeechBubble
        character={character}
        status={status}
        isFastWin={!isSlowResponse}
      />

      {/* Interactive Lagos Reaction Box */}
      <div
        onPointerDown={(e) => {
          e.preventDefault();
          handleTrigger();
        }}
        className={`w-full min-h-[320px] rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-150 relative overflow-hidden select-none shadow-2xl ${
          status === 'idle'
            ? 'bg-slate-900 border-2 border-slate-700 hover:border-amber-400/70'
            : status === 'waiting'
            ? 'bg-amber-950/90 border-2 border-amber-600'
            : status === 'ready'
            ? 'bg-emerald-500 border-2 border-emerald-200 text-slate-950 shadow-emerald-500/30'
            : status === 'false_start' || isSlowResponse
            ? 'bg-rose-950 border-2 border-rose-600'
            : 'bg-slate-900 border-2 border-slate-700'
        }`}
      >
        {/* IDLE */}
        {status === 'idle' && (
          <div className="flex flex-col items-center max-w-md animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              {ICON_MAP[scenario.iconName] || <Zap className="w-7 h-7" />}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Ready for the Streets?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {scenario.waitingContext}
            </p>
            <div className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2">
              <span>Start Scenario · Spacebar / Click</span>
            </div>
          </div>
        )}

        {/* WAITING */}
        {status === 'waiting' && (
          <div className="flex flex-col items-center max-w-lg">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-4" />
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-200 mb-2">
              Waiting on Standby...
            </h3>
            <p className="text-amber-100/90 text-sm italic leading-relaxed max-w-md">
              "{scenario.waitingContext}"
            </p>
            <div className="mt-4 text-xs font-semibold text-amber-300 bg-amber-900/40 px-3 py-1 rounded border border-amber-700/50">
              ⚠️ Early click penalty: Fine of ₦{scenario.earlyFineAmount.toLocaleString()}!
            </div>
          </div>
        )}

        {/* READY (GREEN / TRIGGER) */}
        {status === 'ready' && (
          <div className="flex flex-col items-center max-w-lg">
            <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mb-4 shadow-lg animate-bounce">
              <Zap className="w-10 h-10 fill-current" />
            </div>
            <h3 className="text-3xl sm:text-5xl font-black text-slate-950 uppercase tracking-tight font-display">
              {scenario.actionPrompt}
            </h3>
            <div className="mt-3 font-bold text-lg text-slate-900">
              CLICK OR HIT SPACEBAR NOW!
            </div>
          </div>
        )}

        {/* FALSE START */}
        {status === 'false_start' && (
          <div className="flex flex-col items-center max-w-md animate-shake">
            <XCircle className="w-14 h-14 text-rose-400 mb-3" />
            <h3 className="text-2xl sm:text-3xl font-black text-white font-display mb-1">
              Too Soon! Early Click Penalty!
            </h3>
            <div className="text-rose-400 font-mono-numbers font-bold text-lg mb-2">
              Fine Deducted: -₦{scenario.earlyFineAmount.toLocaleString()}
            </div>
            <p className="text-rose-200 text-sm leading-relaxed mb-6">
              {outcomeMessage}
            </p>
            <div className="px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl shadow-md">
              Click or Spacebar to Continue
            </div>
          </div>
        )}

        {/* RESULT */}
        {status === 'result' && lastElapsedMs !== null && (
          <div className="flex flex-col items-center max-w-md animate-fadeIn">
            {isSlowResponse ? (
              <XCircle className="w-12 h-12 text-rose-400 mb-2" />
            ) : (
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
            )}

            <div className="text-4xl sm:text-6xl font-black text-white font-mono-numbers my-1">
              {lastElapsedMs}
              <span className="text-2xl text-slate-400 ml-1">ms</span>
            </div>

            <div className="text-sm font-semibold mb-2">
              {isSlowResponse ? (
                <span className="text-rose-400">
                  Late Reaction! (&gt;{scenario.slowThresholdMs}ms cutoff)
                </span>
              ) : (
                <span className="text-emerald-400">
                  Fast Lagos Reflexes! (+₦{scenario.rewardNaira.toLocaleString()})
                </span>
              )}
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-5">
              {outcomeMessage}
            </p>

            <div className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-md transition-all">
              Next Lagos Scenario (Spacebar / Click)
            </div>
          </div>
        )}
      </div>

      {/* Street Wisdom Footer */}
      <div className="w-full mt-4 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Lagos Survival Rule:</strong> Patience until green light, lightning-speed execution once the moment arrives!
          </span>
        </div>
        {stats.lagosWalletNaira <= 0 && (
          <button
            onClick={() => {
              const updated = recordLagosOutcome(stats, 100000, true);
              onStatsUpdated(updated);
            }}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold underline whitespace-nowrap ml-2"
          >
            Borrow ₦100,000 Emergency Loan
          </button>
        )}
      </div>
    </div>
  );
};
