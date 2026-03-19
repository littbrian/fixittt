import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const tradeIcons = {
  Plumber: "🔧", Electrician: "⚡", "AC Tech": "❄️",
  Carpenter: "🪚", Painter: "🖌️", Tiler: "⬜", Handyman: "🛠️",
};
const tradeAvatarBg = {
  Plumber: "bg-blue-500", Electrician: "bg-amber-500",
  "AC Tech": "bg-cyan-500", Carpenter: "bg-violet-500",
  Painter: "bg-pink-500", Tiler: "bg-slate-500", Handyman: "bg-emerald-500",
};

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="text-3xl transition-colors"
          style={{ color: s <= (hovered || value) ? "#f59e0b" : "#e2e8f0" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tradesman, setTradesman] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 0, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchReviews();
  }, [id]);

  async function fetchProfile() {
    const { data, error } = await supabase
      .from("tradesmen")
      .select("*")
      .eq("id", id)
      .eq("approved", true)
      .single();

    if (error || !data) {
      setError("Tradesman not found.");
      setLoading(false);
      return;
    }
    setTradesman(data);
    setLoading(false);
  }

  async function fetchReviews() {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("tradesman_id", id)
      .order("created_at", { ascending: false });
    setReviews(data || []);
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!reviewForm.rating) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      tradesman_id: id,
      reviewer_name: reviewForm.name || "Anonymous",
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });
    if (!error) {
      setSubmitted(true);
      setReviewForm({ name: "", rating: 0, comment: "" });
      fetchReviews();
    }
    setSubmitting(false);
  }

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  if (loading) return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
      <div className="text-slate-400 text-sm animate-pulse">Loading profile...</div>
    </div>
  );

  if (error || !tradesman) return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="font-syne font-bold text-navy text-xl mb-2">Not Found</h2>
        <p className="text-slate-500 text-sm mb-4">{error}</p>
        <button onClick={() => navigate("/tradesmen")} className="px-6 py-2.5 bg-gold text-white font-bold text-sm rounded-xl">
          Back to Directory
        </button>
      </div>
    </div>
  );

  const initials = tradesman.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const avatarBg = tradeAvatarBg[tradesman.trade] || "bg-slate-400";

  return (
    <div className="min-h-screen bg-[#f7f4ef] font-dm">

      {/* ── NAV ── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center text-white font-bold text-sm">FX</div>
            <span className="font-syne font-bold text-xl text-navy">FixIt<span className="text-gold">TT</span></span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-navy transition-colors flex items-center gap-1"
          >
            ← Back to results
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 text-sm font-bold text-white bg-gold rounded-lg hover:bg-yellow-600 transition-colors"
          >
            List My Trade
          </button>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="bg-navy relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full border border-gold/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-24 h-24 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-3xl border-4 border-white/20`}>
                {initials}
              </div>
              {tradesman.available && (
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-navy" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="font-syne font-bold text-white text-3xl">{tradesman.name}</h1>
                {tradesman.verified && (
                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">
                    ✓ Verified
                  </span>
                )}
                {tradesman.featured && (
                  <span className="bg-gold/20 text-gold text-xs font-bold px-3 py-1 rounded-full border border-gold/30">
                    ⭐ Featured
                  </span>
                )}
              </div>
              <div className="text-gold font-bold text-lg mb-2">
                {tradeIcons[tradesman.trade]} {tradesman.trade}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <span>📍 {tradesman.area}</span>
                {tradesman.years_experience > 0 && (
                  <span>🕐 {tradesman.years_experience} years experience</span>
                )}
                <span className={tradesman.available ? "text-green-400" : "text-slate-500"}>
                  {tradesman.available ? "🟢 Available Now" : "🔴 Currently Busy"}
                </span>
              </div>
            </div>

            {/* Featured badge top right */}
            {tradesman.featured && (
              <div className="hidden md:block">
                <span className="bg-gold text-white text-xs font-bold px-4 py-2 rounded-full">
                  ⭐ FEATURED
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT — main info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: avgRating ? Number(avgRating).toFixed(1) + " ★" : "New", label: "Rating" },
              { num: reviews.length, label: "Reviews" },
              { num: tradesman.years_experience || "—", label: "Yrs Exp" },
              { num: tradesman.verified ? "✓ Yes" : "Pending", label: "Vetted" },
            ].map(({ num, label }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 text-center shadow-sm">
                <div className="font-syne font-bold text-navy text-2xl">{num}</div>
                <div className="text-slate-500 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* About */}
          {tradesman.bio && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="font-syne font-bold text-navy text-lg mb-3">About</h2>
              <div className="w-10 h-0.5 bg-gold mb-4" />
              <p className="text-slate-600 text-sm leading-relaxed">{tradesman.bio}</p>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-syne font-bold text-navy text-lg">
                Reviews
                <span className="text-slate-400 font-normal text-sm ml-2">({reviews.length})</span>
              </h2>
              {avgRating && (
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-lg">{"★".repeat(Math.round(avgRating))}</span>
                  <span className="font-bold text-navy">{Number(avgRating).toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="w-10 h-0.5 bg-gold mb-4" />

            {reviews.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-6">
                No reviews yet — be the first to leave one below.
              </p>
            )}

            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white font-bold text-xs">
                        {r.reviewer_name[0]}
                      </div>
                      <span className="font-bold text-navy text-sm">{r.reviewer_name}</span>
                    </div>
                    <span className="text-amber-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && (
                    <p className="text-slate-500 text-sm ml-10 leading-relaxed">{r.comment}</p>
                  )}
                  <p className="text-slate-300 text-xs ml-10 mt-1">
                    {new Date(r.created_at).toLocaleDateString("en-TT", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Leave a review */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-syne font-bold text-navy text-lg mb-1">Leave a Review</h2>
            <div className="w-10 h-0.5 bg-gold mb-4" />

            {submitted ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-bold text-navy">Thanks for your review!</p>
                <p className="text-slate-500 text-sm mt-1">Your feedback helps the community.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-gold text-sm font-bold hover:underline">
                  Leave another review
                </button>
              </div>
            ) : (
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Name</label>
                  <input
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    placeholder="e.g. Priya R."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rating</label>
                  <StarPicker value={reviewForm.rating} onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Comment</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-gold resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!reviewForm.rating || submitting}
                  className="px-6 py-2.5 bg-navy text-white font-bold text-sm rounded-xl hover:bg-navy/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT — contact sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
            <div className="bg-navy p-5 text-center">
              <p className="text-white font-syne font-bold text-lg">Contact {tradesman.name.split(" ")[0]}</p>
              <p className="text-slate-400 text-xs mt-1">Responds within a few hours</p>
            </div>
            <div className="p-5 space-y-3">
              
              <a
                href={`https://wa.me/${tradesman.whatsapp || tradesman.phone}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25d366] hover:bg-green-600 text-white font-bold text-sm py-3.5 rounded-xl transition-colors"
              >
                💬 Message on WhatsApp
              </a>
              
              <a
                href={`tel:${tradesman.phone}`}
                className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-navy font-bold text-sm py-3.5 rounded-xl transition-colors"
              >
                📞 Call: {tradesman.phone}
              </a>
              <button
                onClick={() => navigate("/post-job")}
                className="flex items-center justify-center gap-2 w-full border border-slate-200 hover:bg-slate-50 text-navy font-bold text-sm py-3.5 rounded-xl transition-colors"
              >
                📋 Post a Job Instead
              </button>
            </div>

            <div className="border-t border-slate-100 p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Share Profile</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2 rounded-lg transition-colors"
                >
                  🔗 Copy Link
                </button>
                
                <a
                  href={`https://wa.me/?text=Check out ${tradesman.name} on FixItTT: ${window.location.href}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2 rounded-lg transition-colors text-center"
                >
                  📱 Share
                </a>
                
              </div>
            </div>
          </div>

          {/* Back to directory */}
          <button
            onClick={() => navigate("/tradesmen")}
            className="w-full text-sm text-slate-500 hover:text-navy transition-colors py-2"
          >
            ← Back to all tradesmen
          </button>
        </div>
      </div>
    </div>
  );
}