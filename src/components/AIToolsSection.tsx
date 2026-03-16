import { Badge } from "@/components/ui/badge";
import { GitHubProjectCard, GitHubProjectCardSkeleton } from "@/components/GitHubProjectCard";
import { useGitHubRepos } from "@/hooks/useGitHubRepos";
import lovableLogo from "@/assets/tools/lovable.png";
import cursorLogo from "@/assets/tools/cursor.svg";
import kiroLogo from "@/assets/tools/kiro.svg";
import copilotLogo from "@/assets/tools/copilot.png";
import openaiLogo from "@/assets/tools/openai.png";
import claudeLogo from "@/assets/tools/claude.png";
import geminiLogo from "@/assets/tools/gemini.png";

const tools = [
  {
    name: "Lovable",
    descriptor: "AI Full-Stack Platform",
    logo: lovableLogo,
    badge: "L4: Platinum",
    featured: true,
  },
  {
    name: "Cursor",
    descriptor: "AI Code Editor",
    logo: cursorLogo,
    featured: false,
  },
  {
    name: "Kiro",
    descriptor: "AI Development Tool",
    logo: kiroLogo,
    featured: false,
  },
  {
    name: "Microsoft Copilot",
    descriptor: "AI Assistant",
    logo: copilotLogo,
    featured: false,
  },
  {
    name: "OpenAI",
    descriptor: "AI Research & APIs",
    logo: openaiLogo,
    featured: false,
    invertLogo: true,
  },
  {
    name: "Claude",
    descriptor: "AI Assistant",
    logo: claudeLogo,
    featured: false,
  },
  {
    name: "Google Gemini",
    descriptor: "AI Platform",
    logo: geminiLogo,
    featured: false,
  },
];

const AIToolsSection = () => {
  const { repos, loading } = useGitHubRepos();

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="font-heading text-4xl font-bold text-foreground mb-10">
        AI Tools & Platforms
      </h2>
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className={`glass-card rounded-xl p-6 flex flex-col items-center text-center gap-4 ${
              tool.featured ? "border border-primary/30" : ""
            }`}
          >
            <img
              src={tool.logo}
              alt={`${tool.name} logo`}
              className={`h-14 w-14 object-contain ${tool.invertLogo ? "invert" : ""}`}
            />
            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {tool.descriptor}
              </p>
            </div>
            {tool.badge && (
              <Badge className="bg-primary/15 text-primary border-primary/30">
                {tool.badge}
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Projects Subsection */}
      {(loading || repos.length > 0) && (
        <div className="mt-16">
          <h3 className="font-heading text-2xl font-bold text-foreground mb-6">
            Projects
          </h3>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <GitHubProjectCardSkeleton key={i} />
                ))
              : repos.map((repo) => (
                  <GitHubProjectCard key={repo.id} repo={repo} />
                ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default AIToolsSection;
