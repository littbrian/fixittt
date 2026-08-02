import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import { sanitise } from "../lib/sanitise";
import { useAuth } from "../context/AuthContext";



const trades = [
  "Plumber", "Electrician", "AC Tech",
  "Carpenter", "Painter", "Tiler", "Handyman",
];
const areas = [
  "Port of Spain", "San Fernando", "Chaguanas",
  "Arima", "Point Fortin", "Tobago",
];
const tradeIcons = {
  Plumber: "🔧", Electrician: "⚡", "AC Tech": "❄️",
  Carpenter: "🪚", Painter: "🖌️", Tiler: "⬜", Handyman: "🛠️",
};
const urgencyOptions = [
  { value: "emergency", label: "Emergency", desc: "Need someone today", color: "border-red-400 bg-red-50 text-red-700" },
  { value: "this_week", label: "This Week", desc: "Within a few days", color: "border-amber-400 bg-amber-50 text-amber-700" },
  { value: "flexible", label: "Flexible", desc: "No rush", color: "border-green-400 bg-green-50 text-green-700" },
];
const tradeAvatarBg = {
  Plumber: "bg-blue-500", Electrician: "bg-amber-500",
  "AC Tech": "bg-cyan-500", Carpenter: "bg-violet-500",
  Painter: "bg-pink-500", Tiler: "bg-slate-500", Handyman: "bg-emerald-500",
};
const urgencyColors = {
  emergency: "bg-red-100 text-red-700",
  this_week: "bg-amber-100 text-amber-700",
  flexible: "bg-green-100 text-green-700",
};
const urgencyLabels = {
  emergency: "🚨 Emergency",
  this_week: "📅 This Week",
  flexible: "✅ Flexible",
};

function MatchCard({ t, navigate }) {
  const initials = t.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const avatarBg = tradeAvatarBg[t.trade] || "bg-slate-400";
  const avgRating = t.reviews?.length
    ? t.reviews.reduce((s, r) => s + r.rating, 0) / t.reviews.length
    : null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold`}>
            {initials}
          </div>
          {t.available && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-syne font-bold text-navy text-sm">{t.name}</span>
            {t.verified && (
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">✓ Vetted</span>
            )}
            {t.featured && (
              <span className="bg-gold/20 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {tradeIcons[t.trade]} {t.trade} · 📍 {t.area}
          </div>
          {avgRating && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-amber-400 text-xs">{"★".repeat(Math.round(avgRating))}</span>
              <span className="text-xs font-bold text-navy">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({t.reviews.length})</span>
            </div>
          )}
        </div>
      </div>

      {t.bio && (
        <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2">{t.bio}</p>
      )}

      <div className="flex gap-2">
        
        
          href={`https://wa.me/${t.whatsapp || t.phone}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 bg-[#25d366] hover:bg-green-600 text-white text-xs font-bold py-2.5 rounded-xl text-center transition-colors"
        >
          💬 WhatsApp
        </a>
        <button
          onClick={() => navigate(`/tradesmen/${t.id}`)}
          className="flex-1 bg-navy hover:bg-navy/80 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
        >
          View Profile →
        </button>
      </div>
    </div>
  );
}

export default function PostJob() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [errors, setErrors] = useState({});


  const [honeypot, setHoneypot] = useState("");
  const { user } = useAuth();
  useEffect(() => {
      if (!user) navigate("/homeowner-login");
    }, [user]);
  const [form, setForm] = useState({
    contact_name: "",
    contact_phone: "",
    trade: "",
    area: "",
    urgency: "flexible",
    description: "",
  });

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.contact_name.trim()) errs.contact_name = "Name is required";
    if (!form.contact_phone.trim()) errs.contact_phone = "Phone number is required";
    if (!form.trade) errs.trade = "Please select a trade";
    if (!form.area) errs.area = "Please select your area";
    if (!form.description.trim()) errs.description = "Please describe the job";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function fetchMatches(trade, area) {
    setLoadingMatches(true);
    const { data } = await supabase
      .from("tradesmen")
      .select("*, reviews(rating)")
      .eq("approved", true)
      .eq("trade", trade)
      .eq("area", area)
      .order("featured", { ascending: false });

    // If no exact area match, broaden to just trade
    if (!data || data.length === 0) {
      const { data: broader } = await supabase
        .from("tradesmen")
        .select("*, reviews(rating)")
        .eq("approved", true)
        .eq("trade", trade)
        .order("featured", { ascending: false })
        .limit(6);
      setMatches(broader || []);
    } else {
      setMatches(data);
    }
    setLoadingMatches(false);
  }

  async function handleSubmit(e) {

    if (honeypot) return;


    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const { error } = await supabase.from("jobs").insert({
      user_id: user.id,
      contact_name: sanitise(form.contact_name.trim()),
      contact_phone: sanitise(form.contact_phone.trim()),
      trade: form.trade,
      area: form.area,
      urgency: form.urgency,
      description: sanitise(form.description.trim()),
      active: true,
    });

    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      fetchMatches(form.trade, form.area);
    } else {
      console.error(error);
    }
  }

  // ── SUCCESS SCREEN ──
  if (submitted) return (
    <div className="min-h-screen bg-[#f7f4ef] font-dm">
     
     <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Job summary */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
              ✅
            </div>
            <div className="flex-1">
              <h2 className="font-syne font-bold text-navy text-2xl mb-1">Job Posted!</h2>
              <p className="text-slate-500 text-sm">
                Your job has been posted. Contact a tradesman below directly on WhatsApp.
              </p>
            </div>
          </div>

          {/* Job details */}
          <div className="mt-6 bg-slate-50 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trade</p>
              <p className="text-sm font-bold text-navy">{tradeIcons[form.trade]} {form.trade}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Area</p>
              <p className="text-sm font-bold text-navy">📍 {form.area}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Urgency</p>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${urgencyColors[form.urgency]}`}>
                {urgencyLabels[form.urgency]}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Posted by</p>
              <p className="text-sm font-bold text-navy">{form.contact_name}</p>
            </div>
          </div>

          {form.description && (
            <div className="mt-4 px-5 py-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-slate-600 leading-relaxed">{form.description}</p>
            </div>
          )}
        </div>

        {/* Matching tradesmen */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-syne font-bold text-navy text-xl">
                {loadingMatches ? "Finding matches..." : `${matches.length} ${form.trade}${matches.length !== 1 ? "s" : ""} Found`}
                {!loadingMatches && matches.length > 0 && (
                  <span className="text-gold"> in {form.area}</span>
                )}
              </h3>
              {!loadingMatches && matches.length > 0 && (
                <p className="text-slate-500 text-sm mt-0.5">
                  Contact them directly — featured tradesmen listed first.
                </p>
              )}
            </div>
            <button
              onClick={() => navigate(`/tradesmen?trade=${form.trade}&area=${form.area}`)}
              className="text-sm text-gold font-bold hover:underline"
            >
              See all →
            </button>
          </div>

          {/* Loading skeletons */}
          {loadingMatches && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
                  <div className="flex gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-full mb-4" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-9 bg-slate-200 rounded-xl" />
                    <div className="flex-1 h-9 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No matches */}
          {!loadingMatches && matches.length === 0 && (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h4 className="font-syne font-bold text-navy text-lg mb-2">
                No {form.trade}s listed yet in {form.area}
              </h4>
              <p className="text-slate-500 text-sm mb-6">
                We're growing our network. Browse all tradesmen or check back soon.
              </p>
              <button
                onClick={() => navigate(`/tradesmen?trade=${form.trade}`)}
                className="px-6 py-2.5 bg-gold text-white font-bold text-sm rounded-xl hover:bg-yellow-600 transition-colors"
              >
                Browse All {form.trade}s
              </button>
            </div>
          )}

          {/* Match cards */}
          {!loadingMatches && matches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((t) => (
                <MatchCard key={t.id} t={t} navigate={navigate} />
              ))}
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => { setSubmitted(false); setForm({ contact_name: "", contact_phone: "", trade: "", area: "", urgency: "flexible", description: "" }); }}
            className="flex-1 py-3 bg-slate-100 text-navy font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors"
          >
            Post Another Job
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-3 bg-navy text-white font-bold text-sm rounded-xl hover:bg-navy/80 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  // ── FORM ──
  return (
    <div className="min-h-screen bg-[#f7f4ef] font-dm">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center text-white font-bold text-sm">FX</div>
            <span className="font-syne font-bold text-xl text-navy">FixIt<span className="text-gold">TT</span></span>
          </button>
          <button
            onClick={() => navigate("/tradesmen")}
            className="px-4 py-2 text-sm font-bold text-white bg-gold rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Find a Tradesman
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-block bg-navy/5 rounded-2xl px-4 py-2 mb-4">
            <span className="text-navy text-xs font-bold tracking-[0.18em] uppercase">Free to Post</span>
          </div>
          <h1 className="font-syne font-bold text-navy text-4xl mb-3">Post a Job</h1>
          <p className="text-slate-500 text-base">
            Describe what you need and we'll show you matching
            tradesmen in your area instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.contact_name}
                  onChange={(e) => set("contact_name", e.target.value)}
                  placeholder="e.g. Priya Ramkhelawan"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-gold transition-colors ${
                    errors.contact_name ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"
                  }`}
                />
                {errors.contact_name && <p className="text-red-500 text-xs mt-1">{errors.contact_name}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  WhatsApp / Phone <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.contact_phone}
                  onChange={(e) => set("contact_phone", e.target.value)}
                  placeholder="e.g. 868-XXX-XXXX"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-gold transition-colors ${
                    errors.contact_phone ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"
                  }`}
                />
                {errors.contact_phone && <p className="text-red-500 text-xs mt-1">{errors.contact_phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Trade Needed <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {trades.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("trade", t)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      form.trade === t
                        ? "border-gold bg-gold/10 text-amber-800 font-bold"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {tradeIcons[t]} {t}
                  </button>
                ))}
              </div>
              {errors.trade && <p className="text-red-500 text-xs mt-1">{errors.trade}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Your Area <span className="text-red-400">*</span>
              </label>
              <select
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-gold bg-white transition-colors ${
                  errors.area ? "border-red-400" : "border-slate-200"
                }`}
              >
                <option value="">Select your area...</option>
                {areas.map((a) => <option key={a}>{a}</option>)}
              </select>
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Urgency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {urgencyOptions.map(({ value, label, desc, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("urgency", value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.urgency === value ? color : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <div className="font-bold text-xs">{label}</div>
                    <div className="text-xs opacity-70 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Job Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the job — e.g. 'Pipe burst under kitchen sink, water leaking, need urgent repair.'"
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-gold resize-none transition-colors ${
                  errors.description ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"
                }`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ display: "none" }}
              tabIndex="-1"
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-navy text-white font-bold text-sm rounded-xl hover:bg-navy/80 transition-colors disabled:opacity-40"
            >
              {submitting ? "Posting..." : "Post Job & Find Tradesmen →"}
            </button>

            <p className="text-center text-slate-400 text-xs">
              Free to post. Your details are only shared with tradesmen you contact.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
