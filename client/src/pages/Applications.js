import { useState, useRef } from "react";

const mono = "'JetBrains Mono', monospace";
const SUPABASE_URL = "https://nkwmkxnixemmifniezur.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rd21reG5peGVtbWlmbmllenVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTA0NjksImV4cCI6MjA5MzgyNjQ2OX0.6RtYf6JGqrLiOgDQEMMtMc4fxEQCtUoN-KcLnC12-2I";

const AppCard = ({ app, handleStatusChange, fetchApplications }) => {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef();

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fileName = `${app.id}_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
            const uploadRes = await fetch(
                `${SUPABASE_URL}/storage/v1/object/resumes/${fileName}`,
                {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": file.type },
                    body: file
                }
            );
            if (!uploadRes.ok) throw new Error("Upload failed");
            const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/resumes/${fileName}`;
            await fetch(`https://remind-jufd.onrender.com/applications/${app.id}/cv`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cv_url: publicUrl })
            });
            fetchApplications();
        } catch (err) {
            alert("Upload failed. Try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{
            background: "#0f0f0f", border: "1px solid #1a1a1a",
            borderRadius: "4px", padding: "18px 20px", marginBottom: "8px",
            transition: "border-color 0.15s ease",
            position: "relative", overflow: "hidden"
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <img src={"https://www.google.com/s2/favicons?domain=" + app.company.toLowerCase() + ".com&sz=32"} alt={app.company} style={{ width: "32px", height: "32px", borderRadius: "3px" }} />
                    <div>
                        <p style={{ margin: 0, fontWeight: "600", color: "#e2e8f0", fontSize: "14px" }}>{app.company}</p>
                        <p style={{ margin: "2px 0 0", color: "#333", fontSize: "11px", fontFamily: mono }}>{app.role.slice(0, 70)}</p>
                        <p style={{ margin: "3px 0 0", color: "#222", fontSize: "10px", fontFamily: mono }}>{app.date_applied}</p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{
                        fontFamily: mono, fontSize: "9px", fontWeight: "700",
                        padding: "3px 8px", borderRadius: "2px",
                        background: "rgba(0,255,136,0.08)", color: "#00ff88",
                        border: "1px solid rgba(0,255,136,0.15)",
                        textTransform: "uppercase", letterSpacing: "1px", marginRight: "6px"
                    }}>applied</span>
                    <button onClick={() => handleStatusChange(app.id, "applied")} style={{
                        padding: "5px 10px", borderRadius: "3px", border: "1px solid #1a1a1a",
                        fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: mono,
                        background: app.status === "applied" ? "#00ff88" : "transparent",
                        color: app.status === "applied" ? "#000" : "#333",
                    }}>applied</button>
                    <button onClick={() => handleStatusChange(app.id, "interview")} style={{
                        padding: "5px 10px", borderRadius: "3px", border: "1px solid #1a1a1a",
                        fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: mono,
                        background: app.status === "interview" ? "#00aaff" : "transparent",
                        color: app.status === "interview" ? "#000" : "#333",
                    }}>interview</button>
                </div>
            </div>

            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #141414", display: "flex", alignItems: "center", gap: "10px" }}>
                {app.cv_url ? (
                    <>
                        <a href={app.cv_url} target="_blank" rel="noreferrer" style={{
                            fontFamily: mono, fontSize: "10px", fontWeight: "700", color: "#00ff88",
                            textDecoration: "none", padding: "4px 10px", borderRadius: "2px",
                            background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)",
                            letterSpacing: "0.5px"
                        }}>▸ view_resume.pdf</a>
                        <button onClick={() => fileRef.current.click()} style={{
                            fontFamily: mono, fontSize: "10px", color: "#333", cursor: "pointer",
                            background: "transparent", border: "none", padding: 0, letterSpacing: "0.5px"
                        }}>replace</button>
                    </>
                ) : (
                    <button onClick={() => fileRef.current.click()} disabled={uploading} style={{
                        fontFamily: mono, fontSize: "10px", fontWeight: "600",
                        color: uploading ? "#222" : "#333",
                        cursor: uploading ? "not-allowed" : "pointer",
                        background: "transparent", border: "1px solid #1a1a1a",
                        padding: "4px 10px", borderRadius: "2px", letterSpacing: "0.5px"
                    }}>
                        {uploading ? "// uploading..." : "+ attach_resume()"}
                    </button>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={handleUpload} />
            </div>
        </div>
    );
};

export default function Applications({ applications, handleStatusChange, fetchApplications }) {
    const [search, setSearch] = useState("");
    const filtered = applications.filter(a =>
        a.status === "applied" &&
        (a.company.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div>
            <div style={{ marginBottom: "32px" }}>
                <p style={{ fontFamily: mono, fontSize: "10px", color: "#333", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 6px" }}>// applications</p>
                <h1 style={{ fontFamily: mono, fontSize: "28px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 4px", letterSpacing: "-1px" }}>applied</h1>
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
                <p style={{ fontFamily: mono, color: "#222", fontSize: "12px", textAlign: "center", marginTop: "60px" }}>// no results found</p>
            ) : (
                filtered.map(app => <AppCard key={app.id} app={app} handleStatusChange={handleStatusChange} fetchApplications={fetchApplications} />)
            )}
        </div>
    );
}