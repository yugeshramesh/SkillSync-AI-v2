import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import students from "../data/students";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import Chip from "../components/ui/Chip";
import RadialGauge from "../components/ui/RadialGauge";
import PageTransition from "../components/ui/PageTransition";
import "./Match.css";

function Panel({ title, children, delay = 0 }) {
  return (
    <motion.div
      className="mt-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <h4>{title}</h4>
      {children}
    </motion.div>
  );
}

function Match() {
  const navigate = useNavigate();

  const [bestMatch, setBestMatch] = useState(null);
  const [matchPercent, setMatchPercent] = useState(0);
  const [reasons, setReasons] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("profile"));
    if (!profile) return;

    setUserName(profile.name);

    const knows = profile.skillsKnow.split(",").map((s) => s.trim().toLowerCase());
    const learns = profile.skillsLearn.split(",").map((s) => s.trim().toLowerCase());

    const matches = [];

    students.forEach((student) => {
      let score = 0;
      const tempReasons = [];

      student.teaches.forEach((skill) => {
        if (learns.includes(skill.toLowerCase())) {
          score += 25;
          tempReasons.push(`${student.name} can teach ${skill}`);
        }
      });

      student.learns.forEach((skill) => {
        if (knows.includes(skill.toLowerCase())) {
          score += 20;
          tempReasons.push(`${student.name} wants to learn ${skill}`);
        }
      });

      if (profile.department && student.department && profile.department.toLowerCase() === student.department.toLowerCase()) {
        score += 10;
        tempReasons.push("Same department");
      }

      if (profile.year && student.year && profile.year === student.year) {
        score += 10;
        tempReasons.push("Same academic year");
      }

      matches.push({ student, score, reasons: tempReasons });
    });

    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, 3);
    localStorage.setItem("topMatches", JSON.stringify(topMatches));

    const best = topMatches[0];
    if (best) {
      setBestMatch(best.student);
      setMatchPercent(best.score);
      setReasons(best.reasons);
      localStorage.setItem("matchedStudent", JSON.stringify(best.student));
    }
  }, []);

  if (!bestMatch) {
    return (
      <PageTransition>
        <AppShell>
          <div className="mt-empty">
            <h1>No match found yet</h1>
            <p>Complete your profile first so SkillSync has something to match against.</p>
            <Button variant="primary" onClick={() => navigate("/profile")}>
              Go to profile
            </Button>
          </div>
        </AppShell>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <AppShell>
        <div className="mt">
          <motion.div
            className="mt-hero"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <RadialGauge value={Math.min(matchPercent, 100)} size={128} stroke={11} sublabel="match" />
            <div>
              <span className="dash-eyebrow">AI match result</span>
              <h1>Hello {userName}, meet {bestMatch.name}</h1>
              <p>SkillSync AI found your strongest learning partner on campus.</p>
              <div className="mt-hero-actions">
                <Button variant="primary" onClick={() => navigate("/chat")}>Start conversation</Button>
                <Button variant="ghost" onClick={() => navigate("/topmatches")}>View top 3 matches</Button>
              </div>
            </div>
          </motion.div>

          <div className="mt-grid">
            <Panel title="Student details" delay={0.05}>
              <dl className="mt-dl">
                <div><dt>Name</dt><dd>{bestMatch.name}</dd></div>
                <div><dt>College</dt><dd>{bestMatch.college}</dd></div>
                <div><dt>Department</dt><dd>{bestMatch.department}</dd></div>
                <div><dt>Year</dt><dd>{bestMatch.year}</dd></div>
                <div><dt>Learning style</dt><dd>{bestMatch.learningStyle}</dd></div>
                <div><dt>Location</dt><dd>{bestMatch.location}</dd></div>
              </dl>
            </Panel>

            <Panel title="Can teach" delay={0.1}>
              <div className="mt-chip-wrap">
                {bestMatch.teaches.map((skill, i) => (
                  <Chip key={i} tone="navy">{skill}</Chip>
                ))}
              </div>
            </Panel>

            <Panel title="Wants to learn" delay={0.15}>
              <div className="mt-chip-wrap">
                {bestMatch.learns.map((skill, i) => (
                  <Chip key={i} tone="yellow">{skill}</Chip>
                ))}
              </div>
            </Panel>

            <Panel title="Why AI chose this match" delay={0.2}>
              <ul className="mt-reason-list">
                {reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </Panel>

            <Panel title="Suggested meeting place" delay={0.25}>
              <p className="mt-plain">Innovation Lab, Library Discussion Room</p>
            </Panel>

            <Panel title="Suggested first session" delay={0.3}>
              <p className="mt-plain">
                Spend 30 minutes introducing yourselves and your goals, then start on the first
                topic you both selected.
              </p>
            </Panel>
          </div>
        </div>
      </AppShell>
    </PageTransition>
  );
}

export default Match;
