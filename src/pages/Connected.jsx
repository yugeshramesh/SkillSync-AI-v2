import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import Chip from "../components/ui/Chip";
import RadialGauge from "../components/ui/RadialGauge";
import PageTransition from "../components/ui/PageTransition";
import {
  getMyConnections,
  updateConnectionGoals,
  scheduleSession,
  respondSession,
  cancelSession,
  completeSession,
  getUpcomingSessions,
  getPendingRequests,
  getSessionHistory,
} from "../services/api";
import { connectSocket } from "../services/socket";
import "./Sessions.css";
import "./Progress.css";
import "./Connected.css";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "requests", label: "Requests" },
  { key: "history", label: "History" },
];

const STATUS_TONE = {
  pending: "yellow",
  accepted: "navy",
  completed: "navy",
  rejected: "coral",
  cancelled: "coral",
};

function formatDateTime(value) {
  const d = new Date(value);
  return d.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Connected() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null") || {};
  const [connections, setConnections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("upcoming");
  const [upcoming, setUpcoming] = useState([]);
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ topic: "", date: "", time: "", duration: 60, notes: "" });

  const [editingGoal, setEditingGoal] = useState(false);
  const [goal, setGoal] = useState("");
  const [weekly, setWeekly] = useState(2);
  const [monthly, setMonthly] = useState(8);
  const [saving, setSaving] = useState(false);

  const loadConnections = async (preferId) => {
    try {
      const res = await getMyConnections();
      const conns = res.data.connections || [];
      setConnections(conns);

      const stored = JSON.parse(localStorage.getItem("selectedConnection") || "null");
      const preferredId = preferId || stored?._id;

      if (preferredId) {
        const match = conns.find((c) => c._id === preferredId);
        if (match) {
          setSelected(match);
        } else if (stored) {
          setConnections((prev) => [stored, ...prev]);
          setSelected(stored);
        }
        localStorage.removeItem("selectedConnection");
      } else if (!selected && conns.length) {
        setSelected(conns[0]);
      } else if (selected) {
        const refreshed = conns.find((c) => c._id === selected._id);
        if (refreshed) setSelected(refreshed);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    if (!selected) return;
    try {
      const [u, r, h] = await Promise.all([
        getUpcomingSessions(selected._id),
        getPendingRequests(selected._id),
        getSessionHistory(selected._id),
      ]);
      setUpcoming(u.data.sessions || []);
      setRequests(r.data.sessions || []);
      setHistory(h.data.sessions || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadConnections();

    const socket = connectSocket();
    if (socket) {
      socket.on("session:new", () => loadConnections());
      socket.on("session:updated", () => loadConnections());
      socket.on("connection:updated", () => loadConnections());
    }
    return () => {
      if (socket) {
        socket.off("session:new");
        socket.off("session:updated");
        socket.off("connection:updated");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected) {
      setGoal(selected.learningGoal || "");
      setWeekly(selected.weeklyGoal || 2);
      setMonthly(selected.monthlyGoal || 8);
      setEditingGoal(false);
      loadSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?._id]);

  const counts = useMemo(
    () => ({ upcoming: upcoming.length, requests: requests.length, history: history.length }),
    [upcoming, requests, history]
  );

  const weeklyPct = selected ? Math.min(100, Math.round(((selected.sessionsThisWeek || 0) / (weekly || 1)) * 100)) : 0;
  const monthlyPct = selected ? Math.min(100, Math.round(((selected.sessionsThisMonth || 0) / (monthly || 1)) * 100)) : 0;

  const saveGoals = async () => {
    setSaving(true);
    try {
      const res = await updateConnectionGoals(selected._id, {
        learningGoal: goal,
        weeklyGoal: Number(weekly),
        monthlyGoal: Number(monthly),
      });
      const updated = { ...res.data.connection, otherUser: selected.otherUser };
      setSelected(updated);
      setConnections((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setEditingGoal(false);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.date || !form.time) {
      setError("Pick a date and time.");
      return;
    }

    const scheduledAt = new Date(`${form.date}T${form.time}`);

    try {
      await scheduleSession({
        recipient: selected.otherUser._id,
        topic: form.topic,
        scheduledAt,
        duration: Number(form.duration) || 60,
        notes: form.notes,
      });
      setShowForm(false);
      setForm({ topic: "", date: "", time: "", duration: 60, notes: "" });
      setTab("upcoming");
      loadSessions();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't schedule that session.");
    }
  };

  const renderSessionCard = (session, kind) => {
    const isRecipient = session.recipient?._id === currentUser.id;

    return (
      <motion.div
        key={session._id}
        className="sess-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sess-card-top">
          <span className="sess-card-when">{formatDateTime(session.scheduledAt)} · {session.duration} min</span>
          <Chip tone={STATUS_TONE[session.status] || "navy"}>{session.status}</Chip>
        </div>

        {session.topic && <p className="sess-topic">{session.topic}</p>}
        {session.notes && <p className="sess-notes">{session.notes}</p>}

        <div className="sess-actions">
          {kind === "requests" && (
            <>
              <Button size="sm" variant="primary" onClick={() => respondSession(session._id, "accepted").then(() => { loadSessions(); loadConnections(); })}>
                Accept
              </Button>
              <Button size="sm" variant="subtle" onClick={() => respondSession(session._id, "rejected").then(() => { loadSessions(); loadConnections(); })}>
                Reject
              </Button>
            </>
          )}

          {kind === "upcoming" && session.status === "accepted" && (
            <Button size="sm" variant="primary" onClick={() => completeSession(session._id).then(() => { loadSessions(); loadConnections(); })}>
              Mark complete
            </Button>
          )}

          {kind === "upcoming" && isRecipient && session.status === "pending" && (
            <span className="sess-waiting">Awaiting your response — check Requests</span>
          )}

          {kind === "upcoming" && (
            <Button size="sm" variant="subtle" onClick={() => cancelSession(session._id).then(() => { loadSessions(); loadConnections(); })}>
              Cancel
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  const list = tab === "upcoming" ? upcoming : tab === "requests" ? requests : history;

  return (
    <PageTransition>
      <AppShell wide>
        <div className="conn-shell">
          <div className="conn-sidebar">
            <div className="conn-sidebar-head">
              <h2>Connected</h2>
            </div>
            <div className="conn-list">
              {loading ? (
                <p className="dash-empty">Loading…</p>
              ) : connections.length === 0 ? (
                <p className="dash-empty">
                  No connections yet — hit “Connect” on a match to start one.
                </p>
              ) : (
                connections.map((c) => (
                  <div
                    key={c._id}
                    className={`conn-item ${selected?._id === c._id ? "active" : ""}`}
                    onClick={() => setSelected(c)}
                  >
                    <div className="conn-avatar">{c.otherUser?.name?.charAt(0)?.toUpperCase() || "?"}</div>
                    <div className="conn-item-info">
                      <h4>{c.otherUser?.name || "Unknown"}</h4>
                      <p>{c.completedSessions} sessions · {c.progress}%</p>
                    </div>
                    {c.pendingForMe > 0 && <span className="conn-badge">{c.pendingForMe}</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="conn-detail">
            {!selected ? (
              <div className="chat-window-empty">
                <h2>Select a connection to begin.</h2>
              </div>
            ) : (
              <div className="conn-detail-inner">
                <div className="conn-detail-head">
                  <div className="prog-avatar">{selected.otherUser?.name?.charAt(0)?.toUpperCase() || "?"}</div>
                  <div className="prog-card-info">
                    <h3>{selected.otherUser?.name}</h3>
                    <p>{selected.completedSessions} sessions completed</p>
                  </div>
                  <RadialGauge value={selected.progress} size={64} stroke={6} sublabel="" />
                </div>

                <div className="prog-card conn-progress-card">
                  <div className="prog-goal-row">
                    {editingGoal ? (
                      <input
                        className="prog-goal-input"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Learning goal…"
                      />
                    ) : (
                      <p className="prog-goal-text">
                        <strong>Goal:</strong> {selected.learningGoal || "Not set yet"}
                      </p>
                    )}
                  </div>

                  <div className="prog-goals-grid">
                    <div className="prog-goal-block">
                      <div className="prog-goal-head">
                        <span>Weekly goal</span>
                        <span>
                          {selected.sessionsThisWeek || 0} /{" "}
                          {editingGoal ? (
                            <input className="prog-num-input" type="number" min="1" value={weekly} onChange={(e) => setWeekly(e.target.value)} />
                          ) : (
                            selected.weeklyGoal
                          )}
                        </span>
                      </div>
                      <div className="prog-bar-track">
                        <div className="prog-bar-fill" style={{ width: `${weeklyPct}%` }} />
                      </div>
                    </div>

                    <div className="prog-goal-block">
                      <div className="prog-goal-head">
                        <span>Monthly goal</span>
                        <span>
                          {selected.sessionsThisMonth || 0} /{" "}
                          {editingGoal ? (
                            <input className="prog-num-input" type="number" min="1" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
                          ) : (
                            selected.monthlyGoal
                          )}
                        </span>
                      </div>
                      <div className="prog-bar-track">
                        <div className="prog-bar-fill teal" style={{ width: `${monthlyPct}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="prog-achievements">
                    {selected.achievements?.length ? (
                      selected.achievements.map((a) => <Chip key={a} tone="yellow">🏆 {a}</Chip>)
                    ) : (
                      <p className="dash-empty">Complete sessions to earn achievements.</p>
                    )}
                  </div>

                  {selected.progressTimeline?.length > 0 && (
                    <div className="prog-timeline">
                      <span className="prog-timeline-label">Progress timeline</span>
                      <div className="prog-timeline-list">
                        {selected.progressTimeline.slice(0, 5).map((t, i) => (
                          <div className="prog-timeline-row" key={i}>
                            <span className="prog-timeline-dot" />
                            <div>
                              <p>{t.note || "Progress update"}</p>
                              <small>{new Date(t.date).toLocaleDateString()} · {t.progress}%</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="prog-card-footer">
                    {editingGoal ? (
                      <>
                        <Button size="sm" variant="primary" onClick={saveGoals} disabled={saving}>
                          {saving ? "Saving…" : "Save"}
                        </Button>
                        <Button size="sm" variant="subtle" onClick={() => setEditingGoal(false)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="subtle" onClick={() => setEditingGoal(true)}>
                        Edit goals
                      </Button>
                    )}
                  </div>
                </div>

                <div className="conn-session-block">
                  <div className="conn-session-head">
                    <h3>Sessions with {selected.otherUser?.name}</h3>
                    <Button variant="primary" size="sm" onClick={() => setShowForm((s) => !s)}>
                      {showForm ? "Close" : "Schedule session"}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showForm && (
                      <motion.form
                        className="sess-form"
                        onSubmit={handleSchedule}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="sess-form-grid">
                          <label>
                            Topic
                            <input
                              type="text"
                              placeholder="e.g. React hooks deep dive"
                              value={form.topic}
                              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                            />
                          </label>
                          <label>
                            Date
                            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                          </label>
                          <label>
                            Time
                            <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
                          </label>
                          <label>
                            Duration (min)
                            <input type="number" min="15" step="15" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
                          </label>
                          <label className="sess-form-notes">
                            Notes
                            <input
                              type="text"
                              placeholder="Anything to prep beforehand?"
                              value={form.notes}
                              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                            />
                          </label>
                        </div>
                        {error && <p className="sess-error">{error}</p>}
                        <Button variant="primary" as="button" type="submit">
                          Send request
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="sess-tabs">
                    {TABS.map((t) => (
                      <button key={t.key} className={`sess-tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
                        {t.label}
                        <span className="sess-tab-count">{counts[t.key]}</span>
                      </button>
                    ))}
                  </div>

                  <div className="sess-list conn-sess-list">
                    <AnimatePresence>
                      {list.length === 0 ? (
                        <p className="dash-empty">Nothing here yet.</p>
                      ) : (
                        list.map((s) => renderSessionCard(s, tab))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </PageTransition>
  );
}

export default Connected;
