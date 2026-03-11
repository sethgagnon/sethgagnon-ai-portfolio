import { useState } from "react";
import { MessageCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavBarProps {
  onOpenChat: () => void;
}

const NavBar = ({ onOpenChat }: NavBarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Writing", href: "#writing" },
    { label: "Experience", href: "#experience" },
    { label: "Fit Check", href: "#fit-check" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="font-heading text-2xl font-bold text-primary">SG</a>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
          <Button onClick={onOpenChat} size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" /> Ask AI
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="flex flex-col gap-4 border-t border-border/50 bg-background px-6 py-4 md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </a>
          ))}
          <Button onClick={() => { onOpenChat(); setMobileOpen(false); }} size="sm" className="gap-2 w-fit">
            <MessageCircle className="h-4 w-4" /> Ask AI
          </Button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
