export const BRAID_TYPES = [
  'Box Braid',
  'Knotless Braid',
  'Senegalese Twist',
  'Cornrows',
  'Faux Locs',
  'Goddess Braid'
] as const;

export const BRAID_LENGTHS = [
  'Short',
  'Medium',
  'Long',
  'Extra Long'
] as const;

export const BRAID_BRANDS = [
  'Avvis',
  'Rexxy',
  'Janet Collection',
  'Freetress',
  'Crochet Braid',
  'Other'
] as const;

export const COMMON_BRAID_COLORS = [
  { number: '1', name: 'Jet Black' },
  { number: '1B', name: 'Off Black' },
  { number: '2', name: 'Dark Brown' },
  { number: '4', name: 'Medium Brown' },
  { number: '6', name: 'Light Brown' },
  { number: '8', name: 'Golden Brown' },
  { number: '10', name: 'Honey Blonde' },
  { number: '12', name: 'Light Blonde' },
  { number: '24', name: 'Golden Blonde' },
  { number: '27', name: 'Caramel Blonde' },
  { number: '30', name: 'Auburn' },
  { number: '33', name: 'Dark Red' },
  { number: '99J', name: 'Burgundy' },
  { number: 'TT4/27', name: 'Highlight Mix' },
  { number: 'TT1B/30', name: 'Auburn Mix' },
] as const;

export const COLOR_MAP: Record<string, string> = {
  '1': '#000000',
  '1B': '#0a0a0a',
  '2': '#2d1810',
  '4': '#5c3d2e',
  '6': '#8b6f47',
  '8': '#a0826d',
  '10': '#d4a574',
  '12': '#e5d4c1',
  '24': '#f0e68c',
  '27': '#daa520',
  '30': '#8b4513',
  '33': '#8b0000',
  '99J': '#8b0000',
  'TT4/27': '#c67c4e',
  'TT1B/30': '#7a3e1f',
};
