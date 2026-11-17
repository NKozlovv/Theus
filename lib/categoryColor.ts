/**
 * Stable category color assignment — seven inks toned to sit on paper
 * (unslop pass 2026-11-17; the hues keep the order of the v4 map so a
 * category keeps its place in the rotation). Categories are
 * user-defined free text, so exact names can't be hardcoded; instead each
 * name hashes deterministically onto this fixed seven-hue set (replacing
 * the old ten-hue hash), with "Income" special-cased to --in and an
 * "everything else" fallback to --slate never actually reached by the
 * hash pool below (kept as CATEGORY_FALLBACK for empty/uncategorised).
 *
 * Same color for a given category name everywhere: donut, tags, dots,
 * meters, trend cells.
 */

const CATEGORY_HUES = [
  '#2a8f86', // teal
  '#2a3350', // navy
  '#c8596b', // coral
  '#c98a2b', // amber
  '#7a63c4', // violet
  '#3f8fc4', // sky
  '#2f45b8', // indigo
];

const CATEGORY_FALLBACK = '#8a90a3'; // slate — uncategorised only
const INCOME_HUE = '#1f7a52'; // --in

const cache = new Map<string, string>();

export function categoryColor(name: string | null | undefined): string {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return CATEGORY_FALLBACK;
  if (trimmed.toLowerCase() === 'income') return INCOME_HUE;

  const hit = cache.get(trimmed);
  if (hit) return hit;

  let h = 0;
  for (let i = 0; i < trimmed.length; i++) {
    h = (h * 31 + trimmed.charCodeAt(i)) | 0;
  }
  const color = CATEGORY_HUES[Math.abs(h) % CATEGORY_HUES.length]!;
  cache.set(trimmed, color);
  return color;
}

/** hex (e.g. "#4a5ce0") + alpha (0–1) -> "rgba(r, g, b, a)". */
export function tint(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
