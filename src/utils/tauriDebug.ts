/**
 * Tauri Debug Utility
 * Provides comprehensive debugging information for Tauri context issues
 */

import { invoke } from "@tauri-apps/api/core";

export interface TauriDiagnostic {
  isInTauriContext: boolean;
  hasWindow: boolean;
  hasTauriGlobal: boolean;
  hasInvokeFunction: boolean;
  tauriVersion?: string;
  errors: string[];
  suggestions: string[];
}

// Wait for Tauri to be fully initialized
export const waitForTauriInitialization = async (maxWaitMs: number = 5000): Promise<boolean> => {
  const startTime = Date.now();
  
  console.log("🔄 Waiting for Tauri initialization...");
  
  while (Date.now() - startTime < maxWaitMs) {
    // Check multiple indicators of Tauri readiness
    const hasTauriGlobal = typeof window !== "undefined" && (window as any).__TAURI__;
    const isInTauriProcess = typeof window !== "undefined" && (window as any).__TAURI_METADATA__;
    const hasInvokeFunction = typeof invoke === "function";
    
    console.log(`⏱️ ${Date.now() - startTime}ms - Tauri global: ${!!hasTauriGlobal}, Metadata: ${!!isInTauriProcess}, Invoke: ${hasInvokeFunction}`);
    
    // If we have invoke function available, we might be in Tauri even if __TAURI__ isn't ready yet
    if (hasInvokeFunction) {
      try {
        // Try a simple Tauri command to verify connection
        await invoke("greet", { name: "Init Test" });
        console.log("✅ Tauri command executed successfully - we're in Tauri context!");
        return true;
      } catch (error) {
        const errorStr = error instanceof Error ? error.message : String(error);
        console.log(`🔄 Tauri command failed (${Date.now() - startTime}ms):`, errorStr.substring(0, 100));
      }
    }
    
    // Wait 200ms before checking again (longer interval for more reliable detection)
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.warn("⚠️ Tauri initialization timeout after", maxWaitMs, "ms");
  console.log("🔍 Final check - if invoke is available, we might still be in Tauri context");
  return typeof invoke === "function";
};

export const debugTauriContext = (): TauriDiagnostic => {
  const diagnostic: TauriDiagnostic = {
    isInTauriContext: false,
    hasWindow: false,
    hasTauriGlobal: false,
    hasInvokeFunction: false,
    errors: [],
    suggestions: []
  };

  try {
    // Check if window exists
    diagnostic.hasWindow = typeof window !== "undefined";
    if (!diagnostic.hasWindow) {
      diagnostic.errors.push("window object is not available");
      diagnostic.suggestions.push("Ensure code is running in browser environment");
      return diagnostic;
    }

    // Check if __TAURI__ global exists (this might not be available immediately)
    diagnostic.hasTauriGlobal = !!(window as any).__TAURI__;

    // Check if invoke function is available (this is the most reliable indicator)
    diagnostic.hasInvokeFunction = typeof invoke === "function";
    if (!diagnostic.hasInvokeFunction) {
      diagnostic.errors.push("invoke function is not available");
      diagnostic.suggestions.push("Check if @tauri-apps/api/core is properly imported");
    }

    // NEW: More lenient context check - if invoke is available, we're likely in Tauri
    // Even if __TAURI__ global isn't ready yet
    diagnostic.isInTauriContext = diagnostic.hasWindow && diagnostic.hasInvokeFunction;

    // Add warnings but don't fail if __TAURI__ global is missing
    if (!diagnostic.hasTauriGlobal && diagnostic.hasInvokeFunction) {
      console.warn("⚠️ __TAURI__ global not available yet, but invoke function is present");
      diagnostic.suggestions.push("Tauri may still be initializing - this is often normal");
    }

    if (diagnostic.isInTauriContext) {
      try {
        // Try to get Tauri version info
        const tauriMetadata = (window as any).__TAURI_METADATA__;
        if (tauriMetadata) {
          diagnostic.tauriVersion = tauriMetadata.version || "unknown";
        }
      } catch (error) {
        const errorStr = error instanceof Error ? error.message : String(error);
        diagnostic.errors.push(`Failed to get Tauri metadata: ${errorStr}`);
      }
    }

    // Only add hard error if both indicators are missing
    if (!diagnostic.isInTauriContext) {
      if (!diagnostic.hasInvokeFunction) {
        diagnostic.errors.push("Neither invoke function nor __TAURI__ global are available");
        diagnostic.suggestions.push("Run with 'npm run tauri dev' instead of 'npm run dev'");
        diagnostic.suggestions.push("Ensure Tauri dependencies are properly installed");
      }
    }

  } catch (error) {
    const errorStr = error instanceof Error ? error.message : String(error);
    diagnostic.errors.push(`Diagnostic error: ${errorStr}`);
  }

  return diagnostic;
};

export const logTauriDiagnostic = (): void => {
  const diagnostic = debugTauriContext();
  
  console.group("🔧 Tauri Context Diagnostic");
  console.log("✅ Is in Tauri context:", diagnostic.isInTauriContext);
  console.log("🌐 Has window:", diagnostic.hasWindow);
  console.log("🦀 Has __TAURI__ global:", diagnostic.hasTauriGlobal);
  console.log("📞 Has invoke function:", diagnostic.hasInvokeFunction);
  
  if (diagnostic.tauriVersion) {
    console.log("📦 Tauri version:", diagnostic.tauriVersion);
  }
  
  if (diagnostic.errors.length > 0) {
    console.group("❌ Errors");
    diagnostic.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  if (diagnostic.suggestions.length > 0) {
    console.group("💡 Suggestions");
    diagnostic.suggestions.forEach(suggestion => console.info(suggestion));
    console.groupEnd();
  }
  
  console.groupEnd();
};

export const testTauriConnection = async (): Promise<boolean> => {
  try {
    console.log("🔄 Waiting for Tauri to initialize...");
    
    // First, wait for Tauri to be properly initialized
    const isInitialized = await waitForTauriInitialization(5000);
    
    if (!isInitialized) {
      console.error("❌ Tauri failed to initialize within timeout");
      logTauriDiagnostic();
      return false;
    }
    
    const diagnostic = debugTauriContext();
    
    if (!diagnostic.isInTauriContext) {
      console.error("Cannot test Tauri connection - not in Tauri context");
      logTauriDiagnostic();
      return false;
    }

    // Test a simple Tauri command
    console.log("🧪 Testing Tauri command execution...");
    await invoke("greet", { name: "Connection Test" });
    console.log("✅ Tauri connection test successful");
    return true;
    
  } catch (error) {
    console.error("❌ Tauri connection test failed:", error);
    logTauriDiagnostic();
    return false;
  }
};
