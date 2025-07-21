/**
 * Test Script for Tauri Context Initialization
 * Run this in the browser console to test the new initialization logic
 */

// Test the initialization waiting mechanism
async function testTauriInitialization() {
  console.clear();
  console.log("🧪 Testing Tauri Initialization Fix...");

  try {
    // Import the utility (this would normally be imported at the top)
    const {
      waitForTauriInitialization,
      debugTauriContext,
      testTauriConnection,
    } = window.tauriDebugUtils || {};

    if (!waitForTauriInitialization) {
      console.error(
        "❌ Test utilities not available - run this in the actual app context"
      );
      return;
    }

    console.log("1️⃣ Testing immediate context check:");
    const immediate = debugTauriContext();
    console.log("Immediate result:", immediate.isInTauriContext);

    console.log("2️⃣ Testing initialization waiting:");
    const waitResult = await waitForTauriInitialization(3000);
    console.log("Wait result:", waitResult);

    console.log("3️⃣ Testing context after waiting:");
    const afterWait = debugTauriContext();
    console.log("After wait result:", afterWait.isInTauriContext);

    console.log("4️⃣ Testing connection:");
    const connectionResult = await testTauriConnection();
    console.log("Connection result:", connectionResult);

    if (connectionResult) {
      console.log("✅ All tests passed! Tauri initialization fix is working.");
    } else {
      console.log("⚠️ Some tests failed. Check the diagnostic output above.");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Instructions
console.log("🔧 Tauri Initialization Test Script Loaded");
console.log("Run testTauriInitialization() to test the fix");

// Auto-export for testing
if (typeof window !== "undefined") {
  window.testTauriInitialization = testTauriInitialization;
}
