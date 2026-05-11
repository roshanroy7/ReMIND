import { useState } from "react";

const mono = "'JetBrains Mono', monospace";

export default function Rejected({ applications }) {
    const [search, setSearch] = useState("");
    const filtered = applications.filter(a =>
        a.status === "rejected" &&
        (a.company.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div>
            <div style={{ marginBottom: "32px" }}>
                <p style={{ fontFamily: mono, fontSize: "10px", color: "#333", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 6px" }}>// rejected</p>
                <h1 style={{ fontFamily: mono, fontSize: "28px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 4px", letterSpacing: "-1px" }}>rejected</h1>
                <p style={{ fontFamily: mono, fontSize: "11px", color: "#333", margin: 0 }}>{filtered.length} detected — every no gets you closer to yes.</p>
            </div>
            <input
                type="text"
                placeholder="// search company or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                    width: "100%", padding: "12px 16px", borderRadius: "3px", marginBottom: "20px",
                    background: "#0f0f0f", border: "1px solid #1a1a1a",
                    color: "#ccc", fontSize: "12px", outline: "none", boxSizing: "border-box",
                    fontFamily: mono,
                }}
            />
            {filtered.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: "80px" }}>
                    <p style={{ fontFamily: mono, fontSize: "11px", color: "#222" }}>// no rejections detected</p>
                    <p style={{ fontFamily: mono, fontSize: "10px", color: "#1a1a1a", marginTop: "8px" }}>// keep going 🚀</p>
                </div>
            ) : (
                filtered.map(app => (
                    <div key={app.id} style={{
                        background: "#0f0f0f", border: "1px solid #2a1a1a",
                        borderRadius: "4px", padding: "18px 20px", marginBottom: "8px",
                        transition: "border-color 0.15s ease",
                        position: "relative", overflow: "hidden"
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff336633"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a1a1a"; }}
                    >
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "rgba(255,51,102,0.3)" }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <img src={"https://www.google.com/s2/favicons?domain=" + app.company.toLowerCase() + ".com&sz=32"} alt={app.company} style={{ width: "32px", height: "32px", borderRadius: "3px", filter: "grayscale(60%)" }} />
                                <div>
                                    <p style={{ margin: 0, fontWeight: "600", color: "#555", fontSize: "14px" }}>{app.company}</p>
                                    <p style={{ margin: "2px 0 0", color: "#2a2a2a", fontSize: "11px", fontFamily: mono }}>{app.role.slice(0, 70)}</p>
                                    <p style={{ margin: "3px 0 0", color: "#1f1f1f", fontSize: "10px", fontFamily: mono }}>{app.date_applied}</p>
                                </div>
                            </div>
                            <span style={{
                                fontFamily: mono, fontSize: "9px", fontWeight: "700",
                                padding: "3px 10px", borderRadius: "2px",
                                background: "rgba(255,51,102,0.08)", color: "#ff3366",
                                border: "1px solid rgba(255,51,102,0.2)",
                                textTransform: "uppercase", letterSpacing: "1px"
                            }}>rejected</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}