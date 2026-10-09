import { CharacterProfile } from '../types/game';

export const GAME_CHARACTERS: CharacterProfile[] = [
  {
    id: 'amina',
    name: 'Amina',
    subtitle: 'Chic Island Queen & Reflex Goddess 💅✨',
    avatarUrl: '/src/assets/images/character_amina_1791546056525.jpg',
    accentColor: 'rose',
    catchphrase: 'Blow them a kiss and never miss a beat! 💋🔥',
    perkDescription: '+15% Romance Harmony boost & sweeter high-five ratings',
    dialogue: {
      waiting: "Hold steady... look into the mirror... don't jump yet...",
      ready: 'CLICK IT NOW SWEETHEART! 💋🔥',
      falseStart: 'Ah ah! Why you dey jump before the green?! Calm down jor! 😂',
      fastWin: "Purrr! Supersonic speed! That's what I call lightning reflexes! ✨💖",
      slowLoss: 'A whole 380ms?! Baby are you sleeping on duty? Wake up! 🙈',
    },
  },
  {
    id: 'femi',
    name: 'Femi',
    subtitle: 'Danfo Boss & Lagos Street Legend 🚌⚡',
    avatarUrl: '/src/assets/images/character_femi_1791546068695.jpg',
    accentColor: 'amber',
    catchphrase: 'Lagos no dey sleep, so your fingers must never slip! 🚗💨',
    perkDescription: '₦5,000 fine discount on all Lagos traffic violations',
    dialogue: {
      waiting: 'Watch the changeover switch... conductor is about to whistle...',
      ready: 'O WA O! HIT THE SWITCH NOW BEFORE IT STALLS! ⚡🚌',
      falseStart: 'Chai! Why you press early?! Electrician has charged you repair money! 🤦‍♂️',
      fastWin: 'Oshey! Clean move! Street King status verified! Give dem! 👑🔥',
      slowLoss: 'You delayed and LASTMA don flag you down! Why you slack?! 😭',
    },
  },
];
