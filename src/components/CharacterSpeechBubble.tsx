import React from 'react';
import { CharacterProfile, GameStatus } from '../types/game';

interface CharacterSpeechBubbleProps {
  character: CharacterProfile;
  status: GameStatus;
  isFastWin?: boolean;
}

export const CharacterSpeechBubble: React.FC<CharacterSpeechBubbleProps> = ({
  character,
  status,
  isFastWin = true,
}) => {
  let dialogueText = character.dialogue.waiting;

  if (status === 'idle') {
    dialogueText = character.catchphrase;
  } else if (status === 'waiting') {
    dialogueText = character.dialogue.waiting;
  } else if (status === 'ready') {
    dialogueText = character.dialogue.ready;
  } else if (status === 'false_start') {
    dialogueText = character.dialogue.falseStart;
  } else if (status === 'result') {
    dialogueText = isFastWin ? character.dialogue.fastWin : character.dialogue.slowLoss;
  }

  return (
    <div className="w-full max-w-xl flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md mb-3">
      {/* Character Avatar */}
      <div className="relative shrink-0">
        <img
          src={character.avatarUrl}
          alt={character.name}
          className="w-14 h-14 rounded-xl object-cover border-2 border-white/20 shadow-md"
        />
        <div
          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
            status === 'ready'
              ? 'bg-emerald-400 animate-ping'
              : status === 'waiting'
              ? 'bg-amber-400 animate-pulse'
              : 'bg-rose-400'
          }`}
        />
      </div>

      {/* Speech Bubble */}
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold text-white">{character.name}</span>
          <span className="text-[10px] text-slate-400">{character.subtitle}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 italic font-medium leading-snug">
          "{dialogueText}"
        </p>
      </div>
    </div>
  );
};
