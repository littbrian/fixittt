import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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

const steps = ["Your Details", "Your Trade", "Review & Submit"];

function phoneToEmail(phone) {
  return `${phone.replace(/\D/g, "")}@gmail.com`;
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    password: "",
    trade: "",
    area: "",
    years_experience: "",
    bio: "",
  });

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validateStep() {
    const errs = {};
    if (step === 0) {
      if (!form.name.trim()) errs.name = "Name is required";
      if (!form.phone.trim()) errs.phone = "Phone number is required";
      if (form.phone.replace(/\D/g, "").length < 7)
        errs.phone = "Enter a valid phone number";
      if (!form.password || form.password.length < 6)
        errs.password = "Password must be at least 6 characters";
    }
    if (step === 1) {
      if (!form.trade) errs.trade = "Please select a trade";
      if (!form.area) errs.area = "Please select your area";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (validateStep()) setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    if (!validateStep()) return;
    setSubmitting(true);

    const fakeEmail = phoneToEmail(form.phone);

    // 1. Create auth account using phone-derived email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: fakeEmail,
      password: form.password,
    });

    if (authError) {
      // Phone already registered
      if (authError.message.includes("already registered")) {
        setErrors({ phone: "This phone number is already registered. Please log in." });
      } else {
        setErrors({ phone: authError.message });
      }
      setSubmitting(false);
      return;
    }

    // 2. Insert tradesman profile linked to auth user
    const { error: profileError } = await supabase.from("tradesmen").insert({
      user_id: authData.user.id,
      name: form.name.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim() || form.phone.trim(),
      trade: form.trade,
      area: form.area,
      years_experience: parseInt(form.years_experience) || 0,
      bio: form.bio.trim(),
      verified: false,
      featured: false,
      available: true,
      approved: false,
    });

    setSubmitting(false);
    if (!profileError) {
      setSubmitted(true);
    } else {
      console.log("Profile error:", JSON.stringify(profileError));
      setErrors({ phone: "Something went wrong. Please try again." });
    }
  }

  if (submitted) return (
    <div className="min-h-screen bg-[#f7f4ef] font-dm flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center border border-slate-100 shadow-sm">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-syne font-bold text-navy text-2xl mb-2">Application Submitted!</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Thanks <strong>{form.name.split(" ")[0]}</strong>! We'll review your
          application and get back to you within 24 hours. Once approved
          you can log in and start browsing jobs.
        </p>
        <div className="bg-gold/10 rounded-2xl p-5 mb-8 text-left space-y-2">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">What happens next</p>
          <p className="text-sm text-amber-900">✅ We review your details</p>
          <p className="text-sm text-amber-900">📞 We may call to verify</p>
          <p className="text-sm text-amber-900">🟢 Your profile goes live</p>
          <p className="text-sm text-amber-900">💼 You can browse jobs in your area</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-gold text-white font-bold text-sm rounded-xl hover:bg-yellow-600 transition-colors"
          >
            Log In to Browse Jobs
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-slate-100 text-navy font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f4ef] font-dm">

      {/* NAV */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center text-white font-bold text-sm">FX</div>
            <span className="font-syne font-bold text-xl text-navy">FixIt<span className="text-gold">TT</span></span>
          </button>
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-slate-500 hover:text-navy transition-colors"
          >
            Already registered? Log in →
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-gold/10 rounded-2xl px-4 py-2 mb-4">
            <span className="text-gold text-xs font-bold tracking-[0.18em] uppercase">Free Listing</span>
          </div>
          <h1 className="font-syne font-bold text-navy text-4xl mb-3">List Your Trade</h1>
          <p className="text-slate-500 text-base">
            Get found by homeowners across T&T. Free to list —
            featured placement from TT$200/month.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step ? "bg-green-500 text-white" :
                  i === step ? "bg-gold text-white" :
                  "bg-slate-200 text-slate-400"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${i === step ? "text-navy" : "text-slate-400"}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 mb-5 transition-colors ${i < step ? "bg-green-500" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">

          {/* Step 0 — Personal details */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-syne font-bold text-navy text-xl mb-6">Your Details</h2>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Dillon Ramsaran"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-gold transition-colors ${
                    errors.name ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Phone / WhatsApp Number <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="e.g. 868-XXX-XXXX"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-gold transition-colors ${
                    errors.phone ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"
                  }`}
                />
                <p className="text-slate-400 text-xs mt-1">
                  This is your login username — homeowners will contact you on this number.
                </p>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  WhatsApp Number <span className="text-slate-300 normal-case font-normal">(if different from above)</span>
                </label>
                <input
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value)}
                  placeholder="Leave blank to use number above"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Create a Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Min 6 characters"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-gold transition-colors ${
                    errors.password ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50"
                  }`}
                />
                <p className="text-slate-400 text-xs mt-1">
                  You'll use your phone number + this password to log in.
                </p>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>
          )}

          {/* Step 1 — Trade details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-syne font-bold text-navy text-xl mb-6">Your Trade</h2>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Trade <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {trades.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set("trade", t)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
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
                  Area Covered <span className="text-red-400">*</span>
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={form.years_experience}
                  onChange={(e) => set("years_experience", e.target.value)}
                  placeholder="e.g. 8"
                  min="0"
                  max="60"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Bio / Description
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="Describe your services, experience, and what makes you stand out..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-gold resize-none"
                />
                <p className="text-slate-400 text-xs mt-1">{form.bio.length}/300 characters</p>
              </div>
            </div>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div>
              <h2 className="font-syne font-bold text-navy text-xl mb-6">Review & Submit</h2>
              <div className="space-y-1 mb-8">
                {[
                  ["Name", form.name],
                  ["Phone", form.phone],
                  ["WhatsApp", form.whatsapp || form.phone],
                  ["Trade", `${tradeIcons[form.trade]} ${form.trade}`],
                  ["Area", form.area],
                  ["Experience", form.years_experience ? `${form.years_experience} years` : "Not specified"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-start py-3 border-b border-slate-100 last:border-0">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                    <span className="text-sm text-navy font-medium text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
                {form.bio && (
                  <div className="py-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Bio</span>
                    <p className="text-sm text-slate-600 leading-relaxed">{form.bio}</p>
                  </div>
                )}
              </div>

              <div className="bg-gold/10 rounded-2xl p-4 mb-2">
                <p className="text-xs font-bold text-amber-800 mb-1">Free Listing</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Your listing is free. Once approved, homeowners can find and
                  contact you. You can also log in to browse jobs posted in your area.
                  Upgrade to Featured for TT$200/month to appear at the top.
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={back}
                className="flex-1 py-3 border border-slate-200 text-navy font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={next}
                className="flex-1 py-3 bg-gold text-white font-bold text-sm rounded-xl hover:bg-yellow-600 transition-colors"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-navy text-white font-bold text-sm rounded-xl hover:bg-navy/80 transition-colors disabled:opacity-40"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          By submitting you agree to our terms. No spam, no fees to list.
        </p>
      </div>
    </div>
  );
}