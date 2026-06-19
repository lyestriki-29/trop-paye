// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MonthYearField } from "./fields";

declare global {
  // Requis par React 19 pour utiliser act() hors test-renderer.
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Horloge figée au 20 juin 2026 → année courante 2026, mois courant juin (6).
const NOW = new Date("2026-06-20T00:00:00Z");

let container: HTMLDivElement;
let root: Root | undefined;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container.remove();
});

async function render(onChange: (v: string) => void, value = "") {
  root = createRoot(container);
  await act(async () => {
    root!.render(
      createElement(MonthYearField, { label: "Bail", value, onChange, now: NOW }),
    );
  });
}

function selects(): [HTMLSelectElement, HTMLSelectElement] {
  const [mois, annee] = Array.from(container.querySelectorAll("select"));
  return [mois as HTMLSelectElement, annee as HTMLSelectElement];
}

async function choose(sel: HTMLSelectElement, value: string) {
  await act(async () => {
    sel.value = value;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function option(sel: HTMLSelectElement, value: string): HTMLOptionElement {
  return sel.querySelector(`option[value="${value}"]`) as HTMLOptionElement;
}

describe("MonthYearField — choix mois/année dans n'importe quel ordre", () => {
  it("ne grise AUCUN mois tant qu'aucune année n'est choisie", async () => {
    await render(() => {});
    const [mois] = selects();
    // Décembre (12) ne doit pas être grisé : on ignore encore l'année.
    expect(option(mois, "12").disabled).toBe(false);
  });

  it("année choisie AVANT le mois : la date se compose correctement", async () => {
    const onChange = vi.fn();
    await render(onChange);
    const [mois, annee] = selects();
    await choose(annee, "2023");
    await choose(mois, "8");
    expect(onChange).toHaveBeenLastCalledWith("2023-08-01");
  });

  it("garde-fou : pour l'année courante, les mois futurs restent grisés", async () => {
    await render(() => {});
    const [mois, annee] = selects();
    await choose(annee, "2026");
    expect(option(mois, "12").disabled).toBe(true); // décembre 2026 = futur
    expect(option(mois, "5").disabled).toBe(false); // mai 2026 = passé
  });
});
