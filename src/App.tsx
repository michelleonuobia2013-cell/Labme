import React, { useState, useEffect } from 'react';
import {
  GameMode,
  ReactionRecord,
  BenchmarkResult,
  PlayerStats,
  AppTab,
  CharacterProfile,
} from './types/game';
import {
  loadPlayerStats,
  recordReactionAttempt,
  recordBenchmarkResult,
  resetPlayerStats,
} from './utils/storage';
import { soundController } from './utils/audio';
import { GAME_CHARACTERS } from './data/characters';
import { Header } from './components/Header';
import { LagosLifeMode } from './components/LagosLifeMode';
import { LifeTogetherMode } from './components/LifeTogetherMode';
import { StandardBenchmark } from './components/StandardBenchmark';
import { ReactionHistoryChart } from './components/ReactionHistoryChart';
import { StatsModal } from './components/StatsModal';
import { AppDownloadSplashScreen } from './components/AppDownloadSplashScreen';
import { CharactersTab } from './components/CharactersTab';
import { ShopTab } from './components/ShopTab';
import { AppBottomNav } from './components/AppBottomNav';
import {
  Zap,
  Trophy,
  Flame,
  Wallet,
  Heart,
  Users,
  Compass,
  Sparkles,
  Smartphone,
  Laptop,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [hasLaunchedApp, setHasLaunchedApp] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('labme_launched_v1') === 'true';
    }
    return false;
  });

  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats);
  const [activeTab, setActiveTab] = useState<AppTab>('games');
  const [currentMode, setCurrentMode] = useState<GameMode>('lagos');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterProfile>(GAME_CHARACTERS[0]);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundController.getIsMuted());

  useEffect(() => {
    setStats(loadPlayerStats());
  }, []);

  const handleLaunchApp = () => {
    setHasLaunchedApp(true);
    localStorage.setItem('labme_launched_v1', 'true');
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundController.setIsMuted(nextMuted);
  };

  const handleBenchmarkComplete = (result: BenchmarkResult) => {
    const updated = recordBenchmarkResult(stats, result);
    result.rounds.forEach((ms) => {
      recordReactionAttempt(
        updated,
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          timeMs: ms,
          mode: 'classic',
          ratingLabel: `Benchmark Trial (${ms}ms)`,
        },
        ms <= 300
      );
    });
    setStats(loadPlayerStats());
  };

  const handleResetStats = () => {
    const reset = resetPlayerStats();
    setStats(reset);
    setIsStatsOpen(false);
  };

  // If app is not yet launched (simulates app just downloaded)
  if (!hasLaunchedApp) {
    return <AppDownloadSplashScreen onLaunch={handleLaunchApp} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white pb-20 md:pb-8">
      {/* Responsive Header for Laptop & Phone */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          setActiveTab('games');
        }}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenStats={() => setIsStatsOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        walletNaira={stats.lagosWalletNaira}
        selectedCharacter={selectedCharacter}
      />

      {/* Main Responsive Canvas */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex flex-col items-center gap-6">
        {/* Mobile-Only Mode Selector Bar (Quick Tabs on phones) */}
        {activeTab === 'games' && (
          <div className="flex md:hidden w-full items-center justify-between gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs">
            <button
              onClick={() => setCurrentMode('lagos')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center whitespace-nowrap transition-colors ${
                currentMode === 'lagos'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇳🇬 Lagos Life
            </button>
            <button
              onClick={() => setCurrentMode('together')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center whitespace-nowrap transition-colors ${
                currentMode === 'together'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💕 Life Together
            </button>
            <button
              onClick={() => setCurrentMode('classic')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-center whitespace-nowrap transition-colors ${
                currentMode === 'classic'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Benchmark
            </button>
          </div>
        )}

        {/* TAB 1: GAMES ARENA */}
        {activeTab === 'games' && (
          <div className="w-full flex flex-col items-center gap-6">
            {/* Responsive Hero Heading */}
            <div className="w-full text-center max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 mb-2">
                <span className="font-semibold text-rose-400">Labme❤️🔥 Game Engine</span>
                <span aria-hidden="true">·</span>
                <span className="hidden sm:inline">Laptop & Phone Ready</span>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span>Sub-millisecond Timing</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight text-balance">
                {currentMode === 'lagos' && '🇳🇬 Lagos Life Survival Reflexes'}
                {currentMode === 'together' && '💕 Life Together Couple Coordination'}
                {currentMode === 'classic' && '⚡ Standard Green Reaction Benchmark'}
              </h1>
              <p className="mt-2 text-slate-400 text-xs sm:text-sm md:text-base text-balance leading-relaxed">
                {currentMode === 'lagos' &&
                  'Test your instincts on Lagos streets! Click when the green signal triggers: catch light changeovers, leap out of Danfos, dodge LASTMA, and grab hawker drinks!'}
                {currentMode === 'together' &&
                  'Synchronize with your partner side-by-side or play solo! React to shared household moments like catching falling mugs, finishing sentences, and snagging the last pizza slice.'}
                {currentMode === 'classic' &&
                  'Standardized 5-trial visual benchmark measuring your mean sensory processing speed against human population percentiles.'}
              </p>
            </div>

            {/* Responsive HUD Stats Strip */}
            <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {currentMode === 'lagos' ? (
                <>
                  <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] uppercase font-medium text-slate-400">Lagos Wallet</div>
                      <div className="text-base sm:text-xl font-extrabold text-white font-mono-numbers">
                        ₦{stats.lagosWalletNaira.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] uppercase font-medium text-slate-400">Street Streak</div>
                      <div className="text-base sm:text-xl font-extrabold text-amber-400 font-mono-numbers">
                        {stats.lagosSurvivalStreak} in a row
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] uppercase font-medium text-slate-400">Best Streak</div>
                      <div className="text-base sm:text-xl font-extrabold text-teal-400 font-mono-numbers">
                        {stats.lagosBestStreak}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] uppercase font-medium text-slate-400">Fastest Click</div>
                      <div className="text-base sm:text-xl font-extrabold text-white font-mono-numbers">
                        {stats.bestSingleMs !== null ? `${stats.bestSingleMs}ms` : '—'}
                      </div>
                    </div>
                  </div>
                </>
              ) : currentMode === 'together' ? (
                <>
                  <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] uppercase font-medium text-slate-400">Best Sync Delta</div>
                      <div className="text-base sm:text-xl font-extrabold text-rose-400 font-mono-numbers">
                        {stats.togetherBestSyncDelta !== null ? `${stats.togetherBestSyncDelta}ms` : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] uppercase font-medium text-slate-400">Couple Rounds</div>
                      <div className="text-base sm:text-xl font-extrabold text-white font-mono-numbers">
                        {stats.togetherTotalCouplesRounds}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] uppercase font-medium text-slate-400">Fastest Partner</div>
                      <div className="text-base sm:text-xl font-extrabold text-pink-400 font-mono-numbers">
                        {stats.bestSingleMs !== null ? `${stats.bestSingleMs}ms` : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] uppercase font-medium text-slate-400">Total Attempts</div>
                      <div className="text-base sm:text-xl font-extrabold text-white font-mono-numbers">
                        {stats.totalAttempts}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] uppercase font-medium text-slate-400">Fastest Click</div>
                      <div className="text-base sm:text-xl font-extrabold text-white font-mono-numbers">
                        {stats.bestSingleMs !== null ? `${stats.bestSingleMs}ms` : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] uppercase font-medium text-slate-400">5-Trial Average</div>
                      <div className="text-base sm:text-xl font-extrabold text-white font-mono-numbers">
                        {stats.bestBenchmarkAverageMs !== null
                          ? `${stats.bestBenchmarkAverageMs}ms`
                          : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 shrink-0">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] uppercase font-medium text-slate-400">Streak (&lt;300ms)</div>
                      <div className="text-base sm:text-xl font-extrabold text-white font-mono-numbers">
                        {stats.currentStreak}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] uppercase font-medium text-slate-400">Total Attempts</div>
                      <div className="text-base sm:text-xl font-extrabold text-white font-mono-numbers">
                        {stats.totalAttempts}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Active Mode Gameplay Area (Spacious on laptop, touch-ready on phone) */}
            <div className="w-full max-w-4xl">
              {currentMode === 'lagos' && (
                <LagosLifeMode
                  stats={stats}
                  onStatsUpdated={setStats}
                  character={selectedCharacter}
                />
              )}

              {currentMode === 'together' && (
                <LifeTogetherMode
                  stats={stats}
                  onStatsUpdated={setStats}
                  character={selectedCharacter}
                />
              )}

              {currentMode === 'classic' && (
                <StandardBenchmark
                  onBenchmarkComplete={handleBenchmarkComplete}
                  bestBenchmarkMs={stats.bestBenchmarkAverageMs}
                />
              )}
            </div>

            {/* Real-time Reaction Trend Chart */}
            <div className="w-full max-w-4xl">
              <ReactionHistoryChart records={stats.recentRecords} />
            </div>

            {/* Quick Mode Cards for Laptop/Desktop Browsing */}
            <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setCurrentMode('lagos')}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  currentMode === 'lagos'
                    ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/50'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-amber-400 text-sm sm:text-base mb-1">
                  <span>🇳🇬 Lagos Life Mode</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  NEPA switch restoration, Danfo conductor stop drops, LASTMA checkpoint escapes, and hawker window purchases. Early clicks cost real fines!
                </p>
              </div>

              <div
                onClick={() => setCurrentMode('together')}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  currentMode === 'together'
                    ? 'bg-rose-950/20 border-rose-500/60 ring-1 ring-rose-500/50'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-rose-400 text-sm sm:text-base mb-1">
                  <span>💕 Life Together Mode</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  2-player co-op side-by-side or solo rhythm. Catching falling mugs, simultaneous high-fives, and grabbing the last slice of pizza. Tests harmony delta.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HEROES / CHARACTERS */}
        {activeTab === 'characters' && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <CharactersTab
              selectedCharacter={selectedCharacter}
              onSelectCharacter={(char) => {
                setSelectedCharacter(char);
                soundController.playLevelSuccess();
              }}
            />
          </div>
        )}

        {/* TAB 3: STREET & ROMANCE SHOP */}
        {activeTab === 'shop' && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <ShopTab stats={stats} onStatsUpdated={setStats} />
          </div>
        )}

        {/* TAB 4: RECORDS & LEADERBOARD */}
        {activeTab === 'records' && (
          <div className="w-full max-w-2xl text-center py-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Hall of Fame & Records</h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">
              View your lifetime fastest single click, couples synchronization harmony records, and survival streak history.
            </p>
            <button
              onClick={() => setIsStatsOpen(true)}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-rose-500/20"
            >
              Open Full Stats & Performance Breakdown
            </button>
          </div>
        )}
      </main>

      {/* Footer for Laptop / Desktop */}
      <footer className="w-full border-t border-slate-900 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/src/assets/images/labme_app_icon_1791546043981.jpg"
              alt="Labme Logo"
              className="w-5 h-5 rounded-md object-cover"
            />
            <span>Labme❤️🔥 · Fully Responsive for Laptop & Mobile Phones</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => {
                setHasLaunchedApp(false);
                localStorage.removeItem('labme_launched_v1');
              }}
              className="hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-open Splash Screen</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsStatsOpen(true)}
              className="hover:text-rose-400 transition-colors"
            >
              View Records Sheet
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile-Only Bottom Navigation Bar (Hidden on Laptop/Desktop md:hidden) */}
      <AppBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Stats & History Modal */}
      <StatsModal
        stats={stats}
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        onResetStats={handleResetStats}
      />
    </div>
  );
}
