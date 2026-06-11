import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Zap, Users, FileText, TrendingUp, ArrowRight, ChevronRight } from "lucide-react";

function FireParticle({ style }) {
  return (
    <div
      className="particle"
      style={{
        width: style.size,
        height: style.size,
        left: style.left,
        animationDuration: style.duration,
        animationDelay: style.delay,
        opacity: style.opacity,
        background: style.color,
        filter: `blur(${style.blur}px)`,
      }}
    />
  );
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  size: `${Math.random() * 6 + 2}px`,
  left: `${Math.random() * 100}%`,
  duration: `${Math.random() * 8 + 6}s`,
  delay: `${Math.random() * 6}s`,
  opacity: Math.random() * 0.7 + 0.2,
  color: ["#FF2200", "#FF5500", "#FF8C00", "#FF3300"][Math.floor(Math.random() * 4)],
  blur: Math.random() * 2,
}));

const FEATURES = [
  {
    icon: <Zap size={24} className="text-fire-core" />,
    title: "Real-time Transcription",
    desc: "Capture every word instantly with Web Speech API. No uploads, no delays.",
  },
  {
    icon: <Users size={24} className="text-fire-mid" />,
    title: "Speaker Identification",
    desc: "Distributor and vendor voices tracked separately with color-coded segments.",
  },
  {
    icon: <TrendingUp size={24} className="text-fire-tip" />,
    title: "Pain Point Extraction",
    desc: "AI identifies friction points, categorizes by severity, and suggests solutions.",
  },
  {
    icon: <FileText size={24} className="text-success" />,
    title: "Meeting Reports",
    desc: "Full intelligence reports with summaries, action items, and agreements.",
  },
];

const STEPS = [
  { num: "01", title: "Create Meeting", desc: "Set up your session and get an instant shareable link." },
  { num: "02", title: "Invite & Record", desc: "Guests join by link. Real-time transcription starts automatically." },
  { num: "03", title: "Get Intelligence", desc: "AI analyzes the conversation and delivers actionable insights." },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-void text-text-primary overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-bg-border bg-bg-void/90 backdrop-blur">
        <div className="flex items-center gap-2">
          <Flame size={22} className="text-fire-core" fill="rgba(255,34,0,0.2)" />
          <span className="font-display text-xl glow-text">VendorSync</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="btn-ghost text-sm px-4 py-2"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="btn-fire text-sm px-4 py-2"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {PARTICLES.map((p, i) => (
            <FireParticle key={i} style={p} />
          ))}
          {/* Radial gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,34,0,0.08) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-bg-dark border border-fire-core/30 rounded-full px-4 py-1.5 mb-8 text-sm text-fire-mid">
            <span className="w-1.5 h-1.5 rounded-full bg-fire-core animate-rec-dot" />
            AI-Powered Meeting Intelligence
          </div>

          <h1
            className="font-display text-7xl md:text-8xl lg:text-9xl mb-6 leading-none glow-text"
            style={{ letterSpacing: "0.02em" }}
          >
            TURN EVERY
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #FF2200, #FF8C00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              MEETING
            </span>
            <br />
            INTO ACTION
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            VendorSync transforms distributor-vendor meetings into intelligence.
            Real-time transcription, AI analysis, pain point detection — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="btn-fire text-base px-8 py-4 glow-fire"
            >
              Start for Free
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => document.getElementById("how-it-works").scrollIntoView({ behavior: "smooth" })}
              className="btn-ghost text-base px-8 py-4"
            >
              See How It Works
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-16 pt-8 border-t border-bg-border">
            {[
              { n: "100%", l: "Free to Start" },
              { n: "< 1s", l: "Transcription Lag" },
              { n: "AI", l: "Pain Point Detection" },
            ].map(({ n, l }) => (
              <div key={l}>
                <div className="font-display text-3xl text-fire-core">{n}</div>
                <div className="text-xs text-text-dim mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl glow-text mb-4">BUILT FOR BUSINESS</h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Every feature designed for the real complexities of distributor-vendor relationships.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 hover:border-fire-mid/40 group">
              <div className="w-12 h-12 rounded-lg bg-bg-surface flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-bg-dark/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl glow-text mb-4">HOW IT WORKS</h2>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div
              className="absolute top-8 left-0 right-0 h-px hidden md:block"
              style={{
                background: "linear-gradient(90deg, transparent, #FF5500, #FF8C00, #FF5500, transparent)",
              }}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {STEPS.map((s) => (
                <div key={s.num} className="text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center font-display text-2xl mx-auto mb-4 glow-fire"
                    style={{ background: "rgba(255,34,0,0.15)", border: "2px solid #FF2200", color: "#FF2200" }}
                  >
                    {s.num}
                  </div>
                  <h3 className="font-display text-xl text-text-primary mb-2">{s.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center card p-12 glow-border">
          <h2 className="font-display text-4xl mb-4 glow-text">
            READY TO TRANSFORM YOUR VENDOR MEETINGS?
          </h2>
          <p className="text-text-secondary mb-8">
            Join now — no credit card required. Free Groq API tier included.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="btn-fire text-base px-10 py-4 glow-fire"
          >
            Create Free Account
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-bg-border px-8 py-8 flex items-center justify-between text-sm text-text-dim">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-fire-core" />
          <span className="font-display text-lg glow-text">VendorSync</span>
        </div>
        <p>© {new Date().getFullYear()} VendorSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
