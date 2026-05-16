import Nav from "../components/website/Nav";
import Hero from "../components/website/Hero";
import StepsSection from "../components/website/StepsSection";
import AnalyticsSection from "../components/website/AnalyticsSection";
import FeatureCardsSection from "../components/website/FeatureCardsSection";
import TestimonialsSection from "../components/website/TestimonialsSection";
import CTASection from "../components/website/CTASection";
import Footer from "../components/website/Footer";
import ClaimBar from "../components/website/ClaimBar";

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
