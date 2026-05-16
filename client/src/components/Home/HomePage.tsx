import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import AuthModal from '../Auth/AuthModal';

interface HomePageProps {
  onNavigate: (section: string) => void;
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    emoji: '✅',
    icon: '📋',
    title: 'Daily Tasks',
    subtitle: 'Small daily actions for big transformation',
    bullets: ['Personalized daily practice', 'Build healthy habits', 'Track your wellness streak'],
    linkText: 'See How It Works',
  },
  {
    emoji: '🧘',
    icon: '🌊',
    title: 'Prakriti & Elements',
    subtitle: 'Know your unique mind-body constitution',
    bullets: ['Discover dominant Prakriti', 'Understand element balance', 'Insights for better well-being'],
    linkText: 'Explore Assessment',
  },
  // {
  //   emoji: '🍽️',
  //   icon: '🥘',
  //   title: 'AI Meal Planning',
  //   subtitle: 'Personalized satvic meals for your family',
  //   bullets: ['AI-powered meal plans', 'Seasonal & Prakriti based', 'Healthy, simple & delicious'],
  //   linkText: 'See Meal Plans',
  // },
  {
    emoji: '🌿',
    icon: '🌳',
    title: 'Seasonal Guidance',
    subtitle: "Live in harmony with nature's rhythms",
    bullets: ["Seasonal do's & don'ts", 'Yoga, lifestyle & diet tips', 'Stay balanced all year'],
    linkText: 'View Current Season',
  },
];

const WHY_ITEMS = [
  { emoji: '🌿', label: '100% Natural', sub: 'Rooted in Nature' },
  { emoji: '🛡️', label: 'Safe & Personalized', sub: 'For every age & body type' },
  { emoji: '👨‍👩‍👧‍👦', label: 'Whole Family', sub: 'One app for everyone' },
  { emoji: '⚖️', label: 'Balanced Living', sub: 'Mind, body, food & lifestyle' },
];

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/* ─── Component ──────────────────────────────────────────────────────────── */

const HomePage: React.FC<HomePageProps> = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      {/* ══════════ HERO ══════════ */}
      <section className="relative rounded-3xl overflow-hidden mb-10 bg-gradient-to-r from-green-600 to-teal-600 shadow-xl">
        {/* decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-6 right-6 text-5xl opacity-10 select-none">🕉️</div>

        <div className="relative px-6 sm:px-12 lg:px-16 py-2 lg:py-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left text */}
            <div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
                Your family,{' '}
                <span className="relative">
                  living as nature intended
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-white/40 rounded-full" />
                </span>
              </h1>

              <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                Most families know what's natural. Few can do it together. Prakriti Parivar is the system that makes it possible. One rhythm, one season, one family at a time.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={() => setAuthOpen(true)}
                  className="group bg-white text-green-700 px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  🌱 Start Your Journey
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                {/* <button
                  onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white/10 border-2 border-white/30 text-white px-7 py-3.5 rounded-full font-semibold text-sm sm:text-base hover:bg-white/20 transition-all"
                >
                  Explore Features
                </button> */}
              </div>

              {/* Trust badges */}
              {/* <div className="flex flex-wrap gap-5">
                {[
                  { icon: '🌿', title: 'Ancient Wisdom', sub: 'Rooted in Ayurveda' },
                  { icon: '🤖', title: 'Modern Technology', sub: 'AI-Powered Insights' },
                  { icon: '👨‍👩‍👧', title: 'Family Focused', sub: 'For Every Member' },
                ].map((b) => (
                  <div key={b.title} className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-xl shrink-0 border border-white/20">
                      {b.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{b.title}</p>
                      <p className="text-[11px] text-white/65">{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>

            {/* Right illustration */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-[340px] h-[340px]">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20" />
                <div className="absolute inset-6 rounded-full bg-white/10 shadow-inner" />
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none gap-2">
                  <span className="text-7xl drop-shadow-sm">👨‍👩‍👧‍👦</span>
                  <div className="flex gap-2 text-2xl opacity-80">
                    <span>🌿</span><span>🪴</span><span>🌿</span>
                  </div>
                </div>
                {/* Floating chips */}
                <div className="absolute -left-6 top-1/3 bg-white rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <div>
                    <p className="text-[10px] font-bold text-gray-800">5 Day Streak</p>
                    <p className="text-[9px] text-gray-500">Keep going!</p>
                  </div>
                </div>
                <div className="absolute -right-6 top-1/4 bg-white rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2">
                  <span className="text-lg">🌱</span>
                  <div>
                    <p className="text-[10px] font-bold text-gray-800">Body Type</p>
                    <p className="text-[9px] text-gray-500">Your Prakriti</p>
                  </div>
                </div>
                <div className="absolute bottom-10 -right-4 bg-white rounded-2xl px-3 py-2 shadow-lg">
                  <p className="text-[10px] font-bold">Family Nature 🌱</p>
                  <p className="text-[9px] opacity-80">Air · Earth · Fire</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section id="features-section" className="mb-12 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border border-green-100 px-6 sm:px-10 py-10">
        <div className="text-center mb-10">
          <p className="text-green-600 font-semibold text-sm tracking-wider uppercase mb-2">What We Offer</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Natural Family Living
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Light header */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border-b border-green-100 h-28 flex items-center justify-center relative overflow-hidden">
                <span className="text-5xl select-none drop-shadow-sm">{f.emoji}</span>
                <div className="absolute top-2.5 right-2.5 w-7 h-7 bg-white rounded-lg shadow-sm flex items-center justify-center text-sm border border-green-100">
                  {f.icon}
                </div>
                <div className="absolute inset-0 bg-green-50/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 text-base mb-0.5">{f.title}</h3>
                <p className="text-xs text-gray-500 mb-4 leading-snug">{f.subtitle}</p>

                <ul className="space-y-2 flex-1 mb-5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-gray-500">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setAuthOpen(true)}
                  className="text-green-600 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all mt-auto hover:text-teal-600"
                >
                  {f.linkText}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ STREAK BANNER ══════════ */}
      <section className="mb-12 rounded-3xl overflow-hidden bg-gradient-to-r from-green-600 to-teal-600 shadow-xl">
        <div className="px-6 sm:px-10 lg:px-14 py-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">

            {/* Left */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center text-2xl border border-white/20">
                  🔥
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-xl">
                    Stay Consistent, See the Change
                  </h3>
                  <p className="text-white/65 text-sm">
                    Track your streak and celebrate small wins every day.
                  </p>
                </div>
              </div>

              {/* Week circles */}
              <div className="flex gap-2.5">
                {WEEK_LABELS.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${i < 5
                      ? 'bg-white text-green-700 shadow-md'
                      : 'border-2 border-white/25 text-white/35'
                      }`}>
                      {i < 5 ? <Check className="w-4 h-4" /> : d}
                    </div>
                    <span className={`text-[10px] font-semibold ${i < 5 ? 'text-white/90' : 'text-white/30'}`}>
                      {d}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-20 bg-white/20" />

            {/* Stats */}
            <div className="flex flex-wrap gap-8 lg:gap-10">
              {[
                { emoji: '🔥', value: '5', label: 'Day Streak' },
                { emoji: '📅', value: 'Week 3', label: 'Current Week' },
                { emoji: '🏆', value: '2', label: 'Weeks Completed' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-xl border border-white/20">
                    {s.emoji}
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-2xl leading-none">{s.value}</p>
                    <p className="text-white/55 text-xs mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ WHY FAMILIES LOVE ══════════ */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <p className="text-green-600 font-semibold text-sm tracking-wider uppercase mb-2">Why Choose Us</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Why Families Love{' '}
            <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Prakriti Parivar
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {WHY_ITEMS.map((w) => (
            <div
              key={w.label}
              className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl flex items-center justify-center text-3xl shadow-md">
                {w.emoji}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm leading-tight">{w.label}</p>
                <p className="text-xs text-gray-500 mt-1">{w.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="mb-4 rounded-3xl overflow-hidden relative bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border border-green-100 shadow-sm">
        <div className="absolute top-0 right-0 w-72 h-72 bg-green-100/50 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-teal-100/50 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative px-6 sm:px-12 lg:px-16 py-14 flex flex-col lg:flex-row items-center gap-10">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-green-600 font-semibold text-sm tracking-wider uppercase mb-3">
              Get Started Today
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4 leading-tight">
              Ready to bring<br />your family back to nature?
            </h2>
            <p className="text-gray-500 mb-8 text-base max-w-md mx-auto lg:mx-0">
              Join families across India returning to natural living.
            </p>
            <button
              onClick={() => setAuthOpen(true)}
              className="group bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold px-8 py-4 rounded-full text-base shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
            >
              Start Free Journey
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-gray-400 text-xs mt-4">
              Takes less than 2 minutes to get started
            </p>
          </div>

          {/* Phone mockup */}
          <div className="hidden sm:block shrink-0">
            <div className="w-48 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-3">
                <p className="text-white/80 text-[11px] font-bold mb-0.5">Today's Practice</p>
                <p className="text-white text-xs font-semibold leading-snug">
                  Add bottle gourd<br />to today's meal 🌿
                </p>
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="text-gray-700 text-[10px] font-bold mb-1">Element Balance</p>
                {[
                  { label: 'Earth', pct: 22 },
                  { label: 'Water', pct: 18 },
                  { label: 'Fire', pct: 15 },
                  { label: 'Air', pct: 23 },
                  { label: 'Space', pct: 22 },
                ].map((el, i) => (
                  <div key={el.label} className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-400 w-7 shrink-0">{el.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-1.5 rounded-full"
                        style={{ width: `${el.pct * 4}%`, opacity: 1 - i * 0.12 }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 w-5 text-right">{el.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default HomePage;
