import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AuditResultPanel, RulesSection } from "./Home";

const expandedRule = {
  id: 1,
  ownerId: 1,
  clientId: 7,
  sector: null,
  label: "Excepción aprobada",
  maxSpokenWords: 16,
  maxOverlayWords: 8,
  requireProof: true,
  preambles: "hola",
  tiredPhrases: "secreto",
  tensionTerms: "falla",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("señalización de límites ampliados", () => {
  it("marca una regla expandida en la sección de Reglas", () => {
    const markup = renderToStaticMarkup(<RulesSection clients={[]} rules={[expandedRule]} draft={{ label: "", clientId: "", sector: "", maxSpokenWords: "12", maxOverlayWords: "6", requireProof: true, preambles: "", tiredPhrases: "", tensionTerms: "" }} setDraft={() => undefined} saving={false} isAuthenticated onLogin={() => undefined} createRule={() => undefined} />);
    expect(markup).toContain("Límite ampliado");
    expect(markup).toContain("Supera el estándar 12/6");
  });

  it("muestra la desviación en el panel de auditoría", () => {
    const markup = renderToStaticMarkup(<AuditResultPanel visible result={{ score: 84, checks: [], hardFailures: 0, wordCount: 9, overlayWordCount: 4, passed: true }} rule={expandedRule} />);
    expect(markup).toContain("Esta cuenta usa un límite ampliado");
    expect(markup).toContain("voz ≤ 16 e Insert-Titulo ≤ 8");
  });
});
