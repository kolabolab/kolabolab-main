describe("Basic Backend Tests", () => {
  it("should pass basic test", () => {
    expect(true).toBe(true);
  });
  
  it("should have environment defined", () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
