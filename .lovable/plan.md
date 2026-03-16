

## Plan: Admin-Managed GitHub Projects Subsection

### What you get
- **Admin page**: A new "Featured GitHub Repos" card where you enter repo names (e.g. `sethgagnon/repo-name`), remove repos, and reorder them. Secured behind the existing PIN.
- **Public site**: A "Projects" subsection below the AI Tools grid showing glass-card styled repo cards with live GitHub metadata (name, description, language, stars, forks, link).

### Changes

**1. Database: `featured_repos` table**
- Columns: `id` (uuid), `repo_full_name` (text, unique), `display_order` (int), `created_at`
- RLS: public SELECT (visitors read), service_role full access (edge function writes)

**2. Edge function: `manage-repos`**
- PIN-authenticated (same pattern as existing admin)
- Actions: `list`, `add` (validates repo exists via GitHub API), `remove`, `reorder`
- Uses service role key to bypass RLS for writes

**3. Admin page update (`Admin.tsx`)**
- New card: text input + "Add" button, list of current repos with remove/reorder controls
- Calls `manage-repos` edge function for all operations

**4. New hook: `useGitHubRepos.ts`**
- Reads `featured_repos` from database (public SELECT)
- Fetches live metadata from `https://api.github.com/repos/{owner}/{repo}` for each
- Returns combined data with loading state

**5. New component: `GitHubProjectCard.tsx`**
- Glass-card styled, shows repo name, description, language dot, stars, forks, GitHub link
- Skeleton loading state

**6. Update `AIToolsSection.tsx`**
- Add "Projects" subheading + grid of `GitHubProjectCard` below the tools grid

### File summary
| File | Action |
|------|--------|
| Migration SQL | New `featured_repos` table + RLS |
| `supabase/functions/manage-repos/index.ts` | New edge function |
| `src/pages/Admin.tsx` | Add repo management card |
| `src/hooks/useGitHubRepos.ts` | New hook |
| `src/components/GitHubProjectCard.tsx` | New component |
| `src/components/AIToolsSection.tsx` | Add projects subsection |

