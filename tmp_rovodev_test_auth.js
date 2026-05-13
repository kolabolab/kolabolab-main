// Quick test to register a user directly in D1 database
const testUser = {
  id: crypto.randomUUID(),
  email: "simple@test.com",
  password: "testpassword",
  firstName: "Simple",
  lastName: "Test"
};

console.log("Test user to create:", testUser);