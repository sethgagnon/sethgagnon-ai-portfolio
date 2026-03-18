import { useState } from "react";
import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import WritingSection from "@/components/WritingSection";
import QuickTakesSection from "@/components/QuickTakesSection";
import ExperienceSection from "@/components/ExperienceSection";
import SkillsSection from "@/components/SkillsSection";
import AIToolsSection from "@/components/AIToolsSection";
import FitAssessmentSection from "@/components/FitAssessmentSection";
import ChatDrawer from "@/components/ChatDrawer";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <NavBar onOpenChat={() => setChatOpen(true)} />
      <HeroSection onOpenChat={() => setChatOpen(true)} />
      <ErrorBoundary>
        <WritingSection />
      </ErrorBoundary>
      <ErrorBoundary>
        <QuickTakesSection />
      </ErrorBoundary>
      <ErrorBoundary>
        <ExperienceSection />
      </ErrorBoundary>
      <ErrorBoundary>
        <SkillsSection />
      </ErrorBoundary>
      <ErrorBoundary>
        <AIToolsSection />
      </ErrorBoundary>
      <ErrorBoundary>
        <FitAssessmentSection />
      </ErrorBoundary>
      <Footer />
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Index;
