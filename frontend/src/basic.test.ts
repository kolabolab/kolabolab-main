import { describe, it, expect } from "vitest";

describe("Basic Test Suite", () => {
  it("should pass basic test", () => {
    expect(true).toBe(true);
  });
  
  it("should have working environment", () => {
    expect(import.meta.env).toBeDefined();
  });
});
