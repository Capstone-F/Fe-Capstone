# AI Handoff: Survey, Face Scan, and Routine Generation

## Prompt to give another AI

Copy the full prompt below into the new AI task.

```text
You are continuing frontend work for the GlowScan Capstone project.

Workspace:
- Frontend: C:\Users\thinkbook\Documents\Playground\Fe-Capstone
- Backend: C:\Users\thinkbook\Documents\Playground\Be-Capstone
- Frontend branch: codex/survey-routine-generation
- Backend is strictly READ-ONLY. Never modify, format, stage, commit, or push backend files.
- If an API, schema, contract, or backend behavior is missing or incorrect, report the exact backend need instead of changing BE.

Before doing anything:
1. Read C:\Users\thinkbook\Documents\Playground\AGENTS.md.
2. Read C:\Users\thinkbook\Documents\Playground\Fe-Capstone\docs\ai-handoff-survey-routine.md completely.
3. Run git status -sb and git log -5 --oneline in the FE repository.
4. Preserve all user and other-developer changes. Do not reset, overwrite, or reformat unrelated files.
5. Inspect the latest backend contract read-only, especially:
   - docs/survey-flow.md
   - docs/routine-tracking-flow.md
   - docs/uploads.md
   - docs/llm-routine-mock-vs-ollama.md

Current implemented scope:
- Survey options prefer vietnameseNormalized over English name.
- Optional face scan appears after the final survey question.
- Face scan uploads multipart field `file` to POST /surveys/:id/face-scan.
- Supported images: JPEG, PNG, WebP, GIF, HEIC, HEIF; max 5 MB.
- The user can preview, retry, re-scan, or skip face scan.
- Face labels are shown in Vietnamese where available and are presented only as recommendation support, not a diagnosis.
- After a paid SURVEY order, FE first queries routines and deduplicates by sourceOrderId.
- FE calls POST /routines/generate only when no routine exists for that order.
- Routine generation failure is retryable and does not lose payment state.
- Successful generation links to /care.
- No mock/client-side routine generator is allowed.

Relevant FE commits:
- eaf5f74 feat(survey): finalize paid routine generation flow
- f7fa16c feat(survey): add localized optional face scan

Current verification already completed:
- Targeted Prettier check passed for modified files.
- pnpm lint passed.
- pnpm typecheck passed.
- pnpm build passed.
- Whole-repo pnpm format:check still fails because of 254 pre-existing formatting/line-ending violations; do not mass-format unrelated files.

Current external blocker:
- The configured ngrok endpoint may be offline. Check Fe-Capstone/.env.local and verify the API before E2E.
- Never claim real API E2E passed unless survey upload, payment callback, deduplication, routine generation, and /care were actually exercised against a live backend.

Confluence test cases:
https://capstone-fptu-26.atlassian.net/wiki/spaces/CFS/pages/45285378/Test+Cases+-+Survey+Face+Scan+v+AI+Routine+Generation+Web

Jira state and rules:
- CFS-304 is IN TESTING and contains implementation evidence.
- CFS-259 and CFS-271 were already IN TESTING.
- CFS-299 remains To Do because routine cancellation is not implemented in FE.
- CFS-285 remains In Progress pending treatment E2E.
- CFS-308 remains To Do pending multi-account consultation E2E.
- CFS-292 lacks acceptance criteria.
- CFS-242 is deferred.
- CFS-227 is explicitly out of scope.
- Only move a ticket to IN TESTING when implementation and local verification are complete.
- Only move a ticket to Done with acceptance-test evidence.

Your immediate job:
1. Confirm the live API/ngrok URL with the user if the configured one is offline.
2. Start or reuse the FE dev server on localhost:3000.
3. Execute the Confluence test cases for survey localization, optional face scan, paid-order routine generation, retry, and deduplication.
4. Record exact pass/fail evidence, including request endpoint, status, and relevant UI result. Do not expose secrets or tokens.
5. Fix frontend-only defects found during testing on codex/survey-routine-generation.
6. For backend defects, stop that case and provide: endpoint, request shape, actual response, expected response, and affected Jira acceptance criterion.
7. Run targeted format check, pnpm lint, pnpm typecheck, and pnpm build after code changes.
8. Commit by coherent feature/fix scope and push the current branch. Do not merge to main unless the user explicitly asks.
9. Update Jira/Confluence evidence only after verification.

Engineering constraints:
- Follow existing FE patterns and shadcn components already present in the repository.
- Keep changes tightly scoped; no RHF/Zod refactor unless explicitly requested in this task.
- Do not change BE/Zego contracts.
- Do not introduce mock data to make E2E appear successful.
- Preserve Vietnamese UI labels while sending original API enum/code values.
- Report progress clearly and mention blockers immediately.
```

## How to use this handoff

1. Open a new AI task with the workspace rooted at `C:\Users\thinkbook\Documents\Playground`.
2. Paste the prompt above as the first message.
3. Keep the task on `codex/survey-routine-generation` unless you explicitly want a new branch.
4. Supply a new live ngrok URL when asked. The FE server-side proxy reads `BE_API_URL` from `.env.local`; include the `https://` scheme and omit a trailing slash.
5. Ask the AI to test one Confluence case at a time and attach evidence before changing Jira status.

Example environment:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_PREFIX=/api/be
BE_API_URL=https://your-current-ngrok-host.ngrok-free.app
```

Restart the Next.js dev server after changing `BE_API_URL` because server-side environment variables are loaded when the process starts.

## Repository state at handoff

- FE branch: `codex/survey-routine-generation`
- Remote tracking branch: `origin/codex/survey-routine-generation`
- Last known implementation commit: `f7fa16ce1f72adc962dc3fbc502cad9db0096a7e`
- Backend inspection baseline: `origin/main` at `8af3f064b391953507af4ea084fa773ddd3103bd`
- Backend working tree may be on another branch; inspect with `git show origin/main:<path>` and do not checkout or edit it unless the user changes the workspace rule.

## Acceptance checklist

- [ ] Survey questions and options display Vietnamese text while API payload retains `labelCode`.
- [ ] Survey can complete when face scan is skipped.
- [ ] Valid face image uploads and scan results render correctly.
- [ ] Re-scan replaces the previous result.
- [ ] Invalid type and files over 5 MB are blocked before the API call.
- [ ] Authentication, not-found, invalid-image, and unavailable-service errors are understandable in Vietnamese.
- [ ] Paid SURVEY order creates exactly one AI routine.
- [ ] Reloading the payment callback does not create a duplicate routine.
- [ ] Failure to list routines does not trigger blind generation.
- [ ] AI generation failure provides retry without changing payment success.
- [ ] Generated routine opens at `/care`.
- [ ] Desktop and mobile layouts remain usable.
- [ ] Lint, typecheck, and production build pass after changes.

## Known follow-up scope

- Routine lifecycle after generation: complete/skip steps, check-in, history, side effects, and cancellation.
- Treatment flow audit and E2E.
- Consultation multi-account/device E2E.
- RHF and Zod form refactor is postponed and must not be mixed into this branch without explicit approval.
