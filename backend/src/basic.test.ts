describe("Basic Test Suite", () => {
  it("should pass basic test", () => {
    expect(true).toBe(true);
  });
  
  it("should have working environment", () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
