"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { LOGO, BRAND } from "@/lib/brand/tokens";

const SceneCanvas360 = dynamic(
  () => import("@/components/babylon/SceneCanvas360"),
  { ssr: false }
);

export default function Experience360Page() {
  const [ready, setReady] = useState(false);

  const fade: React.CSSProperties = {
    opacity: ready ? 1 : 0,
    transition: "opacity 1.2s ease",
    pointerEvents: ready ? "auto" : "none",
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#000" }}
    >
      <SceneCanvas360 onReady={() => setReady(true)} />

      {/* Top-left: logo + back */}
      <div
        className="absolute top-0 left-0 z-10 flex items-center gap-5 p-6"
        style={{
          ...fade,
          background: "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
        }}
      >
        <Image
          src={LOGO.src}
          alt="AirSea Packing"
          width={110}
          height={Math.round(110 / LOGO.aspectRatio)}
          priority
          style={{ filter: "brightness(0) invert(1)", opacity: 0.85 }}
        />
        <Link
          href="/experience"
          style={{
            color: BRAND.textDim,
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontFamily: "Helvetica Neue, Arial, sans-serif",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = BRAND.textSecondary)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = BRAND.textDim)
          }
        >
          ← Back to Experience
        </Link>
      </div>

      {/* Bottom: hint */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center"
        style={{
          opacity: ready ? 0.5 : 0,
          transition: "opacity 2s ease 1.5s",
        }}
      >
        <p
          style={{
            color: BRAND.textDim,
            fontSize: "10px",
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            fontFamily: "Helvetica Neue, Arial, sans-serif",
          }}
        >
          Drag to look around &nbsp;·&nbsp; 360° Immersive
        </p>
      </div>
    </div>
  );
}
