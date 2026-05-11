import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import AddApplicationModal from "./AddApplicationModal";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import Interviews from "./pages/Interviews";
import Rejected from "./pages/Rejected";

const API = "https://remind-jufd.onrender.com";

function Sidebar({ user, onLogout, onSync, onAddModal, syncing }) {
  const nav = [
    { to: "/", label: "dashboard" },
    { to: "/applications", label: "applied" },
    { to: "/interviews", label: "interviews" },
    { to: "/rejected", label: "rejected" },
  ];

  return (
    <aside style={{
      width: "220px", minHeight: "100vh",
      background: "#111111",
      backgroundImage: "radial-gradient(circle, #1a1a1a 1px, transparent 1px)",
      backgroundSize: "24px 24px",
      borderRight: "1px solid #1a1a1a",
      display: "flex", flexDirection: "column",
      position: "fixed", left: 0, top: 0, zIndex: 100,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ padding: "24px 20px", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "17px", fontWeight: "800", color: "#00ff88", letterSpacing: "-0.5px" }}>
          ▸ ReMind
        </div>
        {user && (
          <p style={{ margin: "6px 0 0", fontSize: "10px", color: "#333", fontFamily: "'JetBrains Mono', monospace" }}>
            // {user.displayName ? user.displayName.split(" ")[0].toLowerCase() : "user"}
          </p>
        )}
      </div>

      <nav style={{ padding: "16px 12px", flex: 1 }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: "700", color: "#2a2a2a", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 8px" }}>// nav</p>
        {nav.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === "/"} style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: "10px",
            padding: "9px 10px", borderRadius: "3px", marginBottom: "2px",
            textDecoration: "none",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px", fontWeight: isActive ? "700" : "400",
            color: isActive ? "#00ff88" : "#444",
            background: isActive ? "rgba(0,255,136,0.05)" : "transparent",
            borderLeft: isActive ? "2px solid #00ff88" : "2px solid transparent",
          })}>
            <span style={{ fontSize: "8px" }}>▸</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: "12px", borderTop: "1px solid #1a1a1a" }}>
        {user ? (
          <>
            <button onClick={onSync} disabled={syncing} style={{
              width: "100%", padding: "9px", marginBottom: "6px",
              background: "transparent", border: "1px solid #00ff88",
              color: "#00ff88", fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px", fontWeight: "700", cursor: syncing ? "not-allowed" : "pointer",
              borderRadius: "3px", opacity: syncing ? 0.5 : 1,
            }}>
              {syncing ? "// syncing..." : "⟳ sync_gmail()"}
            </button>
            <button onClick={onAddModal} style={{
              width: "100%", padding: "9px", marginBottom: "6px",
              background: "#00ff88", border: "none",
              color: "#000", fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px", fontWeight: "700", cursor: "pointer", borderRadius: "3px",
            }}>
              + new_application()
            </button>
            <button onClick={onLogout} style={{
              width: "100%", padding: "7px",
              background: "transparent", border: "1px solid #1a1a1a",
              color: "#333", fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px", cursor: "pointer", borderRadius: "3px",
            }}>logout</button>
          </>
        ) : (
          <button onClick={() => window.location.href = API + '/auth/google'} style={{
            width: "100%", padding: "9px",
            background: "#00ff88", border: "none",
            color: "#000", fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px", fontWeight: "700", cursor: "pointer", borderRadius: "3px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}>
            <img src="https://www.google.com/favicon.ico" alt="G" style={{ width: "13px", height: "13px" }} />
            login()
          </button>
        )}
      </div>
    </aside>
  );
}

function App() {
  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await fetch(API + "/applications");
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) { }
  };

  const checkUser = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken && urlToken !== 'null') {
        localStorage.setItem('accessToken', urlToken);
        window.history.replaceState({}, '', '/');
      }
      const stored = localStorage.getItem('accessToken');
      if (stored) {
        const res = await fetch(API + "/auth/user?token=" + stored);
        const data = await res.json();
        if (data.user) setUser(data.user);
      }
    } catch (err) { }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const handleGmailSync = async () => {
    try {
      if (Notification.permission === "default") await Notification.requestPermission();
      const token = localStorage.getItem('accessToken');
      if (!token) { alert("Please log in first."); return; }
      setSyncing(true);
      const res = await fetch(API + "/gmail/sync?token=" + token);
      const data = await res.json();
      fetchApplications();
      if (Notification.permission === "granted") {
        if (data.rejected > 0) new Notification("ReMind", { body: `❌ ${data.rejected} rejection(s) detected`, icon: "/favicon.ico" });
        if (data.interviews > 0) new Notification("ReMind", { body: `📞 ${data.interviews} interview(s) detected!`, icon: "/favicon.ico" });
        if (!data.rejected && !data.interviews) new Notification("ReMind", { body: `✅ Sync done. ${data.synced} new.`, icon: "/favicon.ico" });
      } else {
        alert(`Sync complete! ${data.synced} new, ${data.rejected} rejected, ${data.interviews} interviews.`);
      }
    } catch (err) {
      alert("Could not sync Gmail");
    } finally {
      setSyncing(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(API + "/applications/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchApplications();
    } catch (err) { }
  };

  useEffect(() => {
    fetchApplications();
    checkUser();
  }, []);

  const props = { applications, handleStatusChange, fetchApplications };

  return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>
        <Sidebar user={user} onLogout={handleLogout} onSync={handleGmailSync} onAddModal={() => setShowModal(true)} syncing={syncing} />
        <main style={{ marginLeft: "220px", flex: 1, padding: "40px 48px", minHeight: "100vh" }}>
          <Routes>
            <Route path="/" element={<Dashboard {...props} />} />
            <Route path="/applications" element={<Applications {...props} />} />
            <Route path="/interviews" element={<Interviews {...props} />} />
            <Route path="/rejected" element={<Rejected {...props} />} />
          </Routes>
        </main>
        {showModal && <AddApplicationModal onClose={() => { setShowModal(false); fetchApplications(); }} />}
      </div>
    </BrowserRouter>
  );
}

export default App;