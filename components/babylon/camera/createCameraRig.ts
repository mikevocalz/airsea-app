import type { Scene } from "@babylonjs/core/scene";
import type { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";

/**
 * ─── Camera Rig — Cinematic, XR-safe ─────────────────────────────────────────
 *
 * Camera sits stationary at eye height (Y=1.6, origin).
 * Only the gaze TARGET ever animates — never the position.
 *
 * Position-animation in XR causes vection mismatch and nausea. Moving only
 * the gaze direction is equivalent to turning your head — zero vestibular cost.
 *
 * Initial gaze: toward the HolographicSlate at (-1.4, 1.65, -5.0).
 * Pointing slightly left-of-center mirrors how you would naturally look at a
 * wall-mounted briefing panel in a physical room.
 *
 * Easing: QuarticEase. Quartic produces a more deliberate, weighted motion than
 * Cubic — the camera feels like it has momentum and settles with authority.
 * Duration 950ms — longer than typical web transitions, shorter than film cuts.
 * Premium immersive work moves slower than you expect.
 *
 * FOV 0.92 rad (~53°) — tighter than default 1.0. Creates a subtle telephoto
 * compression that makes the space feel composed and intentional.
 */

export interface CameraRig {
  camera: UniversalCamera;
  animateTo(target: Vector3, durationMs?: number): void;
  dispose(): void;
}

// Slate is at (-1.4, 1.65, -5.0) — initial gaze points there
export const SLATE_GAZE_TARGET = [-1.4, 1.65, -5.0] as const;

export async function createCameraRig(scene: Scene): Promise<CameraRig> {
  const { UniversalCamera } = await import("@babylonjs/core/Cameras/universalCamera");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const { Animation } = await import("@babylonjs/core/Animations/animation");
  const { QuarticEase, EasingFunction } = await import("@babylonjs/core/Animations/easing");

  const camera = new UniversalCamera("mainCamera", new Vector3(0, 1.6, 0), scene);
  camera.setTarget(new Vector3(...SLATE_GAZE_TARGET));

  camera.angularSensibility = 4000; // deliberate look-around, not twitchy
  camera.speed = 0;
  camera.minZ = 0.1;
  camera.maxZ = 200;
  camera.fov = 0.92; // ~53° — slight telephoto compression, feels premium

  const animateTo = (targetLookAt: Vector3, durationMs = 950): void => {
    const fps = 60;
    const frames = Math.round((durationMs / 1000) * fps);

    const ease = new QuarticEase();
    ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    const anim = new Animation(
      "camTarget",
      "target",
      fps,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    anim.setKeys([
      { frame: 0, value: camera.target.clone() },
      { frame: frames, value: targetLookAt },
    ]);
    anim.setEasingFunction(ease);

    scene.stopAnimation(camera);
    scene.beginDirectAnimation(camera, [anim], 0, frames, false);
  };

  return {
    camera,
    animateTo,
    dispose() {
      scene.stopAnimation(camera);
      camera.dispose();
    },
  };
}
