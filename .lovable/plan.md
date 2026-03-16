

## Plan: Browse & Select GitHub Repos from a List

### What changes
Replace the manual text input for adding repos with a browsable list of your public GitHub repos that you can toggle on/off.

### How it works

1. **Update `manage-repos` edge function** — Add a new `fetch-github-repos` action that calls `https://api.github.com/users/sethgagnon/repos?per_page=100&sort=updated` and returns all your public repos with name, description, language, and stars.

2. **Update Admin UI (`Admin.tsx`)** — Replace the text input with:
   - A "Load My Repos" button that fetches your public repos via the edge function
   - A scrollable list of all your repos, each with a checkbox/toggle
   - Already-featured repos shown as checked; click to add or remove
   - Keep the existing reorder controls for featured repos

3. **No other changes needed** — The `GitHubProjectCard`, `useGitHubRepos` hook, and `AIToolsSection` all stay the same since the `featured_repos` table format doesn't change.

### Technical notes
- GitHub username can be stored as a constant or made configurable later
- The edge function proxies the GitHub API call to avoid CORS issues and keep the pattern consistent

