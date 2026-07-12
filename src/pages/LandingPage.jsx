import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import WhyChoose from "../components/landing/WhyChoose";
import FAQ from "../components/landing/FAQ";
import About from "../components/landing/About";
import Contact from "../components/landing/Contact";

import "../styles/landing.css";

const LandingPage = ({ onGetStarted }) => {
  return (
    <>
      <Navbar />
      <Hero onGetStarted={onGetStarted} />
      <Features />
      <HowItWorks />
      <WhyChoose />
      <FAQ />
      <About />
      <Contact />
    </>
  );
};

export default LandingPage;