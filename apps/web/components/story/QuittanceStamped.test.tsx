// @vitest-environment jsdom
import { act, createElement, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

declare global {
  // Requis par React 19 pour utiliser act() hors test-renderer.
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let ioInstances = 0;
let container: HTMLDivElement;
let root: Root | undefined;

function stubMatchMedia(reduced: boolean) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: query.includes("prefers-reduced-motion") ? reduced : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

class MockIO {
  constructor() {
    ioInstances += 1;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

/** Le composant lit matchMedia dans son effet : un stub par scénario suffit. */
async function renderFresh(reduced: boolean) {
  stubMatchMedia(reduced);
  const mod = (await import("./QuittanceStamped")) as {
    QuittanceStamped: ComponentType<{ className?: string }>;
  };
  root = createRoot(container);
  await act(async () => {
    root!.render(createElement(mod.QuittanceStamped));
  });
}

beforeEach(() => {
  ioInstances = 0;
  globalThis.IntersectionObserver = MockIO as unknown as typeof IntersectionObserver;
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container.remove();
});

describe("QuittanceStamped (spec notre-histoire §1)", () => {
  it("prefers-reduced-motion : AUCUN observer monté, tampon statique d'emblée", async () => {
    await renderFresh(true);
    expect(ioInstances).toBe(0);
    expect(container.querySelector("[data-reveal]")?.getAttribute("data-reveal")).toBe("in");
  });

  it("motion autorisée : un observer est monté, le tampon attend le scroll", async () => {
    await renderFresh(false);
    expect(ioInstances).toBe(1);
    expect(container.querySelector("[data-reveal]")?.getAttribute("data-reveal")).toBe("");
  });

  it("rend la ligne complément 120,00 € en évidence et le tampon TROP PAYÉ", async () => {
    await renderFresh(true);
    expect(container.textContent).toContain("Complément de loyer");
    expect(container.textContent).toContain("120,00");
    expect(container.textContent).toContain("TROP PAYÉ");
  });
});
