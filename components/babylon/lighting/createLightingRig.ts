import type { Scene } from "@babylonjs/core/scene";
import { BRAND, hexToFloat3 } from "@/lib/brand/tokens";

/**
 * ─── Lighting Rig — AirSea Brand Atmosphere ──────────────────────────────────
 *
 * The lighting should evoke the brand's core register: restrained, premium,
 * architectural — not sci-fi, not gaming, not over-lit corporate.
 *
 * Think: the lighting inside a premium art storage facility or a high-end
 * logistics showroom. Controlled. Professional. Not dramatic for drama's sake.
 *
 * Four-layer strategy:
 *
 * 1. Ambient (HemisphericLight)
 *    Very low intensity, cool-neutral sky / dark ground.
 *    Exists only to prevent absolute black fill. Not perceivable as a source.
 *    Intensity 0.15 — completely sub-threshold for attention.
 *
 * 2. Key (DirectionalLight)
 *    Neutral-warm from upper-right. Intentionally soft.
 *    Gives shallow depth to the environment without creating drama.
 *    Intensity 0.35. No shadows — this is a spatial UI environment,
 *    not an architectural visualization. Shadow cost is not justified.
 *
 * 3. Slate accent (PointLight — right side)
 *    Positioned near the HolographicSlate to ensure the reading surface
 *    has adequate illumination independent of the video background.
 *    Very warm-neutral, short range (5 units), intensity 0.55.
 *    This is a "practical light" — it exists for legibility, not aesthetics.
 *
 * 4. Cluster accent (PointLight — left side)
 *    Mirror of the slate accent for the navigation cluster.
 *    Slightly cooler to give the nav zone a technical quality vs.
 *    the warmer editorial feel of the content slate.
 *    Intensity 0.45, range 4.5.
 *
 * Color note: No teal-wash lighting. The brand teal is a UI accent color,
 * not a light source color. Washing the scene in teal would read as
 * "generic sci-fi" which violates the brand register entirely.
 */

export interface LightingRig {
  dispose(): void;
}

export async function createLightingRig(scene: Scene): Promise<LightingRig> {
  const { HemisphericLight } = await import("@babylonjs/core/Lights/hemisphericLight");
  const { DirectionalLight } = await import("@babylonjs/core/Lights/directionalLight");
  const { PointLight } = await import("@babylonjs/core/Lights/pointLight");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const { Color3 } = await import("@babylonjs/core/Maths/math.color");

  // ── 1. Ambient ───────────────────────────────────────────────────────────
  const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);
  ambient.intensity = 0.15;
  ambient.diffuse = new Color3(0.82, 0.85, 0.90);   // cool-neutral sky
  ambient.groundColor = new Color3(0.08, 0.09, 0.10); // near-black ground

  // ── 2. Key ───────────────────────────────────────────────────────────────
  const key = new DirectionalLight("key", new Vector3(-0.4, -1, -0.7), scene);
  key.intensity = 0.35;
  key.diffuse = new Color3(0.96, 0.95, 0.92); // neutral warm white

  // ── 3. Slate accent — warm-neutral, right side ────────────────────────────
  const slateAccent = new PointLight(
    "slateAccent",
    new Vector3(2.8, 2.8, -4.0),
    scene
  );
  slateAccent.intensity = 0.55;
  slateAccent.range = 5.0;
  slateAccent.diffuse = new Color3(0.93, 0.91, 0.88); // warm neutral

  // ── 4. Cluster accent — cool-neutral, left side ───────────────────────────
  const clusterAccent = new PointLight(
    "clusterAccent",
    new Vector3(-2.8, 2.4, -4.0),
    scene
  );
  clusterAccent.intensity = 0.45;
  clusterAccent.range = 4.5;
  clusterAccent.diffuse = new Color3(0.88, 0.90, 0.93); // slightly cooler

  return {
    dispose() {
      ambient.dispose();
      key.dispose();
      slateAccent.dispose();
      clusterAccent.dispose();
    },
  };
}
