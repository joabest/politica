import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeNextPath } from "../lib/auth.js";

describe("safeNextPath", () => {
  it("aceita caminhos internos", () => assert.equal(safeNextPath("/redefinir-senha?token=1"), "/redefinir-senha?token=1"));
  for (const value of ["https://evil.example", "//evil.example", "\\evil.example", "javascript:alert(1)"])
    it(`rejeita redirecionamento inseguro: ${value}`, () => assert.equal(safeNextPath(value), "/dashboard"));
});
