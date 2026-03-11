import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const ADMIN_PIN = "1234";

interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

interface SyncStatus {
  aiContext: number;
  newsletter: number;
  lastSync: string | null;
}

export default function Admin() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handlePin = () => {
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      loadStatus();
    } else {
      toast({ title: "Invalid PIN", variant: "destructive" });
    }
  };

  const loadStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("search-documents", {
        body: { query: "status check", match_count: 0 },
      });
      // Just get counts from a direct query won't work with RLS, so we use edge function approach
      // Instead, let's invoke a simple count via the search function
    } catch {
      // ignore
    }

    // Use edge function to get status by searching with a dummy query
    // Actually, let's query the documents table count per source via a workaround
    // Since RLS blocks anon, we'll just show sync results after syncing
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-documents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ query: "cloud engineering", match_count: 1 }),
        }
      );
      // If this works, documents exist
      if (res.ok) {
        const data = await res.json();
        if (data.results?.length > 0) {
          setStatus((prev) => prev || { aiContext: 0, newsletter: 0, lastSync: null });
        }
      }
    } catch {
      // ignore
    }
  }, []);

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
    } catch (err: any) {
      setSyncResult(`❌ Error: ${err.message}`);
      toast({ title: "Sync failed", description: err.message, variant: "destructive" });
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
    } catch (err: any) {
      toast({ title: "Search failed", description: err.message, variant: "destructive" });
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
      <h1 className="text-2xl font-bold text-foreground">Admin — Embeddings Pipeline</h1>

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleSync("ai-context")}
              disabled={!!syncing}
            >
              {syncing === "ai-context" ? "Syncing…" : "Sync AI Context"}
            </Button>
            <Button
              onClick={() => handleSync("newsletter")}
              disabled={!!syncing}
            >
              {syncing === "newsletter" ? "Syncing…" : "Sync Newsletter Articles"}
            </Button>
            <Button
              onClick={() => handleSync("all")}
              disabled={!!syncing}
              variant="secondary"
            >
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
                      #{i + 1} — similarity: {(result.similarity * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                      {(result.metadata as any)?.source}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-4">
                    {result.content}
                  </p>
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
