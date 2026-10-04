import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { findMatches } from "../services/api";
import SyncMark from "../components/ui/SyncMark";
import PageTransition from "../components/ui/PageTransition";
import "./Loading.css";

const STEPS = [
  "Reading your profile",
  "Understanding your skills",
  "Scanning compatible students",
  "Scoring AI compatibility",
  "Preparing your best matches",
];

function Loading() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const res = await findMatches();
        localStorage.setItem("topMatches", JSON.stringify(res.data.matches));
      } catch (error) {
        console.log(error);
      }
    };

    loadMatches();

    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev === STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => navigate("/topmatches"), 800);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <PageTransition>
      <div className="ld-page">
        <div className="ld-card">
          <motion.div
            className="ld-orbit"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <span />
            <span />
          </motion.div>

          <motion.div
            className="ld-mark"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <SyncMark size={40} />
          </motion.div>

          <h1>Matching you now</h1>

          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {STEPS[step]}…
          </motion.p>

          <div className="ld-bar">
            <motion.div
              className="ld-bar-fill"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <div className="ld-steps">
            {STEPS.map((s, i) => (
              <span key={s} className={i <= step ? "is-done" : ""} />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Loading;
