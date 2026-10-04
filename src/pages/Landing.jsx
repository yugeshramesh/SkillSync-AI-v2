import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Button from "../components/ui/Button";
import SyncMark from "../components/ui/SyncMark";
import PageTransition from "../components/ui/PageTransition";
import "./Landing.css";

const STEPS = [
  {
    n: "01",
    title: "Build your profile",
    body: "List what you can teach and what you're trying to learn, plus your year, pace and free hours.",
  },
  {
    n: "02",
    title: "Get matched by AI",
    body: "SkillSync scores every student on campus against your profile and ranks your best three partners.",
  },
  {
    n: "03",
    title: "Meet and grow",
    body: "Chat, pick a spot, and start your first session with a plan the AI already drafted for you.",
  },
];

function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem("token");
    navigate(token ? "/dashboard" : "/auth");
  };

  return (
    <PageTransition>
      <div className="landing-page">
        <Navbar onGetStarted={handleGetStarted} />
        <Hero onGetStarted={handleGetStarted} />

        <section className="how" id="how-it-works">
          <div className="how-head">
            <span className="section-eyebrow">How it works</span>
            <h2>From profile to your first study session, in three steps</h2>
          </div>

          <div className="how-steps">
            {STEPS.map((step, i) => (
              <motion.div
                className="how-step"
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span className="how-step-n">{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <Features />

        <section className="landing-cta">
          <div className="landing-cta-card">
            <SyncMark size={40} />
            <h2>Your next study partner is already on campus.</h2>
            <p>Set up your profile in under two minutes and let SkillSync find them.</p>
            <Button variant="accent" size="lg" onClick={handleGetStarted}>
              Get started — it's free
            </Button>
          </div>
        </section>

        <footer className="landing-footer">
          <div className="landing-logo">
            <SyncMark size={20} />
            <span>SkillSync</span>
          </div>
          <p>Built for the Agentic AI Hackathon 2026.</p>
        </footer>
      </div>
    </PageTransition>
  );
}

export default Landing;
