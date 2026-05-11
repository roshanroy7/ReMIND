import { useState } from "react";

const mono = "'JetBrains Mono', monospace";

export default function Interviews({ applications }) {
    const [search, setSearch] = useState("");
    const filtered = applications.filter(a =>
        a.status === "interview" &&
        (a.company.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div>
            <div style={{ marginBottom: "32px" }}>
                <p style={{ fontFamily: mono, fontSize: "10px", color: "#333", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 6px" }}>// interviews</p>
                <h1 style={{ fontFamily: mono, fontSize: "28px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 4px", letterSpacing: "-1px" }}>interviews</h1>
                <p style={{ fontFamily: mono, fontSize: "11px", color: "#333", margin: 0 }}>{filtered.length} active</p>
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
                    <p style={{ fontFamily: mono, fontSize: "11px", color: "#222" }}>// no interviews detected yet</p>
                    <p style={{ fontFamily: mono, fontSize: "10px", color: "#1a1a1a", marginTop: "8px" }}>// sync gmail to auto-detect</p>
                </div>
            ) : (
                filtered.map(app => (
                    <div key={app.id} style={{
                        background: "#0f0f0f", border: "1px solid #1a2030",
                        borderRadius: "4px", padding: "18px 20px", marginBottom: "8px",
                        transition: "border-color 0.15s ease",
                        position: "relative", overflow: "hidden"
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#00aaff33"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2030"; }}
                    >
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "rgba(0,170,255,0.3)" }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <img src={"https://www.google.com/s2/favicons?domain=" + app.company.toLowerCase() + ".com&sz=32"} alt={app.company} style={{ width: "32px", height: "32px", borderRadius: "3px" }} />
                                <div>
                                    <p style={{ margin: 0, fontWeight: "600", color: "#e2e8f0", fontSize: "14px" }}>{app.company}</p>
                                    <p style={{ margin: "2px 0 0", color: "#333", fontSize: "11px", fontFamily: mono }}>{app.role.slice(0, 70)}</p>
                                    <p style={{ margin: "3px 0 0", color: "#222", fontSize: "10px", fontFamily: mono }}>{app.date_applied}</p>
                                </div>
                            </div>
                            <span style={{
                                fontFamily: mono, fontSize: "9px", fontWeight: "700",
                                padding: "3px 10px", borderRadius: "2px",
                                background: "rgba(0,170,255,0.08)", color: "#00aaff",
                                border: "1px solid rgba(0,170,255,0.2)",
                                textTransform: "uppercase", letterSpacing: "1px"
                            }}>interview</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}