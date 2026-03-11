import { useState } from "react";
import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import WritingSection from "@/components/WritingSection";
import ExperienceSection from "@/components/ExperienceSection";
import SkillsSection from "@/components/SkillsSection";
import FitAssessmentSection from "@/components/FitAssessmentSection";
import ChatDrawer from "@/components/ChatDrawer";
import Footer from "@/components/Footer";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <NavBar onOpenChat={() => setChatOpen(true)} />
      <HeroSection onOpenChat={() => setChatOpen(true)} />
      <WritingSection />
      <ExperienceSection />
      <SkillsSection />
      <FitAssessmentSection />
      <Footer />
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Index;
