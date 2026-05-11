import { useNavigate } from "react-router-dom";

const mono = "'JetBrains Mono', monospace";

const StatCard = ({ label, count, color, borderColor, to, navigate, desc }) => (
    <div onClick={() => navigate(to)} style={{
        background: "#0f0f0f", border: `1px solid ${borderColor}`,
        borderRadius: "4px", padding: "28px 24px", cursor: "pointer",
        flex: 1, position: "relative", overflow: "hidden",
        transition: "border-color 0.15s ease",
    }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = color; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = borderColor; }}
    >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: color, opacity: 0.6 }} />
        <p style={{ fontFamily: mono, fontSize: "11px", color: "#444", margin: "0 0 12px", letterSpacing: "1px", textTransform: "uppercase" }}>{label}</p>
        <p style={{ fontFamily: mono, fontSize: "48px", fontWeight: "800", color, margin: "0 0 8px", letterSpacing: "-2px", lineHeight: 1 }}>{count}</p>
        <p style={{ fontSize: "11px", color: "#333", margin: 0, fontFamily: mono }}>{desc}</p>
        <div style={{ position: "absolute", bottom: "16px", right: "16px", fontFamily: mono, fontSize: "10px", color: "#2a2a2a" }}>view →</div>
    </div>
);

export default function Dashboard({ applications }) {
    const navigate = useNavigate();
    const applied = applications.filter(a => a.status === "applied").length;
    const interviews = applications.filter(a => a.status === "interview").length;
    const rejected = applications.filter(a => a.status === "rejected").length;
    const total = applications.length;
    const rate = total > 0 ? Math.round((interviews / total) * 100) : 0;
    const recent = applications.slice(0, 6);

    return (
        <div>
            <div style={{ marginBottom: "36px" }}>
                <p style={{ fontFamily: mono, fontSize: "10px", color: "#333", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 6px" }}>// overview</p>
                <h1 style={{ fontFamily: mono, fontSize: "28px", fontWeight: "800", color: "#f1f5f9", margin: 0, letterSpacing: "-1px" }}>dashboard</h1>
            </div>

            <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
                <StatCard label="applied" count={applied} color="#00ff88" borderColor="#1a2a1a" to="/applications" navigate={navigate} desc="active applications" />
                <StatCard label="interviews" count={interviews} color="#00aaff" borderColor="#1a1a2a" to="/interviews" navigate={navigate} desc="in progress" />
                <StatCard label="rejected" count={rejected} color="#ff3366" borderColor="#2a1a1a" to="/rejected" navigate={navigate} desc="auto-detected" />
            </div>

            {/* Interview rate */}
            <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: "4px", padding: "24px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "14px" }}>
                    <div>
                        <p style={{ fontFamily: mono, fontSize: "10px", color: "#333", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 4px" }}>// interview_rate</p>
                        <p style={{ fontFamily: mono, fontSize: "13px", color: "#555", margin: 0 }}>{interviews} interviews / {total} total</p>
                    </div>
                    <span style={{ fontFamily: mono, fontSize: "32px", fontWeight: "800", color: "#00aaff", letterSpacing: "-1px" }}>{rate}%</span>
                </div>
                <div style={{ height: "4px", background: "#1a1a1a", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: rate + "%", background: "linear-gradient(90deg, #00ff88, #00aaff)", borderRadius: "2px", transition: "width 1s ease" }} />
                </div>
            </div>

            {/* Recent */}
            <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: "4px", padding: "24px" }}>
                <p style={{ fontFamily: mono, fontSize: "10px", color: "#333", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px" }}>// recent_activity</p>
                {recent.length === 0 ? (
                    <p style={{ fontFamily: mono, fontSize: "12px", color: "#333" }}>// no data. sync gmail to populate.</p>
                ) : (
                    recent.map((app, i) => (
                        <div key={app.id} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "10px 0",
                            borderBottom: i < recent.length - 1 ? "1px solid #141414" : "none"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <img src={"https://www.google.com/s2/favicons?domain=" + app.company.toLowerCase() + ".com&sz=32"} alt={app.company} style={{ width: "24px", height: "24px", borderRadius: "3px", filter: "grayscale(20%)" }} />
                                <div>
                                    <p style={{ margin: 0, fontWeight: "600", color: "#ccc", fontSize: "13px" }}>{app.company}</p>
                                    <p style={{ margin: 0, color: "#333", fontSize: "11px", fontFamily: mono }}>{app.role.slice(0, 50)}</p>
                                </div>
                            </div>
                            <span style={{
                                fontFamily: mono, fontSize: "10px", fontWeight: "700",
                                padding: "3px 10px", borderRadius: "2px",
                                background: app.status === "applied" ? "rgba(0,255,136,0.08)" : app.status === "interview" ? "rgba(0,170,255,0.08)" : "rgba(255,51,102,0.08)",
                                color: app.status === "applied" ? "#00ff88" : app.status === "interview" ? "#00aaff" : "#ff3366",
                                border: `1px solid ${app.status === "applied" ? "rgba(0,255,136,0.2)" : app.status === "interview" ? "rgba(0,170,255,0.2)" : "rgba(255,51,102,0.2)"}`,
                                textTransform: "uppercase", letterSpacing: "1px"
                            }}>{app.status}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}