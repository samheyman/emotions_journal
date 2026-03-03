# Design System

Source of truth: `src/styles/global.css`

## Color System

Warm neutral palette with a purple accent. Mood colors form a gradient from red (negative) through white (neutral) to green (positive).

### Base palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#faf8f5` | Page background |
| `--bg-card` | `#ffffff` | Card / surface background |
| `--bg-subtle` | `#f3efea` | Subtle fills, toggle backgrounds |
| `--text-primary` | `#2c2825` | Body text |
| `--text-secondary` | `#8a8380` | Labels, secondary content |
| `--text-muted` | `#b5afaa` | Placeholder, hints |
| `--border` | `#e8e4df` | Borders, dividers |
| `--shadow` | `0 1px 3px rgba(44,40,37,0.06)` | Card elevation |
| `--accent` | `#55187e` | Primary interactive color (purple) |
| `--accent-soft` | `#936ed8` | Softer accent, active states |
| `--accent-alt` | `#7ca5a0` | Teal alternative accent |

### Mood color system

Three user-configurable base colors drive the full mood gradient. Defaults:

| Token | Default | Meaning |
|-------|---------|---------|
| `--mood-negative` | `#fd7369` | Valence -3 (most negative) |
| `--mood-neutral` | `#ffffff` | Valence 0 (neutral) |
| `--mood-positive` | `#4caf50` | Valence +3 (most positive) |

Intermediate steps are generated with `color-mix(in oklch, ...)`:

```css
--mood-negative-3: var(--mood-negative);
--mood-negative-2: color-mix(in oklch, var(--mood-negative) 60%, white);
--mood-negative-1: color-mix(in oklch, var(--mood-negative) 20%, white);
--mood-positive-1: color-mix(in oklch, var(--mood-positive) 20%, white);
--mood-positive-2: color-mix(in oklch, var(--mood-positive) 60%, white);
--mood-positive-3: var(--mood-positive);
```

**Why oklch?** The oklch color space is perceptually uniform — equal steps produce visually equal lightness changes regardless of hue. This means a tint of red and a tint of green at the same percentage look equally light, which isn't true in sRGB or HSL. It also avoids the desaturation-to-grey problem that occurs when mixing colors in sRGB.

**Why `color-mix` instead of `oklch(from ...)` relative color syntax?** The relative color syntax (`oklch(from var(--color) l c h)`) requires the hue argument to be a number, not a percentage — easy to get wrong. `color-mix` is simpler and handles the tinting intent more intuitively.

### Applying mood colors to components

Mood classes `mood-0` through `mood-6` are defined globally in `global.css` and map valence to background color:

| Class | Valence | Background |
|-------|---------|------------|
| `.mood-0` | -3 | `--mood-negative-3` |
| `.mood-1` | -2 | `--mood-negative-2` |
| `.mood-2` | -1 | `--mood-negative-1` |
| `.mood-3` |  0 | `--mood-neutral` |
| `.mood-4` | +1 | `--mood-positive-1` |
| `.mood-5` | +2 | `--mood-positive-2` |
| `.mood-6` | +3 | `--mood-positive-3` |

Usage: `class="entry-card mood-{entry.valence + 3}"`

### User-customisable colors

The `moodColors` store (`src/lib/stores/moodColors.ts`) lets users pick their own positive/neutral/negative base colors in Settings. On any change it updates `--mood-positive`, `--mood-neutral`, and `--mood-negative` on `document.documentElement`, which flows through to all six `color-mix` variables automatically.

## Spacing

8px grid.

| Token | Value |
|-------|-------|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |
| `--space-2xl` | 48px |

## Typography

| Token | Value |
|-------|-------|
| `--font` | `"Inter", system-ui, sans-serif` |
| `--text-sm` | `0.875rem` |
| `--text-base` | `1rem` |
| `--text-lg` | `1.25rem` |
| `--text-xl` | `1.5rem` |

## Borders

| Token | Value |
|-------|-------|
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |
| `--radius-full` | `9999px` |

## Global resets (global.css)

- Box-sizing: border-box on all elements
- Margin/padding reset to 0
- Font, background, and color set on `html, body` from tokens
- `-webkit-font-smoothing: antialiased` for crisp text on macOS/iOS
- `overscroll-behavior: none` to prevent pull-to-refresh on mobile
- Safe area insets applied to `body` padding for notch/home indicator
