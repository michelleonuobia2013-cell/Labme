import React from 'react';
import { AppTab } from '../types/game';
import { Gamepad2, Users, ShoppingBag, Trophy } from 'lucide-react';

interface AppBottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

export const AppBottomNav: React.FC<AppBottomNavProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="md:hidden w-full bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-around">
        <button
          onClick={() => onSelectTab('games')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors ${
            activeTab === 'games' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[11px]">Games</span>
        </button>

        <button
          onClick={() => onSelectTab('characters')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors ${
            activeTab === 'characters' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[11px]">Characters</span>
        </button>

        <button
          onClick={() => onSelectTab('shop')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors ${
            activeTab === 'shop' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[11px]">Shop</span>
        </button>

        <button
          onClick={() => onSelectTab('records')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors ${
            activeTab === 'records' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[11px]">Records</span>
        </button>
      </div>
    </nav>
  );
};
