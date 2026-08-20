import { describe, expect, it } from "vitest";
import { applyTrendReference, filterTrendReferences } from "./Home";

const references = [
  { id: 1, spoken: "El precio no es el problema", insertTitle: "El problema real", platform: "TikTok", territory: "F", sourceUrl: null, insight: "Resuelve una objeción", tags: "precio, objeción" },
  { id: 2, spoken: "Tres formas de probarlo", insertTitle: null, platform: "Instagram Reels", territory: "B", sourceUrl: "https://example.com", insight: "Muestra la prueba", tags: "demostración, proceso" },
];

describe("lógica de referencias de tendencia", () => {
  it("encuentra referencias por búsqueda, plataforma y territorio", () => {
    expect(filterTrendReferences(references, { search: "precio", platform: "all", territory: "all" })).toHaveLength(1);
    expect(filterTrendReferences(references, { search: "", platform: "Instagram Reels", territory: "B" })).toEqual([references[1]]);
    expect(filterTrendReferences(references, { search: "no existe", platform: "all", territory: "all" })).toHaveLength(0);
  });

  it("copia el hook e Insert-Titulo al Canvas sin perder los demás campos", () => {
    const form = { objective: "Guardados", platform: "TikTok", audience: "Audiencia", tension: "Tensión", truth: "Verdad", proof: "Prueba", spoken: "Anterior", overlay: "Anterior", frame: "Escena", payoff: "Pago", cta: "Guardar", risk: "" };
    expect(applyTrendReference(form, references[0])).toMatchObject({ spoken: "El precio no es el problema", overlay: "El problema real", proof: "Prueba" });
    expect(applyTrendReference(form, references[1]).overlay).toBe("");
  });
});
