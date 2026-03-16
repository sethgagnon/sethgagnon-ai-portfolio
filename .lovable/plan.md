

## Plan: Replace PIN with Secure Auth on Admin Page

### What changes

Replace the hardcoded PIN (`1234`) with real authentication using Lovable Cloud. You'll create one account for yourself — no other users needed.

### Steps

1. **Create `src/pages/Auth.tsx`** — Simple login page with email/password form (login + one-time signup). Redirects to `/admin` on success.

2. **Update `src/pages/Admin.tsx`** — Remove all PIN logic. Use `supabase.auth.getSession()` and `onAuthStateChange` to gate access. Redirect unauthenticated users to `/auth`. Add a logout button.

3. **Update `src/App.tsx`** — Add `/auth` route.

4. **Update `supabase/functions/manage-repos/index.ts`** — Remove `ADMIN_PIN`. For protected actions (`add`, `remove`, `reorder`), extract the `Authorization` header, verify the JWT with `getClaims()`, and confirm the authenticated user's email matches yours. Public actions (`list`, `fetch-github-repos`) stay open.

5. **Remove hardcoded PIN** from both files entirely.

### What stays the same
- All existing admin functionality (sync, search, repo management)
- Public-facing site unchanged
- No database changes needed

### Security model
- Auth session stored in browser, managed by Lovable Cloud
- Edge function validates JWT server-side per request
- No credentials in source code

