import { describe, expect, it } from "vitest";
import { foundationCards } from "./Home";

describe("Fundamento parafraseado", () => {
  it("mantiene los tres principios actualizados en la interfaz", () => {
    expect(foundationCards).toEqual([
      expect.objectContaining({
        code: "01 / CAPTAR ATENCIÓN",
        title: "La retención es el primer filtro.",
      }),
      expect.objectContaining({
        code: "02 / GENERAR COMPARTIDOS",
        title: "Compartir confirma que la pieza importa.",
      }),
      expect.objectContaining({
        code: "03 / DAR CONTEXTO",
        title: "La decisión empieza antes de escuchar.",
      }),
    ]);
  });
});
