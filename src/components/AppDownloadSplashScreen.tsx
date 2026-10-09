import React, { useState } from 'react';
import { Download, Sparkles, Play, CheckCircle2, Heart, Flame } from 'lucide-react';
import { soundController } from '../utils/audio';

interface AppDownloadSplashScreenProps {
  onLaunch: () => void;
}

export const AppDownloadSplashScreen: React.FC<AppDownloadSplashScreenProps> = ({ onLaunch }) => {
  const [downloadProgress, setDownloadProgress] = useState<number>(100);

  const handleLaunch = () => {
    soundController.playLevelSuccess();
    onLaunch();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-rose-500">
      {/* Decorative ambient glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-sm w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl backdrop-blur-xl">
        {/* App Logo Icon Badge */}
        <div className="relative mb-5 group">
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-rose-500 to-amber-400 rounded-3xl blur opacity-70 group-hover:opacity-100 transition duration-300" />
          <img
            src="/src/assets/images/labme_app_icon_1791546043981.jpg"
            alt="Labme App Icon"
            className="relative w-28 h-28 rounded-2xl object-cover shadow-2xl border-2 border-white/20"
          />
          <div className="absolute -bottom-2 -right-2 bg-slate-950 text-white rounded-full p-1.5 border border-slate-800 shadow-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* App Title & Tagline */}
        <div className="flex items-center gap-1.5 mb-1">
          <h1 className="text-3xl font-black text-white font-display tracking-tight">
            Labme
          </h1>
          <span className="text-2xl animate-pulse">❤️🔥</span>
        </div>

        <div className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-3">
          Reflex & Coordination App Game
        </div>

        <div className="w-full bg-slate-950/80 rounded-2xl p-3 border border-slate-800 mb-6 text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span>App Status</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Installed & Verified
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Game Modes</span>
            <span className="text-white font-medium">Lagos Life · Life Together</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Starring</span>
            <span className="text-amber-400 font-medium">Amina & Femi</span>
          </div>
        </div>

        {/* Launch Game Button */}
        <button
          onClick={handleLaunch}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 text-base"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Tap to Open Labme❤️🔥</span>
        </button>

        <p className="mt-4 text-[11px] text-slate-500">
          Ready to play on your mobile browser or desktop
        </p>
      </div>
    </div>
  );
};
