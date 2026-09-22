// @vitest-environment happy-dom
import { act, createContext, createElement, StrictMode, useContext, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { IsolatedScene } from "@/components/map/isolated-scene";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const RouterContext = createContext("outside-router");
const cleanup = vi.fn();
const host = document.createElement("div");
afterEach(() => { host.replaceChildren(); cleanup.mockReset(); });

it("yönlendirme bağlamını taşımaz; seçim prop/callback ve StrictMode temizliği çalışır", async () => {
  const sources = new Set<HTMLDivElement>();
  function Scene({ value, select }: { value: number; select: () => void }) {
    const context = useContext(RouterContext);
    useEffect(() => cleanup, []);
    return createElement("button", { onClick: select }, `${context}:${value}`);
  }
  function MapHarness() {
    const [value, setValue] = useState(0);
    return createElement(RouterContext.Provider, { value: "pending-router-transition" },
      createElement(IsolatedScene, { renderScene: (eventSource) => {
        sources.add(eventSource);
        return createElement(Scene, { value, select: () => setValue(v => v + 1) });
      } }),
    );
  }
  const root = createRoot(host);
  try {
    await act(async () => { root.render(createElement(StrictMode, null, createElement(MapHarness))); });
    expect(host.textContent).toBe("outside-router:0");
    await act(async () => { host.querySelector("button")!.click(); });
    expect(host.textContent).toBe("outside-router:1");
    expect(host.querySelectorAll("button")).toHaveLength(1);
    expect([...sources].every(source => source instanceof HTMLDivElement)).toBe(true);
  } finally {
    await act(async () => { root.unmount(); });
  }
  expect(cleanup).toHaveBeenCalled();
  expect(host.childElementCount).toBe(0);
});
