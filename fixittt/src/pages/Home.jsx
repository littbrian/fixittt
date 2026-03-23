import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Carpenter: "🪚", Painter: "🖌️", Tiler: "⬜",
  Handyman: "🛠️",
};

const stats = [
  { num: "500+", label: "Tradesmen Listed" },
  { num: "7", label: "Trade Categories" },
  { num: "4.8★", label: "Average Rating" },
  { num: "T&T Wide", label: "Coverage" },
];

const howItWorks = [
  { icon: "🔍", title: "Search", desc: "Find a vetted tradesman by trade and area across Trinidad & Tobago." },
  { icon: "💬", title: "Contact", desc: "Reach them directly on WhatsApp or call — no middleman, no fees." },
  { icon: "⭐", title: "Review", desc: "Rate your experience to help the community find the best tradesmen." },
];

export default function Home() {
  const navigate = useNavigate();
  const [trade, setTrade] = useState("All Trades");
  const [area, setArea] = useState("All Areas");

  function handleSearch() {
    const params = new URLSearchParams();
    if (trade !== "All Trades") params.set("trade", trade);
    if (area !== "All Areas") params.set("area", area);
    navigate(`/tradesmen?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] font-dm">

      {/* ── NAV ── */}
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-navy relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full border border-gold/10 pointer-events-none" />
        <div className="absolute bottom-[-120px] left-[-60px] w-[300px] h-[300px] rounded-full border border-gold/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-24">
          <p className="text-gold text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Trinidad & Tobago's #1 Tradesman Directory
          </p>
          <h1 className="font-syne font-bold text-white text-5xl md:text-6xl leading-tight mb-4">
            Find a Trusted<br />
            <span className="text-gold">Tradesman</span><br />
            Anywhere in T&T
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-lg">
            Vetted, rated tradesmen across Trinidad & Tobago.
            Contact them directly on WhatsApp — no middleman.
          </p>

          {/* Search box */}
          <div className="bg-white rounded-2xl p-3 flex flex-col md:flex-row gap-3 max-w-2xl shadow-xl">
            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-gold"
            >
              {trades.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-gold"
            >
              {areas.map((a) => <option key={a}>{a}</option>)}
            </select>
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-gold text-white font-bold text-sm rounded-xl hover:bg-yellow-600 transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </div>

          {/* Trade pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            <span className="text-slate-500 text-xs self-center mr-1">Popular:</span>
            {trades.slice(1).map((t) => (
              <button
                key={t}
                onClick={() => navigate(`/tradesmen?trade=${t}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full border border-white/20 transition-colors"
              >
                {tradeIcons[t]} {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gold">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ num, label }) => (
            <div key={label} className="text-center">
              <div className="font-syne font-bold text-navy text-3xl">{num}</div>
              <div className="text-yellow-900 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-gold text-xs font-bold tracking-[0.18em] uppercase mb-3">Simple Process</p>
          <h2 className="font-syne font-bold text-navy text-4xl">How FixItTT Works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {howItWorks.map(({ icon, title, desc }, i) => (
            <div key={title} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm relative">
              <div className="text-4xl mb-4">{icon}</div>
              <div className="absolute top-6 right-8 font-syne font-bold text-slate-100 text-5xl">
                {i + 1}
              </div>
              <h3 className="font-syne font-bold text-navy text-xl mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRADE CATEGORIES ── */}
      <section className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-gold text-xs font-bold tracking-[0.18em] uppercase mb-3">Browse by Trade</p>
            <h2 className="font-syne font-bold text-white text-4xl">What Do You Need?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trades.slice(1).map((t) => (
              <button
                key={t}
                onClick={() => navigate(`/tradesmen?trade=${t}`)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/40 rounded-2xl p-6 text-center transition-all group"
              >
                <div className="text-4xl mb-3">{tradeIcons[t]}</div>
                <div className="font-syne font-bold text-white text-sm group-hover:text-gold transition-colors">
                  {t}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gold rounded-3xl p-12 text-center">
          <h2 className="font-syne font-bold text-navy text-4xl mb-4">
            Are You a Tradesman?
          </h2>
          <p className="text-yellow-900 text-lg mb-8 max-w-md mx-auto">
            Get found by homeowners across T&T. Free listing — featured from TT$200/month.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-10 py-4 bg-navy text-white font-bold text-sm rounded-xl hover:bg-navy/90 transition-colors"
          >
            List My Trade — It's Free
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-navy border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center text-white font-bold text-xs">FX</div>
            <span className="font-syne font-bold text-white">FixIt<span className="text-gold">TT</span></span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 FixItTT · Trinidad & Tobago</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <button onClick={() => navigate("/tradesmen")} className="hover:text-white transition-colors">Find Tradesmen</button>
            <button onClick={() => navigate("/post-job")} className="hover:text-white transition-colors">Post a Job</button>
            <button onClick={() => navigate("/register")} className="hover:text-white transition-colors">List My Trade</button>
          </div>
        </div>
      </footer>

    </div>
  );
}