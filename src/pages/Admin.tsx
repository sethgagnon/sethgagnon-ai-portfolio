import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const ADMIN_PIN = "1234";

interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

interface FeaturedRepo {
  id: string;
  repo_full_name: string;
  display_order: number;
}

interface GitHubRepo {
  full_name: string;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
}

export default function Admin() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // GitHub repos state
  const [repos, setRepos] = useState<FeaturedRepo[]>([]);
  const [ghRepos, setGhRepos] = useState<GitHubRepo[]>([]);
  const [loadingGh, setLoadingGh] = useState(false);
  const [togglingRepo, setTogglingRepo] = useState<string | null>(null);

  const handlePin = () => {
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      loadRepos();
    } else {
      toast({ title: "Invalid PIN", variant: "destructive" });
    }
  };

  const loadRepos = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-repos", {
        body: { action: "list" },
      });
      if (!error && data?.repos) setRepos(data.repos);
    } catch {
      // ignore
    }
  }, []);

  const loadGitHubRepos = async () => {
    setLoadingGh(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-repos", {
        body: { action: "fetch-github-repos" },
      });
      if (error) throw error;
      if (data?.repos) setGhRepos(data.repos.filter((r: GitHubRepo) => !r.fork));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Failed to load repos", description: msg, variant: "destructive" });
    } finally {
      setLoadingGh(false);
    }
  };

  const isFeatured = (fullName: string) =>
    repos.some((r) => r.repo_full_name === fullName);

  const toggleRepo = async (fullName: string) => {
    setTogglingRepo(fullName);
    try {
      if (isFeatured(fullName)) {
        const existing = repos.find((r) => r.repo_full_name === fullName);
        if (!existing) return;
        const { data, error } = await supabase.functions.invoke("manage-repos", {
          body: { action: "remove", pin: ADMIN_PIN, repo_id: existing.id },
        });
        if (error) throw error;
        if (data?.error) {
          toast({ title: "Error", description: data.error, variant: "destructive" });
        } else {
          setRepos((prev) => prev.filter((r) => r.id !== existing.id));
        }
      } else {
        const { data, error } = await supabase.functions.invoke("manage-repos", {
          body: { action: "add", pin: ADMIN_PIN, repo_full_name: fullName },
        });
        if (error) throw error;
        if (data?.error) {
          toast({ title: "Error", description: data.error, variant: "destructive" });
        } else {
          await loadRepos();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Failed to update repo", description: msg, variant: "destructive" });
    } finally {
      setTogglingRepo(null);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const newRepos = [...repos];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newRepos.length) return;
    [newRepos[index], newRepos[swapIndex]] = [newRepos[swapIndex], newRepos[index]];
    setRepos(newRepos);
    try {
      await supabase.functions.invoke("manage-repos", {
        body: {
          action: "reorder",
          pin: ADMIN_PIN,
          ordered_ids: newRepos.map((r) => r.id),
        },
      });
    } catch {
      loadRepos();
    }
  };

  const handleSync = async (source: string) => {
    setSyncing(source);
    setSyncResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ingest-documents", {
        body: { source },
      });
      if (error) throw error;
      setSyncResult(
        `✅ Synced "${source}": ${data.counts.deleted} deleted, ${data.counts.inserted} inserted`
      );
      toast({ title: "Sync complete", description: `${data.counts.inserted} chunks inserted` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setSyncResult(`❌ Error: ${msg}`);
      toast({ title: "Sync failed", description: msg, variant: "destructive" });
    } finally {
      setSyncing(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("search-documents", {
        body: { query: searchQuery, match_count: 5 },
      });
      if (error) throw error;
      setSearchResults(data.results || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Search failed", description: msg, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-center">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePin()}
            />
            <Button className="w-full" onClick={handlePin}>
              Enter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Admin - Embeddings Pipeline</h1>

      {/* Featured GitHub Repos */}
      <Card>
        <CardHeader>
          <CardTitle>Featured GitHub Repos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Browse repos */}
          {ghRepos.length === 0 ? (
            <Button onClick={loadGitHubRepos} disabled={loadingGh}>
              {loadingGh ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </>
              ) : (
                "Load My Repos"
              )}
            </Button>
          ) : (
            <ScrollArea className="h-64 border border-border rounded-lg">
              <div className="p-2 space-y-1">
                {ghRepos.map((gh) => {
                  const featured = isFeatured(gh.full_name);
                  const toggling = togglingRepo === gh.full_name;
                  return (
                    <label
                      key={gh.full_name}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={featured}
                        disabled={toggling}
                        onCheckedChange={() => toggleRepo(gh.full_name)}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-mono text-foreground">
                          {gh.name}
                        </span>
                        {gh.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {gh.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                        {gh.language && <span>{gh.language}</span>}
                        <span>⭐ {gh.stargazers_count}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {/* Reorder featured repos */}
          {repos.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Display Order</p>
              {repos.map((repo, i) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between border border-border rounded-lg px-4 py-2"
                >
                  <span className="text-sm text-foreground font-mono">
                    {repo.repo_full_name}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReorder(i, "up")}
                      disabled={i === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReorder(i, "down")}
                      disabled={i === repos.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => handleSync("ai_context")} disabled={!!syncing}>
              {syncing === "ai_context" ? "Syncing…" : "Sync AI Context"}
            </Button>
            <Button onClick={() => handleSync("newsletter")} disabled={!!syncing}>
              {syncing === "newsletter" ? "Syncing…" : "Sync Newsletter Articles"}
            </Button>
            <Button onClick={() => handleSync("all")} disabled={!!syncing} variant="secondary">
              {syncing === "all" ? "Syncing…" : "Sync All"}
            </Button>
          </div>
          {syncResult && (
            <p className="text-sm text-muted-foreground font-mono">{syncResult}</p>
          )}
        </CardContent>
      </Card>

      {/* Test Search */}
      <Card>
        <CardHeader>
          <CardTitle>Test Vector Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a search query…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? "Searching…" : "Search"}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((result, i) => (
                <div
                  key={result.id}
                  className="border border-border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-muted-foreground">
                      #{i + 1} - similarity: {(result.similarity * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                      {(result.metadata as any)?.source}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-4">{result.content}</p>
                  <pre className="text-xs text-muted-foreground overflow-x-auto">
                    {JSON.stringify(result.metadata, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
