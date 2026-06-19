import { Navbar } from '../../components/layout/Navbar';
import { HeroSection } from './sections/HeroSection';
import { TechStackBar } from './sections/TechStackBar';
import { FeaturesSection } from './sections/FeaturesSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { StatsSection } from './sections/StatsSection';
import { ShowcaseSection } from './sections/ShowcaseSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { FAQSection } from './sections/FAQSection';
import { FooterSection } from './sections/FooterSection';

export function Landing() {
  return (
    <div className="min-h-screen bg-surface text-white overflow-x-hidden">
      {/* ── Ambient background ── */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div
        className="fixed top-[-25%] left-[-15%] w-[700px] h-[700px] rounded-full pointer-events-none animate-glow-pulse"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)' }}
      />
      <div
        className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none animate-glow-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
          animationDelay: '2s',
        }}
      />

      {/* ── Shared navbar ── */}
      <Navbar />

      {/* ── Sections ── */}
      <HeroSection />
      <TechStackBar />

      <div className="relative z-10 h-px max-w-5xl mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.25), transparent)' }} />

      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <ShowcaseSection />
      <TestimonialsSection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}
