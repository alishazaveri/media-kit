import Nav from "./components/Nav";
import Hero from "./components/Hero";
import StepsSection from "./components/StepsSection";
import AnalyticsSection from "./components/AnalyticsSection";
import FeatureCardsSection from "./components/FeatureCardsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import ClaimBar from "./components/ClaimBar";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <StepsSection />
      <AnalyticsSection />
      <FeatureCardsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
      <ClaimBar />
    </main>
  );
}
