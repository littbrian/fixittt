import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const urgencyColors = {
  emergency: "bg-red-100 text-red-700 border-red-200",
  this_week: "bg-amber-100 text-amber-700 border-amber-200",
  flexible: "bg-green-100 text-green-700 border-green-200",
};
const urgencyLabels = {
  emergency: "🚨 Emergency",
  this_week: "📅 This Week",
  flexible: "✅ Flexible",
};
const tradeIcons = {
  Plumber: "🔧", Electrician: "⚡", "AC Tech": "❄️",
  Carpenter: "🪚", Painter: "🖌️", Tiler: "⬜", Handyman: "🛠️",
};

export default function Jobs() {
  const navigate = useNavigate();
  const { user, tradesman, loading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [filter, setFilter] = useState("my_trade");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading]);

  useEffect(() => {
    if (tradesman) fetchJobs();
  }, [tradesman, filter]);

  async function fetchJobs() {
    setLoadingJobs(true);
    let query = supabase
      .from("jobs")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (filter === "my_trade" && tradesman) {
      query = query.eq("trade", tradesman.trade);
    }
    if (filter === "my_area" && tradesman) {
      query = query.eq("trade", tradesman.trade).eq("area", tradesman.area);
    }

    const { data, error } = await query;
    console.log("Jobs data:", data);
    console.log("Jobs error:", error);
    console.log("Filter:", filter);
    console.log("Tradesman:", tradesman);
    setJobs(data || []);
    setLoadingJobs(false);
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "Just now";
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
      <div className="text-slate-400 text-sm animate-pulse">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f4ef] font-dm">

      {/* NAV */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center text-white font-bold text-sm">FX</div>
            <span className="font-syne font-bold text-xl text-navy">FixIt<span className="text-gold">TT</span></span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-sm text-slate-500 hover:text-navy transition-colors">
              ← Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-syne font-bold text-navy text-3xl mb-1">Jobs Board</h1>
          {tradesman && (
            <p className="text-slate-500 text-sm">
              Showing jobs for {tradeIcons[tradesman.trade]} {tradesman.trade}s
              {filter === "my_area" ? ` in ${tradesman.area}` : " across T&T"}
            </p>
          )}
        </div>

        {/* Filter tabs */}
        {tradesman && (
          <div className="flex gap-2 mb-6">
            {[
              { value: "my_trade", label: `My Trade (${tradesman.trade})` },
              { value: "my_area", label: `My Area (${tradesman.area})` },
              { value: "all", label: "All Jobs" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filter === value
                    ? "bg-navy text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Not approved warning */}
        {tradesman && !tradesman.approved && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <p className="text-amber-800 text-sm">
              ⏳ Your profile is pending approval. You can browse jobs but homeowners can't find you yet.
            </p>
          </div>
        )}

        {/* Loading */}
        {loadingJobs && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-slate-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loadingJobs && jobs.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-syne font-bold text-navy text-xl mb-2">No jobs posted yet</h3>
            <p className="text-slate-500 text-sm mb-4">
              No {filter === "my_area" ? `jobs in ${tradesman?.area}` : "jobs"} right now. Check back soon.
            </p>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="px-5 py-2.5 bg-gold text-white font-bold text-sm rounded-xl hover:bg-yellow-600 transition-colors"
              >
                See All Jobs
              </button>
            )}
          </div>
        )}

        {/* Job cards */}
        {!loadingJobs && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`bg-white rounded-2xl p-6 border shadow-sm transition-all hover:shadow-md ${
                  job.urgency === "emergency"
                    ? "border-red-200 bg-red-50/30"
                    : "border-slate-100"
                }`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-syne font-bold text-navy text-base">
                      {tradeIcons[job.trade]} {job.trade} Needed
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${urgencyColors[job.urgency]}`}>
                      {urgencyLabels[job.urgency]}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(job.created_at)}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3 mb-3 text-sm text-slate-500">
                  <span>📍 {job.area}</span>
                  <span>·</span>
                  <span>👤 {job.contact_name}</span>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {job.description}
                </p>

                {/* Contact button */}
                <div className="flex gap-3">
                  <a 
                    href={`https://wa.me/${job.contact_phone.replace(/\D/g, "")}?text=Hi ${job.contact_name}, I saw your job post on FixItTT. I'm a ${job.trade} and I can help. When would be a good time?`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-[#25d366] hover:bg-green-600 text-white text-sm font-bold py-3 rounded-xl text-center transition-colors"
                  >
                    💬 Contact on WhatsApp
                  </a>
                  
                   <a
                    href={`tel:${job.contact_phone.replace(/\D/g, "")}`}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-navy text-sm font-bold rounded-xl transition-colors"
                  >
                    📞 Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}