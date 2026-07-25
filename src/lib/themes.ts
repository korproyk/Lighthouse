export const themes = [
  { id: 'basic', label: 'Basic', swatch: '#FFB27A' },
  { id: 'uv', label: 'UV', swatch: 'linear-gradient(135deg, #A79BFF, #6C5CE7)' },
  { id: 'random', label: 'Random', swatch: 'conic-gradient(from 180deg, #FF4D6A, #FFB547, #34D399, #3B82F6, #A78BFA, #FF4D6A)' },
] as const;

export type ThemeId = typeof themes[number]['id'];

// Basic and UV both toggle darkMode + uvMode together (UV is a violet-tinted
// dark mode); Random just flips a coin between the two each time it's tapped.
export function resolveThemeUv(id: ThemeId): boolean {
  return id === 'uv' || (id === 'random' && Math.random() < 0.5);
}
