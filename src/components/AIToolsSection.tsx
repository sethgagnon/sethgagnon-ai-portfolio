import { Badge } from "@/components/ui/badge";
import lovableLogo from "@/assets/tools/lovable.png";
import cursorLogo from "@/assets/tools/cursor.svg";
import kiroLogo from "@/assets/tools/kiro.svg";

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
];

const AIToolsSection = () => (
  <section className="mx-auto max-w-6xl px-6 py-24">
    <h2 className="font-heading text-4xl font-bold text-foreground mb-10">
      AI Tools & Platforms
    </h2>
    <div className="grid gap-6 md:grid-cols-3">
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
            className="h-10 w-10 object-contain"
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
  </section>
);

export default AIToolsSection;
