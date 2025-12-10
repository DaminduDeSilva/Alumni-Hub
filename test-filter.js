// Test script to verify filtering logic
const mockUsers = [
  {
    id: 5,
    email: "damindudesilva2384@gmail.com",
    full_name: "Damindu De Silva",
    role: "VERIFIED_USER",
    assigned_field: null,
  },
  {
    id: 3,
    email: "desilva.wdt@gmail.com",
    full_name: "Damindu De Silva",
    role: "VERIFIED_USER",
    assigned_field: null,
  },
  {
    id: 2,
    email: "my3palasirisena2384@gmail.com",
    full_name: "The Flash",
    role: "FIELD_ADMIN",
    assigned_field: "Chemical",
  },
];

// Simulate filtering logic from the component
function getFilteredUsers(allUsers, selectedField) {
  if (!selectedField) return [];

  return allUsers.filter((user) => {
    // Don't show super admins
    if (user.role === "SUPER_ADMIN") return false;

    // Don't show users who are already field admin for the selected field
    if (user.role === "FIELD_ADMIN" && user.assigned_field === selectedField) {
      return false;
    }

    // Show all other users:
    // - VERIFIED_USER (can be assigned to any field)
    // - FIELD_ADMIN with different field assignment (can be reassigned)
    return true;
  });
}

// Test scenarios
console.log("=== TESTING FIELD ADMIN FILTERING ===\n");

// Test 1: No field selected
console.log("Test 1 - No field selected:");
console.log("Result:", getFilteredUsers(mockUsers, ""));
console.log("Expected: [] (empty array)\n");

// Test 2: Chemical field selected (The Flash is already Chemical admin)
console.log("Test 2 - Chemical field selected:");
const chemicalResult = getFilteredUsers(mockUsers, "Chemical");
console.log("Result:", chemicalResult);
console.log(
  "Expected: Should exclude 'The Flash' (Chemical admin), show others"
);
console.log(`Actual count: ${chemicalResult.length}, Expected count: 2\n`);

// Test 3: Civil field selected (no existing admin)
console.log("Test 3 - Civil field selected:");
const civilResult = getFilteredUsers(mockUsers, "Civil");
console.log("Result:", civilResult);
console.log("Expected: Should show all users (including The Flash)");
console.log(`Actual count: ${civilResult.length}, Expected count: 3\n`);

// Test 4: Computer field selected (no existing admin)
console.log("Test 4 - Computer field selected:");
const computerResult = getFilteredUsers(mockUsers, "Computer");
console.log("Result:", computerResult);
console.log("Expected: Should show all users");
console.log(`Actual count: ${computerResult.length}, Expected count: 3\n`);

console.log("=== TEST COMPLETE ===");
