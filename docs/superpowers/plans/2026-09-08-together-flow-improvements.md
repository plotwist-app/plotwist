# Together Flow Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Together with host-selected streaming services, language-neutral invites, match celebrations, guest sign-in guidance, and rooms for up to four participants.

**Architecture:** Keep room-level recommendation constraints in the existing room entity and apply them when the web client builds its TMDB deck. Enforce group capacity atomically in the backend, while locale detection, provider setup, guest guidance, and match notifications remain focused web components around the existing Together flow.

**Tech Stack:** Fastify 5, Drizzle ORM, PostgreSQL, Next.js 16, React 19, TanStack Query, TMDB client, Vitest, Testing Library, Biome.

## Global Constraints

- Only the host chooses `watchProviderIds` and `watchRegion`; the values apply to the whole room.
- Provider selection is the first host step and includes an explicit unfiltered “Any service” option.
- Signed-in host preferences prefill the room setup but remain editable.
- Shared invite URLs contain no locale and rely on request language detection.
- A room accepts at most four distinct participants.
- A valid participant token may rejoin a full room.
- Voting may start at two participants.
- Two distinct `LIKE` or `MAYBE` decisions create a match, including in larger rooms.
- Both participants who are voting can discover a match; acknowledging it prevents repeated celebration in the same browser session.
- Match celebration offers “Continue discovering” and “View matches”.
- Guest login guidance is non-blocking.
- All new user-facing copy exists in all seven web dictionaries.
- No new dependency is added.

---

### Task 1: Atomic four-person room capacity

**Files:**
- Create: `apps/backend/src/domain/services/together/constants.ts`
- Modify: `apps/backend/src/infra/db/repositories/together-repository.ts`
- Modify: `apps/backend/src/domain/services/together/join-room.ts`
- Modify: `apps/backend/src/domain/services/together/join-room.spec.ts`
- Modify: `apps/backend/src/domain/services/together/create-swipe.spec.ts`
- Modify: `apps/backend/src/infra/http/controllers/together-controller.ts`
- Modify: `apps/backend/src/infra/http/schemas/together.ts`
- Modify: `apps/web/src/services/together.ts`

**Interfaces:**
- Produces: `MAX_TOGETHER_PARTICIPANTS = 4`
- Produces: `insertTogetherParticipantWithinCapacity(values, capacity)` returning the participant or `null`
- Adds: `maxParticipants: 4` to serialized room state

- [ ] **Step 1: Write failing capacity tests**

Extend `join-room.spec.ts` to create one host and join three distinct participants, then assert a fifth new participant returns `TogetherInvalidInputError`. Reuse one of the four valid tokens after capacity and assert the existing participant is returned:

```ts
expect(fifth).toBeInstanceOf(TogetherInvalidInputError)
expect(rejoined).toEqual(
  expect.objectContaining({
    participant: expect.objectContaining({ id: fourth.participant.id }),
    participantToken: fourth.participantToken,
  })
)
```

Extend `create-swipe.spec.ts` with four participants. After two distinct interested swipes, assert:

```ts
expect(result.match).toEqual(
  expect.objectContaining({ likeCount: 2, matchPercent: 50 })
)
```

- [ ] **Step 2: Run backend tests and verify RED**

```bash
pnpm --filter backend test --run \
  src/domain/services/together/join-room.spec.ts \
  src/domain/services/together/create-swipe.spec.ts
```

Expected: fifth participant currently succeeds and the four-person percentage case is absent or fails.

- [ ] **Step 3: Implement atomic capacity**

Define the shared constant. Add a repository transaction which locks the room row, counts participants, returns `null` at capacity, and inserts otherwise:

```ts
await tx.execute(
  sql`select id from ${togetherRooms} where ${togetherRooms.id} = ${values.roomId} for update`
)
const [{ count }] = await tx
  .select({ count: sql<number>`count(*)::int` })
  .from(togetherParticipants)
  .where(eq(togetherParticipants.roomId, values.roomId))
if (count >= capacity) return null
```

`joinTogetherRoomService` must check a valid rejoin token before calling the capacity insert. Convert `null` into `TogetherInvalidInputError('Room is full.')`.

- [ ] **Step 4: Expose capacity**

Add `maxParticipants` to `serializeRoom`, the Zod room schema, and `TogetherRoom`. Use the shared backend constant in serialization.

- [ ] **Step 5: Verify and commit**

Run the two focused backend specs, backend typecheck/build, and Biome on changed backend files. Commit:

```bash
git add apps/backend apps/web/src/services/together.ts
git commit -m "feat(together): support rooms of up to four"
```

### Task 2: Locale-neutral invite URLs

**Files:**
- Create: `apps/web/src/services/together-invite.ts`
- Create: `apps/web/src/services/together-invite.test.ts`
- Create: `apps/web/src/lib/request-locale.test.ts`
- Modify: `apps/web/src/app/[lang]/together/_components/together-room.tsx`
- Modify: `apps/web/src/proxy.ts`

**Interfaces:**
- Produces: `buildTogetherInviteUrl(appUrl: string, code: string): string`
- Produces: `detectRequestLocale(acceptLanguage: string | null): Language`

- [ ] **Step 1: Write failing URL and locale tests**

```ts
expect(buildTogetherInviteUrl('https://plotwist.app', 'ABC123')).toBe(
  'https://plotwist.app/together/ABC123'
)
expect(buildTogetherInviteUrl('https://plotwist.app/', 'abc123')).toBe(
  'https://plotwist.app/together/ABC123'
)
expect(detectRequestLocale('pt-BR,pt;q=0.9,en;q=0.8')).toBe('pt-BR')
expect(detectRequestLocale('fr;q=0.9,en;q=0.8')).toBe('fr-FR')
expect(detectRequestLocale(null)).toBe('en-US')
```

- [ ] **Step 2: Verify RED**

Run both focused web tests. Expected: helpers do not exist.

- [ ] **Step 3: Implement helpers and integration**

Build the invite without a locale and uppercase the room code. Extract the existing proxy language selection into `detectRequestLocale`, preserving traffic guard and locale-prefixed route behavior. `TogetherRoom` uses:

```ts
const inviteUrl = buildTogetherInviteUrl(APP_URL, roomCode)
```

- [ ] **Step 4: Verify and commit**

Run helper tests, web typecheck, and Biome. Commit:

```bash
git add apps/web/src/services/together-invite* apps/web/src/lib/request-locale* apps/web/src/proxy.ts apps/web/src/app/[lang]/together/_components/together-room.tsx
git commit -m "feat(together): share locale-neutral invite links"
```

### Task 3: Host watch-provider setup and filtered deck

**Files:**
- Create: `apps/web/src/app/[lang]/together/_components/together-provider-step.tsx`
- Create: `apps/web/src/app/[lang]/together/_components/together-provider-step.test.tsx`
- Modify: `apps/web/src/app/[lang]/together/_components/create-invite-form.tsx`
- Modify: `apps/web/src/app/[lang]/together/_components/create-invite-form.test.tsx`
- Modify: `apps/web/src/app/[lang]/together/_components/together-vote.tsx`
- Modify: `apps/web/src/app/[lang]/together/_components/together-vote.test.tsx`
- Modify: `apps/web/src/services/together.ts`
- Modify: all seven files under `apps/web/public/dictionaries/*.json`

**Interfaces:**
- Produces: `TogetherProviderStep({ region, providerIds, onRegionChange, onProviderIdsChange, onContinue })`
- Extends: `createTogetherRoom({ displayName, watchProviderIds, watchRegion })`

- [ ] **Step 1: Write failing host-flow tests**

Test that provider setup renders before the name field, selecting providers advances to the name step, and room creation receives:

```ts
expect(createTogetherRoom).toHaveBeenCalledWith({
  displayName: 'Ana',
  watchProviderIds: [8, 337],
  watchRegion: 'BR',
})
```

Mock `useUserPreferences` and assert saved provider IDs and region are initially selected for authenticated hosts.

- [ ] **Step 2: Write failing deck-filter tests**

With a room containing providers `[8, 337]` and region `BR`, assert TMDB discovery receives:

```ts
filters: expect.objectContaining({
  with_watch_providers: '8|337',
  watch_region: 'BR',
})
```

With an empty provider list, assert `with_watch_providers` and `watch_region` are omitted.

- [ ] **Step 3: Verify RED**

Run the three Together component tests. Expected: setup component and extended room body do not exist; deck lacks provider filters.

- [ ] **Step 4: Implement provider setup**

Use `tmdb.watchProviders.regions` and `tmdb.watchProviders.list('movie', ...)`. Render provider names and logos as keyboard-operable toggle buttons. Include explicit “Any service”, loading, error/retry, and continue states. Prefill from `useUserPreferences().userPreferences`, falling back to region `BR` and no providers.

Keep selection state in `CreateInviteForm` so an API error does not reset it. Step one advances to the existing name/create step.

Add the provider-step heading, explanation, “Any service”, retry, back, and continue copy to all seven dictionaries in this task.

- [ ] **Step 5: Apply room filters**

Read `roomQuery.data.room.watchProviderIds` and `watchRegion` in `TogetherVote`. Include the provider values in the deck query key. Only add TMDB availability filters when the provider list is non-empty.

- [ ] **Step 6: Verify and commit**

Run focused Together tests, web typecheck, and changed-file Biome. Commit:

```bash
git add apps/web/src/app/[lang]/together apps/web/src/services/together.ts
git commit -m "feat(together): filter choices by host providers"
```

### Task 4: Match celebration and continued discovery

**Files:**
- Create: `apps/web/src/app/[lang]/together/_components/match-celebration.tsx`
- Create: `apps/web/src/app/[lang]/together/_components/match-celebration.test.tsx`
- Create: `apps/web/src/app/[lang]/together/_components/together-match-notifications.ts`
- Create: `apps/web/src/app/[lang]/together/_components/together-match-notifications.test.ts`
- Modify: `apps/web/src/app/[lang]/together/_components/together-vote.tsx`
- Modify: `apps/web/src/app/[lang]/together/_components/together-vote.test.tsx`
- Modify: all seven files under `apps/web/public/dictionaries/*.json`

**Interfaces:**
- Produces: `togetherMatchKey(match): string`
- Produces: acknowledged-match session helpers scoped by room code
- Produces: `MatchCelebration({ match, onContinue, onViewMatches, copy })`

- [ ] **Step 1: Write failing notification tests**

Cover stable match keys, room-scoped acknowledgement, and no repeated unacknowledged match. Render the celebration and assert both actions:

```ts
await user.click(screen.getByRole('button', { name: copy.continueDiscovering }))
expect(onContinue).toHaveBeenCalledOnce()
expect(onViewMatches).not.toHaveBeenCalled()
```

In the vote test, assert a match returned by `createTogetherSwipe` opens the dialog and a match later returned by polling opens the same dialog.

- [ ] **Step 2: Verify RED**

Run focused match/vote tests. Expected: helpers, celebration, and polling path do not exist.

- [ ] **Step 3: Implement one notification path**

Add a `getTogetherMatches` query while voting with a 3-second interval. Feed direct swipe matches into that query cache. Select the first unacknowledged match and show the accessible celebration dialog. Acknowledge on either action:

- Continue closes the dialog and leaves the deck/route unchanged.
- View matches navigates to `/{language}/together/{code}/matches`.

Use explicit Together colors on portaled dialog content so CSS variables scoped to `.together-shell` are not lost.

Add the match heading, interest summary, “Continue discovering”, and “View matches” copy to all seven dictionaries in this task.

- [ ] **Step 4: Verify and commit**

Run focused match/vote tests, typecheck, and Biome. Commit:

```bash
git add apps/web/src/app/[lang]/together/_components
git commit -m "feat(together): celebrate matches while discovering"
```

### Task 5: Guest guidance and four-person UI

**Files:**
- Create: `apps/web/src/app/[lang]/together/_components/together-guest-prompt.tsx`
- Create: `apps/web/src/app/[lang]/together/_components/together-guest-prompt.test.tsx`
- Modify: `apps/web/src/app/[lang]/together/_components/welcome-screen.tsx`
- Modify: `apps/web/src/app/[lang]/together/_components/together-room.tsx`
- Modify: `apps/web/src/app/[lang]/together/_components/join-invite-form.tsx`
- Modify: `apps/web/src/app/[lang]/together/_components/invite-screen.tsx`
- Modify: `apps/web/src/app/[lang]/together/_components/waiting-room.tsx`
- Modify: all seven files under `apps/web/public/dictionaries/*.json`

**Interfaces:**
- Produces: `TogetherGuestPrompt({ language, copy })`
- Consumes: `room.maxParticipants`

- [ ] **Step 1: Write failing guest/capacity tests**

Assert signed-out welcome renders the recommendation-benefit prompt, sign-in link includes a localized encoded redirect to `/{lang}/together`, and a continue-as-guest action dismisses it. Assert authenticated users do not see it.

Assert a room with four participants renders localized full-room state to a visitor, while two or three participants still render the join form. Assert waiting copy contains current and maximum capacity.

- [ ] **Step 2: Verify RED**

Run focused guest, room, and waiting tests. Expected: prompt and capacity UI do not exist.

- [ ] **Step 3: Implement guest prompt**

Render it before host provider setup. Keep dismissal in component state and never block setup. Use existing Together button styles and localized sign-in URL:

```ts
`/${language}/sign-in?redirect=${encodeURIComponent(`/${language}/together`)}`
```

- [ ] **Step 4: Implement capacity UI and copy**

Use `participants.length` and `room.maxParticipants` from room state. Replace exact “admit two” copy with “up to four”; show `current / max` in invite and waiting screens. When full and the visitor has no valid membership, show the localized room-full state instead of the join form.

Add all remaining guest prompt and capacity strings to all seven dictionaries. Extend the existing dictionary contract test to require every new key, including the provider-step and match keys from Tasks 3 and 4.

- [ ] **Step 5: Verify and commit**

Run all focused Together web tests, dictionary contract tests, typecheck, and changed-file Biome. Commit:

```bash
git add apps/web/src/app/[lang]/together apps/web/public/dictionaries
git commit -m "feat(together): guide guests and show room capacity"
```

### Task 6: Final integration verification

**Files:**
- Modify only files required to fix failures found during verification.

- [ ] **Step 1: Run focused backend verification**

```bash
pnpm --filter backend test --run src/domain/services/together
pnpm --filter backend run build
```

- [ ] **Step 2: Run focused web verification**

```bash
pnpm --filter web test --run \
  src/services/together-invite.test.ts \
  src/lib/request-locale.test.ts \
  'src/app/[lang]/together/**/*.test.ts*' \
  src/utils/dictionaries/get-dictionaries.test.ts
pnpm --filter web run typecheck
```

- [ ] **Step 3: Run formatting checks**

Run Biome on every changed TS, TSX, and dictionary file. Expected: no errors.

- [ ] **Step 4: Build and manually verify**

Run root or app builds with available environment services. In the deployed preview, verify:

1. guest prompt can be dismissed;
2. host provider choices persist into room creation;
3. invite URL is locale-neutral and redirects by browser language;
4. participants two through four join, while a fifth is blocked;
5. a match opens for direct and polling participants;
6. continue discovering stays on the deck;
7. the provider-filtered deck only shows titles available in the selected region/services.

- [ ] **Step 5: Final review and PR update**

Push all commits to `cursor/together-flow-improvements-08b6`, run a whole-branch code review, resolve every Critical/Important finding, and update PR #519 with verification evidence and preview instructions.
