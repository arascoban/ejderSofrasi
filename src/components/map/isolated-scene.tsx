"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

/**
 * R3F's Canvas bridges every ancestor context into its custom renderer.
 * Keep App Router's pending navigation contexts out of that renderer. Scene
 * data and callbacks cross this boundary explicitly, never via router hooks.
 */
export function IsolatedScene({ renderScene }: { renderScene: (eventSource: HTMLDivElement) => ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const root = useRef<Root | null>(null);
  const eventSource = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = document.createElement("div");
    container.style.cssText = "width:100%;height:100%";
    host.current!.appendChild(container);
    const sceneRoot = createRoot(container);
    root.current = sceneRoot;
    eventSource.current = container;
    return () => {
      root.current = null;
      eventSource.current = null;
      // React must finish the outer commit before unmounting a nested root.
      // Each mount has its own container, also under StrictMode replay.
      queueMicrotask(() => {
        sceneRoot.unmount();
        container.remove();
      });
    };
  }, []);

  useEffect(() => {
    // Canvas configures asynchronously. Give it the captured element rather
    // than a ref that React clears during a fast route change.
    if (eventSource.current) root.current?.render(renderScene(eventSource.current));
  }, [renderScene]);

  return <div ref={host} className="atlas-scene-root" />;
}
