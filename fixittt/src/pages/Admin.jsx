import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const tradeIcons = {
  Plumber: "🔧", Electrician: "⚡", "AC Tech": "❄️",
  Carpenter: "🪚", Painter: "🖌️", Tiler: "⬜", Handyman: "🛠️",
};

const tabs = ["Pending", "Approved", "All Jobs"];

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Pending");
  const [tradesmen, setTradesmen] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      if (tab === "All Jobs") fetchJobs();
      else fetchTradesmen();
    }
  }, [tab, isAdmin]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/admin/login"); return; }

    const { data: adminRow } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!adminRow) { navigate("/admin/login"); return; }
    setIsAdmin(true);
  }

  async function fetchTradesmen() {
    setLoading(true);
    let query = supabase
      .from("tradesmen")
      .select("*")
      .order("created_at", { ascending: false });

    if (tab === "Pending") query = query.eq("approved", false);
    if (tab === "Approved") query = query.eq("approved", true);

    const { data } = await query;
    setTradesmen(data || []);
    setLoading(false);
  }

  async function fetchJobs() {
    setLoading(true);
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    setJobs(data || []);
    setLoading(false);
  }

  async function approve(id) {
    setActionLoading(id);
    const { error } = await supabase
      .from("tradesmen")
      .update({ approved: true })
      .eq("id", id);
    if (!error) {
      showToast("Tradesman approved ✅");
      fetchTradesmen();
    }
    setActionLoading(null);
  }

  async function reject(id) {
    setActionLoading(id);
    const { error } = await supabase
      .from("tradesmen")
      .delete()
      .eq("id", id);
    if (!error) {
      showToast("Application rejected and removed.", "error");
      fetchTradesmen();
    }
    setActionLoading(null);
  }

  async function toggleFeatured(id, current) {
    await supabase
      .from("tradesmen")
      .update({ featured: !current })
      .eq("id", id);
    showToast(current ? "Removed from featured" : "Marked as featured ⭐");
    fetchTradesmen();
  }

  async function toggleVerified(id, current) {
    await supabase
      .from("tradesmen")
      .update({ verified: !current })
      .eq("id", id);
    showToast(current ? "Verification removed" : "Marked as verified ✓");
    fetchTradesmen();
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/admin/login");
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

  if (!isAdmin) return <div className="min-h-screen bg-navy" />;
  

  return (
    <div className="min-h-screen bg-[#f7f4ef] font-dm">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm font-bold shadow-xl ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* NAV */}
      <nav className="bg-navy border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center text-white font-bold text-sm">FX</div>
            <span className="font-syne font-bold text-white">FixIt<span className="text-gold">TT</span></span>
            <span className="bg-gold/20 text-gold text-xs font-bold px-2.5 py-1 rounded-full ml-2">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-sm text-slate-400 hover:text-white transition-colors">
              View Site →
            </button>
            <button onClick={signOut} className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-syne font-bold text-navy text-3xl mb-1">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Manage tradesman applications and job postings.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pending", value: tab === "Pending" ? tradesmen.length : "—", color: "text-amber-600" },
            { label: "Approved", value: tab === "Approved" ? tradesmen.length : "—", color: "text-green-600" },
            { label: "Jobs Posted", value: tab === "All Jobs" ? jobs.length : "—", color: "text-blue-600" },
            { label: "Total", value: "—", color: "text-navy" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`font-syne font-bold text-3xl ${color}`}>{value}</div>
              <div className="text-slate-500 text-xs mt-1 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                tab === t
                  ? "bg-navy text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tradesman cards */}
        {!loading && tab !== "All Jobs" && (
          <>
            {tradesmen.length === 0 && (
              <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                <div className="text-5xl mb-4">
                  {tab === "Pending" ? "🎉" : "📋"}
                </div>
                <h3 className="font-syne font-bold text-navy text-xl mb-2">
                  {tab === "Pending" ? "No pending applications" : "No approved tradesmen yet"}
                </h3>
                <p className="text-slate-500 text-sm">
                  {tab === "Pending" ? "All caught up!" : "Approve some applications first."}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {tradesmen.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-4">

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-syne font-bold text-navy text-lg">{t.name}</h3>
                        {t.verified && (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">✓ Verified</span>
                        )}
                        {t.featured && (
                          <span className="bg-gold/20 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>
                        )}
                        {!t.approved && (
                          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">⏳ Pending</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-2">
                        <span>{tradeIcons[t.trade]} {t.trade}</span>
                        <span>📍 {t.area}</span>
                        <span>📞 {t.phone}</span>
                        <span>🕐 {t.years_experience} yrs exp</span>
                        <span className="text-slate-400">· {timeAgo(t.created_at)}</span>
                      </div>

                      {t.bio && (
                        <p className="text-slate-500 text-sm leading-relaxed">{t.bio}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:w-48 flex-shrink-0">
                      {!t.approved && (
                        <button
                          onClick={() => approve(t.id)}
                          disabled={actionLoading === t.id}
                          className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40"
                        >
                          {actionLoading === t.id ? "..." : "✓ Approve"}
                        </button>
                      )}
                      <button
                        onClick={() => toggleVerified(t.id, t.verified)}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-navy text-sm font-bold rounded-xl transition-colors"
                      >
                        {t.verified ? "Remove Verified" : "Mark Verified"}
                      </button>
                      <button
                        onClick={() => toggleFeatured(t.id, t.featured)}
                        className="w-full py-2.5 bg-gold/10 hover:bg-gold/20 text-amber-800 text-sm font-bold rounded-xl transition-colors"
                      >
                        {t.featured ? "Remove Featured" : "⭐ Make Featured"}
                      </button>
                      {!t.approved && (
                        <button
                          onClick={() => reject(t.id)}
                          disabled={actionLoading === t.id}
                          className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors disabled:opacity-40"
                        >
                          ✕ Reject
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/tradesmen/${t.id}`)}
                        className="w-full py-2.5 bg-navy/5 hover:bg-navy/10 text-navy text-sm font-bold rounded-xl transition-colors"
                      >
                        View Profile →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Jobs tab */}
        {!loading && tab === "All Jobs" && (
          <>
            {jobs.length === 0 && (
              <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="font-syne font-bold text-navy text-xl mb-2">No jobs posted yet</h3>
              </div>
            )}
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-syne font-bold text-navy">
                        {tradeIcons[job.trade]} {job.trade} — {job.area}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        job.urgency === "emergency" ? "bg-red-100 text-red-700" :
                        job.urgency === "this_week" ? "bg-amber-100 text-amber-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {job.urgency === "emergency" ? "🚨 Emergency" :
                         job.urgency === "this_week" ? "📅 This Week" : "✅ Flexible"}
                      </span>
                      {!job.active && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(job.created_at)}</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-2">{job.description}</p>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>👤 {job.contact_name}</span>
                    <span>📞 {job.contact_phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}