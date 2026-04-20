"use client";

import { useEffect, useRef, useState } from "react";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { AirSea360SceneHandle } from "@/components/babylon/scenes/AirSea360Scene";

interface Props {
  onReady?: () => void;
}

export default function SceneCanvas360({ onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<AirSea360SceneHandle | null>(null);
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
        const { createAirSea360Scene } = await import(
          "@/components/babylon/scenes/AirSea360Scene"
        );

        const engine = await createEngine(canvas);
        if (disposed) { engine.dispose(); return; }
        engineRef.current = engine;

        const handle = await createAirSea360Scene(engine);
        if (disposed) { handle.dispose(); engine.dispose(); return; }
        sceneRef.current = handle;

        stopLoopRef.current = startRenderLoop(engine, handle.scene);
        onReady?.();
      } catch (err) {
        console.error("[SceneCanvas360] init failed:", err);
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
        touchAction: "none",
        outline: "none",
      }}
    />
  );
}
