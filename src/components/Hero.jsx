import { motion } from "framer-motion";
import Button from "./ui/Button";
import Chip from "./ui/Chip";
import RadialGauge from "./ui/RadialGauge";
import "./Hero.css";

function Hero({ onGetStarted }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <motion.span
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Peer learning, matched by AI
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          Learn what you love.
          <br />
          Teach what you <span className="hero-highlight">know.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
        >
          SkillSync AI reads what you can teach and what you want to learn,
          then pairs you with the classmate on campus who fits best —
          down to your schedule, your pace and your favourite study spot.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
        >
          <Button variant="accent" size="lg" onClick={onGetStarted}>
            Get started — it's free
          </Button>
          <Button variant="ghost" size="lg" as="a" href="#how-it-works">
            See how it works
          </Button>
        </motion.div>

        <motion.div
          className="hero-proof"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="hero-proof-avatars">
            <span>R</span>
            <span>P</span>
            <span>A</span>
          </div>
          <p>Built for study groups, hackathon teams and course cohorts</p>
        </motion.div>
      </div>

      <motion.div
        className="hero-visual"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hero-card">
          <div className="hero-card-top">
            <div className="hero-card-avatar">RS</div>
            <div>
              <h4>Rahul Sharma</h4>
              <p>CSE · 3rd Year</p>
            </div>
            <RadialGauge value={92} size={56} stroke={6} sublabel="" />
          </div>

          <div className="hero-card-row">
            <span className="hero-card-label">Can teach</span>
            <div className="hero-card-chips">
              <Chip tone="navy">React</Chip>
              <Chip tone="navy">Node.js</Chip>
            </div>
          </div>

          <div className="hero-card-row">
            <span className="hero-card-label">Wants to learn</span>
            <div className="hero-card-chips">
              <Chip tone="yellow">Machine Learning</Chip>
            </div>
          </div>

          <div className="hero-card-foot">
            <span>Evenings · Innovation Lab</span>
            <span className="hero-card-dot" /> Available now
          </div>
        </div>

        <motion.div
          className="hero-card hero-card-back"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
      </motion.div>
    </section>
  );
}

export default Hero;
