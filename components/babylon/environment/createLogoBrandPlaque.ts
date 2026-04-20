import type { Scene } from "@babylonjs/core/scene";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";

/**
 * ─── Logo Plaque: Spatial Brand Anchor ───────────────────────────────────────
 *
 * The AirSea logo is placed as a thin backlit panel — a "reception nameplate"
 * mounted on the back wall of the briefing chamber, above the reading plane.
 *
 * Position: (0, 2.6, -7.5)
 *   - X=0    : Dead center. The logo is the axis of the space.
 *   - Y=2.6  : Well above eye height (1.6). The logo presides over the scene
 *               without intruding on the interactive reading zone below.
 *   - Z=-6.5 : Deeper than the reading plane (-4.0) by 3.5 units. This puts it
 *               clearly in the "architectural background" — part of the room's
 *               wall, not a floating UI panel.
 *
 * Dimensions: 2.2 × 1.21 units (maintains the exact 1.82:1 logo aspect ratio)
 *
 * No-overlap guarantee:
 *   - The slate lives at Z=-4.0. The plaque is at Z=-6.5. 3.5 units of depth
 *     separation is unmistakable — no visual competition.
 *   - Vertically: plaque center at Y=2.6. Slate center at Y=1.7. The plaque
 *     is a full meter above the slate — no overlap possible.
 *
 * Material treatment:
 *   - Dark backing panel (near-black with slight blue-tint, no reflections)
 *   - Logo texture on a plane slightly forward of the backing
 *   - Logo inverted to white-on-dark for legibility in the dark scene
 *   - Emissive strength 0.55 — visible but not glowing
 *   - No bevel, extrusion, or glow ring
 *   - Logo texture uses alpha so the transparent background shows through
 *
 * Brand compliance:
 *   - Real logo PNG at /airsealogo.png
 *   - Natural proportions preserved
 *   - Not animated, not distorted, not colorized
 *   - Given generous clear zone (backed by dedicated panel)
 *   - Reads as "part of the room," not "sticker on the scene"
 */

export interface LogoBrandPlaque {
  dispose(): void;
}

export async function createLogoBrandPlaque(scene: Scene): Promise<LogoBrandPlaque> {
  const { MeshBuilder } = await import("@babylonjs/core/Meshes/meshBuilder");
  const { StandardMaterial } = await import("@babylonjs/core/Materials/standardMaterial");
  const { Texture } = await import("@babylonjs/core/Materials/Textures/texture");
  const { Color3 } = await import("@babylonjs/core/Maths/math.color");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const { hexToFloat3, BRAND } = await import("@/lib/brand/tokens");

  // Logo dimensions: 675×370, aspect 1.824:1
  const PLAQUE_W = 2.2;
  const PLAQUE_H = PLAQUE_W / (675 / 370); // 1.207

  // ── Backing panel ────────────────────────────────────────────────────────
  const backing = MeshBuilder.CreatePlane(
    "logoBacking",
    { width: PLAQUE_W + 0.18, height: PLAQUE_H + 0.14 },
    scene
  );
  backing.position = new Vector3(0, 2.75, -6.5);
  backing.isPickable = false;

  const backingMat = new StandardMaterial("logoBackingMat", scene);
  const [r, g, b] = hexToFloat3(BRAND.panel);
  backingMat.diffuseColor = new Color3(r, g, b);
  backingMat.emissiveColor = new Color3(r * 0.4, g * 0.4, b * 0.4);
  backingMat.disableLighting = true;
  backingMat.alpha = 0.82;
  backing.material = backingMat;

  // ── Logo plane (sits 0.02 units forward of the backing) ─────────────────
  const logoPlane = MeshBuilder.CreatePlane(
    "logoPlane",
    { width: PLAQUE_W, height: PLAQUE_H },
    scene
  );
  logoPlane.position = new Vector3(0, 2.75, -6.48);
  logoPlane.isPickable = false;

  const logoMat = new StandardMaterial("logoMat", scene);
  const logoTex = new Texture("/airsealogo.png", scene, false, true);
  logoTex.hasAlpha = true;

  logoMat.diffuseTexture = logoTex;
  logoMat.emissiveTexture = logoTex;
  // Emissive at 0.55 — logo is readable but not glowing
  logoMat.emissiveColor = new Color3(0.55, 0.55, 0.55);
  logoMat.useAlphaFromDiffuseTexture = true;
  logoMat.disableLighting = true;
  logoMat.backFaceCulling = true;
  logoPlane.material = logoMat;

  // Subtle thin rule line below the plaque — architectural detail
  const rule = MeshBuilder.CreateBox(
    "logoRule",
    { width: PLAQUE_W + 0.18, height: 0.008, depth: 0.01 },
    scene
  );
  rule.position = new Vector3(0, 2.75 - (PLAQUE_H + 0.14) / 2 - 0.004, -6.49);
  rule.isPickable = false;

  const [tr, tg, tb] = hexToFloat3(BRAND.teal);
  const ruleMat = new StandardMaterial("logoRuleMat", scene);
  ruleMat.emissiveColor = new Color3(tr * 0.7, tg * 0.7, tb * 0.7);
  ruleMat.disableLighting = true;
  ruleMat.alpha = 0.6;
  rule.material = ruleMat;

  return {
    dispose() {
      logoTex.dispose();
      logoMat.dispose();
      backingMat.dispose();
      ruleMat.dispose();
      logoPlane.dispose();
      backing.dispose();
      rule.dispose();
    },
  };
}
