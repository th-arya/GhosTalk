# Quick Task 260408-jvh: Fix Active Channel Cards

## Summary

Made the "Active Channels" room cards fully functional with instant room switching.

## Changes Made

### `app/page.tsx`

1. **Updated PREDEFINED_ROOMS** — Replaced 3 generic rooms with 5 themed channels (HOT_TAKES, CONFESSIONS, SHOWER_THOUGHTS, LATE_NIGHT, RANTS), each with emoji and specters count
2. **Replaced sidebar nav** — Removed modal-gated LOBBY/CHANNELS buttons, added direct channel list with active state highlighting (cyan border + bg glow)
3. **Updated modal channels** — Added emoji and online count to the channel selection modal
4. **Updated mobile nav** — Consolidated LOBBY/CHANNELS into a single CHANNELS button
5. **Fixed roomNameDisplay** — Works with new room structure
6. **Set default room** — Changed from `shadow_reserve` to `hot_takes`

## Verification

- `npm run build` — ✅ Passes with zero errors/warnings
- Clicking any channel card calls `setCurrentRoom(room.id)` — switches room instantly
- Chat header displays correct room name via `roomNameDisplay`
- Active room card shows cyan border + wifi_tethering icon
- Modal channel list uses emoji + specters data

## Commit

`aec02f1` — fix: active channel cards now functional with room switching
