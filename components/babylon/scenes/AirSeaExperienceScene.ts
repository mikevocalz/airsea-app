import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";
import type { SectionId } from "@/types/experience";
import type { CameraRig } from "@/components/babylon/camera/createCameraRig";
import type { LightingRig } from "@/components/babylon/lighting/createLightingRig";
import type { EnvironmentLayer } from "@/components/babylon/environment/createEnvironment";
import type { LogoBrandPlaque } from "@/components/babylon/environment/createLogoBrandPlaque";
import type { MuxVideoSphere } from "@/components/babylon/video/createMuxVideoSphere";
import type { PrimarySlate } from "@/components/babylon/gui/createPrimaryHolographicSlate";
import type { ServiceCluster } from "@/components/babylon/gui/createServiceCluster3D";
import type { TransportControls } from "@/components/babylon/gui/createTransportControls3D";

import { AIRSEA_SECTIONS } from "@/content/airsea";
import { DEFAULT_VIDEO_ID } from "@/content/airsea";
import { useAirSeaExperienceStore } from "@/store/useAirSeaExperienceStore";

/**
 * ─── Scene Orchestrator ───────────────────────────────────────────────────────
 *
 * AirSeaExperienceScene owns the full lifecycle of the Babylon scene.
 * All sub-systems are stationary GUI elements positioned on the gaze axis.
 * Section changes animate ONLY the camera gaze target — no locomotion,
 * no position drift — XR-safe by design.
 *
 * Spatial layout (camera at origin, looking −Z):
 *   Z=−2.6  transport controls (right peripheral, Y=0.88)
 *   Z=−3.5  navigation bar     (centered, Y=0.88)
 *   Z=−4.2  HolographicSlate   (centered, Y=1.7)  ← primary gaze axis
 *   Z=−6.5  logo plaque        (centered, Y=2.75)
 *   Z=−50   360 video sphere
 */

export interface AirSeaScene {
  scene: Scene;
  dispose(): void;
}

export async function createAirSeaExperienceScene(
  engine: Engine,
  canvas: HTMLCanvasElement
): Promise<AirSeaScene> {
  // ── Bootstrap ────────────────────────────────────────────────────────────
  const { createScene } = await import("@/lib/babylon/engineFactory");
  const scene = await createScene(engine);

  const { GUI3DManager } = await import("@babylonjs/gui/3D/gui3DManager");
  const gui3d = new GUI3DManager(scene);

  // ── Sub-systems ──────────────────────────────────────────────────────────
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
  const primarySlate = await createPrimaryHolographicSlate(
    scene,
    gui3d,
    AIRSEA_SECTIONS[0]
  );

  const { createServiceCluster3D } = await import(
    "@/components/babylon/gui/createServiceCluster3D"
  );
  const serviceCluster = await createServiceCluster3D(
    scene,
    gui3d,
    AIRSEA_SECTIONS,
    (sectionId: SectionId) => {
      useAirSeaExperienceStore.getState().setActiveSection(sectionId);
    }
  );

  const { createTransportControls3D } = await import(
    "@/components/babylon/gui/createTransportControls3D"
  );
  const transportControls = await createTransportControls3D(scene, gui3d, {
    initialPlaying: true,
    initialMuted: true,
    onPlayPause() {
      const store = useAirSeaExperienceStore.getState();
      store.setIsPlaying(!store.isPlaying);
    },
    onMuteToggle() {
      useAirSeaExperienceStore.getState().toggleMute();
    },
  });

  // ── Store subscriptions ──────────────────────────────────────────────────
  const store = useAirSeaExperienceStore;
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");

  // Section change: update content + animate gaze (target only — XR safe)
  const unsubSection = store.subscribe(
    (s) => s.activeSection,
    (sectionId) => {
      const section = AIRSEA_SECTIONS.find((s) => s.id === sectionId)!;
      primarySlate.updateSection(section);
      serviceCluster.setActiveSection(sectionId);
      cameraRig.animateTo(new Vector3(0, 1.7, -4.2), 500);
    }
  );

  const unsubPlaying = store.subscribe(
    (s) => s.isPlaying,
    (playing) => {
      if (playing) videoSphere.play();
      else videoSphere.pause();
      transportControls.setPlaying(playing);
    }
  );

  const unsubMuted = store.subscribe(
    (s) => s.isMuted,
    (muted) => {
      videoSphere.setMuted(muted);
      transportControls.setMuted(muted);
    }
  );

  // ── WebXR forward capability ─────────────────────────────────────────────
  if (navigator.xr) {
    navigator.xr
      .isSessionSupported("immersive-vr")
      .then((supported) => {
        useAirSeaExperienceStore.getState().setXrSupported(supported);
      })
      .catch(() => {});
  }

  useAirSeaExperienceStore.getState().setSceneReady(true);

  // ── Disposal ─────────────────────────────────────────────────────────────
  return {
    scene,
    dispose() {
      unsubSection();
      unsubPlaying();
      unsubMuted();

      transportControls.dispose();
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
