import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SyncMark from "../ui/SyncMark";
import { connectSocket, disconnectSocket } from "../../services/socket";
import "./AppShell.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/topmatches", label: "Matches" },
  { to: "/connected", label: "Connected" },
  { to: "/chat", label: "Chat" },
  { to: "/profile", label: "Profile" },
];

function AppShell({ children, wide = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [live, setLive] = useState(false);

  // AppShell wraps every logged-in page, so this is the natural place to
  // keep a single Socket.IO connection alive for the whole session.
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    const onConnect = () => setLive(true);
    const onDisconnect = () => setLive(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) setLive(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const logout = () => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <div className="shell">
      <header className="shell-top">
        <div className={`shell-top-inner ${wide ? "wide" : ""}`}>
          <Link to="/dashboard" className="shell-logo">
            <SyncMark size={26} />
            <span>SkillSync</span>
          </Link>

          <nav className="shell-nav">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} className="shell-nav-item">
                  {active && (
                    <motion.span
                      layoutId="shell-nav-pill"
                      className="shell-nav-pill"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className={active ? "is-active" : ""}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="shell-actions">
            <span className={`shell-live-dot ${live ? "on" : ""}`} title={live ? "Live" : "Offline"} />
            <button className="shell-icon-btn" onClick={logout} title="Log out" aria-label="Log out">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 17l5-5-5-5M20 12H9M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="shell-avatar">{initial}</div>
          </div>
        </div>
      </header>

      <main className="shell-main">{children}</main>
    </div>
  );
}

export default AppShell;
