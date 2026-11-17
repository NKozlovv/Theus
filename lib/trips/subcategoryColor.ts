import type { TripSummary } from './summary';

/**
 * Hand-ordered, warm/cool-alternating palette for the Trips page's
 * subcategory colors. A first version hashed each name individually
 * (matching lib/categoryColor.ts's own approach) — that still let two
 * unrelated names land on similar-looking hues by chance (real feedback:
 * a five-subcategory set came out looking like "only two colors"). This
 * version assigns colors by RANK instead of by hashing the name, so
 * distinctness is guaranteed rather than left to a hash collision.
 */
const TRIP_SUBCATEGORY_HUES = [
  '#2f45b8', // indigo
  '#c8596b', // coral
  '#2a8f86', // teal
  '#c98a2b', // amber
  '#7a63c4', // violet
  '#a8486f', // rose
  '#3f8fc4', // sky
  '#7c9a3a', // olive
];

const FALLBACK = '#8a90a3';

/**
 * One color per subcategory name, ranked by total spend across every trip
 * passed in (descending) and assigned the palette in order — the same
 * order the legend itself sorts by, so the biggest, most-often-adjacent
 * subcategories get the most different-looking colors from each other.
 * Compute once per `trips` array and share the result across every
 * section (mix chart, matrix, legend) so a given subcategory is always
 * the same color everywhere on the page.
 */
export function buildSubcategoryColorMap(trips: TripSummary[]): Map<string, string> {
  const totals = new Map<string, number>();
  for (const t of trips) {
    for (const s of t.bySubcategory) totals.set(s.name, (totals.get(s.name) ?? 0) + s.amount);
  }
  const ranked = Array.from(totals.keys()).sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0));

  const map = new Map<string, string>();
  ranked.forEach((name, i) => map.set(name, TRIP_SUBCATEGORY_HUES[i % TRIP_SUBCATEGORY_HUES.length]!));
  return map;
}

export function subcategoryColor(colors: Map<string, string>, name: string): string {
  return colors.get(name) ?? FALLBACK;
}
