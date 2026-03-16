

## Plan: Show README Excerpts on Project Cards

Currently the project cards show `repo.description` from GitHub's API, which is just the short one-liner. We'll fetch each repo's README and extract the first meaningful paragraph to display as a richer description.

### Approach

Since the GitHub API is rate-limited (60 req/hr unauthenticated), and we already fetch repo data client-side per featured repo, we'll fetch READMEs in the same hook and cache the result.

### Changes

**1. Update `src/hooks/useGitHubRepos.ts`**
- Add a `readme_excerpt` field to the `GitHubRepo` interface
- After fetching each repo's metadata, also fetch `https://api.github.com/repos/{full_name}/readme` (returns base64-encoded content)
- Decode the README, strip markdown headers/badges/links, and extract the first 1-2 sentences (roughly 200 chars) as the excerpt
- Fall back to `repo.description` if the README fetch fails

**2. Update `src/components/GitHubProjectCard.tsx`**
- Display `repo.readme_excerpt` (falling back to `repo.description`) in the card's description area
- Possibly increase `line-clamp` from 2 to 3 for a slightly longer preview

### Rate limit consideration

With ~3-6 featured repos, this adds 3-6 extra GitHub API calls. Combined with the existing calls, still well under the 60/hr limit. If this ever becomes a concern, we could move README fetching into the edge function and cache results in the database.

