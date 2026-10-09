import React from 'react';
import { CharacterProfile } from '../types/game';
import { GAME_CHARACTERS } from '../data/characters';
import { Check, Sparkles, Shield, Heart } from 'lucide-react';

interface CharactersTabProps {
  selectedCharacter: CharacterProfile;
  onSelectCharacter: (char: CharacterProfile) => void;
}

export const CharactersTab: React.FC<CharactersTabProps> = ({
  selectedCharacter,
  onSelectCharacter,
}) => {
  return (
    <div className="w-full flex flex-col items-center max-w-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-1">
          Choose Your Hero
        </h2>
        <p className="text-slate-400 text-sm">
          Select who accompanies your reflex challenges with in-game voice lines and perks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {GAME_CHARACTERS.map((char) => {
          const isSelected = selectedCharacter.id === char.id;
          return (
            <div
              key={char.id}
              onClick={() => onSelectCharacter(char)}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-rose-500 shadow-xl shadow-rose-500/10 ring-2 ring-rose-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={char.avatarUrl}
                    alt={char.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">{char.name}</h3>
                      {isSelected && (
                        <span className="px-2 py-0.5 bg-rose-500 text-white rounded text-[10px] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-rose-400 font-medium">{char.subtitle}</p>
                  </div>
                </div>

                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 mb-4 text-xs space-y-2">
                  <div className="text-slate-300 font-medium italic">
                    "{char.catchphrase}"
                  </div>
                  <div className="text-emerald-400 font-semibold flex items-center gap-1.5 pt-1 border-t border-slate-850">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Perk: {char.perkDescription}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCharacter(char);
                }}
                className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-colors ${
                  isSelected
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isSelected ? 'Equipped & Ready' : `Select ${char.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
