# Task 5 report: Guest guidance and four-person UI

## Status

Implemented and pushed on `cursor/together-flow-improvements-08b6`.

- Signed-out hosts see a dismissible recommendation-benefit prompt before provider setup.
- The prompt links to the localized sign-in route with an encoded redirect back to Together.
- Provider setup remains visible and usable while the prompt is present.
- Authenticated hosts never see the prompt.
- Invite, join, and waiting UI use `room.maxParticipants` and show current/maximum capacity.
- The invitation ticket now says “up to four” instead of promising admission for exactly two.
- Waiting rooms render every participant and every available seat up to room capacity.
- A full room hides the join form from non-members and shows localized full-room guidance.
- Valid members still enter the existing waiting/voting flow when the room is full.
- Guest and capacity copy is present in all seven dictionaries.
- The dictionary contract now covers Task 3 provider copy, Task 4 match copy, and Task 5 guest/capacity copy.
- No dependencies were added.

## TDD evidence

### RED 1: guest prompt, full-room state, and capacity UI

Command:

```bash
pnpm --filter web test --run \
  'src/app/[lang]/together/_components/together-guest-prompt.test.tsx' \
  'src/app/[lang]/together/_components/together-room.test.tsx' \
  'src/app/[lang]/together/_components/waiting-room.test.tsx' \
  src/utils/dictionaries/get-dictionaries.test.ts
```

Result: exit 1. Three files failed, six tests failed, and 18 tests passed.

- The guest recommendation and dismiss action were absent.
- A four-person visitor still received the join form.
- `maxParticipants` was not passed to valid-member waiting UI.
- Invite and waiting screens did not render current/maximum capacity.
- Waiting UI rendered only the first two participants.

### RED 2: strengthened dictionary contract

The initial optional-chain assertion allowed missing keys to pass because `undefined` is not an empty string. The contract was corrected to require a string before checking its trimmed value.

The focused dictionary command then exited 1 with all seven locale cases failing at `together.guest_prompt_title`, proving missing localized copy is detected.

### RED 3: join capacity propagation

The focused room test exited 1 with four failures. Two- and three-person rooms rendered `Join form undefined/undefined`, a full visitor still saw the join form, and a valid full-room member rendered `Waiting 4/undefined`.

### GREEN

The focused guest/room/waiting/dictionary command exited 0:

```text
Test Files  4 passed (4)
Tests       24 passed (24)
```

## Final verification

All Together component and dictionary tests:

```bash
pnpm --filter web test --run \
  'src/app/[lang]/together/_components' \
  src/utils/dictionaries/get-dictionaries.test.ts
```

```text
Test Files  9 passed (9)
Tests       51 passed (51)
```

Web typecheck:

```bash
pnpm --filter web run typecheck
```

Result: exit 0.

Changed-file Biome:

```bash
git diff --name-only -z d314df8e HEAD |
  xargs -0 pnpm exec biome check
```

Result: `Checked 17 files. No fixes applied.`

The first broad verification found a TypeScript narrowing error in the full-room expression and formatting differences in three tests. These were corrected in `9c5c2663`, committed and pushed, and the complete verification set above was rerun successfully.

## Files

Created:

- `apps/web/src/app/[lang]/together/_components/together-guest-prompt.tsx`
- `apps/web/src/app/[lang]/together/_components/together-guest-prompt.test.tsx`
- `apps/web/src/app/[lang]/together/_components/together-room.test.tsx`
- `apps/web/src/app/[lang]/together/_components/waiting-room.test.tsx`

Modified:

- `apps/web/src/app/[lang]/together/_components/welcome-screen.tsx`
- `apps/web/src/app/[lang]/together/_components/together-room.tsx`
- `apps/web/src/app/[lang]/together/_components/join-invite-form.tsx`
- `apps/web/src/app/[lang]/together/_components/invite-screen.tsx`
- `apps/web/src/app/[lang]/together/_components/waiting-room.tsx`
- `apps/web/src/utils/dictionaries/get-dictionaries.test.ts`
- `apps/web/public/dictionaries/de-DE.json`
- `apps/web/public/dictionaries/en-US.json`
- `apps/web/public/dictionaries/es-ES.json`
- `apps/web/public/dictionaries/fr-FR.json`
- `apps/web/public/dictionaries/it-IT.json`
- `apps/web/public/dictionaries/ja-JP.json`
- `apps/web/public/dictionaries/pt-BR.json`

## Commits

- `6de3dc2d` — `feat(together): guide guests and show room capacity`
- `9c5c2663` — `fix(together): satisfy capacity verification`

## Self-review

- Confirmed prompt visibility is controlled by the existing session user and dismissal is local component state.
- Confirmed the sign-in URL is `/{language}/sign-in` with an encoded `/{language}/together` redirect.
- Confirmed the prompt does not wrap, disable, or replace provider controls.
- Confirmed only `room.me` determines valid membership; a stored but invalid token cannot bypass the full-room state.
- Confirmed two- and three-person rooms remain joinable and full-room members retain waiting/voting access.
- Confirmed join success still refreshes the token and room query through the existing callback.
- Confirmed capacity values originate from `participants.length` and `room.maxParticipants`, not a client-side constant.
- Confirmed waiting seats use the room maximum and stable participant IDs where available.
- Confirmed all new dictionary values are non-empty and all `{current}`/`{max}` placeholders are present.
- Confirmed the task diff contains no backend, dependency, room-join service, or voting-flow changes.

## Concerns

- Verification succeeds under Node 22.14.0, but every pnpm command emits the existing warning that the repository requests Node 23 or newer.
- Localized copy is structurally covered across seven dictionaries but has not been reviewed by native-speaking translators.

## Blocking-review follow-up

### Changes

- Added `getSafeLocalizedRedirectPath`, a pure validator that only accepts internal paths rooted in the current supported locale.
- Rejected absolute URLs, protocol-relative URLs, literal and repeatedly encoded path separators, backslashes, control characters, traversal outside the locale, cross-locale paths, and repeated query values.
- The sign-in page now validates its `redirect` query and passes either that target or localized home to `SignInForm`.
- `SignInForm` forwards the target and current locale to the sign-in action.
- The sign-in action validates again at the redirect sink, while an internal sign-up checkout caller can deliberately omit navigation and continue to Stripe.
- Added a test-only `server-only` marker alias so server action behavior can be tested without changing application dependencies.
- `TogetherRoom` now distinguishes an uninitialized token from a hydrated guest token, keeps the room query disabled until local-storage hydration, and renders loading during that interval.
- Added an asynchronous full-room valid-member regression proving the only request uses the stored token and no visitor-full state appears.
- Added safe recognition of the stable capacity `ApiError`: HTTP 400 plus `{ message: "Room is full." }`.
- Concurrent capacity rejection now immediately renders localized room-full copy, notifies the parent to refetch room state, and never exposes backend text.
- Wrong status, other messages, malformed payloads, and other failures retain generic `join_error` handling.

### Follow-up TDD evidence

Secure redirect RED:

```text
Validator: valid /pt-BR/together target returned null.
Page: safe and fallback redirect props were absent.
Form: submitted /pt-BR/home instead of /pt-BR/together.
```

After implementation, the focused validator/page/form suite passed 3 files and 16 tests.

Token hydration RED:

```text
Expected one room request with member-token; received two requests because
the first query ran anonymously with null.
```

After adding the sentinel and query gate, hydration and room tests passed 2 files and 5 tests.

Concurrent capacity RED:

```text
The localized room-full state was absent after a stable 400/full response,
and the parent refetch callback had zero calls.
```

After implementing the classifier, local state, and parent callback, join/room/hydration tests passed 3 files and 10 tests.

Redirect-sink RED:

```text
SignInForm omitted the current language, and direct unsafe server-action
targets were not constrained. A subsequent integration regression showed
that unconditional home fallback would interrupt sign-up checkout.
```

The action/form suite passed 2 files and 6 tests after server-side validation and preserving the intentional no-redirect internal call.

### Follow-up final verification

```bash
pnpm --filter web test --run \
  src/actions/auth/sign-in.test.ts \
  src/utils/auth-redirect.test.ts \
  'src/app/[lang]/sign-in' \
  'src/app/[lang]/together/_components' \
  src/utils/dictionaries/get-dictionaries.test.ts
```

```text
Test Files  15 passed (15)
Tests       78 passed (78)
```

```bash
pnpm --filter web run typecheck
```

Result: exit 0.

```bash
git diff --name-only -z 840d48f8 HEAD |
  xargs -0 pnpm exec biome check
```

Result: `Checked 17 files. No fixes applied.`

### Follow-up files

Created:

- `apps/web/src/utils/auth-redirect.ts`
- `apps/web/src/utils/auth-redirect.test.ts`
- `apps/web/src/actions/auth/sign-in.test.ts`
- `apps/web/src/app/[lang]/sign-in/page.test.tsx`
- `apps/web/src/app/[lang]/sign-in/_sign-in-form.test.tsx`
- `apps/web/src/app/[lang]/together/_components/together-room-hydration.test.tsx`
- `apps/web/src/app/[lang]/together/_components/join-invite-form.test.tsx`
- `apps/web/test/server-only.ts`

Modified:

- `apps/web/src/actions/auth/sign-in.ts`
- `apps/web/src/actions/auth/sign-up.ts`
- `apps/web/src/app/[lang]/sign-in/page.tsx`
- `apps/web/src/app/[lang]/sign-in/_sign-in-form.tsx`
- `apps/web/src/app/[lang]/together/_components/together-room.tsx`
- `apps/web/src/app/[lang]/together/_components/together-room.test.tsx`
- `apps/web/src/app/[lang]/together/_components/join-invite-form.tsx`
- `apps/web/src/services/together.ts`
- `apps/web/vitest.config.ts`

### Follow-up commits

- `5fe449a4` — `fix(auth): validate localized sign-in redirects`
- `e382026d` — `fix(together): hydrate member token before room query`
- `a4589c10` — `fix(together): localize concurrent room capacity errors`
- `3ca13fe5` — `fix(auth): enforce redirect safety at sign-in action`
- `c2bdb4df` — `fix(auth): preserve sign-up locale redirect`
- `920ccec8` — `chore(web): restore generated typecheck cache`
- `55247ed7` — `fix(auth): preserve sign-up checkout continuation`

### Follow-up self-review

- Confirmed the page and action both validate redirects; the server action does not trust the client-provided target.
- Confirmed fallback navigation remains localized and the validator normalizes traversal through `URL` before checking the locale boundary.
- Confirmed onboarding still overrides a safe target for users missing a display name.
- Confirmed sign-up profile navigation remains locale-bound and sign-up checkout retains control after session creation.
- Confirmed no anonymous room request occurs before token hydration, including when a valid member opens a full room.
- Confirmed hydrated guests still query with `null`, and valid members still query with their stored token.
- Confirmed the capacity classifier requires the exact stable status and payload and safely handles `unknown`.
- Confirmed localized room-full text is selected from the dictionary; the backend message is only a discriminator.
- Confirmed parent refetch is invoked synchronously on a concurrent capacity response.
- Confirmed no backend, dictionary, or dependency changes were required.

### Follow-up concerns

- The existing Node 22.14.0 versus declared Node 23 warning remains; all requested commands exit successfully.
- Capacity discrimination depends on the backend’s existing stable HTTP 400 and `{ message: "Room is full." }` contract. If that API contract changes, the client classifier and regression must change together.

## Checkout onboarding blocker follow-up

The implicit “missing redirect means do not navigate” convention was replaced by a required discriminated option:

```ts
type SignInNavigation =
  | { mode: 'redirect'; target: string }
  | { mode: 'none' }
```

- Interactive sign-in always uses `mode: 'redirect'`; safe-target validation and localized-home fallback are unchanged.
- Non-checkout sign-up uses redirect mode and still sends a new user with `displayName: null` to localized onboarding.
- Checkout sign-up uses `mode: 'none'`; the onboarding decision cannot replace that explicit choice, so Stripe checkout creation executes after session creation.

### RED evidence

Command:

```bash
pnpm --filter web test --run \
  src/actions/auth/sign-in.test.ts \
  src/actions/auth/sign-up.test.ts \
  'src/app/[lang]/sign-in/_sign-in-form.test.tsx'
```

Result: exit 1, seven failures.

- Checkout expected the Stripe redirect but received `/pt-BR/onboarding`.
- Explicit no-navigation expected no redirect but received onboarding.
- The old action ignored redirect-mode targets.
- The form still submitted the ambiguous `redirectTo` field.
- The existing non-checkout onboarding regression passed before implementation.

### GREEN evidence

The focused sign-in, sign-up, form, and page suite passed 4 files and 11 tests after implementing the discriminated option.

### Final verification

```text
Focused auth, Together, and dictionary tests:
  Test Files  16 passed (16)
  Tests       81 passed (81)

Web typecheck:
  tsc --noEmit
  exit 0

Changed-file Biome:
  Checked 6 files
  No fixes applied
```

### Files

Created:

- `apps/web/src/actions/auth/sign-up.test.ts`

Modified:

- `apps/web/src/actions/auth/sign-in.ts`
- `apps/web/src/actions/auth/sign-in.test.ts`
- `apps/web/src/actions/auth/sign-up.ts`
- `apps/web/src/app/[lang]/sign-in/_sign-in-form.tsx`
- `apps/web/src/app/[lang]/sign-in/_sign-in-form.test.tsx`

### Commit

- `ccb56a62` — `fix(auth): preserve checkout through onboarding check`

### Self-review

- Confirmed no-navigation is explicit and required at every `signIn` call site.
- Confirmed onboarding override is guarded by redirect mode.
- Confirmed checkout reaches `api.post` when `getMe` returns `displayName: null`.
- Confirmed normal sign-in and non-checkout sign-up still reach localized onboarding.
- Confirmed redirect-mode targets continue through locale-bound server-side validation.
- Confirmed no dependencies or unrelated flows changed.

### Concerns

- The existing Node 22.14.0 versus declared Node 23 warning remains; all requested commands exit successfully.
