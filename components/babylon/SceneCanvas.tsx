"use client";

import { useEffect, useRef } from "react";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { AirSeaScene } from "@/components/babylon/scenes/AirSeaExperienceScene";

/**
 * SceneCanvas
 * ─────────────────────────────────────────────────────────────────────────────
 * Sole owner of the HTMLCanvasElement and the Babylon Engine lifecycle.
 *
 * Responsibilities:
 *   1. Mount a full-viewport canvas.
 *   2. Dynamically import + create the Babylon Engine (client-only).
 *   3. Delegate scene construction to AirSeaExperienceScene.
 *   4. Start the render loop.
 *   5. On unmount, call dispose on both the scene and the engine.
 *      React 18/19 StrictMode fires effects twice in dev — the ref guard
 *      (`disposed`) ensures the second teardown is a no-op.
 *
 * This component intentionally has NO props and NO internal state beyond
 * the imperative canvas/engine refs. All product state lives in Zustand.
 * React's re-render cycle never touches Babylon directly.
 *
 * The canvas is sized 100vw × 100vh via CSS; the engine's resize handler
 * (wired in engineFactory.startRenderLoop) keeps it in sync.
 */
export default function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<AirSeaScene | null>(null);
  const stopLoopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let disposed = false;

    (async () => {
      try {
        const { createEngine, startRenderLoop } = await import(
          "@/lib/babylon/engineFactory"
        );
        const { createAirSeaExperienceScene } = await import(
          "@/components/babylon/scenes/AirSeaExperienceScene"
        );

        const engine = await createEngine(canvas);
        if (disposed) {
          engine.dispose();
          return;
        }
        engineRef.current = engine;

        const airseaScene = await createAirSeaExperienceScene(engine, canvas);
        if (disposed) {
          airseaScene.dispose();
          engine.dispose();
          return;
        }
        sceneRef.current = airseaScene;

        stopLoopRef.current = startRenderLoop(engine, airseaScene.scene);
      } catch (err) {
        console.error("[SceneCanvas] Babylon init failed:", err);
      }
    })();

    return () => {
      disposed = true;
      stopLoopRef.current?.();
      sceneRef.current?.dispose();
      engineRef.current?.dispose();
      stopLoopRef.current = null;
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
        touchAction: "none", // prevent scroll interference with pointer events
        outline: "none",
      }}
    />
  );
}
