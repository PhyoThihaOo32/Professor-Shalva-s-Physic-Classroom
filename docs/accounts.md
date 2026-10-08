# Personal classrooms

Implemented routes: `/login` and `/space`. Email/password signup and sign-in use Auth.js, PostgreSQL user records, salted scrypt password hashes, and signed/encrypted JWT session cookies. Sessions last 30 days. Google uses the same account/history storage once its OAuth credentials are configured. Welcome and account pages are public; role/student selection, Classroom, Problems, Settings, and My space require an account. Private APIs reject anonymous requests even when a signed legacy guest cookie exists.

## Google setup

1. Open the Google Cloud project’s [Google Auth Platform Clients](https://console.cloud.google.com/auth/clients) page. Configure the app’s branding and audience if prompted, then create an OAuth client of type **Web application**.
2. Add the authorized JavaScript origin `https://professor-shalvas-physic-classroom.vercel.app`.
3. Add this exact authorized redirect URI:
   `https://professor-shalvas-physic-classroom.vercel.app/api/auth/callback/google`
4. In the Vercel project’s **Settings → Environment Variables**, add `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` for **Production**. Keep the secret private and server-only. Preserve the existing `AUTH_SECRET`, database, shared OpenAI, and encryption settings.
5. Redeploy the project. Check `/api/auth/providers` for the Google provider, then test **Continue with Google** using a consenting test account. In Google’s testing audience, add that account as a test user if required; configure the intended audience before public use.

For local testing, register `http://127.0.0.1:3000/api/auth/callback/google` separately. Do not point production at a local callback or expose secrets with `NEXT_PUBLIC_` names. Auth.js uses Google’s standard `openid email profile` scopes and accepts verified Google emails. It does not need Gmail or Drive access. [Google’s credential guide](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred), [Auth.js Google configuration](https://authjs.dev/getting-started/providers/google).

## Entry flow

Welcome offers prominent Sign in and Create account actions. New accounts continue to role selection and then student selection. Returning sign-ins open My space, unless a protected deep link supplies a validated, local return destination. Switching sign-in/signup tabs and Google callbacks preserve that destination. Already signed-in users leave the login page automatically. Server page guards verify both the session and the existing user; the client boundary prevents cached private screens from reappearing after sign-out. Anonymous public content APIs expose only published reference material, never private chats.

There is no guest entry option. The legacy guest cookie exists only to recover pre-account conversations during optional import; old records remain eligible for normal retention cleanup.

## History and identity

- Each session has exactly one owner, a guest or authenticated user. Knowing a session ID does not grant access.
- Import uses the signed guest cookie from the signing-in browser, not a caller-provided guest/user ID. A database transaction transfers ownership and deletes the claimed guest. Concurrent imports grant ownership to exactly one account. Declining import leaves guest records eligible for ordinary retention cleanup.
- Existing account connections take priority during import. A migrated personal key is decrypted and encrypted again with the account’s authenticated ID as associated data, entirely on the server. Shared server OpenAI access remains unchanged.
- Email/password and Google accounts are never automatically merged by email. After password sign-in, **Connect Google** can link the verified Google subject to the authenticated account. Auth.js rejects linking a subject already owned by someone else.
- Account switches remount the displayed workspace; other tabs receive an identity-change event. The root radio and original offline audio remain outside this boundary.
- New conversation creation is idempotent. **My space** shows the newest 60 conversations; all owned older records remain available through saved links or Settings export.

Passwords cannot currently be reset through email, and password account emails are not verified. An email delivery/recovery flow is a future addition. Google sign-in cannot be tested end to end until the project’s OAuth client is configured; storage, isolation, and provider-subject handling are tested independently.

## Test plan and release checks

| Area | Coverage |
| --- | --- |
| Passwords | Salt uniqueness; valid/wrong/missing/corrupt hashes; input bounds; rejection of privilege fields |
| PostgreSQL accounts | Normalized email; duplicate signup; password-free responses; stable OAuth subjects; hashed quotas |
| Ownership/import | Atomic import; competing claims; cross-account reads denied; encrypted connection migration; existing connection preserved |
| Browser flow | Signup/import; sign-in on second device; older/new chat recovery; sign-out across tabs; declined import; wrong password and retry |
| HTTP security | Foreign-origin authentication/signup rejected; caller-supplied import IDs rejected; owner routes denied; secure HttpOnly cookies |
| UI/audio regressions | Phone/desktop layout, entry pages, references, diagrams, Settings, radio and offline playback through navigation |

Run against a dedicated migrated/seeded test database. Tests use stubbed AI and do not send paid requests. Roll back code to commit `0b3a5d4` if account separation, sign-in, or existing classroom recovery fails after release. The account migration only adds columns and an OAuth-account table; do not drop these or reset user data for a code rollback.
