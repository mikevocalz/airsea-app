"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { LOGO, BRAND, FONT } from "@/lib/brand/tokens";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    message: "",
  });

  const services = [
    "White-Glove Delivery",
    "Storage & Receiving",
    "Designers & Architects",
    "Private Households",
    "Fine Art & Luxury",
    "Luxury Retail / 3PL",
    "Imports & Exports",
    "Installation",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: POST to /api/quote or a form provider
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    background: BRAND.panelRaised,
    border: `1px solid ${BRAND.border}`,
    color: BRAND.textPrimary,
    fontFamily: FONT.body,
    fontSize: "13px",
    padding: "12px 16px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    color: BRAND.textSecondary,
    fontFamily: FONT.body,
    fontSize: "10px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "6px",
  };

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
            href="/solutions"
            style={{ color: BRAND.textDim, fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            Services
          </Link>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-8 py-20">
        {/* Page heading */}
        <div className="mb-16">
          <p
            style={{ color: BRAND.teal, fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "14px" }}
          >
            White-Glove Consultation
          </p>
          <h1
            style={{ color: BRAND.textPrimary, fontFamily: FONT.display, fontSize: "32px", fontWeight: 400, lineHeight: 1.25, marginBottom: "16px" }}
          >
            Request a Quote
          </h1>
          <p style={{ color: BRAND.textSecondary, fontSize: "14px", lineHeight: 1.7 }}>
            Every project begins with a direct conversation. Tell us about your
            logistics need and a member of our team will respond within one
            business day.
          </p>
        </div>

        {submitted ? (
          <div
            className="py-20 text-center"
            style={{ border: `1px solid ${BRAND.border}` }}
          >
            <p
              style={{ color: BRAND.teal, fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "12px" }}
            >
              Message Received
            </p>
            <p style={{ color: BRAND.textSecondary, fontSize: "13px" }}>
              A member of the AirSea team will be in touch shortly.
            </p>
            <Link
              href="/"
              style={{ color: BRAND.textDim, fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", display: "inline-block", marginTop: "28px" }}
            >
              ← Return Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            {/* Name + Company row */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  required
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.teal)}
                  onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
                />
              </div>
              <div>
                <label style={labelStyle}>Company</label>
                <input
                  style={inputStyle}
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  onFocus={(e) => (e.target.style.borderColor = BRAND.teal)}
                  onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input
                required
                type="email"
                style={inputStyle}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = BRAND.teal)}
                onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
              />
            </div>

            {/* Service */}
            <div>
              <label style={labelStyle}>Service Required *</label>
              <select
                required
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = BRAND.teal)}
                onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
              >
                <option value="" style={{ background: BRAND.panel }}>Select a service</option>
                {services.map((s) => (
                  <option key={s} value={s} style={{ background: BRAND.panel }}>{s}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label style={labelStyle}>Project Details *</label>
              <textarea
                required
                rows={5}
                style={{ ...inputStyle, resize: "vertical" }}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = BRAND.teal)}
                onBlur={(e) => (e.target.style.borderColor = BRAND.border)}
                placeholder="Describe your logistics requirement, timeline, and any special handling considerations."
              />
            </div>

            {/* Submit */}
            <div
              className="pt-2 flex items-center justify-between"
              style={{ borderTop: `1px solid ${BRAND.border}` }}
            >
              <p style={{ color: BRAND.textDim, fontSize: "10px", letterSpacing: "0.14em" }}>
                All inquiries are handled with complete discretion.
              </p>
              <button
                type="submit"
                style={{
                  background: BRAND.teal,
                  color: BRAND.textPrimary,
                  fontFamily: FONT.body,
                  fontSize: "11px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  padding: "14px 32px",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = BRAND.tealLight)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = BRAND.teal)}
              >
                Submit Inquiry
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
