"use client";

import { useEffect, useRef } from "react";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";
import { useVideoStore } from "@/store/useVideoStore";

interface SceneHandle {
  scene: Scene;
  dispose(): void;
}

export default function SceneCanvas360() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef  = useRef<SceneHandle | null>(null);
  const stopRef   = useRef<(() => void) | null>(null);
  const sidRef    = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let disposed = false;
    let unsub: (() => void) | null = null;

    async function startLoop(scene: Scene) {
      stopRef.current?.();
      const { startRenderLoop } = await import("@/lib/babylon/engineFactory");
      if (!disposed && engineRef.current) {
        stopRef.current = startRenderLoop(engineRef.current, scene);
      }
    }

    async function runGallery(sid: number) {
      if (disposed || sid !== sidRef.current) return;
      const { createVideoGalleryScene } = await import(
        "@/components/babylon/scenes/VideoGalleryScene"
      );
      if (disposed || sid !== sidRef.current) return;
      const handle = await createVideoGalleryScene(engineRef.current!, canvas);
      if (disposed || sid !== sidRef.current) { handle.dispose(); return; }
      sceneRef.current = handle;
      await startLoop(handle.scene);
    }

    async function runPlayback(sid: number, playbackId: string) {
      if (disposed || sid !== sidRef.current) return;
      const { createVideoPlaybackScene } = await import(
        "@/components/babylon/scenes/VideoPlaybackScene"
      );
      if (disposed || sid !== sidRef.current) return;
      const handle = await createVideoPlaybackScene(engineRef.current!, playbackId);
      if (disposed || sid !== sidRef.current) { handle.dispose(); return; }
      sceneRef.current = handle;
      await startLoop(handle.scene);
    }

    (async () => {
      try {
        const { createEngine } = await import("@/lib/babylon/engineFactory");
        const engine = await createEngine(canvas);
        if (disposed) { engine.dispose(); return; }
        engineRef.current = engine;

        // Initial gallery scene
        const initSid = ++sidRef.current;
        await runGallery(initSid);
        if (disposed) return;

        // Subscribe to scene-mode changes after initial scene is ready
        unsub = useVideoStore.subscribe(
          (s) => s.sceneMode,
          async (mode) => {
            if (disposed) return;
            const sid = ++sidRef.current;

            // Wait for the CSS transition overlay to fully cover the canvas
            await new Promise<void>((r) => setTimeout(r, 350));
            if (disposed || sid !== sidRef.current) return;

            // Safely tear down old scene (hidden behind the overlay)
            stopRef.current?.();
            stopRef.current = null;
            sceneRef.current?.dispose();
            sceneRef.current = null;

            if (mode === "gallery") {
              await runGallery(sid);
            } else if (mode === "playback") {
              const state = useVideoStore.getState();
              const video = state.videos.find((v) => v.id === state.selectedVideoId);
              if (video?.playbackId && !video.comingSoon) {
                await runPlayback(sid, video.playbackId);
              } else {
                // Video not streamable yet — return to gallery
                useVideoStore.getState().returnToGallery();
                return;
              }
            }

            if (!disposed && sid === sidRef.current) {
              setTimeout(() => {
                if (!disposed && sid === sidRef.current) {
                  useVideoStore.getState().setIsTransitioning(false);
                }
              }, 150);
            }
          }
        );
      } catch (err) {
        console.error("[SceneCanvas360] init failed:", err);
      }
    })();

    return () => {
      disposed = true;
      unsub?.();
      stopRef.current?.();
      sceneRef.current?.dispose();
      engineRef.current?.dispose();
      stopRef.current  = null;
      sceneRef.current = null;
      engineRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        touchAction: "none",
        outline: "none",
      }}
    />
  );
}
