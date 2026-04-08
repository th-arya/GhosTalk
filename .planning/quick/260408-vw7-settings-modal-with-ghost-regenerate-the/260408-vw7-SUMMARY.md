# Quick Task 260408-vw7: Settings Modal

## Summary

Added a fully functional Settings Modal to `app/page.tsx` triggered by the gear icon click.

## Changes

### `app/page.tsx`
- Added `createClient` import from `@/lib/supabaseClient`
- Added `useCallback` import
- Created `THEMES` constant with 3 dark variants (Void, Crimson, Matrix) + `ThemeKey` type
- Added state: `showSettings`, `currentTheme`, `supabase` client
- Implemented `applyTheme()` — sets CSS custom properties + persists to localStorage
- Implemented `regenerateGhostName()` — random Adjective-Animal name via Supabase user metadata update
- Implemented `clearSession()` — sign out + clear storage with confirmation dialog
- Wired gear icon `onClick` in desktop sidebar (line ~178)
- Replaced mobile "Profile" nav button with "Settings" button → opens same modal
- Added full Settings Modal JSX with sections:
  - Current Identity display (ghost emoji + name)
  - Regenerate Identity button
  - Theme picker (3 options with checkmark indicator)
  - Danger Zone — Clear Session button (red styling)
  - Footer with protocol branding

## Verification

- `npx next build` — ✅ passes with zero errors
- Committed as `7bcb08d`
