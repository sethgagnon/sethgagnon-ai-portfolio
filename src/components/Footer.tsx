import { Linkedin, Mail } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/50 py-12">
    <div className="mx-auto max-w-6xl px-6 text-center">
      <p className="font-heading text-xl font-semibold text-foreground">Seth Gagnon</p>
      <p className="mt-1 text-sm text-muted-foreground">Cloud Engineering Director | Enterprise AI Strategist</p>

      <div className="mt-6 flex justify-center gap-6">
        <a href="#" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <Linkedin className="h-4 w-4" /> LinkedIn
        </a>
        <a href="#" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <Mail className="h-4 w-4" /> Email
        </a>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        AI-queryable portfolio. Ask the AI anything about my background
      </p>
      <p className="mt-2 text-xs text-muted-foreground/60">© 2026 Seth Gagnon</p>
    </div>
  </footer>
);

export default Footer;
