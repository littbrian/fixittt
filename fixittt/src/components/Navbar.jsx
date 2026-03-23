import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, tradesman, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center text-white font-bold text-sm">
            FX
          </div>
          <span className="font-syne font-bold text-xl text-navy">
            FixIt<span className="text-gold">TT</span>
          </span>
        </button>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
          <button onClick={() => navigate("/tradesmen")} className="hover:text-navy transition-colors">
            Find Tradesmen
          </button>
          <button onClick={() => navigate("/post-job")} className="hover:text-navy transition-colors">
            Post a Job
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              {/* Logged in state */}
              <button
                onClick={() => navigate("/dashboard")}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-navy bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <span>👤</span>
                <span>{tradesman?.name?.split(" ")[0] || "Dashboard"}</span>
              </button>
              <button
                onClick={() => navigate("/jobs")}
                className="hidden md:block px-4 py-2 text-sm font-medium text-navy bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                💼 Jobs
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-bold text-white bg-navy rounded-lg hover:bg-navy/80 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              {/* Logged out state */}
              <button
                onClick={() => navigate("/post-job")}
                className="hidden md:block px-4 py-2 text-sm font-medium text-navy bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Post a Job
              </button>
              <button
                onClick={() => navigate("/login")}
                className="hidden md:block px-4 py-2 text-sm font-medium text-slate-600 hover:text-navy transition-colors"
              >
                Tradesman Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 text-sm font-bold text-white bg-gold rounded-lg hover:bg-yellow-600 transition-colors"
              >
                List My Trade
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}