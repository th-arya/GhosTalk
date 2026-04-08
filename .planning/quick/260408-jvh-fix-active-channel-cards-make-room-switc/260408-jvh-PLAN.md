---
quick_id: "260408-jvh"
description: "Fix active channel cards - make room switching functional"
tasks: 1
---

# Quick Task: Fix Active Channel Cards

## Task 1: Update page.tsx with functional channel cards

**Files:** `app/page.tsx`
**Action:** Multi-step edit:

1. Replace PREDEFINED_ROOMS array with 5 rooms (hot_takes, confessions, shower_thoughts, late_night, rants) including emoji and specters data
2. Replace left sidebar nav (LOBBY/CHANNELS buttons) with direct room list showing all channels with active state highlighting
3. Update modal channel list to use new room structure with emoji
4. Update roomNameDisplay to use new room structure
5. Replace mobile bottom nav LOBBY/CHANNELS with single channel-switching button
6. Update default room to 'hot_takes'

**Verify:** `npm run build` passes, clicking channels switches rooms
**Done:** All channel cards are functional, room switching works
