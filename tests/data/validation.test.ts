import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createDatabaseValidator, DataValidationError, parseJsonDocument } from "@/lib/data/validation";
import { auxiliaryDatabaseSchema } from "@/lib/data/auxiliary-schema";

describe("veri doğrulama sınırı", () => {
  it("bozuk JSON için dosya ve işaretçi bilgisi verir", () => {
    expect(() => parseJsonDocument("bozuk.json", '[{"id":')).toThrowError(DataValidationError);
    try {
      parseJsonDocument("bozuk.json", '[{"id":');
    } catch (error) {
      expect(error).toMatchObject({ fileName: "bozuk.json", pointer: "/" });
      expect((error as Error).message).toContain("bozuk.json");
    }
  });

  it("şemaya uymayan kayıtta JSON işaretçisini korur", async () => {
    const schema = JSON.parse(await readFile(path.join(process.cwd(), "data/schema.json"), "utf8"));
    const validate = createDatabaseValidator(schema);
    expect(() => validate("entities.json", [{ id: "hatalı" }])).toThrowError(DataValidationError);
    try {
      validate("entities.json", [{ id: "hatalı" }]);
    } catch (error) {
      expect((error as DataValidationError).fileName).toBe("entities.json");
      expect((error as DataValidationError).pointer).toMatch(/^\/0/);
    }
  });

  it("yardımcı dosyaları aynı dosya ve işaretçi sınırında doğrular", () => {
    const validate = createDatabaseValidator(auxiliaryDatabaseSchema);
    expect(() => validate("world_states.json", [{ id: "WST-0001", period: "1700 civarı" }]))
      .toThrowError(DataValidationError);
    try {
      validate("world_states.json", [{ id: "WST-0001", period: "1700 civarı" }]);
    } catch (error) {
      expect(error).toMatchObject({ fileName: "world_states.json" });
      expect((error as DataValidationError).pointer).toMatch(/^\/0/);
    }
  });
});
