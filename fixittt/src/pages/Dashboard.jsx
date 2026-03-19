import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, tradesman, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading]);

  if (loading) return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
      <div className="text-slate-400 text-sm animate-pulse">Loading...</div>
    </div>
  );

  const tradeIcons = {
    Plumber: "🔧", Electrician: "⚡", "AC Tech": "❄️",
    Carpenter: "🪚", Painter: "🖌️", Tiler: "⬜", Handyman: "🛠️",
  };

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
            <button
              onClick={() => navigate("/jobs")}
              className="text-sm font-bold text-navy hover:text-gold transition-colors"
            >
              Browse Jobs
            </button>
            <button
              onClick={signOut}
              className="text-sm text-slate-500 hover:text-navy transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-syne font-bold text-navy text-3xl mb-1">
            Welcome back{tradesman ? `, ${tradesman.name.split(" ")[0]}` : ""}! 👋
          </h1>
          <p className="text-slate-500 text-sm">Here's your FixItTT dashboard.</p>
        </div>

        {/* Status card */}
        {tradesman ? (
          <div className={`rounded-2xl p-6 mb-6 border ${
            tradesman.approved
              ? "bg-green-50 border-green-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            <div className="flex items-start gap-4">
              <div className="text-3xl">{tradesman.approved ? "✅" : "⏳"}</div>
              <div>
                <h3 className={`font-syne font-bold text-lg ${tradesman.approved ? "text-green-800" : "text-amber-800"}`}>
                  {tradesman.approved ? "Profile Live" : "Approval Pending"}
                </h3>
                <p className={`text-sm mt-1 ${tradesman.approved ? "text-green-700" : "text-amber-700"}`}>
                  {tradesman.approved
                    ? "Your profile is visible to homeowners across T&T."
                    : "We're reviewing your application. Usually takes less than 24 hours."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <p className="text-amber-800 text-sm font-medium">
              No tradesman profile found for this account.{" "}
              <button onClick={() => navigate("/register")} className="font-bold underline">
                Register your trade →
              </button>
            </p>
          </div>
        )}

        {/* Profile summary */}
        {tradesman && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
            <h2 className="font-syne font-bold text-navy text-lg mb-4">Your Profile</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {[
                ["Trade", `${tradeIcons[tradesman.trade] || ""} ${tradesman.trade}`],
                ["Area", `📍 ${tradesman.area}`],
                ["Experience", `${tradesman.years_experience || 0} years`],
                ["Verified", tradesman.verified ? "✓ Vetted" : "Pending"],
                ["Featured", tradesman.featured ? "⭐ Yes" : "Not yet"],
                ["Available", tradesman.available ? "🟢 Yes" : "🔴 No"],
              ].map(([label, value]) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm font-bold text-navy">{value}</p>
                </div>
              ))}
            </div>
            {tradesman.bio && (
              <p className="text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">{tradesman.bio}</p>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/jobs")}
            className="bg-navy text-white rounded-2xl p-6 text-left hover:bg-navy/90 transition-colors"
          >
            <div className="text-3xl mb-3">💼</div>
            <h3 className="font-syne font-bold text-lg mb-1">Browse Jobs</h3>
            <p className="text-slate-400 text-sm">See jobs posted in your area that match your trade.</p>
          </button>
          <button
            onClick={() => tradesman && navigate(`/tradesmen/${tradesman.id}`)}
            className="bg-white border border-slate-100 rounded-2xl p-6 text-left hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">👤</div>
            <h3 className="font-syne font-bold text-navy text-lg mb-1">View My Profile</h3>
            <p className="text-slate-500 text-sm">See how homeowners see your public profile.</p>
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-white border border-slate-100 rounded-2xl p-6 text-left hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">🏠</div>
            <h3 className="font-syne font-bold text-navy text-lg mb-1">Back to Home</h3>
            <p className="text-slate-500 text-sm">Browse the public directory.</p>
          </button>
          <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="font-syne font-bold text-amber-800 text-lg mb-1">Go Featured</h3>
            <p className="text-amber-700 text-sm mb-3">Appear at the top of search results for TT$200/month.</p>
            <span className="text-xs font-bold text-gold">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}