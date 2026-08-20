import { describe, expect, it } from "vitest";
import { auditHook, library, objectiveDetail, PASS_SCORE, platformGuidance } from "./hookManual";

const cases = [
  { spoken: "", overlay: "", expected: 0, passed: false, label: "campo vacío" },
  { spoken: "esto", overlay: "esto", expected: 25, passed: false, label: "fragmento demasiado corto" },
  { spoken: "Buenas chicos, bienvenidos un día más al canal", overlay: "Bienvenidos", expected: 59, passed: false, label: "preámbulo real de cliente" },
  { spoken: "Resultados garantizados al 100% en 24 horas, esto funciona siempre", overlay: "Garantizado 100%", expected: 69, passed: false, label: "sobrepromesa" },
  { spoken: "Dejamos de usar plantillas", overlay: "Dejamos de usar plantillas", expected: 69, passed: false, label: "Insert-Titulo idéntico al hablado" },
  { spoken: "Te voy a dar muchos consejos increíbles sobre cosas de marketing que te van a servir", overlay: "Muchos consejos increíbles de marketing", expected: 55, passed: false, label: "frase vaga y gastada" },
  { spoken: "Dejamos de usar plantillas y bajamos las revisiones a la mitad", overlay: "Sin plantillas, mitad de revisiones", expected: 86, passed: true, label: "contradicción con resultado" },
  { spoken: "Publicar todos los días está hundiendo tu alcance", overlay: "Publicar a diario te frena", expected: 92, passed: true, label: "contradicción con coste" },
  { spoken: "Analicé 340 Reels de clínicas y solo 11 pasaban del segundo tres", overlay: "Solo 11 de 340", expected: 81, passed: true, label: "dato específico" },
  { spoken: "El detalle que cambia cómo eliges café", overlay: "Elige café mejor", expected: 73, passed: true, label: "curiosidad útil" },
];

describe("auditor de hooks", () => {
  cases.forEach(({ spoken, overlay, expected, passed, label }) => {
    it(`emite el veredicto esperado para ${label}`, () => {
      const result = auditHook(spoken, overlay);
      expect(result.passed).toBe(passed);
      expect(result.score).toBeGreaterThanOrEqual(expected - 3);
      expect(result.score).toBeLessThanOrEqual(expected + 3);
    });
  });

  it("impide aprobar cualquier fallo duro y mantiene todos los hallazgos", () => {
    const result = auditHook("Buenas chicos, esto lo cambia todo y resultados garantizados al 100% en 24 horas", "Buenas chicos, esto lo cambia todo");
    expect(result.score).toBeLessThan(PASS_SCORE);
    expect(result.hardFailures).toBeGreaterThan(2);
    expect(result.checks.length).toBeGreaterThanOrEqual(8);
  });

  it("expone las 42 aperturas completas y los ajustes de selección", () => {
    expect(library).toHaveLength(42);
    expect(new Set(library.map((item) => item.id)).size).toBe(42);
    expect(library[0]?.id).toBe(1);
    expect(library[41]?.id).toBe(42);
    expect(library.every((item) => item.template.includes("[") && Boolean(item.example) && Boolean(item.overlay) && Boolean(item.edit) && Boolean(item.useWhen))).toBe(true);
    expect(objectiveDetail("Acción").metric).toBe("Coste por resultado");
    expect(objectiveDetail("Compartidos").metric).toBe("Compartidos por alcance");
    expect(platformGuidance["TikTok"]).toContain("sonido");
  });

  it("bloquea el veredicto cuando la regla activa exige una prueba que falta", () => {
    const withoutProof = auditHook("Publicar todos los días está hundiendo tu alcance", "Publicar a diario te frena", "", { requireProof: true });
    const withProof = auditHook("Publicar todos los días está hundiendo tu alcance", "Publicar a diario te frena", "Curva de analítica", { requireProof: true });

    expect(withoutProof.passed).toBe(false);
    expect(withoutProof.score).toBeLessThanOrEqual(69);
    expect(withoutProof.hardFailures).toBeGreaterThan(0);
    expect(withProof.passed).toBe(true);
    expect(withProof.score).toBe(92);
  });
});
