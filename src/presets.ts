import { Palette } from './defaults';

export interface Preset {
  name: string;
  description: string;
  palette: Palette;
  swatches: string[];
}

export const PRESETS: Preset[] = [
  {
    name: 'Lumex Dark',
    description: 'The default electric dark theme',
    palette: {
      background: '#0F1117', surface: '#161B22', elevated: '#1C2333',
      accent: '#7C6AF7', accent2: '#3ECFCF', foreground: '#E2E8F0',
      muted: '#94A3B8', subtle: '#475569', green: '#4ADE80',
      red: '#F87171', yellow: '#FBBF24', blue: '#60A5FA',
      pink: '#F472B6', border: '#2D3748',
    },
    swatches: ['#0F1117','#7C6AF7','#3ECFCF','#4ADE80','#F472B6'],
  },
  {
    name: 'Lumex Light',
    description: 'Clean and airy light variant',
    palette: {
      background: '#FFFFFF', surface: '#F8FAFC', elevated: '#F1F5F9',
      accent: '#6D5CEC', accent2: '#0EA5E9', foreground: '#1E293B',
      muted: '#64748B', subtle: '#CBD5E1', green: '#16A34A',
      red: '#DC2626', yellow: '#D97706', blue: '#2563EB',
      pink: '#DB2777', border: '#E2E8F0',
    },
    swatches: ['#F8FAFC','#6D5CEC','#0EA5E9','#16A34A','#DB2777'],
  },
  {
    name: 'Midnight Ocean',
    description: 'Deep blues and aqua highlights',
    palette: {
      background: '#070D1A', surface: '#0A1628', elevated: '#0F2040',
      accent: '#00D4FF', accent2: '#00FF9F', foreground: '#CAE3FF',
      muted: '#6B9DBF', subtle: '#2A4A6B', green: '#00FF9F',
      red: '#FF4D6D', yellow: '#FFD166', blue: '#00D4FF',
      pink: '#C77DFF', border: '#1A3A5C',
    },
    swatches: ['#070D1A','#00D4FF','#00FF9F','#C77DFF','#FF4D6D'],
  },
  {
    name: 'Sakura',
    description: 'Soft pinks and warm cream tones',
    palette: {
      background: '#1C1215', surface: '#241A1E', elevated: '#2E2028',
      accent: '#FF79C6', accent2: '#FFB3C6', foreground: '#FFE4EC',
      muted: '#C48B9F', subtle: '#6B3F52', green: '#80FFA0',
      red: '#FF5572', yellow: '#FFDD99', blue: '#96CBFE',
      pink: '#FF79C6', border: '#3D2030',
    },
    swatches: ['#1C1215','#FF79C6','#FFB3C6','#80FFA0','#FFDD99'],
  },
  {
    name: 'Nord Drift',
    description: 'Arctic-inspired cool grays and frost',
    palette: {
      background: '#1E2430', surface: '#242934', elevated: '#2E3440',
      accent: '#88C0D0', accent2: '#81A1C1', foreground: '#ECEFF4',
      muted: '#D8DEE9', subtle: '#4C566A', green: '#A3BE8C',
      red: '#BF616A', yellow: '#EBCB8B', blue: '#5E81AC',
      pink: '#B48EAD', border: '#3B4252',
    },
    swatches: ['#2E3440','#88C0D0','#A3BE8C','#EBCB8B','#B48EAD'],
  },
  {
    name: 'Cyberpunk Neo',
    description: 'Neon on black — live the future',
    palette: {
      background: '#020207', surface: '#08090F', elevated: '#0E0E1A',
      accent: '#FF003C', accent2: '#00FFF5', foreground: '#F0F0FF',
      muted: '#7B7FA8', subtle: '#2A2A45', green: '#39FF14',
      red: '#FF003C', yellow: '#FFE600', blue: '#00FFF5',
      pink: '#FF00FF', border: '#1A1A2E',
    },
    swatches: ['#020207','#FF003C','#00FFF5','#39FF14','#FF00FF'],
  },
];
