import type { Scene } from "@babylonjs/core/scene";
import type { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";

/**
 * ─── Camera Rig — XR-safe gaze-only interaction ───────────────────────────────
 *
 * Camera is STATIONARY at eye height (Y=1.6, origin).
 * It never translates — only its TARGET (gaze direction) animates.
 *
 * Why no position animation:
 *   Moving the camera during interaction is a primary cause of XR discomfort
 *   (vection mismatch). Vestibular signals tell the user they're still; optical
 *   flow says they're moving. Even small position drifts cause nausea.
 *   Section changes animate ONLY the gaze target — equivalent to moving your
 *   eyes, not your body.
 *
 * Spatial axes (camera at origin, looking −Z):
 *   Z=−2.6  "reach"    → transport controls
 *   Z=−3.5  "interact" → navigation bar
 *   Z=−4.2  "read"     → HolographicSlate (primary gaze target)
 *   Z=−6.5  "ambient"  → logo plaque
 *
 * FreeCamera (via UniversalCamera) is required for WebXR rig compatibility.
 * ArcRotateCamera cannot be the scene camera in immersive XR mode.
 */

export interface CameraRig {
  camera: UniversalCamera;
  /** Animate gaze to a world-space target. Camera position never moves. */
  animateTo(target: Vector3, durationMs?: number): void;
  dispose(): void;
}

// Default gaze target — centered on the primary slate
export const CAMERA_INITIAL_TARGET = [0, 1.7, -4.2] as const;

export async function createCameraRig(scene: Scene): Promise<CameraRig> {
  const { UniversalCamera } = await import("@babylonjs/core/Cameras/universalCamera");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const { Animation } = await import("@babylonjs/core/Animations/animation");
  const { CubicEase, EasingFunction } = await import("@babylonjs/core/Animations/easing");

  const camera = new UniversalCamera("mainCamera", new Vector3(0, 1.6, 0), scene);
  camera.setTarget(new Vector3(0, 1.7, -4.2));

  // Sensitivity tuned for comfortable 360 browsing — not too responsive
  camera.angularSensibility = 3500;
  camera.speed = 0;       // no locomotion in a kiosk experience
  camera.minZ = 0.1;
  camera.maxZ = 200;
  camera.fov = 1.0;       // ~57° — slightly narrower for a more intimate, premium feel

  const animateTo = (targetLookAt: Vector3, durationMs = 700): void => {
    const fps = 60;
    const frames = Math.round((durationMs / 1000) * fps);

    const ease = new CubicEase();
    ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    const targetAnim = new Animation(
      "camTarget",
      "target",
      fps,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    targetAnim.setKeys([
      { frame: 0, value: camera.target.clone() },
      { frame: frames, value: targetLookAt },
    ]);
    targetAnim.setEasingFunction(ease);

    scene.stopAnimation(camera);
    scene.beginDirectAnimation(camera, [targetAnim], 0, frames, false);
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
