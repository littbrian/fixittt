import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";


const trades = [
  "All Trades", "Plumber", "Electrician", "AC Tech",
  "Carpenter", "Painter", "Tiler", "Handyman",
];
const areas = [
  "All Areas", "Port of Spain", "San Fernando", "Chaguanas",
  "Arima", "Point Fortin", "Tobago",
];
const tradeIcons = {
  Plumber: "🔧", Electrician: "⚡", "AC Tech": "❄️",
  Carpenter: "🪚", Painter: "🖌️", Tiler: "⬜", Handyman: "🛠️",
};
const tradeColors = {
  Plumber: "bg-blue-100 text-blue-700",
  Electrician: "bg-amber-100 text-amber-700",
  "AC Tech": "bg-cyan-100 text-cyan-700",
  Carpenter: "bg-violet-100 text-violet-700",
  Painter: "bg-pink-100 text-pink-700",
  Tiler: "bg-slate-100 text-slate-700",
  Handyman: "bg-emerald-100 text-emerald-700",
};
const tradeAvatarBg = {
  Plumber: "bg-blue-500",
  Electrician: "bg-amber-500",
  "AC Tech": "bg-cyan-500",
  Carpenter: "bg-violet-500",
  Painter: "bg-pink-500",
  Tiler: "bg-slate-500",
  Handyman: "bg-emerald-500",
};

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return (
    <span className="text-amber-400 text-sm">
      {"★".repeat(full)}{"☆".repeat(empty)}
    </span>
  );
}

function TradesmanCard({ t, onClick }) {
  const avatarBg = tradeAvatarBg[t.trade] || "bg-slate-400";
  const tradeBadge = tradeColors[t.trade] || "bg-slate-100 text-slate-700";
  const initials = t.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
        t.featured ? "border-gold/40 shadow-sm" : "border-slate-100"
      }`}
    >
      {/* Featured badge */}
      {t.featured && (
        <div className="flex justify-end mb-2">
          <span className="bg-gold text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">
            ⭐ FEATURED
          </span>
        </div>
      )}

      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-14 h-14 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-lg`}>
            {initials}
          </div>
          {t.available && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-syne font-bold text-navy text-base">{t.name}</h3>
            {t.verified && (
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                ✓ Vetted
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${tradeBadge}`}>
              {tradeIcons[t.trade]} {t.trade}
            </span>
            <span className="text-slate-400 text-xs">📍 {t.area}</span>
            {t.years_experience > 0 && (
              <span className="text-slate-400 text-xs">· {t.years_experience} yrs exp</span>
            )}
          </div>

          {t.avg_rating && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <StarRating rating={t.avg_rating} />
              <span className="text-xs font-bold text-navy">{Number(t.avg_rating).toFixed(1)}</span>
              <span className="text-xs text-slate-400">({t.review_count} reviews)</span>
            </div>
          )}

          {t.bio && (
            <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-2">{t.bio}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        
        <a
          href={`https://wa.me/${t.whatsapp || t.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-[#25d366] hover:bg-green-600 text-white text-xs font-bold py-2.5 rounded-xl text-center transition-colors"
        >
          💬 WhatsApp
        </a>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="flex-1 bg-navy hover:bg-navy/80 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
        >
          View Profile →
        </button>
      </div>
    </div>
  );
}

export default function Directory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tradesmen, setTradesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState(searchParams.get("trade") || "All Trades");
  const [selectedArea, setSelectedArea] = useState(searchParams.get("area") || "All Areas");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    fetchTradesmen();
  }, [selectedTrade, selectedArea, availableOnly, verifiedOnly]);

  async function fetchTradesmen() {
    setLoading(true);
    let query = supabase
      .from("tradesmen")
      .select(`*, reviews(rating)`)
      .eq("approved", true);

    if (selectedTrade !== "All Trades") query = query.eq("trade", selectedTrade);
    if (selectedArea !== "All Areas") query = query.eq("area", selectedArea);
    if (availableOnly) query = query.eq("available", true);
    if (verifiedOnly) query = query.eq("verified", true);

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Calculate avg rating
    const withRatings = data.map((t) => {
      const reviews = t.reviews || [];
      const avg = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;
      return { ...t, avg_rating: avg, review_count: reviews.length };
    });

    // Sort
    const sorted = withRatings.sort((a, b) => {
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (sortBy === "rating") return (b.avg_rating || 0) - (a.avg_rating || 0);
      if (sortBy === "reviews") return b.review_count - a.review_count;
      return 0;
    });

    setTradesmen(sorted);
    setLoading(false);
  }

  const filtered = tradesmen.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.trade.toLowerCase().includes(search.toLowerCase()) ||
    t.area.toLowerCase().includes(search.toLowerCase())
  );

  const featured = filtered.filter((t) => t.featured);

  function updateFilter(trade, area) {
    const params = {};
    if (trade !== "All Trades") params.trade = trade;
    if (area !== "All Areas") params.area = area;
    setSearchParams(params);
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] font-dm">

      {/* ── NAV ── */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">

        {/* ── SIDEBAR ── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">

            <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase mb-4">Filters</p>

            {/* Trade */}
            <div className="mb-6">
              <p className="text-xs font-bold text-navy mb-2">Trade</p>
              {trades.map((t) => (
                <button
                  key={t}
                  onClick={() => { setSelectedTrade(t); updateFilter(t, selectedArea); }}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg mb-0.5 transition-colors flex items-center gap-2 ${
                    selectedTrade === t
                      ? "bg-gold/15 text-amber-800 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t !== "All Trades" && tradeIcons[t]} {t}
                </button>
              ))}
            </div>

            {/* Area */}
            <div className="mb-6">
              <p className="text-xs font-bold text-navy mb-2">Area</p>
              {areas.map((a) => (
                <button
                  key={a}
                  onClick={() => { setSelectedArea(a); updateFilter(selectedTrade, a); }}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg mb-0.5 transition-colors ${
                    selectedArea === a
                      ? "bg-gold/15 text-amber-800 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-slate-600">Available Now</span>
                <div
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${availableOnly ? "bg-green-500" : "bg-slate-200"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${availableOnly ? "left-5" : "left-1"}`} />
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-slate-600">Vetted Only</span>
                <div
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${verifiedOnly ? "bg-gold" : "bg-slate-200"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${verifiedOnly ? "left-5" : "left-1"}`} />
                </div>
              </label>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 min-w-0">

          {/* Header row */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-syne font-bold text-navy text-2xl">
                {selectedTrade === "All Trades" ? "All Tradesmen" : `${tradeIcons[selectedTrade] || ""} ${selectedTrade}s`}
                {selectedArea !== "All Areas" && <span className="text-gold"> in {selectedArea}</span>}
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {loading ? "Loading..." : `${filtered.length} tradesman${filtered.length !== 1 ? "s" : ""} found`}
              </p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-gold"
            >
              <option value="featured">Sort: Featured First</option>
              <option value="rating">Sort: Top Rated</option>
              <option value="reviews">Sort: Most Reviewed</option>
            </select>
          </div>

          {/* Mobile filters */}
          <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-1">
            {trades.map((t) => (
              <button
                key={t}
                onClick={() => { setSelectedTrade(t); updateFilter(t, selectedArea); }}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedTrade === t
                    ? "bg-gold/15 border-gold/40 text-amber-800 font-bold"
                    : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                {t !== "All Trades" && tradeIcons[t]} {t}
              </button>
            ))}
          </div>

          {/* Featured strip */}
          {featured.length > 0 && !search && (
            <div className="bg-amber-50 border border-gold/30 rounded-2xl p-4 mb-6">
              <p className="text-[10px] font-bold tracking-[0.16em] text-gold uppercase mb-3">⭐ Featured Tradesmen</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {featured.map((t) => {
                  const initials = t.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                  const avatarBg = tradeAvatarBg[t.trade] || "bg-slate-400";
                  return (
                    <button
                      key={t.id}
                      onClick={() => navigate(`/tradesmen/${t.id}`)}
                      className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gold/20 hover:border-gold/50 transition-colors text-left"
                    >
                      <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-navy text-sm">{t.name}</div>
                        <div className="text-xs text-slate-500">{tradeIcons[t.trade]} {t.trade} · {t.area}</div>
                        {t.avg_rating && (
                          <div className="text-xs text-amber-500 font-bold">★ {Number(t.avg_rating).toFixed(1)}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-syne font-bold text-navy text-xl mb-2">No tradesmen found</h3>
              <p className="text-slate-500 text-sm mb-6">Try a different trade, area, or remove some filters.</p>
              <button
                onClick={() => { setSelectedTrade("All Trades"); setSelectedArea("All Areas"); setSearch(""); setAvailableOnly(false); setVerifiedOnly(false); }}
                className="px-6 py-2.5 bg-gold text-white font-bold text-sm rounded-xl hover:bg-yellow-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Cards grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((t) => (
                <TradesmanCard
                  key={t.id}
                  t={t}
                  onClick={() => navigate(`/tradesmen/${t.id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}