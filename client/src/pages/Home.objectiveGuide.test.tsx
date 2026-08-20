import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CollapsibleSection, ObjectiveGuide } from "./Home";

describe("guía rápida de objetivos", () => {
  it("diferencia Comunidad, Consideración y Acción y se presenta plegada por defecto", () => {
    const markup = renderToStaticMarkup(<ObjectiveGuide active="Consideración" onSelect={() => undefined} />);

    expect(markup).toContain("Comunidad construye relación");
    expect(markup).toContain("Consideración facilita una decisión");
    expect(markup).toContain("Acción pide un paso concreto");
    expect(markup).toContain("Seleccionado");
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('id="guia-objetivos-contenido"');
  });

  it("expone el estado y el contenido de una explicación desplegable", () => {
    const closed = renderToStaticMarkup(<CollapsibleSection id="prueba" code="00" title="Prueba" open={false} onToggle={() => undefined}><p>Contenido de prueba</p></CollapsibleSection>);
    const open = renderToStaticMarkup(<CollapsibleSection id="prueba" code="00" title="Prueba" open onToggle={() => undefined}><p>Contenido de prueba</p></CollapsibleSection>);

    expect(closed).toContain('aria-expanded="false"');
    expect(closed).toContain('hidden=""');
    expect(open).toContain('aria-expanded="true"');
    expect(open).not.toContain('hidden=""');
  });
});
