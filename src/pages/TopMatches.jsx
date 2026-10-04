import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { getConnectionWithUser } from "../services/api";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import Chip from "../components/ui/Chip";
import RadialGauge from "../components/ui/RadialGauge";
import PageTransition from "../components/ui/PageTransition";
import "./TopMatches.css";

function TopMatches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("topMatches")) || [];
    setMatches(data);
  }, []);

  const startChat = (user) => {
    localStorage.setItem("selectedChat", JSON.stringify(user));
    navigate("/chat");
  };

  const connectWith = async (user) => {
    try {
      const res = await getConnectionWithUser(user._id);
      localStorage.setItem("selectedConnection", JSON.stringify(res.data.connection));
      navigate("/connected");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <PageTransition>
      <AppShell wide>
        <div className="tm">
          <motion.div
            className="tm-head"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="dash-eyebrow">Your matches</span>
            <h1>Your best learning partners</h1>
            <p>Ranked by SkillSync AI on skill fit, schedule and department overlap.</p>
          </motion.div>

          {matches.length === 0 ? (
            <div className="tm-empty">
              <h2>No matches yet</h2>
              <p>Ask more classmates to register and complete their profiles, then run the match again.</p>
              <Button variant="primary" onClick={() => navigate("/loading")}>
                Find matches
              </Button>
            </div>
          ) : (
            <div className="tm-grid">
              {matches.map((user, index) => (
                <motion.div
                  className="tm-card"
                  key={user._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="tm-card-top">
                    <span className="tm-rank">{String(index + 1).padStart(2, "0")}</span>
                    <RadialGauge value={Math.min(user.compatibility, 100)} size={64} stroke={6} sublabel="" />
                  </div>

                  <h3>{user.name}</h3>
                  <p className="tm-college">{user.college}</p>

                  <div className="tm-meta">
                    <span>{user.department}</span>
                    <span className="tm-dot" />
                    <span>{user.year}</span>
                  </div>

                  <div className="tm-detail-rows">
                    <div>
                      <dt>Learning style</dt>
                      <dd>{user.learningStyle || "Not added"}</dd>
                    </div>
                    <div>
                      <dt>Preferred time</dt>
                      <dd>{user.preferredTime || "Not added"}</dd>
                    </div>
                  </div>

                  <div className="tm-skill-block">
                    <span className="tm-skill-label">Can teach</span>
                    <div className="tm-chip-wrap">
                      {user.teaches?.length > 0 ? (
                        user.teaches.map((skill, i) => (
                          <Chip key={i} tone="navy">{skill}</Chip>
                        ))
                      ) : (
                        <p className="dash-empty">No skills added.</p>
                      )}
                    </div>
                  </div>

                  <div className="tm-skill-block">
                    <span className="tm-skill-label">Wants to learn</span>
                    <div className="tm-chip-wrap">
                      {user.learns?.length > 0 ? (
                        user.learns.map((skill, i) => (
                          <Chip key={i} tone="yellow">{skill}</Chip>
                        ))
                      ) : (
                        <p className="dash-empty">No learning goals.</p>
                      )}
                    </div>
                  </div>

                  <div className="tm-btn-row">
                    <Button variant="primary" className="tm-chat-btn" onClick={() => startChat(user)}>
                      Start chat
                    </Button>
                    <Button variant="subtle" className="tm-chat-btn" onClick={() => connectWith(user)}>
                      Connect
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </PageTransition>
  );
}

export default TopMatches;
