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
