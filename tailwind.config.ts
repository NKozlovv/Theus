import type { Config } from 'tailwindcss';

// Colors are RGB channels in styles/tokens.css so opacity modifiers work
// (bg-indigo/10, text-ink/60).
const channel = (name: string) => `rgb(var(--${name}-rgb) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: channel('ink'),
        'ink-soft': channel('ink-soft'),
        'ink-mute': channel('ink-mute'),

        indigo: channel('indigo'),
        'indigo-dark': channel('indigo-dark'),
        teal: channel('teal'),
        coral: channel('coral'),
        amber: channel('amber'),

        in: channel('in'),
        out: channel('out'),

        paper: 'var(--bg)',
        surface: 'var(--surface)',
        raised: 'var(--raised)',
        line: 'var(--line)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // Deliberately the same family: the user rejected monospace twice
        // (CLAUDE.md §6). `font-mono` stays an alias so old markup works.
        mono: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        control: 'var(--r-control)',
      },
      transitionTimingFunction: {
        theus: 'var(--ease)',
      },
    },
  },
  plugins: [],
};

export default config;
