import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

const suggestions = [
  "What makes Seth a strong fit for VP Cloud roles?",
  "Where does Seth have honest gaps?",
  "Tell me about the At Scale newsletter",
  "What would Seth's last manager say about him?",
];

const ChatDrawer = ({ open, onClose }: ChatDrawerProps) => (
  <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
    <SheetContent side="right" className="flex w-full flex-col bg-background p-0 sm:max-w-md">
      <SheetHeader className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <SheetTitle className="font-heading text-lg">Ask AI About Seth</SheetTitle>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
      </SheetHeader>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
            What makes Seth a strong fit for VP Cloud roles?
          </div>
        </div>
        {/* AI response */}
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl rounded-tl-sm glass-card px-4 py-2.5 text-sm text-foreground leading-relaxed">
            I'll give you a specific answer. 20+ years inside large regulated enterprises means I understand the environment most VP Cloud candidates only claim to — the matrix, the compliance constraints, the budget cycles, the pace. I've built cloud functions from scratch, co-led AI governance at org scale, and kept teams intact through sustained uncertainty. That combination is not common. Want me to go deeper on any of it?
          </div>
        </div>
      </div>

      {/* Suggested chips */}
      <div className="flex flex-wrap gap-2 border-t border-border p-4 pb-2">
        {suggestions.map((s) => (
          <button key={s} className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-border p-4">
        <Input placeholder="Ask anything about my background..." className="bg-muted/30" />
        <Button size="icon" className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </SheetContent>
  </Sheet>
);

export default ChatDrawer;
