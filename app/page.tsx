"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

// ─── Floating particle field (money in motion) ────────────────────────
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.5 ? 160 : 200, 
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

// ─── 3D Tilt Card ──────────────────────────────────────────────────────
function TiltCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(
    "perspective(800px) rotateX(0deg) rotateY(0deg)"
  );

  const handleMouse = (e: React.MouseEvent) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setTransform(
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    );
  };

  const handleLeave = () => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg)");
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ transform, transition: "transform 0.15s ease-out" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Staggered text reveal ─────────────────────────────────────────────
function RevealText({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Glowing orb background ───────────────────────────────────────────
function GlowOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, #00e676 0%, transparent 70%)",
          top: "-10%",
          right: "-5%",
          animation: "orbFloat 12s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, #2979ff 0%, transparent 70%)",
          bottom: "10%",
          left: "-8%",
          animation: "orbFloat 15s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
        rel="stylesheet"
      />

      <style jsx global>{`
        :root {
          --green-primary: #00e676;
          --green-glow: #00e67640;
          --blue-primary: #2979ff;
          --blue-glow: #2979ff30;
          --surface: #0a0f1a;
          --surface-raised: #0f1628;
          --surface-card: #111b30;
          --text-primary: #e8ecf4;
          --text-secondary: #7a8ba8;
          --font-display: "Instrument Serif", Georgia, serif;
          --font-body: "DM Sans", system-ui, sans-serif;
        }

        body {
          background: var(--surface);
          color: var(--text-primary);
          font-family: var(--font-body);
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }

        @keyframes tickerPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .grain-overlay::after {
          content: "";
          position: fixed;
          inset: 0;
          opacity: 0.03;
          pointer-events: none;
          z-index: 100;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .comparison-line {
          background: linear-gradient(
            180deg,
            transparent 0%,
            var(--green-primary) 20%,
            var(--green-primary) 80%,
            transparent 100%
          );
        }
      `}</style>

      <div className="grain-overlay overflow-x-hidden">
        <GlowOrbs />
        <ParticleField />

        {/* ── HERO ──────────────────────────────────────────────── */}
        <motion.section
          style={{ y: heroY, zIndex: 2 }}
          className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
        >
          {/* Badge */}
          <RevealText delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--green-primary)]/20 bg-[var(--green-primary)]/5 mb-8 hover:bg-[var(--green-primary)]/10 transition-colors cursor-default">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: "var(--green-primary)",
                  boxShadow: "0 0 8px var(--green-glow)",
                  animation: "tickerPulse 2s ease-in-out infinite",
                }}
              />
              <span
                className="text-sm font-medium tracking-wide"
                style={{ color: "var(--green-primary)", fontFamily: "var(--font-body)" }}
              >
                Built on Starknet · Powered by StarkZap
              </span>
            </div>
          </RevealText>

          {/* Headline */}
          <RevealText delay={0.25}>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight max-w-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your money should{" "}
              <span
                className="italic inline-block transition-transform duration-500 hover:scale-105 hover:rotate-2 cursor-default"
                style={{
                  color: "var(--green-primary)",
                  textShadow: "0 0 40px var(--green-glow)",
                }}
              >
                work
              </span>{" "}
              the moment it{" "}
              <span
                className="inline-block transition-transform duration-500 hover:scale-105 hover:-rotate-2 cursor-default"
                style={{
                  color: "var(--blue-primary)",
                  textShadow: "0 0 40px var(--blue-glow)",
                }}
              >
                arrives
              </span>
            </h1>
          </RevealText>

          {/* Subtext */}
          <RevealText delay={0.45}>
            <p
              className="mt-8 text-lg sm:text-xl max-w-xl leading-relaxed"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
            >
              Cross-border payments that earn yield instantly.
              Zero gas. Total privacy. No crypto knowledge needed.
            </p>
          </RevealText>

          {/* CTA */}
          <RevealText delay={0.6}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <button
                  className="group relative px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-[1.05] active:scale-[0.95]"
                  style={{
                    background: "var(--green-primary)",
                    color: "var(--surface)",
                    fontFamily: "var(--font-body)",
                    boxShadow: "0 0 30px var(--green-glow), 0 4px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Earning Now 
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--green-primary), var(--blue-primary))",
                    }}
                  />
                </button>
              </Link>
              <a
                href="https://github.com/unifyweb3/remityield"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  className="px-8 py-4 rounded-2xl font-semibold text-lg border transition-all duration-300 hover:scale-[1.05] hover:bg-white/5 active:scale-[0.95]"
                  style={{
                    borderColor: "var(--text-secondary)30",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-body)",
                    background: "transparent",
                  }}
                >
                  View Source ↗
                </button>
              </a>
            </div>
          </RevealText>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-10"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 rounded-full border-2 flex justify-center pt-2"
              style={{ borderColor: "var(--text-secondary)40" }}
            >
              <div
                className="w-1.5 h-2.5 rounded-full"
                style={{ background: "var(--green-primary)" }}
              />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* ── BEFORE / AFTER ────────────────────────────────────── */}
        <section className="relative py-16 sm:py-24 px-6" style={{ zIndex: 2 }}>
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl sm:text-5xl tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              The old way is <span className="line-through opacity-40">broken</span>
            </h2>
            <p
              className="mt-4 text-lg max-w-lg mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              See what changes when your remittance hits Starknet
            </p>
          </motion.div>

          {/* Comparison Cards */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-0 items-stretch">
            {/* BEFORE card */}
            <TiltCard delay={0.1}>
              <div
                className="h-full rounded-3xl p-8 sm:p-10 border relative overflow-hidden transition-all duration-500 hover:border-red-500/40 hover:shadow-[0_0_30px_rgba(255,82,82,0.1)]"
                style={{
                  background: "linear-gradient(145deg, #1a1018 0%, #12091a 100%)",
                  borderColor: "#ff5252" + "20",
                }}
              >
                <div
                  className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
                  style={{
                    background: "radial-gradient(circle, #ff5252, transparent 70%)",
                  }}
                />
                <div className="relative">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-red-400/70">
                    Before · Traditional
                  </span>
                  <h3
                    className="text-3xl sm:text-4xl mt-4 text-red-300/90"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Western Union
                  </h3>

                  <div className="mt-8 space-y-5">
                    {[
                      { label: "Fees", value: "$5 – $10", sub: "on every $100 sent" },
                      { label: "Speed", value: "1 – 3 days", sub: "business days only" },
                      { label: "Privacy", value: "None", sub: "bank sees everything" },
                      { label: "Yield", value: "0%", sub: "money sits idle" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-start group">
                        <div>
                          <div className="text-sm font-medium text-red-200/50 group-hover:text-red-200/80 transition-colors">
                            {item.label}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                            {item.sub}
                          </div>
                        </div>
                        <span
                          className="text-lg font-semibold text-red-300/80 font-mono whitespace-nowrap"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="mt-8 p-4 rounded-xl text-center border border-red-500/10"
                    style={{ background: "#ff525208" }}
                  >
                    <div className="text-3xl font-mono font-bold text-red-400/60">
                      $100.00
                    </div>
                    <div className="text-xs text-red-300/40 mt-1">
                      still $100 after 1 year
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Divider */}
            <div className="hidden md:flex flex-col items-center justify-center px-4">
              <div className="comparison-line w-[2px] h-full min-h-[300px] rounded-full" />
              <div
                className="my-3 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--green-primary)40",
                  color: "var(--green-primary)",
                  boxShadow: "0 0 20px var(--green-glow)",
                }}
              >
                VS
              </div>
              <div className="comparison-line w-[2px] h-full min-h-[300px] rounded-full" />
            </div>

            {/* Mobile divider */}
            <div className="md:hidden flex items-center justify-center py-4">
              <div className="h-[2px] w-16 rounded-full" style={{ background: "var(--green-primary)40" }} />
              <div
                className="mx-4 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--green-primary)40",
                  color: "var(--green-primary)",
                  boxShadow: "0 0 20px var(--green-glow)",
                }}
              >
                VS
              </div>
              <div className="h-[2px] w-16 rounded-full" style={{ background: "var(--green-primary)40" }} />
            </div>

            {/* AFTER card */}
            <TiltCard delay={0.3}>
              <div
                className="h-full rounded-3xl p-8 sm:p-10 border relative overflow-hidden transition-all duration-500 hover:border-[var(--green-primary)] hover:shadow-[0_0_40px_var(--green-glow)]"
                style={{
                  background: "linear-gradient(145deg, #081a14 0%, #091220 100%)",
                  borderColor: "var(--green-primary)25",
                }}
              >
                <div
                  className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15"
                  style={{
                    background: "radial-gradient(circle, var(--green-primary), transparent 70%)",
                  }}
                />
                <div className="relative">
                  <span
                    className="text-xs font-bold tracking-[0.2em] uppercase"
                    style={{ color: "var(--green-primary)90" }}
                  >
                    After · remitYield
                  </span>
                  <h3
                    className="text-3xl sm:text-4xl mt-4"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--green-primary)",
                      textShadow: "0 0 20px var(--green-glow)",
                    }}
                  >
                    remitYield
                  </h3>

                  <div className="mt-8 space-y-5">
                    {[
                      { label: "Fees", value: "$0", sub: "gasless via AVNU paymaster" },
                      { label: "Speed", value: "~30 sec", sub: "bridged + confirmed" },
                      { label: "Privacy", value: "Full", sub: "amounts hidden (Tongo)" },
                      { label: "Yield", value: "~4.2% APY", sub: "auto-deposit into Vesu" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-start group">
                        <div>
                          <div
                            className="text-sm font-medium transition-colors group-hover:text-[var(--green-primary)]"
                            style={{ color: "var(--green-primary)80" }}
                          >
                            {item.label}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                            {item.sub}
                          </div>
                        </div>
                        <span
                          className="text-lg font-semibold font-mono whitespace-nowrap"
                          style={{
                            color: "var(--green-primary)",
                            fontFamily: "var(--font-body)",
                          }}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <YieldPreview />
                </div>
              </div>
            </TiltCard>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────── */}
        <section className="relative py-16 sm:py-24 px-6" style={{ zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl sm:text-5xl md:text-6xl tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Three steps.{" "}
              <span
                className="italic"
                style={{
                  color: "var(--green-primary)",
                  textShadow: "0 0 30px var(--green-glow)",
                }}
              >
                That&apos;s it.
              </span>
            </h2>
          </motion.div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Someone sends you money",
                desc: "From anywhere in the world. Bridged from Ethereum or Solana to Starknet in seconds.",
                icon: "🌍",
                color: "var(--blue-primary)",
                glow: "var(--blue-glow)",
              },
              {
                step: "02",
                title: "It arrives privately",
                desc: "Confidential transfer via Tongo. No one can see the amount on-chain. Just you.",
                icon: "🔒",
                color: "var(--green-primary)",
                glow: "var(--green-glow)",
              },
              {
                step: "03",
                title: "Starts earning instantly",
                desc: "Auto-deposited into Vesu lending. Your balance grows every second. Withdraw anytime.",
                icon: "📈",
                color: "var(--green-primary)",
                glow: "var(--green-glow)",
              },
            ].map((item, i) => (
              <TiltCard key={i} delay={i * 0.15}>
                <div
                  className="group h-full rounded-2xl p-8 border relative overflow-hidden transition-all duration-300 hover:-translate-y-3 cursor-default"
                  style={{
                    background: "var(--surface-card)",
                    borderColor: item.color + "20",
                  }}
                >
                  {/* Hover Glow Injector */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 40px ${item.glow}` }}
                  />

                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle, ${item.color}, transparent 70%)`,
                    }}
                  />

                  <div className="relative z-10">
                    <span
                      className="text-5xl font-bold opacity-10 absolute -top-2 -left-1 transition-opacity group-hover:opacity-20"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: item.color,
                      }}
                    >
                      {item.step}
                    </span>

                    <div className="text-4xl mb-4 mt-6 transform transition-transform group-hover:scale-110 group-hover:-rotate-3 origin-bottom-left">
                      {item.icon}
                    </div>

                    <h3
                      className="text-2xl font-semibold mb-3 transition-colors group-hover:text-white"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {item.title}
                    </h3>

                    <p
                      className="text-base leading-relaxed transition-colors group-hover:text-slate-300"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ── STARKZAP MODULES ─────────────────────────────────── */}
        <section className="relative py-16 px-6" style={{ zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl sm:text-5xl tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              6 modules.{" "}
              <span style={{ color: "var(--blue-primary)" }}>One SDK.</span>{" "}
              <span style={{ color: "var(--green-primary)" }}>Zero gas.</span>
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { name: "Privy Wallet", tag: "Auth" },
              { name: "Bridging", tag: "Cross-chain" },
              { name: "Tongo", tag: "Privacy" },
              { name: "Vesu", tag: "Yield" },
              { name: "AVNU", tag: "Gasless" },
              { name: "Tx Builder", tag: "Batching" },
            ].map((mod, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group rounded-2xl p-6 border text-center transition-all duration-300 hover:-translate-y-2 cursor-default relative overflow-hidden"
                style={{
                  background: "var(--surface-raised)",
                  borderColor: "var(--green-primary)15",
                }}
              >
                {/* Module Hover Background Glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "radial-gradient(circle at center, var(--green-primary)10 0%, transparent 100%)"
                  }}
                />

                <div 
                  className="text-base md:text-lg font-semibold relative z-10 transition-colors group-hover:text-white" 
                  style={{ color: "var(--text-primary)" }}
                >
                  {mod.name}
                </div>
                <div
                  className="text-xs md:text-sm mt-2 font-medium uppercase tracking-widest relative z-10"
                  style={{ color: "var(--green-primary)80" }}
                >
                  {mod.tag}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────── */}
        <section className="relative py-24 px-6 text-center" style={{ zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className="text-5xl sm:text-6xl tracking-tight max-w-3xl mx-auto leading-[1.1]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Stop losing money to{" "}
              <span className="line-through opacity-30">fees</span>{" "}
              <span className="line-through opacity-30">delays</span>{" "}
              <span className="line-through opacity-30">idle wallets</span>
            </h2>
            <p className="mt-6 text-xl" style={{ color: "var(--text-secondary)" }}>
              Try the demo. See your money grow in real-time.
            </p>
            <Link href="/dashboard">
              <button
                className="group mt-12 px-12 py-5 rounded-2xl text-xl font-semibold transition-all duration-300 hover:scale-[1.05] active:scale-[0.95]"
                style={{
                  background: "linear-gradient(135deg, var(--green-primary), var(--blue-primary))",
                  color: "var(--surface)",
                  fontFamily: "var(--font-body)",
                  boxShadow:
                    "0 0 40px var(--green-glow), 0 0 80px var(--blue-glow), 0 8px 30px rgba(0,0,0,0.4)",
                }}
              >
                Launch Dashboard <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
              </button>
            </Link>
          </motion.div>

          {/* Footer */}
          <div className="mt-32 text-sm font-medium" style={{ color: "var(--text-secondary)60" }}>
            Built with StarkZap SDK · Starknet Sepolia · By{" "}
            <a
              href="https://x.com/unifyWeb3"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-[var(--green-primary)]"
              style={{ color: "var(--green-primary)80" }}
            >
              @unifyWeb3
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

// ─── Mini yield preview inside the "After" card ────────────────────────
function YieldPreview() {
  const [earned, setEarned] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!started) return;
    const rate = (100 * 0.042) / (365 * 24 * 60 * 60);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setEarned(rate * elapsed);
    }, 100); 
    return () => clearInterval(interval);
  }, [started]);

  return (
    <div
      className="mt-8 p-4 rounded-xl text-center border"
      style={{
        borderColor: "var(--green-primary)20",
        background: "var(--green-primary)08",
      }}
    >
      <div
        className="text-3xl font-mono font-bold"
        style={{
          color: "var(--green-primary)",
          textShadow: "0 0 15px var(--green-glow)",
        }}
      >
        $100.00
      </div>
      <div
        className="text-lg font-mono mt-1"
        style={{
          color: "var(--green-primary)",
          fontVariantNumeric: "tabular-nums",
          opacity: 0.8,
        }}
      >
        +${earned.toFixed(7)}
      </div>
      <div className="text-xs mt-2" style={{ color: "var(--green-primary)80" }}>
        earning live · right now · on this page
      </div>
    </div>
  );
}