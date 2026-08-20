import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TrendReferencesPanel } from "./Home";

describe("referencias de tendencia", () => {
  it("muestra los campos de carga y permite reutilizar una referencia guardada", () => {
    const markup = renderToStaticMarkup(
      <TrendReferencesPanel
        references={[{ id: 1, spoken: "La escena demuestra primero", insertTitle: "Prueba primero", platform: "TikTok", territory: "B", sourceUrl: "https://example.com", insight: "La evidencia llega antes de la explicación.", tags: "prueba, tendencia" }]}
        loading={false}
        isAuthenticated
        search=""
        setSearch={() => undefined}
        platform="all"
        setPlatform={() => undefined}
        territory="all"
        setTerritory={() => undefined}
        draft={{ spoken: "", insertTitle: "", platform: "Instagram Reels", territory: "C", sourceUrl: "", insight: "", tags: "" }}
        setDraft={() => undefined}
        saving={false}
        onSave={() => undefined}
        onUse={() => undefined}
        onLogin={() => undefined}
      />
    );

    expect(markup).toContain("Referencias de tendencia");
    expect(markup).toContain("Hook observado");
    expect(markup).toContain("Por qué funciona");
    expect(markup).toContain("La escena demuestra primero");
    expect(markup).toContain("Usar como punto de partida");
  });
});
