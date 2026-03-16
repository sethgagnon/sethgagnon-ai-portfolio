import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";

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
  const [repoInput, setRepoInput] = useState("");
  const [addingRepo, setAddingRepo] = useState(false);

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

  const handleAddRepo = async () => {
    const name = repoInput.trim();
    if (!name) return;
    setAddingRepo(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-repos", {
        body: { action: "add", pin: ADMIN_PIN, repo_full_name: name },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      } else {
        toast({ title: "Repo added", description: name });
        setRepoInput("");
        loadRepos();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Failed to add repo", description: msg, variant: "destructive" });
    } finally {
      setAddingRepo(false);
    }
  };

  const handleRemoveRepo = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-repos", {
        body: { action: "remove", pin: ADMIN_PIN, repo_id: id },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      } else {
        setRepos((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      toast({ title: "Failed to remove repo", variant: "destructive" });
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
      // revert on failure
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
          <div className="flex gap-2">
            <Input
              placeholder="owner/repo (e.g. sethgagnon/my-project)"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddRepo()}
            />
            <Button onClick={handleAddRepo} disabled={addingRepo}>
              {addingRepo ? "Adding…" : "Add"}
            </Button>
          </div>

          {repos.length > 0 && (
            <div className="space-y-2">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRepo(repo.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {repos.length === 0 && (
            <p className="text-sm text-muted-foreground">No repos featured yet.</p>
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
