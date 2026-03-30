import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function HomeownerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/post-job`,
      },
    });

    if (error) {
      setError("Something went wrong. Please try again.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) return (
    <div className="min-h-screen bg-[#f7f4ef] font-dm flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center border border-slate-100 shadow-sm">
        <div className="text-6xl mb-4">📧</div>
        <h2 className="font-syne font-bold text-navy text-2xl mb-2">Check your email</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">
          We sent a link to <strong>{email}</strong>. Click it to continue posting your job.
        </p>
        <p className="text-slate-400 text-xs">
          No email? Check your spam folder or{" "}
          <button onClick={() => setSent(false)} className="text-gold font-bold hover:underline">
            try again
          </button>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f4ef] font-dm flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-white font-bold">FX</div>
            <span className="font-syne font-bold text-2xl text-navy">FixIt<span className="text-gold">TT</span></span>
          </button>
          <h1 className="font-syne font-bold text-navy text-3xl mb-2">Post a Job</h1>
          <p className="text-slate-500 text-sm">Enter your email to continue — no password needed.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Your Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="e.g. priya@gmail.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-gold"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3.5 bg-gold text-white font-bold text-sm rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-40"
            >
              {loading ? "Sending..." : "Send Magic Link →"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Are you a tradesman?{" "}
              <button onClick={() => navigate("/login")} className="text-gold font-bold hover:underline">
                Log in here →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}