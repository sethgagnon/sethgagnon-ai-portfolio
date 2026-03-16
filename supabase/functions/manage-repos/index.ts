import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifyAuth(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) return null;
  return data.claims;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, repo_full_name, repo_id, ordered_ids } = await req.json();

    // Public actions — no auth needed
    if (action === "list") {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data, error } = await supabase
        .from("featured_repos")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return new Response(JSON.stringify({ repos: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "fetch-github-repos") {
      const username = "sethgagnon";
      const allRepos: any[] = [];
      let page = 1;
      while (true) {
        const res = await fetch(
          `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&page=${page}`,
          { headers: { "User-Agent": "lovable-app" } }
        );
        if (!res.ok) {
          return new Response(
            JSON.stringify({ error: `GitHub API error: ${res.status}` }),
            { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const batch = await res.json();
        if (batch.length === 0) break;
        allRepos.push(
          ...batch.map((r: any) => ({
            full_name: r.full_name,
            name: r.name,
            description: r.description,
            language: r.language,
            stargazers_count: r.stargazers_count,
            fork: r.fork,
          }))
        );
        if (batch.length < 100) break;
        page++;
      }
      return new Response(JSON.stringify({ repos: allRepos }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Protected actions — require authenticated user
    const claims = await verifyAuth(req);
    if (!claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "add") {
      if (!repo_full_name) {
        return new Response(JSON.stringify({ error: "repo_full_name is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const ghRes = await fetch(`https://api.github.com/repos/${repo_full_name}`, {
        headers: { "User-Agent": "lovable-app" },
      });
      if (!ghRes.ok) {
        return new Response(
          JSON.stringify({ error: `GitHub repo "${repo_full_name}" not found` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: existing } = await supabase
        .from("featured_repos")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);

      const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

      const { data, error } = await supabase
        .from("featured_repos")
        .insert({ repo_full_name, display_order: nextOrder })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return new Response(JSON.stringify({ error: "Repo already featured" }), {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw error;
      }

      return new Response(JSON.stringify({ repo: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "remove") {
      if (!repo_id) {
        return new Response(JSON.stringify({ error: "repo_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase.from("featured_repos").delete().eq("id", repo_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reorder") {
      if (!ordered_ids || !Array.isArray(ordered_ids)) {
        return new Response(JSON.stringify({ error: "ordered_ids array is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      for (let i = 0; i < ordered_ids.length; i++) {
        const { error } = await supabase
          .from("featured_repos")
          .update({ display_order: i })
          .eq("id", ordered_ids[i]);
        if (error) throw error;
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
