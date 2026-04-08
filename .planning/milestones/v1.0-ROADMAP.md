# Roadmap

**5 phases** | **4 requirements mapped** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Database & Auth Setup | Set up Supabase schema, RLS, and Auth | | 2 |
| 2 | Authentication Logic | Implement signInAnonymously and Ghost Identity generator | AUTH-01 | 2 |
| 3 | Real-time Messaging | Implement Supabase Broadcast and useEffect subscriptions | CHAT-01, CHAT-02 | 2 |
| 4 | UI Development | Build Shadcn Chat UI, Dark Mode, Context Feed | | 3 |
| 5 | Auto Data Purge | Configure pg_cron to delete messages > 4 hours old | DATA-01 | 1 |

### Phase Details

**Phase 1: Database & Auth Setup**
Goal: Set up Supabase project, database schema, Row Level Security, and enable Anonymous Auth.
Requirements: None (Foundational)
Success criteria:
1. Supabase project initialized with 'messages' and 'rooms' tables.
2. Row Level Security policies active to allow anonymous users to insert and select appropriately.

**Phase 2: Authentication Logic**
Goal: Implement app-side logic for anonymous logins and assign ghost identities.
Requirements: AUTH-01
Success criteria:
1. Users seamlessly authenticate anonymously on page load.
2. An automated ghost identity (e.g., "Ghost-1234") is generated and assigned to the session.

**Phase 3: Real-time Messaging**
Goal: Enable sending and receiving of messages with no lag.
Requirements: CHAT-01, CHAT-02
Success criteria:
1. Messages are broadcasted to connected clients in the room via WebSockets.
2. The client correctly subscribes and updates the message feed in real-time.

**Phase 4: UI Development**
**UI hint**: yes
Goal: Build a polished, dark-mode native chat interface using Shadcn UI.
Requirements: None (UX focused)
Success criteria:
1. Dark mode is functional and the default.
2. Message feed uses a clean, responsive Shadcn-based layout.
3. Mobile layout is fully functional without visual glitches.

**Phase 5: Auto Data Purge**
Goal: Implement the ephemeral cleanup job via the database.
Requirements: DATA-01
Success criteria:
1. pg_cron extension enabled.
2. A scheduled job deletes messages older than 4 hours automatically.
