import type { Scene } from "@babylonjs/core/scene";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { BRAND, hexToFloat3 } from "@/lib/brand/tokens";

/**
 * ─── Environment — AirSea Brand Atmosphere ───────────────────────────────────
 *
 * The environment establishes the brand register before a single word is read.
 * It must say: precision, restraint, white-glove professionalism.
 *
 * Three elements:
 *
 * 1. Floor
 *    Dark architectural plane — almost-black with a blue-charcoal tint that
 *    matches the brand background. Grid lines derived from the brand border
 *    color (#252B32) at 40% opacity. The grid is structural, not decorative —
 *    it gives the space depth and scale without creating visual noise.
 *
 *    GridMaterial chosen because it communicates "precision operations facility"
 *    which is exactly what AirSea is. Avoid stone/marble/wood — those read
 *    domestic. This should feel operational and premium simultaneously.
 *
 * 2. Scene fog
 *    Exponential fog starting at medium range softens the 360 sphere horizon.
 *    The fog color is the brand background (#0B0D10) — it makes distant
 *    geometry fade into the environment naturally. No "wall" visible.
 *
 * 3. Origin marker ring
 *    A very thin floor-level torus gives the user a spatial anchor point.
 *    Color: brand teal at very low opacity — present but not assertive.
 *    This is the only use of teal in the environment itself. Everything else
 *    is neutral, keeping the brand accent reserved for UI and content.
 *
 * Scene clear color: BRAND.bg (#0B0D10) — the brand's darkest background tone.
 *
 * Anti-pattern avoided:
 *    No reflective chrome floor. No glowing grid lines. No neon rings.
 *    No ambient teal particle wash. These would make the experience look
 *    like a generic sci-fi demo or a gaming environment — both fatal to
 *    the AirSea brand register.
 */

export interface EnvironmentLayer {
  floor: Mesh;
  dispose(): void;
}

export async function createEnvironment(scene: Scene): Promise<EnvironmentLayer> {
  const { MeshBuilder } = await import("@babylonjs/core/Meshes/meshBuilder");
  const { GridMaterial } = await import("@babylonjs/materials/grid/gridMaterial");
  const { Color3, Color4 } = await import("@babylonjs/core/Maths/math.color");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const { StandardMaterial } = await import("@babylonjs/core/Materials/standardMaterial");
  const { Scene: BabScene } = await import("@babylonjs/core/scene");

  // ── Scene clear = brand background ──────────────────────────────────────
  const [br, bg, bb] = hexToFloat3(BRAND.bg);
  scene.clearColor = new Color4(br, bg, bb, 1);

  // ── Fog — brand bg color, exponential ────────────────────────────────────
  scene.fogMode = BabScene.FOGMODE_EXP2;
  scene.fogColor = new Color3(br, bg, bb);
  scene.fogDensity = 0.010;

  // ── Floor ────────────────────────────────────────────────────────────────
  const floor = MeshBuilder.CreateGround(
    "envFloor",
    { width: 40, height: 40, subdivisions: 2 },
    scene
  );
  floor.position.y = -0.02;

  const [mr, mg, mb] = hexToFloat3(BRAND.bgElevated);
  const [lr, lgc, lbc] = hexToFloat3(BRAND.border);

  const gridMat = new GridMaterial("floorGrid", scene);
  gridMat.majorUnitFrequency = 5;
  gridMat.minorUnitVisibility = 0.18;
  gridMat.gridRatio = 1;
  gridMat.backFaceCulling = false;
  gridMat.mainColor = new Color3(mr, mg, mb);
  gridMat.lineColor = new Color3(lr, lgc, lbc);
  gridMat.opacity = 0.55;
  floor.material = gridMat;

  // ── Origin marker ring — brand teal, very restrained ─────────────────────
  const ring = MeshBuilder.CreateTorus(
    "originRing",
    { diameter: 2.4, thickness: 0.018, tessellation: 64 },
    scene
  );
  ring.position.y = 0.005;

  const [tr, tg, tb] = hexToFloat3(BRAND.teal);
  const ringMat = new StandardMaterial("originRingMat", scene);
  ringMat.emissiveColor = new Color3(tr, tg, tb);
  ringMat.disableLighting = true;
  ringMat.alpha = 0.22; // present but barely — restrained brand usage

  ring.material = ringMat;
  ring.isPickable = false;

  return {
    floor,
    dispose() {
      gridMat.dispose();
      ringMat.dispose();
      floor.dispose();
      ring.dispose();
    },
  };
}
