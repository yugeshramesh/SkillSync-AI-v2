import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import Chip from "../components/ui/Chip";
import RadialGauge from "../components/ui/RadialGauge";
import PageTransition from "../components/ui/PageTransition";
import {
  getPendingRequests,
  getUpcomingSessions,
  getMyConnections,
} from "../services/api";
import { connectSocket } from "../services/socket";
import "./Dashboard.css";

const ICONS = {
  profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  match: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="15" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  heart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20s-7.5-4.6-9.6-9.4C.7 6.9 3 3.6 6.5 3.6c2 0 3.6 1.1 4.5 2.7.9-1.6 2.5-2.7 4.5-2.7 3.5 0 5.8 3.3 4.1 7C19.5 15.4 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  chat: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  check: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 10h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  trend: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 16l5-6 4 4 7-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [topMatch, setTopMatch] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [connCount, setConnCount] = useState(0);
  const [avgProgress, setAvgProgress] = useState(0);

  const loadLiveStats = async () => {
    try {
      const [reqs, upcoming, connections] = await Promise.all([
        getPendingRequests(),
        getUpcomingSessions(),
        getMyConnections(),
      ]);
      setPendingCount(reqs.data.sessions?.length || 0);
      setUpcomingCount(upcoming.data.sessions?.length || 0);
      const conns = connections.data.connections || [];
      setConnCount(conns.length);
      setAvgProgress(
        conns.length
          ? Math.round(conns.reduce((sum, c) => sum + (c.progress || 0), 0) / conns.length)
          : 0
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);

    const matches = JSON.parse(localStorage.getItem("topMatches") || "[]");
    if (matches.length) setTopMatch(matches[0]);

    loadLiveStats();

    // Reflect session/connection changes here the instant they happen
    // anywhere else in the app (accepting a request, completing a
    // session, receiving a message), without needing a manual refresh.
    const socket = connectSocket();
    if (socket) {
      socket.on("session:new", loadLiveStats);
      socket.on("session:updated", loadLiveStats);
      socket.on("connection:updated", loadLiveStats);
    }
    return () => {
      if (socket) {
        socket.off("session:new", loadLiveStats);
        socket.off("session:updated", loadLiveStats);
        socket.off("connection:updated", loadLiveStats);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  if (!user) {
    return (
      <div className="dash-loading">
        <div className="dash-loading-mark" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  const teaches = user.teaches || [];
  const learns = user.learns || [];

  const checklist = [
    { label: "Add skills you can teach", done: teaches.length > 0 },
    { label: "Add skills you want to learn", done: learns.length > 0 },
    { label: "Set your learning style & schedule", done: Boolean(user.learningStyle) },
    { label: "Run your first AI match", done: Boolean(topMatch) },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const completion = Math.round((doneCount / checklist.length) * 100);

  const actions = [
    { icon: ICONS.profile, title: "Complete profile", body: "Update your skills & preferences.", to: "/profile" },
    { icon: ICONS.match, title: "Find AI match", body: "Run the matching engine again.", to: "/loading" },
    { icon: ICONS.heart, title: "My matches", body: "See your ranked learning partners.", to: "/topmatches" },
    { icon: ICONS.chat, title: "AI chat", body: "Message a match or your mentor.", to: "/chat" },
    {
      icon: ICONS.calendar,
      title: "Connected",
      body: pendingCount > 0 ? `${pendingCount} request${pendingCount > 1 ? "s" : ""} waiting` : "Sessions & progress with your connections.",
      to: "/connected",
    },
  ];

  const skillBars = [...teaches.map((s) => ({ label: s, kind: "teach" })), ...learns.map((s) => ({ label: s, kind: "learn" }))].slice(0, 5);

  return (
    <PageTransition>
      <AppShell wide>
        <div className="dash">
          <motion.div
            className="dash-welcome"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div>
              <span className="dash-eyebrow">Welcome back</span>
              <h1>{user.name?.split(" ")[0] || "there"}, ready for a session?</h1>
              <div className="dash-pill-row">
                <span className="dash-stat-pill dark">Profile {completion}%</span>
                <span className="dash-stat-pill">{teaches.length} skills taught</span>
                <span className="dash-stat-pill outline">{learns.length} to learn</span>
                {pendingCount > 0 && (
                  <span className="dash-stat-pill live" onClick={() => navigate("/connected")}>
                    {pendingCount} session request{pendingCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            <div className="dash-headline-stats">
              <div>
                <span>{teaches.length}</span>
                <p>Teaching</p>
              </div>
              <div>
                <span>{learns.length}</span>
                <p>Learning</p>
              </div>
              <div>
                <span>{topMatch ? `${topMatch.compatibility}%` : "—"}</span>
                <p>Top match</p>
              </div>
              <div>
                <span>{upcomingCount}</span>
                <p>Upcoming sessions</p>
              </div>
              <div>
                <span>{connCount ? `${avgProgress}%` : "—"}</span>
                <p>Avg. progress</p>
              </div>
            </div>
          </motion.div>

          <div className="dash-grid">
            <motion.div
              className="dash-card dash-profile-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
            >
              <div className="dash-profile-avatar">{user.name?.charAt(0)?.toUpperCase() || "S"}</div>
              <h3>{user.name}</h3>
              <p>{user.department || "Department not set"}</p>
              <span className="dash-year-badge">{user.year || "Year not set"}</span>
              <Button variant="subtle" size="sm" className="dash-profile-btn" onClick={() => navigate("/profile")}>
                Edit profile
              </Button>
            </motion.div>

            <motion.div
              className="dash-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <div className="dash-card-head">
                <h3>Skill breakdown</h3>
              </div>
              {skillBars.length === 0 ? (
                <p className="dash-empty">Add skills to your profile to see them here.</p>
              ) : (
                <div className="dash-skill-bars">
                  {skillBars.map((s, i) => (
                    <div className="dash-skill-bar-row" key={s.label + i}>
                      <span>{s.label}</span>
                      <div className="dash-skill-track">
                        <motion.div
                          className={`dash-skill-fill ${s.kind}`}
                          initial={{ width: 0 }}
                          animate={{ width: s.kind === "teach" ? "82%" : "58%" }}
                          transition={{ duration: 0.7, delay: 0.2 + i * 0.06 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="dash-legend">
                <span><i className="teach" /> Can teach</span>
                <span><i className="learn" /> Want to learn</span>
              </div>
            </motion.div>

            <motion.div
              className="dash-card dash-match-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
            >
              <div className="dash-card-head">
                <h3>Top match</h3>
              </div>
              <RadialGauge value={topMatch ? Math.min(topMatch.compatibility, 100) : 0} size={128} stroke={11} sublabel="compatible" />
              <p className="dash-match-name">{topMatch ? topMatch.name : "No match yet"}</p>
              <Button variant="primary" size="sm" onClick={() => navigate("/loading")}>
                {topMatch ? "Refresh match" : "Find a match"}
              </Button>
            </motion.div>

            <motion.div
              className="dash-card dash-checklist-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              <div className="dash-card-head">
                <h3>Setup checklist</h3>
                <span>{doneCount}/{checklist.length}</span>
              </div>
              <div className="dash-check-list">
                {checklist.map((item) => (
                  <div className={`dash-check-row ${item.done ? "done" : ""}`} key={item.label}>
                    <span className="dash-check-icon">{item.done && ICONS.check}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="dash-actions-grid">
            {actions.map((a, i) => (
              <motion.div
                key={a.title}
                className="dash-action-card"
                onClick={() => navigate(a.to)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.05 }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="dash-action-icon">{a.icon}</div>
                <h4>{a.title}</h4>
                <p>{a.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="dash-lower-grid">
            <motion.div
              className="dash-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35 }}
            >
              <div className="dash-card-head">
                <h3>Skills you teach</h3>
              </div>
              {teaches.length ? (
                <div className="dash-chip-wrap">
                  {teaches.map((s) => (
                    <Chip key={s} tone="navy">{s}</Chip>
                  ))}
                </div>
              ) : (
                <p className="dash-empty">Nothing added yet — head to your profile.</p>
              )}

              <div className="dash-card-head" style={{ marginTop: 22 }}>
                <h3>Skills you want to learn</h3>
              </div>
              {learns.length ? (
                <div className="dash-chip-wrap">
                  {learns.map((s) => (
                    <Chip key={s} tone="yellow">{s}</Chip>
                  ))}
                </div>
              ) : (
                <p className="dash-empty">Nothing added yet — head to your profile.</p>
              )}
            </motion.div>

            <motion.div
              className="dash-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.4 }}
            >
              <div className="dash-card-head">
                <h3>Your details</h3>
              </div>
              <dl className="dash-detail-list">
                <div><dt>Name</dt><dd>{user.name}</dd></div>
                <div><dt>Email</dt><dd>{user.email}</dd></div>
                <div><dt>College</dt><dd>{user.college || "—"}</dd></div>
                <div><dt>Department</dt><dd>{user.department || "—"}</dd></div>
                <div><dt>Year</dt><dd>{user.year || "—"}</dd></div>
              </dl>
            </motion.div>
          </div>
        </div>
      </AppShell>
    </PageTransition>
  );
}

export default Dashboard;
