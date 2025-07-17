import { describe, it, expect } from "vitest";

describe("Basic Frontend Tests", () => {
  it("should pass basic test", () => {
    expect(true).toBe(true);
  });
  
  it("should have environment defined", () => {
    expect(import.meta.env).toBeDefined();
  });
});
