import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email.trim().toLowerCase(), password);

    setLoading(false);
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Please confirm your email before logging in. Check your inbox.");
      } else {
        setError("Incorrect email or password. Please try again.");
      }
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] font-dm flex items-center justify-center px-6">

      {/* Card */}
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-white font-bold">FX</div>
            <span className="font-syne font-bold text-2xl text-navy">FixIt<span className="text-gold">TT</span></span>
          </button>
          <h1 className="font-syne font-bold text-navy text-3xl mb-2">Tradesman Login</h1>
          <p className="text-slate-500 text-sm">Log in to browse jobs in your area</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="e.g. priya@gmail.com"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-gold transition-colors ${
                  error ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="Your password"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-gold transition-colors ${
                  error ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"
                }`}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 bg-navy text-white font-bold text-sm rounded-xl hover:bg-navy/80 transition-colors disabled:opacity-40"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-3">
            <p className="text-slate-500 text-sm">
              Not registered yet?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-gold font-bold hover:underline"
              >
                List your trade — it's free
              </button>
            </p>
            <p className="text-slate-500 text-sm">
              Looking for a tradesman?{" "}
              <button
                onClick={() => navigate("/tradesmen")}
                className="text-navy font-bold hover:underline"
              >
                Browse the directory →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
