import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_PIN = "1234";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, pin, repo_full_name, repo_id, ordered_ids } = await req.json();

    // List is public (no PIN needed)
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

    // All other actions require PIN
    if (pin !== ADMIN_PIN) {
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

      // Validate repo exists on GitHub
      const ghRes = await fetch(`https://api.github.com/repos/${repo_full_name}`, {
        headers: { "User-Agent": "lovable-app" },
      });
      if (!ghRes.ok) {
        return new Response(
          JSON.stringify({ error: `GitHub repo "${repo_full_name}" not found` }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get max display_order
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
