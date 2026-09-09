# Fix Plan — Post-API-Audit

Baseline: commit `98ac42f` (clean tree). Endpoints manually verified against the live
dev server (`http://localhost:3000`) before this plan was written.

## 1. Like / unlike counters are never updated

- Symptom: `POST /api/projects/:id/like` returns `liked: true` and inserts the like row,
  but `projects.totalLikes` stays `0`. Same for `solutions.likes`.
- Root cause: `toggleProjectLikeService` / `toggleSolutionLikeService` insert/delete the
  like row without touching the counter column, despite the action docs claiming an
  atomic counter update.
- Files:
  - `src/services/likes/like-projects.ts`
  - `src/services/likes/like-solutions.ts`
- Fix:
  - Like → increment the counter (`totalLikes` / `likes`) in the same operation.
  - Unlike → decrement the counter, floored at `0`.
- **Implementing note:** the counter must be updated with an atomic SQL expression
  (`sql\`COLUMN + 1\`` / `sql\`GREATEST(COLUMN - 1, 0)\``). A first attempt using
  `Number(column) ± 1` was rejected: `Number()` of a Drizzle column object is `NaN`,
  which PostgreSQL refuses for the `integer NOT NULL` column — leaving the like row
  created but the counter unchanged, plus a `500`.
- Status: DONE (verified live — project 5→6→5, solution 3→4→3).

## 2. Vote test data invalid + stale vote/engagement tests

- Symptom: `POST /api/projects/:id/vote` with `difficulty: 3` → 400
  `"Invalid difficulty level selected."`. The app behavior is correct; the test fixture
  is wrong (`difficulty` must be a `BEGINNER | INTERMEDIATE | ADVANCED` string).
- Also `src/__tests__/likes.test.ts` calls the vote handler as
  `voteProject(request(url, payload))` with **one** argument, but the route signature is
  now `(request, { params })` → the destructure throws. The `projectVote` fixture URL also
  lacks the `:id` segment.
- Files:
  - `src/__tests__/api-fixtures.ts`
  - `src/__tests__/likes.test.ts`
- Fix: fixture `difficulty: "INTERMEDIATE"`, `projectVote` URL includes the id, vote test
  passes `routeParams(id)`.
- Verify: `npm run test:run`.
- Status: DONE — also updated `solutions.test.ts` (PUT/DELETE now pass `routeParams` and
  use `solutionId`; DELETE with no body) and `users.test.ts` (imports the solutions route
  from `users/[id]/solutions` and passes `routeParams`).

## 3. Missing / empty user `[id]` routes

- Symptom: `GET /api/users/:id` → 404 (no route exists). `GET /api/users/:id/bookmarks`
  and `GET /api/users/:id/likes` → 405 with `No HTTP methods exported` in the Next.js log
  (both route files are 0 bytes).
- Files:
  - `src/app/api/users/[id]/route.ts` (new) — GET user via existing `selectUserService`,
    404 when not found, 400 when id missing.
  - `src/app/api/users/[id]/bookmarks/route.ts` — GET bookmarked projects + solutions.
  - `src/app/api/users/[id]/likes/route.ts` — GET liked projects + solutions.
- Fix: implement the three GET routes (plus minimal select services for user
  bookmarks/likes where they do not exist yet).
- Verify: curl each GET → 200 with a sensible data shape; unknown id → 404.
- Status: DONE. Added `selectUserBookmarksService` / `selectUserLikesService` in
  `src/services/users/select-user.ts`; implemented `users/[id]/route.ts` (GET user),
  `users/[id]/bookmarks/route.ts`, `users/[id]/likes/route.ts`. Verified live:
  GET → 200, unknown id → 404.

## 4. DELETE endpoints require redundant body payloads

- Symptom:
  - `DELETE /api/projects/:id` with an **empty body** → 400 (route requires `id` in the
    JSON body even though it is already in the URL).
  - `DELETE /api/solutions/:id` requires `{ userId, solutionId }` in the body; only the
    URL id should be enough.
  - A non-JSON DELETE body → 500 because `request.json()` throws.
- Files:
  - `src/app/api/projects/[id]/route.ts`
  - `src/app/api/solutions/[id]/route.ts`
  - `src/zod-validators/zod-solutions.ts` (`deleteSolutionSchema`)
  - `src/actions/solutions/actions.ts` / `src/services/solutions/delete-solution.ts`
- Fix: routes delete by URL param only, no body requirement; solution delete drops the
  `userId` requirement (matches project/category semantics); keep the `ClientError`
  not-found behavior.
- Verify: curl DELETE with no body → 200; re-GET the id → 404.
- Status: DONE. `deleteSolutionSchema` is now `{ solutionId }` only,
  `deleteSolutionService` deletes by id; both DELETE routes ignore the request body.
  Verified live: DELETE with empty body → 200; deleted ids → 404.

## 5. Regression checks

- `npm run test:run` (vitest) — all suites green.
- `npm run lint`.
- Curl E2E smoke: create user/category/project/solution → exercise every `[id]` GET, PUT,
  DELETE path → confirm 404s after cleanup.
- Leave the dev server running and the tree clean of scratch data.