import Link from "next/link";
import Image from "next/image";
import { LOGO, BRAND, FONT } from "@/lib/brand/tokens";
import { AIRSEA_SECTIONS } from "@/content/airsea";

export default function SolutionsPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: BRAND.bg, fontFamily: FONT.body }}
    >
      {/* Nav */}
      <header
        className="flex items-center justify-between px-8 py-6 border-b"
        style={{ borderColor: BRAND.border }}
      >
        <Link href="/">
          <Image
            src={LOGO.src}
            alt="AirSea Packing"
            width={110}
            height={Math.round(110 / LOGO.aspectRatio)}
            style={{ filter: "brightness(0) invert(1)", opacity: 0.85 }}
          />
        </Link>
        <nav className="flex gap-8">
          <Link
            href="/experience"
            style={{ color: BRAND.teal, fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            Experience
          </Link>
          <Link
            href="/contact"
            style={{ color: BRAND.textDim, fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            Request a Quote
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-20">
        {/* Page heading */}
        <div className="mb-20">
          <p
            style={{ color: BRAND.teal, fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "14px" }}
          >
            White-Glove Logistics
          </p>
          <h1
            style={{ color: BRAND.textPrimary, fontFamily: FONT.display, fontSize: "36px", fontWeight: 400, lineHeight: 1.2, marginBottom: "18px" }}
          >
            Services
          </h1>
          <p style={{ color: BRAND.textSecondary, fontSize: "14px", lineHeight: 1.75, maxWidth: "540px" }}>
            AirSea provides premium logistics services to designers, architects,
            private households, luxury retailers, fine art collectors, and
            institutions across New York, Los Angeles, and beyond.
          </p>
        </div>

        {/* Service grid */}
        <div className="grid grid-cols-1 gap-px" style={{ borderTop: `1px solid ${BRAND.border}` }}>
          {AIRSEA_SECTIONS.filter((s) => s.id !== "quote").map((section) => (
            <div
              key={section.id}
              className="py-10 grid grid-cols-3 gap-10"
              style={{ borderBottom: `1px solid ${BRAND.border}` }}
            >
              {/* Left: label + tagline */}
              <div className="col-span-1">
                <div
                  className="w-3 h-px mb-5"
                  style={{ background: section.accentHex }}
                />
                <h2
                  style={{ color: BRAND.textPrimary, fontFamily: FONT.display, fontSize: "17px", fontWeight: 400, marginBottom: "10px", lineHeight: 1.3 }}
                >
                  {section.label}
                </h2>
                <p
                  style={{ color: section.accentHex, fontFamily: FONT.display, fontStyle: "italic", fontSize: "12px", lineHeight: 1.6 }}
                >
                  {section.tagline}
                </p>
              </div>

              {/* Right: value props */}
              <div className="col-span-2 flex flex-col gap-5">
                {section.valueProps.map((vp) => (
                  <div key={vp.headline}>
                    <p
                      style={{ color: BRAND.textPrimary, fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}
                    >
                      {vp.headline}
                    </p>
                    <p style={{ color: BRAND.textSecondary, fontSize: "12px", lineHeight: 1.7 }}>
                      {vp.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center flex flex-col items-center gap-6">
          <p style={{ color: BRAND.textSecondary, fontSize: "13px" }}>
            Ready to discuss your logistics requirement?
          </p>
          <Link
            href="/contact"
            style={{
              color: BRAND.teal,
              border: `1px solid ${BRAND.teal}55`,
              fontSize: "11px",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              padding: "14px 40px",
              display: "inline-block",
            }}
          >
            Request a Quote
          </Link>
          <Link
            href="/experience"
            style={{ color: BRAND.textDim, fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            Or explore the spatial experience →
          </Link>
        </div>
      </main>
    </div>
  );
}
