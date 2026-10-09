import React from 'react';
import { GameMode, AppTab, CharacterProfile } from '../types/game';
import { BarChart3, Volume2, VolumeX, Wallet, Users, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenStats: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  walletNaira: number;
  selectedCharacter: CharacterProfile;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  activeTab,
  onSelectTab,
  onOpenStats,
  isMuted,
  onToggleMute,
  walletNaira,
  selectedCharacter,
}) => {
  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark with Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src="/src/assets/images/labme_app_icon_1791546043981.jpg"
            alt="Labme Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-rose-500/40 shadow-sm"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white font-display whitespace-nowrap">
                Labme
              </span>
              <span className="text-sm sm:text-base">❤️🔥</span>
            </div>
            <span className="hidden sm:inline text-[10px] text-slate-400 font-medium -mt-1">
              Reaction Engine
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links for Laptop / Desktop (hidden on phone, handled by bottom nav / mode pills) */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium">
          <button
            onClick={() => {
              onSelectMode('lagos');
              onSelectTab('games');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 text-xs lg:text-sm font-semibold ${
              activeTab === 'games' && currentMode === 'lagos'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🇳🇬 Lagos Life
          </button>
          <button
            onClick={() => {
              onSelectMode('together');
              onSelectTab('games');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 text-xs lg:text-sm font-semibold ${
              activeTab === 'games' && currentMode === 'together'
                ? 'text-rose-400 border-b-2 border-rose-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💕 Life Together
          </button>
          <button
            onClick={() => {
              onSelectMode('classic');
              onSelectTab('games');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 text-xs lg:text-sm ${
              activeTab === 'games' && currentMode === 'classic'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Classic Benchmark
          </button>
          <button
            onClick={() => onSelectTab('characters')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 text-xs lg:text-sm flex items-center gap-1.5 ${
              activeTab === 'characters'
                ? 'text-pink-400 border-b-2 border-pink-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Heroes</span>
          </button>
          <button
            onClick={() => onSelectTab('shop')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 text-xs lg:text-sm flex items-center gap-1.5 ${
              activeTab === 'shop'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Street Shop</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Mobile HUD Badges */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Lagos Funds Badge */}
          <div
            onClick={() => onSelectTab('shop')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-emerald-400 text-xs font-mono font-bold cursor-pointer hover:border-emerald-500/40 transition-colors"
            title="Lagos Survival Wallet"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>₦{walletNaira.toLocaleString()}</span>
          </div>

          {/* Active Hero Pill */}
          <button
            onClick={() => onSelectTab('characters')}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs transition-colors border border-slate-700"
            title="Switch Active Hero"
          >
            <img
              src={selectedCharacter.avatarUrl}
              alt={selectedCharacter.name}
              className="w-5 h-5 rounded-md object-cover"
            />
            <span className="font-semibold text-rose-300">{selectedCharacter.name}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Records Button */}
          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-rose-400 hover:bg-rose-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Records</span>
          </button>
        </div>
      </div>
    </header>
  );
};
