"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useAirSeaExperienceStore } from "@/store/useAirSeaExperienceStore";
import { LOGO, BRAND } from "@/lib/brand/tokens";

const SceneCanvas = dynamic(
  () => import("@/components/babylon/SceneCanvas"),
  { ssr: false, loading: () => <ExperienceLoader /> }
);

function ExperienceLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full" style={{ background: BRAND.bg }}>
      <div className="flex flex-col items-center gap-6">
        <Image
          src={LOGO.src}
          alt="AirSea Packing"
          width={160}
          height={Math.round(160 / LOGO.aspectRatio)}
          priority
          style={{ opacity: 0.65, filter: "brightness(0) invert(1)" }}
        />
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full border border-t-transparent animate-spin"
            style={{ borderColor: BRAND.teal }}
          />
          <p style={{ color: BRAND.textDim, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
            Preparing
          </p>
        </div>
      </div>
    </div>
  );
}

function ExperienceHUD() {
  const sceneReady  = useAirSeaExperienceStore((s) => s.sceneReady);
  const xrSupported = useAirSeaExperienceStore((s) => s.xrSupported);
  const xrEnter     = useAirSeaExperienceStore((s) => s.xrEnter);
  const fade: React.CSSProperties = {
    opacity: sceneReady ? 1 : 0,
    transition: "opacity 1.6s ease",
  };

  const navLinkStyle = (dim = true): React.CSSProperties => ({
    color: dim ? BRAND.textDim : BRAND.teal,
    fontSize: "10px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    fontFamily: "Helvetica Neue, Arial, sans-serif",
    transition: "color 0.2s",
  });

  return (
    <>
      {/* ── Top-left: logo ──────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 z-10 p-7"
        style={{
          ...fade,
          background: "linear-gradient(135deg, rgba(11,13,16,0.75) 0%, transparent 80%)",
        }}
      >
        <Link href="/" aria-label="AirSea Packing — Home">
          <Image
            src={LOGO.src}
            alt="AirSea Packing"
            width={132}
            height={Math.round(132 / LOGO.aspectRatio)}
            priority
            style={{ filter: "brightness(0) invert(1)", opacity: 0.88 }}
          />
        </Link>
      </div>

      {/* ── Top-right: primary nav ──────────────────────────────────────── */}
      <div
        className="absolute top-0 right-0 z-10 flex items-center gap-7 px-7 py-6"
        style={{
          ...fade,
          background: "linear-gradient(225deg, rgba(11,13,16,0.65) 0%, transparent 80%)",
        }}
      >
        {xrSupported && (
          <button
            style={{ ...navLinkStyle(false), background: "transparent", border: "none", cursor: "pointer" }}
            onClick={() => xrEnter?.()}
          >
            Enter XR
          </button>
        )}
        <Link
          href="/contact"
          style={navLinkStyle(false)}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = BRAND.tealLight)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = BRAND.teal)}
        >
          Request a Quote
        </Link>
        <Link
          href="/"
          style={navLinkStyle()}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = BRAND.textSecondary)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = BRAND.textDim)}
        >
          ← Exit
        </Link>
      </div>

      {/* ── Bottom-center: mode tabs ────────────────────────────────────── */}
      <div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex items-center"
        style={{
          opacity: sceneReady ? 1 : 0,
          transition: "opacity 2s ease 1s",
          border: `1px solid ${BRAND.border}`,
          background: "rgba(11,13,16,0.68)",
          backdropFilter: "blur(12px)",
        }}
      >
        {([
          { label: "360°", href: "/experience/360" },
          { label: "Interactive", href: null },
          { label: "Immersive", href: null },
        ] as const).map(({ label, href }, i) => {
          const isActive = label === "Interactive";
          const isLast = i === 2;
          const s: React.CSSProperties = {
            color: isActive ? BRAND.teal : BRAND.textDim,
            background: isActive ? `${BRAND.teal}12` : "transparent",
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            padding: "10px 24px",
            border: "none",
            borderRight: isLast ? "none" : `1px solid ${BRAND.border}`,
            cursor: "pointer",
            fontFamily: "Helvetica Neue, Arial, sans-serif",
            display: "block",
            transition: "color 0.2s",
          };
          if (href) return <Link key={label} href={href} style={s}>{label}</Link>;
          return <button key={label} style={s}>{label}</button>;
        })}
      </div>

      {/* ── Bottom-right: look hint ─────────────────────────────────────── */}
      <div
        className="absolute bottom-7 right-7 z-10"
        style={{
          opacity: sceneReady ? 0.35 : 0,
          transition: "opacity 2.5s ease 2s",
        }}
      >
        <p style={{ color: BRAND.textDim, fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
          Drag to look
        </p>
      </div>
    </>
  );
}

export default function ExperiencePage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: BRAND.bg }}>
      <SceneCanvas />
      <ExperienceHUD />
    </div>
  );
}
