import Link from "next/link";
import Image from "next/image";
import { LOGO, BRAND } from "@/lib/brand/tokens";

export default function Home() {
  return (
    <div
      className="flex flex-1 items-center justify-center min-h-screen"
      style={{ background: BRAND.bg }}
    >
      <main className="flex flex-col items-center gap-12 text-center px-8 max-w-lg">

        {/* Real AirSea logo — given generous space, no competing elements near it */}
        <Image
          src={LOGO.src}
          alt="AirSea Packing"
          width={220}
          height={Math.round(220 / LOGO.aspectRatio)}
          priority
          style={{
            filter: "brightness(0) invert(1)",
            opacity: 0.88,
          }}
        />

        {/* Thin brand rule */}
        <div
          className="w-12 h-px"
          style={{ background: BRAND.border }}
        />

        {/* Positioning line */}
        <p
          className="text-xs tracking-[0.22em] uppercase"
          style={{ color: BRAND.textSecondary }}
        >
          White-Glove Logistics &nbsp;·&nbsp; Fine Art &nbsp;·&nbsp; Private Households
        </p>

        {/* Primary CTA — spatial experience entry */}
        <Link href="/experience" className="group flex flex-col items-center gap-3">
          <span
            className="border text-xs tracking-[0.26em] uppercase px-12 py-4 transition-all duration-400 block"
            style={{
              color: BRAND.teal,
              borderColor: `${BRAND.teal}55`,
            }}
          >
            Enter Spatial Experience
          </span>
          <span
            className="text-[10px] tracking-[0.18em] uppercase"
            style={{ color: BRAND.textDim }}
          >
            360° &nbsp;·&nbsp; Interactive &nbsp;·&nbsp; Immersive
          </span>
        </Link>

        {/* Secondary navigation */}
        <div
          className="flex gap-8 pt-4 border-t w-full justify-center"
          style={{ borderColor: BRAND.border }}
        >
          <Link
            href="/contact"
            className="text-xs tracking-[0.18em] uppercase transition-colors"
            style={{ color: BRAND.textDim }}
          >
            Request a Quote
          </Link>
          <Link
            href="/solutions"
            className="text-xs tracking-[0.18em] uppercase transition-colors"
            style={{ color: BRAND.textDim }}
          >
            Services
          </Link>
        </div>

      </main>
    </div>
  );
}
