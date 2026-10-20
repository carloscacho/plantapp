import { PlantTheme } from '../types/plant';

export const HABIT_THEMES: Record<string, PlantTheme> = {
  Todos: {
    primary: '#2E7D32',
    titleColor: '#2E7D32',
    accent: '#1B5E20',
    badgeBg: '#E8F5E9',
    badgeText: '#1B5E20',
    headerSub: '#E8F5E9',
    placeholderBg: '#E8F5E9',
  },
  'Árvore': {
    primary: '#1B5E20',
    titleColor: '#1B5E20',
    accent: '#0D3C12',
    badgeBg: '#E8F5E9',
    badgeText: '#1B5E20',
    headerSub: '#E8F5E9',
    placeholderBg: '#E8F5E9',
  },
  'Arbusto': {
    primary: '#B45309',
    titleColor: '#B45309',
    accent: '#78350F',
    badgeBg: '#FEF3C7',
    badgeText: '#78350F',
    headerSub: '#FEF3C7',
    placeholderBg: '#FEF3C7',
  },
  'Erva': {
    primary: '#1565C0',
    titleColor: '#1565C0',
    accent: '#0D47A1',
    badgeBg: '#E3F2FD',
    badgeText: '#0D47A1',
    headerSub: '#E3F2FD',
    placeholderBg: '#E3F2FD',
  },
  'Subarbusto': {
    primary: '#6A1B9A',
    titleColor: '#6A1B9A',
    accent: '#4A148C',
    badgeBg: '#F3E5F5',
    badgeText: '#4A148C',
    headerSub: '#F3E5F5',
    placeholderBg: '#F3E5F5',
  },
  'Trepadeira': {
    primary: '#00695C',
    titleColor: '#00695C',
    accent: '#004D40',
    badgeBg: '#E0F2F1',
    badgeText: '#004D40',
    headerSub: '#E0F2F1',
    placeholderBg: '#E0F2F1',
  },
};

export function getThemeForHabit(habito: string | null | undefined): PlantTheme {
  const h = (habito || '').toLowerCase();
  if (h.includes('erva')) {
    return HABIT_THEMES['Erva'];
  }
  if (h.includes('arbusto') && !h.includes('subarbusto')) {
    return HABIT_THEMES['Arbusto'];
  }
  if (h.includes('subarbusto')) {
    return HABIT_THEMES['Subarbusto'];
  }
  if (h.includes('trepadeira')) {
    return HABIT_THEMES['Trepadeira'];
  }
  if (h.includes('árvore') || h.includes('arvore')) {
    return HABIT_THEMES['Árvore'];
  }
  return HABIT_THEMES['Todos'];
}
