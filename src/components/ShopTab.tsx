import React from 'react';
import { PlayerStats } from '../types/game';
import { recordLagosOutcome } from '../utils/storage';
import { soundController } from '../utils/audio';
import { Wallet, ShieldCheck, Coffee, Sparkles, Gift } from 'lucide-react';

interface ShopTabProps {
  stats: PlayerStats;
  onStatsUpdated: (newStats: PlayerStats) => void;
}

export const ShopTab: React.FC<ShopTabProps> = ({ stats, onStatsUpdated }) => {
  const handleBuyItem = (cost: number, name: string) => {
    if (stats.lagosWalletNaira < cost) {
      alert("Insufficient Lagos funds! Complete more Lagos survival scenarios to earn Naira!");
      return;
    }
    soundController.playLevelSuccess();
    const updated = recordLagosOutcome(stats, -cost, true);
    onStatsUpdated(updated);
    alert(`Purchased ${name}! Power-up activated!`);
  };

  const handleClaimDailyGift = () => {
    soundController.playLevelSuccess();
    const updated = recordLagosOutcome(stats, 50000, true);
    onStatsUpdated(updated);
    alert("Claimed ₦50,000 Daily Lagos Hustler Allowance! 💰🎉");
  };

  return (
    <div className="w-full flex flex-col items-center max-w-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-1">
          Lagos Street & Romance Shop
        </h2>
        <p className="text-slate-400 text-sm">
          Spend your earned survival Naira on reflex perks, street immunity, and coffee.
        </p>
      </div>

      {/* Wallet Balance Card */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Available Funds</div>
            <div className="text-2xl font-black text-emerald-400 font-mono-numbers">
              ₦{stats.lagosWalletNaira.toLocaleString()}
            </div>
          </div>
        </div>
        <button
          onClick={handleClaimDailyGift}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          <Gift className="w-4 h-4" />
          <span>Claim ₦50k Gift</span>
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {/* Item 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">LASTMA Immunity Pass</h3>
            <p className="text-xs text-slate-400 mb-4">
              Forgives one traffic checkpoint violation or curb-mounting incident on Lagos roads.
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-sm font-bold text-amber-400 font-mono">₦25,000</span>
            <button
              onClick={() => handleBuyItem(25000, 'LASTMA Immunity Pass')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
            >
              Buy Pass
            </button>
          </div>
        </div>

        {/* Item 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
              <Coffee className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Cupid's Espresso Double Shot</h3>
            <p className="text-xs text-slate-400 mb-4">
              Sharpens nervous system alertness for Life Together couple coordination moments.
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-sm font-bold text-rose-400 font-mono">₦15,000</span>
            <button
              onClick={() => handleBuyItem(15000, "Cupid's Espresso")}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
            >
              Drink Espresso
            </button>
          </div>
        </div>

        {/* Item 3 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Cold Supermalt & Gala Combo</h3>
            <p className="text-xs text-slate-400 mb-4">
              Classic Third Mainland Bridge nutritional fuel to sustain your longest survival streak.
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-sm font-bold text-emerald-400 font-mono">₦10,000</span>
            <button
              onClick={() => handleBuyItem(10000, 'Cold Supermalt & Gala')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
            >
              Grab Combo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
