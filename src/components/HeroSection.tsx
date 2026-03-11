import { MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface HeroSectionProps {
  onOpenChat: () => void;
}

const credentials = ["AWS", "Azure", "GCP", "OCI", "IBM Champion", "At Scale Newsletter"];

const HeroSection = ({ onOpenChat }: HeroSectionProps) =>
<section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
    {/* Status badge */}
    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm text-primary">
      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
      Open to VP / Director roles at enterprise-scale organizations
    </div>

    {/* Profile photo */}
    <Avatar className="mb-6 h-32 w-32 border-2 border-primary/20">
      <AvatarImage src="/seth-gagnon.jpg" alt="Seth Gagnon" />
      <AvatarFallback className="text-3xl font-bold bg-muted text-muted-foreground">SG</AvatarFallback>
    </Avatar>

    <h1 className="font-heading text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
      Seth Gagnon
    </h1>

    <p className="mt-4 text-xl font-medium text-primary sm:text-2xl" style={{ fontFamily: 'var(--font-body)' }}>
      Cloud Engineering Director | Enterprise AI Strategist
    </p>

    <p className="mt-6 max-w-2xl text-lg text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>20+ years leading technology inside large regulated enterprises. Writing about what it actually takes to make Cloud & AI work at scale.

  </p>

    {/* Credential pills */}
    <div className="mt-8 flex flex-wrap justify-center gap-2">
      {credentials.map((c) =>
    <Badge key={c} variant="outline" className="border-border bg-muted/50 text-muted-foreground text-xs px-3 py-1">
          {c}
        </Badge>
    )}
    </div>

    {/* CTAs */}
    <div className="mt-10 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <Button onClick={onOpenChat} size="lg" className="w-full gap-2 text-base sm:w-auto">
        <MessageCircle className="h-5 w-5" /> Ask AI About Me
      </Button>
      <Button variant="outline" size="lg" asChild className="w-full text-base sm:w-auto">
        <a href="#writing">Read At Scale</a>
      </Button>
    </div>

    {/* Scroll indicator */}
    <div className="absolute bottom-10 animate-bounce text-muted-foreground">
      <ChevronDown className="h-6 w-6" />
    </div>
  </section>;


export default HeroSection;