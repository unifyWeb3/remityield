"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════
   PARTICLE FIELD — floating dots simulating money in motion
   ═══════════════════════════════════════════════════════════════════════ */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; hue: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.1,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.08,
        hue: Math.random() > 0.5 ? 160 : 210,
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
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animationId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
}

/* ═══════════════════════════════════════════════════════════════════════
   3D TILT CARD — mouse-reactive perspective shift
   ═══════════════════════════════════════════════════════════════════════ */
function TiltCard({
  children, className = "", delay = 0,
}: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");

  const handleMouse = (e: React.MouseEvent) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
  };

  const handleLeave = () => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)");
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ transform, transition: "transform 0.2s ease-out" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   REVEAL TEXT — staggered entrance with blur dissolve
   ═══════════════════════════════════════════════════════════════════════ */
function RevealText({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   GLOW ORBS — ambient background atmosphere
   ═══════════════════════════════════════════════════════════════════════ */
function GlowOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #00e676 0%, transparent 70%)", top: "-10%", right: "-5%", animation: "orbFloat 12s ease-in-out infinite" }} />
      <div className="absolute w-[450px] h-[450px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #2979ff 0%, transparent 70%)", bottom: "15%", left: "-6%", animation: "orbFloat 15s ease-in-out infinite reverse" }} />
      <div className="absolute w-[300px] h-[300px] rounded-full opacity-[0.035]"
        style={{ background: "radial-gradient(circle, #00e676 0%, transparent 70%)", bottom: "40%", right: "15%", animation: "orbFloat 10s ease-in-out infinite 3s" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MINI YIELD PREVIEW — live ticker inside the "After" card
   ═══════════════════════════════════════════════════════════════════════ */
function YieldPreview() {
  const [earned, setEarned] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!started) return;
    const rate = (100 * 0.042) / (365 * 24 * 60 * 60);
    const t0 = Date.now();
    const interval = setInterval(() => setEarned(rate * ((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [started]);

  return (
    <div className="mt-7 p-3.5 rounded-xl text-center border"
      style={{ borderColor: "var(--green)20", background: "var(--green)08" }}>
      <div className="text-2xl font-mono font-bold"
        style={{ color: "var(--green)", textShadow: "0 0 15px var(--green-glow)" }}>
        $100.00
      </div>
      <div className="text-base font-mono mt-1" style={{ color: "var(--green)", fontVariantNumeric: "tabular-nums", opacity: 0.8 }}>
        +${earned.toFixed(7)}
      </div>
      <div className="text-[10px] mt-1" style={{ color: "var(--green)60" }}>
        earning live · right now · on this page
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" />

      <style jsx global>{`
        :root {
          --green: #00e676;
          --green-glow: rgba(0, 230, 118, 0.25);
          --green-dim: rgba(0, 230, 118, 0.08);
          --blue: #2979ff;
          --blue-glow: rgba(41, 121, 255, 0.2);
          --surface: #060b14;
          --surface-raised: #0c1322;
          --surface-card: #0f1829;
          --text-primary: #e4e9f2;
          --text-muted: #6b7c99;
          --font-display: "Instrument Serif", Georgia, serif;
          --font-body: "DM Sans", system-ui, sans-serif;
        }

        html { scroll-behavior: smooth; }
        body { background: var(--surface); color: var(--text-primary); font-family: var(--font-body); margin: 0; }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes tickerPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Film grain */
        .grain::after {
          content: "";
          position: fixed; inset: 0;
          opacity: 0.025; pointer-events: none; z-index: 200;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* ── Step card hover: pop up + glow + border light up ─── */
        .step-card {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.35s ease;
        }
        .step-card:hover {
          transform: translateY(-12px) scale(1.04);
          box-shadow: 0 24px 60px rgba(0, 230, 118, 0.1), 0 0 40px rgba(0, 230, 118, 0.06);
          border-color: rgba(0, 230, 118, 0.3) !important;
        }
        .step-card:hover .step-glow {
          opacity: 0.12 !important;
        }
        .step-card:hover .step-icon {
          transform: scale(1.25) translateY(-2px);
        }
        .step-card:hover .step-number {
          opacity: 0.18 !important;
        }
        .step-card:hover .step-accent-line {
          opacity: 1 !important;
        }
        .step-card .step-icon {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .step-card .step-number {
          transition: opacity 0.35s ease;
        }
        .step-card .step-glow {
          transition: opacity 0.5s ease;
        }
        .step-card .step-accent-line {
          transition: opacity 0.4s ease;
        }

        /* ── Module pill hover: lift + glow + color shift ─── */
        .mod-pill {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.3s ease,
                      border-color 0.3s ease,
                      background 0.3s ease;
        }
        .mod-pill:hover {
          transform: translateY(-8px) scale(1.06);
          border-color: rgba(0, 230, 118, 0.4) !important;
          box-shadow: 0 16px 40px rgba(0, 230, 118, 0.12), 0 0 25px rgba(0, 230, 118, 0.08);
          background: rgba(0, 230, 118, 0.07) !important;
        }
        .mod-pill:hover .mod-icon {
          transform: scale(1.2);
        }
        .mod-pill:hover .mod-tag {
          color: var(--green) !important;
        }
        .mod-pill .mod-icon {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mod-pill .mod-tag {
          transition: color 0.3s ease;
        }

        /* VS divider gradient */
        .vs-line {
          background: linear-gradient(180deg, transparent 0%, var(--green) 20%, var(--green) 80%, transparent 100%);
        }
      `}</style>

      <div className="grain">
        <GlowOrbs />
        <ParticleField />

        {/* ════════════════════════════════════════════════════════
            SECTION 1 — HERO
            ════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 2 }}>

          <RevealText delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
              style={{ borderColor: "var(--green)20", background: "var(--green-dim)" }}>
              <span className="w-2 h-2 rounded-full"
                style={{ background: "var(--green)", boxShadow: "0 0 8px var(--green-glow)", animation: "tickerPulse 2s ease-in-out infinite" }} />
              <span className="text-sm font-medium tracking-wide" style={{ color: "var(--green)" }}>
                Built on Starknet · Powered by StarkZap
              </span>
            </div>
          </RevealText>

          <RevealText delay={0.25}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight max-w-5xl"
              style={{ fontFamily: "var(--font-display)" }}>
              Your money should{" "}
              <span className="italic" style={{ color: "var(--green)", textShadow: "0 0 40px var(--green-glow)" }}>work</span>{" "}
              the moment it{" "}
              <span style={{ color: "var(--blue)", textShadow: "0 0 40px var(--blue-glow)" }}>arrives</span>
            </h1>
          </RevealText>

          <RevealText delay={0.45}>
            <p className="mt-7 text-lg sm:text-xl max-w-xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Cross-border payments that earn yield instantly. Zero gas. Total privacy. No crypto knowledge needed.
            </p>
          </RevealText>

          <RevealText delay={0.6}>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <button className="group relative px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                  style={{ background: "var(--green)", color: "var(--surface)", boxShadow: "0 0 30px var(--green-glow), 0 4px 20px rgba(0,0,0,0.3)" }}>
                  <span className="relative z-10">Start Earning Now</span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg, var(--green), var(--blue))" }} />
                </button>
              </Link>
              <a href="https://github.com/unifyweb3/remityield" target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-4 rounded-2xl font-semibold text-lg border transition-all duration-300 hover:scale-[1.03] hover:border-[var(--green)] hover:text-[var(--green)] active:scale-[0.97] cursor-pointer"
                  style={{ borderColor: "var(--text-muted)30", color: "var(--text-muted)", background: "transparent" }}>
                  View Source ↗
                </button>
              </a>
            </div>
          </RevealText>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-8">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 rounded-full border-2 flex justify-center pt-2" style={{ borderColor: "var(--text-muted)30" }}>
              <div className="w-1.5 h-2.5 rounded-full" style={{ background: "var(--green)" }} />
            </motion.div>
          </motion.div>
        </section>

        {/* ════════════════════════════════════════════════════════
            SECTION 2 — BEFORE vs AFTER
            ════════════════════════════════════════════════════════ */}
        <section className="relative py-20 sm:py-28 px-6" style={{ zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl md:text-6xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              The old way is <span className="line-through opacity-30">broken</span>
            </h2>
            <p className="mt-3 text-base max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
              See what changes when your remittance hits Starknet
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-0 items-stretch">

            {/* ── BEFORE ── */}
            <TiltCard delay={0.1}>
              <div className="h-full rounded-3xl p-8 sm:p-10 border relative overflow-hidden"
                style={{ background: "linear-gradient(145deg, #1a1018 0%, #12091a 100%)", borderColor: "#ff525218" }}>
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.08]"
                  style={{ background: "radial-gradient(circle, #ff5252, transparent 70%)" }} />
                <div className="relative">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-red-400/60">Before · Traditional</span>
                  <h3 className="text-3xl sm:text-4xl mt-3 text-red-300/80" style={{ fontFamily: "var(--font-display)" }}>Western Union</h3>
                  <div className="mt-7 space-y-4">
                    {[
                      { label: "Fees", value: "$5 – $10", sub: "on every $100" },
                      { label: "Speed", value: "1 – 3 days", sub: "business days" },
                      { label: "Privacy", value: "None", sub: "bank sees all" },
                      { label: "Yield", value: "0%", sub: "money sits idle" },
                      { label: "Setup", value: "Photo ID", sub: "forms + visit" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-red-200/40">{item.label}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{item.sub}</div>
                        </div>
                        <span className="text-base font-semibold text-red-300/70 font-mono">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 p-3.5 rounded-xl text-center border border-red-500/10" style={{ background: "#ff525206" }}>
                    <div className="text-2xl font-mono font-bold text-red-400/50">$100.00</div>
                    <div className="text-[10px] text-red-300/30 mt-1">still $100 after 1 year</div>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* ── VS divider (desktop) ── */}
            <div className="hidden md:flex flex-col items-center justify-center px-5">
              <div className="vs-line w-[2px] flex-1 rounded-full opacity-40" />
              <div className="my-3 w-11 h-11 rounded-full flex items-center justify-center text-[11px] font-bold border"
                style={{ background: "var(--surface)", borderColor: "var(--green)30", color: "var(--green)", boxShadow: "0 0 25px var(--green-glow)" }}>
                VS
              </div>
              <div className="vs-line w-[2px] flex-1 rounded-full opacity-40" />
            </div>

            {/* ── VS divider (mobile) ── */}
            <div className="md:hidden flex items-center justify-center py-1">
              <div className="h-[2px] w-14 rounded-full" style={{ background: "var(--green)30" }} />
              <div className="mx-4 w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold border"
                style={{ background: "var(--surface)", borderColor: "var(--green)30", color: "var(--green)", boxShadow: "0 0 20px var(--green-glow)" }}>VS</div>
              <div className="h-[2px] w-14 rounded-full" style={{ background: "var(--green)30" }} />
            </div>

            {/* ── AFTER ── */}
            <TiltCard delay={0.3}>
              <div className="h-full rounded-3xl p-8 sm:p-10 border relative overflow-hidden"
                style={{ background: "linear-gradient(145deg, #081a14 0%, #091220 100%)", borderColor: "var(--green)18" }}>
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.12]"
                  style={{ background: "radial-gradient(circle, var(--green), transparent 70%)" }} />
                <div className="relative">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "var(--green)80" }}>After · remitYield</span>
                  <h3 className="text-3xl sm:text-4xl mt-3"
                    style={{ fontFamily: "var(--font-display)", color: "var(--green)", textShadow: "0 0 20px var(--green-glow)" }}>
                    remitYield
                  </h3>
                  <div className="mt-7 space-y-4">
                    {[
                      { label: "Fees", value: "$0", sub: "gasless via AVNU" },
                      { label: "Speed", value: "~30 sec", sub: "bridge + confirm" },
                      { label: "Privacy", value: "Full", sub: "hidden via Tongo" },
                      { label: "Yield", value: "~4.2% APY", sub: "auto into Vesu" },
                      { label: "Setup", value: "Email", sub: "or Google — done" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium" style={{ color: "var(--green)70" }}>{item.label}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{item.sub}</div>
                        </div>
                        <span className="text-base font-semibold font-mono" style={{ color: "var(--green)" }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <YieldPreview />
                </div>
              </div>
            </TiltCard>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            SECTION 3 — HOW IT WORKS
            ════════════════════════════════════════════════════════ */}
        <section className="relative py-20 sm:py-28 px-6" style={{ zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl md:text-6xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Three steps.{" "}
              <span className="italic" style={{ color: "var(--green)", textShadow: "0 0 30px var(--green-glow)" }}>
                That&apos;s it.
              </span>
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01", title: "Someone sends you money",
                desc: "From anywhere in the world. Bridged from Ethereum or Solana into Starknet in seconds.",
                icon: "🌍", accent: "var(--blue)",
              },
              {
                step: "02", title: "It arrives privately",
                desc: "Confidential transfer via Tongo. No one sees the amount on-chain. Only you.",
                icon: "🔒", accent: "var(--green)",
              },
              {
                step: "03", title: "Starts earning instantly",
                desc: "Auto-deposited into Vesu lending. Your balance grows every second. Withdraw anytime.",
                icon: "📈", accent: "var(--green)",
              },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}>

                <div className="step-card h-full rounded-2xl p-7 border relative overflow-hidden cursor-default"
                  style={{ background: "var(--surface-card)", borderColor: `${item.accent}10` }}>

                  {/* Glow that appears on hover */}
                  <div className="step-glow absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-0 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${item.accent}, transparent 70%)` }} />

                  {/* Big number watermark */}
                  <span className="step-number text-5xl font-bold absolute -top-1 -left-0.5 opacity-[0.06]"
                    style={{ fontFamily: "var(--font-display)", color: item.accent }}>
                    {item.step}
                  </span>

                  {/* Icon */}
                  <div className="step-icon text-3xl mb-4 mt-5">{item.icon}</div>

                  <h3 className="text-lg font-semibold mb-2.5 leading-snug">{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</p>

                  {/* Bottom accent line — visible on hover */}
                  <div className="step-accent-line absolute bottom-0 left-0 right-0 h-[2px] opacity-0"
                    style={{ background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            SECTION 4 — STARKZAP MODULES
            ════════════════════════════════════════════════════════ */}
        <section className="relative py-20 sm:py-24 px-6" style={{ zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl md:text-[3.4rem] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              6 modules.{" "}
              <span style={{ color: "var(--blue)", textShadow: "0 0 20px var(--blue-glow)" }}>One SDK.</span>{" "}
              <span style={{ color: "var(--green)", textShadow: "0 0 20px var(--green-glow)" }}>Zero gas.</span>
            </h2>
            <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
              Every module serves a purpose in the flow — nothing bolted on.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { name: "Privy", tag: "Wallet & Auth", icon: "🔐", accent: "var(--blue)" },
              { name: "Bridging", tag: "Cross-chain", icon: "🌉", accent: "var(--blue)" },
              { name: "Tongo", tag: "Privacy", icon: "🔒", accent: "var(--green)" },
              { name: "Vesu", tag: "Auto-yield", icon: "📈", accent: "var(--green)" },
              { name: "AVNU", tag: "Gasless", icon: "⚡", accent: "var(--green)" },
              { name: "Tx Builder", tag: "Batching", icon: "🧱", accent: "var(--blue)" },
            ].map((mod, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}>
                <div className="mod-pill rounded-2xl p-5 border cursor-default text-center"
                  style={{ background: "var(--surface-raised)", borderColor: `${mod.accent}12` }}>
                  <div className="mod-icon text-2xl mb-2">{mod.icon}</div>
                  <div className="text-base font-semibold">{mod.name}</div>
                  <div className="mod-tag text-[10px] mt-1.5 font-semibold uppercase tracking-[0.15em]"
                    style={{ color: "var(--text-muted)" }}>
                    {mod.tag}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            SECTION 5 — FINAL CTA + FOOTER (tight, no excess space)
            ════════════════════════════════════════════════════════ */}
        <section className="relative pt-12 pb-16 px-6 text-center" style={{ zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl tracking-tight max-w-3xl mx-auto leading-[1.1]"
              style={{ fontFamily: "var(--font-display)" }}>
              Stop losing money to{" "}
              <span className="line-through opacity-25">fees</span>{" "}
              <span className="line-through opacity-25">delays</span>{" "}
              <span className="line-through opacity-25">idle wallets</span>
            </h2>
            <p className="mt-5 text-base" style={{ color: "var(--text-muted)" }}>
              Try the demo. See your money grow in real-time.
            </p>
            <Link href="/dashboard">
              <button className="mt-8 px-10 py-5 rounded-2xl text-xl font-semibold transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, var(--green), var(--blue))",
                  color: "var(--surface)",
                  boxShadow: "0 0 40px var(--green-glow), 0 0 80px var(--blue-glow), 0 8px 30px rgba(0,0,0,0.4)",
                }}>
                Launch Dashboard →
              </button>
            </Link>
          </motion.div>

          {/* Footer — compact, no extra breathing room */}
          <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between max-w-3xl mx-auto gap-3"
            style={{ borderColor: "var(--text-muted)15" }}>
            <div className="text-xs" style={{ color: "var(--text-muted)50" }}>
              © 2025 remitYield · Built with StarkZap SDK on Starknet Sepolia
            </div>
            <div className="flex items-center gap-4">
              <a href="https://x.com/unifyWeb3" target="_blank" rel="noopener noreferrer"
                className="text-xs transition-colors duration-200 hover:text-[var(--green)]"
                style={{ color: "var(--text-muted)60" }}>
                @unifyWeb3
              </a>
              <a href="https://github.com/unifyweb3/remityield" target="_blank" rel="noopener noreferrer"
                className="text-xs transition-colors duration-200 hover:text-[var(--green)]"
                style={{ color: "var(--text-muted)60" }}>
                GitHub
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
