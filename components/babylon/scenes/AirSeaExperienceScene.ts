import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";
import type { SectionId } from "@/types/experience";

import { AIRSEA_SECTIONS, DEFAULT_VIDEO_ID, PRIMARY_NAV_IDS } from "@/content/airsea";
import { useAirSeaExperienceStore } from "@/store/useAirSeaExperienceStore";

/**
 * ─── Scene Orchestrator ───────────────────────────────────────────────────────
 *
 * Spatial layout:
 *   (-1.4, 1.65, -5.0)  HolographicSlate  — LEFT dominant
 *   (+2.8, 1.5,  -5.4)  Navigation strip  — RIGHT subordinate
 *   (0,    2.5,  -9.0)  Logo plaque       — background anchor
 *   Z=±50               360 video sphere
 *
 * Transport controls (play/pause, mute) are DOM elements in the React HUD.
 * They do not belong in 3D space — utility UI shouldn't consume XR real estate.
 *
 * Section changes animate ONLY the camera gaze target — XR-safe by design.
 * The slate and nav strip are stationary; the user's gaze moves to them.
 */

export interface AirSeaScene {
  scene: Scene;
  dispose(): void;
}

// Only primary nav sections pass through to the 3D cluster
const primarySections = AIRSEA_SECTIONS.filter((s) =>
  (PRIMARY_NAV_IDS as readonly string[]).includes(s.id)
);

export async function createAirSeaExperienceScene(
  engine: Engine,
  canvas: HTMLCanvasElement
): Promise<AirSeaScene> {
  const { createScene } = await import("@/lib/babylon/engineFactory");
  const scene = await createScene(engine);

  const { GUI3DManager } = await import("@babylonjs/gui/3D/gui3DManager");
  const gui3d = new GUI3DManager(scene);

  const { createCameraRig } = await import("@/components/babylon/camera/createCameraRig");
  const cameraRig = await createCameraRig(scene);

  const { createLightingRig } = await import("@/components/babylon/lighting/createLightingRig");
  const lightingRig = await createLightingRig(scene);

  const { createEnvironment } = await import("@/components/babylon/environment/createEnvironment");
  const environment = await createEnvironment(scene);

  const { createLogoBrandPlaque } = await import(
    "@/components/babylon/environment/createLogoBrandPlaque"
  );
  const logoBrandPlaque = await createLogoBrandPlaque(scene);

  const { createMuxVideoSphere } = await import("@/components/babylon/video/createMuxVideoSphere");
  const videoSphere = await createMuxVideoSphere(scene, DEFAULT_VIDEO_ID);
  videoSphere.play();

  const { createPrimaryHolographicSlate } = await import(
    "@/components/babylon/gui/createPrimaryHolographicSlate"
  );
  const primarySlate = await createPrimaryHolographicSlate(scene, gui3d, primarySections[0]);

  const { createServiceCluster3D } = await import(
    "@/components/babylon/gui/createServiceCluster3D"
  );
  const serviceCluster = await createServiceCluster3D(
    scene,
    gui3d,
    primarySections,
    (sectionId: SectionId) => {
      useAirSeaExperienceStore.getState().setActiveSection(sectionId);
    }
  );

  // ── Store subscriptions ──────────────────────────────────────────────────
  const store = useAirSeaExperienceStore;
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");

  // Section change: update slate + nav, gaze returns to slate
  const unsubSection = store.subscribe(
    (s) => s.activeSection,
    (sectionId) => {
      const section = AIRSEA_SECTIONS.find((s) => s.id === sectionId)!;
      primarySlate.updateSection(section);
      serviceCluster.setActiveSection(sectionId);
      // Gaze returns to the slate after nav selection
      cameraRig.animateTo(new Vector3(-1.4, 1.65, -5.0), 950);
    }
  );

  const unsubPlaying = store.subscribe(
    (s) => s.isPlaying,
    (playing) => {
      if (playing) videoSphere.play();
      else videoSphere.pause();
    }
  );

  const unsubMuted = store.subscribe(
    (s) => s.isMuted,
    (muted) => videoSphere.setMuted(muted)
  );

  if (navigator.xr) {
    navigator.xr
      .isSessionSupported("immersive-vr")
      .then((supported) => useAirSeaExperienceStore.getState().setXrSupported(supported))
      .catch(() => {});
  }

  useAirSeaExperienceStore.getState().setSceneReady(true);

  return {
    scene,
    dispose() {
      unsubSection();
      unsubPlaying();
      unsubMuted();

      serviceCluster.dispose();
      primarySlate.dispose();
      videoSphere.dispose();
      logoBrandPlaque.dispose();
      environment.dispose();
      lightingRig.dispose();
      cameraRig.dispose();
      gui3d.dispose();

      useAirSeaExperienceStore.getState().setSceneReady(false);
      useAirSeaExperienceStore.getState().setIsPlaying(false);
    },
  };
}
