import AddApplicationModal from "./AddApplicationModal";
import { useState, useEffect, useRef } from "react";

const useTypewriter = (text, speed = 50, delay = 0) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const delayTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(delayTimer);
  }, [delay]);
  useEffect(() => {
    if (!started) return;
    if (displayed.length === text.length) { setDone(true); return; }
    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(timer);
  }, [displayed, started, text, speed]);
  return { displayed, done };
};

const companies = [
  "google.com","meta.com","apple.com","microsoft.com","amazon.com",
  "netflix.com","spotify.com","adobe.com","salesforce.com","oracle.com",
  "linkedin.com","uber.com","airbnb.com","dropbox.com","slack.com",
  "stripe.com","intercom.com","hubspot.com","indeed.com","workday.com",
  "accenture.com","deloitte.com","pwc.com","kpmg.com","revolut.com",
  "wise.com","monzo.com","deliveroo.com","figma.com","notion.so",
  "vercel.com","supabase.io","linear.app","airtable.com","webflow.com",
  "framer.com","nvidia.com","tesla.com","deepmind.com","klarna.com",
  "bolt.eu","n26.com","checkout.com","arm.com","ibm.com",
  "intel.com","siemens.com","sap.com","zoom.us","twilio.com",
  "shopify.com","atlassian.com","github.com","gitlab.com","cloudflare.com",
  "datadog.com","mongodb.com","snowflake.com","databricks.com","elastic.co",
];

const getFavicon = (domain) => "https://www.google.com/s2/favicons?domain=" + domain + "&sz=64";

const generateLogo = (id) => ({
  id,
  domain: companies[Math.floor(Math.random() * companies.length)],
  x: Math.random() * 95,
  y: -10,
  size: Math.random() * 20 + 28,
  speed: Math.random() * 0.03 + 0.02,
  opacity: Math.random() * 0.35 + 0.25,
  blinking: false,
});

function App() {
  const { displayed: headline, done: headlineDone } = useTypewriter("Your next offer is already out there.", 50, 300);
  const { displayed: subline, done: sublineDone } = useTypewriter("Have you applied yet?", 60, 2300);
  const [showHero, setShowHero] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  const fetchApplications = async () => {
    try {
      const res = await fetch("http://localhost:8000/applications");
      const data = await res.json();
      setApplications(data);
    } catch (err) {}
  };

  const checkUser = async () => {
    try {
      const res = await fetch("http://localhost:8000/auth/user", { credentials: "include" });
      const data = await res.json();
      setUser(data.user);
    } catch (err) {}
  };

  const handleLogout = async () => {
    await fetch("http://localhost:8000/auth/logout", { credentials: "include" });
    setUser(null);
  };

  const handleGmailSync = async () => {
    try {
      const res = await fetch("http://localhost:8000/gmail/sync", { credentials: "include" });
      await res.json();
      alert("Gmail sync complete! Check your dashboard.");
      fetchApplications();
    } catch (err) {
      alert("Could not sync Gmail");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch("http://localhost:8000/applications/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchApplications();
    } catch (err) {}
  };

  useEffect(() => {
    fetchApplications();
    checkUser();
  }, []);

  useEffect(() => {
    if (sublineDone) {
      const timer = setTimeout(() => setShowHero(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [sublineDone]);

  const [logos, setLogos] = useState(() =>
    Array.from({ length: 25 }, (_, i) => ({ ...generateLogo(i), y: Math.random() * 100 }))
  );
  const animRef = useRef(null);

  useEffect(() => {
    let idCounter = 200;
    const animate = () => {
      setLogos((prev) => prev.map((logo) => {
        if (logo.y > 110) return { ...generateLogo(idCounter++), y: -10 };
        const nearMiddle = logo.y > 42 && logo.y < 58;
        return { ...logo, y: logo.y + logo.speed, blinking: nearMiddle, opacity: nearMiddle ? 0.9 : Math.random() * 0.15 + 0.25 };
      }));
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const filtered = applications.filter(function(app) {
    return app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.role.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(160deg, #020617 0%, #0a0f1e 50%, #020617 100%)" }}>
      <div className="absolute pointer-events-none" style={{ width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", top: "-200px", left: "50%", transform: "translateX(-50%)" }} />
      <div className="absolute pointer-events-none" style={{ width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", bottom: "-200px", left: "50%", transform: "translateX(-50%)" }} />

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {logos.map((logo) => (
          <img key={logo.id} src={getFavicon(logo.domain)} alt={logo.domain} className="absolute select-none"
            style={{ left: logo.x + "%", top: logo.y + "%", width: logo.size + "px", height: logo.size + "px", opacity: logo.opacity, borderRadius: "8px",
              filter: logo.blinking ? "drop-shadow(0 0 8px rgba(16,185,129,0.9))" : "none",
              transform: logo.blinking ? "scale(1.3)" : "scale(1)", transition: "filter 0.2s ease, transform 0.2s ease" }} />
        ))}
      </div>

      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-white border-opacity-10 backdrop-blur-md" style={{ backgroundColor: "rgba(2,6,23,0.7)" }}>
        <h1 className="text-2xl font-black text-emerald-400 cursor-pointer hover:scale-105 transition-transform duration-200">ReMind</h1>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Hey, {user.displayName ? user.displayName.split(" ")[0] : "there"}!</span>
              <button onClick={handleGmailSync} className="bg-blue-500 hover:bg-blue-400 hover:scale-105 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 text-sm">Sync Gmail</button>
              <button onClick={() => setShowModal(true)} className="bg-emerald-500 hover:bg-emerald-400 hover:scale-105 text-white font-semibold px-5 py-2 rounded-lg transition-all duration-200">+ Add Application</button>
              <button onClick={handleLogout} className="text-gray-500 hover:text-white text-sm transition">Logout</button>
            </div>
          ) : (
            <a href="http://localhost:8000/auth/google" className="bg-white hover:bg-gray-100 hover:scale-105 text-gray-900 font-semibold px-5 py-2 rounded-lg transition-all duration-200 flex items-center gap-2">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Login with Google
            </a>
          )}
        </div>
      </nav>

      <div className="relative z-10 px-10 py-16 text-center" style={{ opacity: showHero ? 1 : 0, transform: showHero ? "translateY(0)" : "translateY(-20px)", transition: "opacity 1s ease, transform 1s ease", pointerEvents: showHero ? "auto" : "none", position: showHero ? "relative" : "absolute", width: "100%" }}>
        <h2 className="text-5xl font-black leading-tight min-h-[60px] hover:text-emerald-400 transition-colors duration-300 cursor-default" style={{ color: "#f1f5f9" }}>
          {headline}{!headlineDone && <span className="animate-pulse text-emerald-400">|</span>}
        </h2>
        <p className="text-2xl font-semibold text-blue-400 mt-3 hover:text-blue-300 hover:scale-105 inline-block transition-all duration-200 cursor-default min-h-[36px]">
          {subline}{!sublineDone && <span className="animate-pulse text-blue-400">|</span>}
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-10" style={{ opacity: showHero ? 0 : 1, transform: showHero ? "translateY(20px)" : "translateY(0)", transition: "opacity 1s ease, transform 1s ease", marginTop: showHero ? "0" : "80px" }}>
        <p className="text-gray-400 font-semibold text-sm tracking-widest uppercase mb-4">Current Status</p>
        <div className="flex justify-center gap-4">
          <div className="backdrop-blur-md border border-white border-opacity-10 rounded-xl p-5 w-40 text-center shadow-sm hover:shadow-xl hover:scale-105 hover:border-emerald-500 transition-all duration-200 cursor-pointer" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <p className="text-3xl font-black text-emerald-400">{applications.filter(function(a){return a.status==="applied";}).length}</p>
            <p className="text-gray-400 font-semibold mt-1 text-sm">Applied</p>
          </div>
          <div className="backdrop-blur-md border border-white border-opacity-10 rounded-xl p-5 w-40 text-center shadow-sm hover:shadow-xl hover:scale-105 hover:border-blue-500 transition-all duration-200 cursor-pointer" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <p className="text-3xl font-black text-blue-400">{applications.filter(function(a){return a.status==="interview";}).length}</p>
            <p className="text-gray-400 font-semibold mt-1 text-sm">Interview</p>
          </div>
          <div className="backdrop-blur-md border border-white border-opacity-10 rounded-xl p-5 w-40 text-center shadow-sm hover:shadow-xl hover:scale-105 hover:border-red-500 transition-all duration-200 cursor-pointer" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <p className="text-3xl font-black text-red-400">{applications.filter(function(a){return a.status==="rejected";}).length}</p>
            <p className="text-gray-400 font-semibold mt-1 text-sm">Rejected</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-10 pb-16" style={{ opacity: showHero ? 0 : 1, transition: "opacity 1s ease", marginTop: "40px" }}>
        <div className="max-w-3xl mx-auto mb-6">
          <input
            type="text"
            placeholder="Search by company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
        {filtered.length === 0 ? (
          <p className="text-center text-gray-600 text-sm mt-4">No applications found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
            {filtered.map(function(app) {
              return (
                <div key={app.id} className="backdrop-blur-md border border-white border-opacity-10 rounded-xl p-6 flex items-center justify-between hover:border-emerald-500 transition-all duration-200" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-4">
                    <img src={"https://www.google.com/s2/favicons?domain=" + app.company.toLowerCase() + ".com&sz=32"} alt={app.company} className="rounded-md" style={{ width: "32px", height: "32px" }} />
                    <div>
                      <p className="text-white font-bold text-lg">{app.company}</p>
                      <p className="text-gray-400 text-sm">{app.role}</p>
                      <p className="text-gray-500 text-xs mt-1">{app.date_applied}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={"text-xs font-bold px-3 py-1 rounded-full " + (app.status === "applied" ? "bg-blue-500 bg-opacity-20 text-blue-400" : app.status === "interview" ? "bg-emerald-500 bg-opacity-20 text-emerald-400" : "bg-red-500 bg-opacity-20 text-red-400")}>
                      {app.status}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={function(){handleStatusChange(app.id,"applied");}} className={"text-xs px-2 py-1 rounded transition " + (app.status==="applied" ? "bg-blue-500 text-white" : "text-gray-500 hover:text-blue-400")}>Applied</button>
                      <button onClick={function(){handleStatusChange(app.id,"interview");}} className={"text-xs px-2 py-1 rounded transition " + (app.status==="interview" ? "bg-emerald-500 text-white" : "text-gray-500 hover:text-emerald-400")}>Interview</button>
                      <button onClick={function(){handleStatusChange(app.id,"rejected");}} className={"text-xs px-2 py-1 rounded transition " + (app.status==="rejected" ? "bg-red-500 text-white" : "text-gray-500 hover:text-red-400")}>Rejected</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && <AddApplicationModal onClose={() => { setShowModal(false); fetchApplications(); }} />}
    </div>
  );
}

export default App;
