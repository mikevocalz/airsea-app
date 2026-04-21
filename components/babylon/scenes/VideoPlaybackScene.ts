import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";

import { useVideoStore } from "@/store/useVideoStore";

export interface VideoPlaybackSceneHandle {
  scene: Scene;
  dispose(): void;
}

export async function createVideoPlaybackScene(
  engine: Engine,
  playbackId: string
): Promise<VideoPlaybackSceneHandle> {
  const { createScene } = await import("@/lib/babylon/engineFactory");
  const scene = await createScene(engine);

  const { Color4 } = await import("@babylonjs/core/Maths/math.color");
  const { Vector3 } = await import("@babylonjs/core/Maths/math.vector");
  const { UniversalCamera } = await import("@babylonjs/core/Cameras/universalCamera");

  scene.clearColor = new Color4(0, 0, 0, 1);

  const camera = new UniversalCamera("playbackCam", new Vector3(0, 0, 0), scene);
  camera.setTarget(new Vector3(0, 0, -1));
  // attachControl() is the critical fix — without it desktop drag-to-look doesn't work
  camera.attachControl();
  camera.angularSensibility = 2500;
  camera.speed = 0;
  camera.minZ = 0.1;
  camera.maxZ = 200;
  camera.fov = 1.1;
  scene.activeCamera = camera;

  const { createMuxVideoSphere } = await import(
    "@/components/babylon/video/createMuxVideoSphere"
  );
  const videoSphere = await createMuxVideoSphere(scene, playbackId);

  videoSphere.setMuted(useVideoStore.getState().isMuted);
  videoSphere.play();
  useVideoStore.getState().setIsPlaying(true);

  const store = useVideoStore;

  const unsubPlay = store.subscribe(
    (s) => s.isPlaying,
    (playing) => {
      if (playing) videoSphere.play();
      else videoSphere.pause();
    }
  );

  const unsubMute = store.subscribe(
    (s) => s.isMuted,
    (muted) => { videoSphere.setMuted(muted); }
  );

  // ── WebXR Setup ────────────────────────────────────────────────────────────
  // Create the XR experience after the video sphere so the video renders in VR.
  // disableDefaultUI suppresses Babylon's canvas-overlay button; our React HUD
  // owns the "Enter XR" affordance.
  let xrDispose: (() => void) | null = null;
  try {
    const { WebXRDefaultExperience } = await import(
      "@babylonjs/core/XR/webXRDefaultExperience"
    );
    const xrExp = await WebXRDefaultExperience.CreateAsync(scene, {
      disableDefaultUI: true,
      uiOptions: { sessionMode: "immersive-vr" },
      optionalFeatures: true,
    });

    if (xrExp.baseExperience) {
      const supported = await xrExp.baseExperience.sessionManager.isSessionSupportedAsync("immersive-vr");
      useVideoStore.getState().setXrSupported(supported);

      if (supported) {
        useVideoStore.getState().setXrEnter(async () => {
          await xrExp.baseExperience.enterXRAsync("immersive-vr", "local-floor");
        });
        xrDispose = () => xrExp.dispose();
      }
    }
  } catch {
    // WebXR unavailable (desktop, unsupported browser) — silently skip
  }

  useVideoStore.getState().setSceneReady(true);

  return {
    scene,
    dispose() {
      unsubPlay();
      unsubMute();
      xrDispose?.();
      camera.detachControl();
      videoSphere.dispose();
      scene.dispose();
      useVideoStore.getState().setXrEnter(null);
      useVideoStore.getState().setXrSupported(false);
      useVideoStore.getState().setSceneReady(false);
      useVideoStore.getState().setIsPlaying(false);
    },
  };
}
