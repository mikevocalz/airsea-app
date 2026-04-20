import type { AirSeaSection, MuxVideoSource } from "@/types/experience";
import { BRAND } from "@/lib/brand/tokens";

// Accent colours are all drawn from the real AirSea palette — no invented colours.
// Teal variants provide differentiation across sections while staying on-brand.

// ─── Mux Sources ──────────────────────────────────────────────────────────────

export const MUX_SOURCES: MuxVideoSource[] = [
  {
    playbackId: "Yrv02Q00VmKyoYgJ7VntPArMYEHFGCS0002IuksSkFEAjvU",
    label: "AirSea Operations — 360°",
    is360: true,
  },
];

export const DEFAULT_VIDEO_ID = MUX_SOURCES[0].playbackId;

// Curated primary navigation — 6 services surfaced in the spatial experience.
// The full catalog is accessible via /solutions. Editorial restraint:
// fewer, more confident choices over an exhaustive menu.
export const PRIMARY_NAV_IDS = [
  "white-glove",
  "fine-art",
  "storage",
  "households",
  "imports-exports",
  "quote",
] as const;

// ─── Service Sections ─────────────────────────────────────────────────────────

export const AIRSEA_SECTIONS: AirSeaSection[] = [
  {
    id: "white-glove",
    label: "White-Glove Delivery",
    tagline: "From our hands to yours — nothing touched without intention.",
    accentHex: BRAND.teal,
    videoId: MUX_SOURCES[0].playbackId,
    ctaLabel: "Request Delivery",
    valueProps: [
      {
        headline: "Single-Item Handling",
        body: "Dedicated crews for every piece. No consolidated loads, no shortcut packaging.",
      },
      {
        headline: "Scheduled White-Glove",
        body: "Delivery windows confirmed in advance. We arrive, unwrap, place, and remove all debris.",
      },
      {
        headline: "Specialized Equipment",
        body: "Floor protection, stair-climbing dollies, and custom rigging for oversized or fragile goods.",
      },
    ],
  },
  {
    id: "storage",
    label: "Storage & Receiving",
    tagline: "Climate-controlled. Catalogued. Ready when you are.",
    accentHex: BRAND.tealLight,
    ctaLabel: "Set Up Storage",
    valueProps: [
      {
        headline: "Secure Warehouse Facilities",
        body: "24/7 monitored storage across NYC and LA. Individually vaulted spaces for high-value items.",
      },
      {
        headline: "Item-Level Inventory",
        body: "Every piece is photographed, logged, and assigned a digital record on arrival.",
      },
      {
        headline: "Flexible Access",
        body: "Schedule retrieval or on-site access at your convenience. No bureaucratic delays.",
      },
    ],
  },
  {
    id: "designers",
    label: "Designers & Architects",
    tagline: "Your receiving department — without the overhead.",
    accentHex: BRAND.sage,
    ctaLabel: "Open a Trade Account",
    valueProps: [
      {
        headline: "Design Trade Intake",
        body: "Receive vendor shipments directly to our facility. We inspect, photograph, and catalog every item.",
      },
      {
        headline: "Condition Documentation",
        body: "Detailed receiving reports with photographic evidence sent to you on the same day.",
      },
      {
        headline: "Direct-to-Site Delivery",
        body: "Staged and delivered on your install schedule, not ours. Room-by-room placement available.",
      },
    ],
  },
  {
    id: "households",
    label: "Private Households",
    tagline: "Your home handled with the care of a world-class museum.",
    accentHex: BRAND.sageDim,
    ctaLabel: "Plan Your Move",
    valueProps: [
      {
        headline: "Full-Residence Moves",
        body: "Primary homes, vacation residences, and estates. Domestic and international relocation.",
      },
      {
        headline: "Packing & Crating",
        body: "Custom wooden crates and archival materials for heirlooms, art, and fragile furniture.",
      },
      {
        headline: "Valuables Handling",
        body: "Jewelry, wine collections, fine china — specialty packing protocols for every category.",
      },
    ],
  },
  {
    id: "fine-art",
    label: "Fine Art & Luxury",
    tagline: "Museum-grade handling for every piece — every time.",
    accentHex: BRAND.teal,
    ctaLabel: "Discuss Your Collection",
    valueProps: [
      {
        headline: "Custom Crating",
        body: "Engineered wooden and foam crates matched to each work's specific dimensions and fragility profile.",
      },
      {
        headline: "Climate-Sensitive Transport",
        body: "Temperature and humidity-controlled vehicles for paintings, sculptures, and installations.",
      },
      {
        headline: "Insurance Documentation",
        body: "Professional condition reporting and photographic records accepted by major fine art insurers.",
      },
    ],
  },
  {
    id: "retail-3pl",
    label: "Luxury Retail & 3PL",
    tagline: "Your brand's fulfillment partner — built for precision.",
    accentHex: BRAND.tealDim,
    ctaLabel: "Explore 3PL Options",
    valueProps: [
      {
        headline: "White-Label Receiving",
        body: "We receive and process your inbound freight invisibly, under your brand standards.",
      },
      {
        headline: "VIP Packaging",
        body: "Bespoke outbound packaging that matches the unboxing experience your customers expect.",
      },
      {
        headline: "Retail Distribution",
        body: "Last-mile delivery to flagship stores, pop-ups, and showrooms across major markets.",
      },
    ],
  },
  {
    id: "imports-exports",
    label: "Imports & Exports",
    tagline: "Border to door — without a single point of confusion.",
    accentHex: BRAND.tealLight,
    ctaLabel: "Get Freight Guidance",
    valueProps: [
      {
        headline: "Customs Brokerage",
        body: "In-house expertise for art, antiques, personal effects, and commercial goods.",
      },
      {
        headline: "Freight Forwarding",
        body: "Sea, air, and ground options with full chain-of-custody documentation.",
      },
      {
        headline: "International Crating",
        body: "ISPM-15 compliant wooden crates and ATA carnet coordination for temporary exports.",
      },
    ],
  },
  {
    id: "installation",
    label: "Installation",
    tagline: "We don't just deliver. We place.",
    accentHex: BRAND.sage,
    ctaLabel: "Schedule Installation",
    valueProps: [
      {
        headline: "Art Installation",
        body: "Rigging, mounting, hanging, and anchoring for works of all scales — wall, floor, and ceiling.",
      },
      {
        headline: "Furniture Placement",
        body: "Coordinated staging and placement aligned with your designer's floor plan.",
      },
      {
        headline: "Technical Assembly",
        body: "Furniture assembly, AV equipment placement, and system integration in collaboration with your trades.",
      },
    ],
  },
  {
    id: "locations",
    label: "Locations & Reach",
    tagline: "Two flagship facilities. Coast-to-coast capability.",
    accentHex: BRAND.teal,
    ctaLabel: "Find Your Facility",
    valueProps: [
      {
        headline: "New York",
        body: "Primary operations hub serving Manhattan, the Hamptons, Connecticut, and the greater Tri-State area.",
      },
      {
        headline: "Los Angeles",
        body: "West Coast facility serving Beverly Hills, Bel Air, Malibu, and the broader Southern California market.",
      },
      {
        headline: "National Network",
        body: "Long-distance freight, trusted carrier partners, and vetted agents in all major metropolitan markets.",
      },
    ],
  },
  {
    id: "quote",
    label: "Request a Quote",
    tagline: "Tell us what you need. We will make it happen.",
    accentHex: BRAND.teal,
    ctaLabel: "Start Your Request",
    valueProps: [
      {
        headline: "White-Glove Consultation",
        body: "Every project begins with a direct conversation — no forms, no call centers.",
      },
      {
        headline: "Custom Logistics Plans",
        body: "We design solutions around your timeline, property constraints, and service requirements.",
      },
      {
        headline: "Transparent Pricing",
        body: "Clear, itemized quotes with no hidden surcharges or day-of-delivery surprises.",
      },
    ],
  },
];
