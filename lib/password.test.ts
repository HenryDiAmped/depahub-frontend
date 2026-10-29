import { describe, expect, it } from "vitest";
import { evaluatePassword } from "./password";

describe("evaluatePassword", () => {
  it("indica débil y no válida si faltan los requisitos mínimos", () => {
    expect(evaluatePassword("clave123")).toMatchObject({
      strength: "débil",
      isValid: false,
      hasMinimumLength: false,
      hasUppercase: false,
    });
  });

  it("clasifica las contraseñas válidas por fortaleza", () => {
    expect(evaluatePassword("Clave1234").strength).toBe("medio");
    expect(evaluatePassword("ClaveSegura12").strength).toBe("seguro");
    expect(evaluatePassword("ClaveMuySegura12!").strength).toBe("muy seguro");
  });
});
