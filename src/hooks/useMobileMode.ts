import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export const useMobileMode = () => {
  const [isMobileMode, setIsMobileMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load mobile mode preference from database on mount
  useEffect(() => {
    loadMobileMode();
  }, []);

  const loadMobileMode = async (): Promise<void> => {
    try {
      setLoading(true);
      const mobileMode = await invoke<boolean>("get_mobile_mode");
      setIsMobileMode(mobileMode);
    } catch (error) {
      console.error("Failed to load mobile mode:", error);
      setIsMobileMode(false); // Default to desktop mode
    } finally {
      setLoading(false);
    }
  };

  const toggleMobileMode = async (): Promise<void> => {
    try {
      const newMobileMode = !isMobileMode;
      await invoke("set_mobile_mode", { enabled: newMobileMode });
      setIsMobileMode(newMobileMode);
    } catch (error) {
      console.error("Failed to update mobile mode:", error);
    }
  };

  return {
    isMobileMode,
    toggleMobileMode,
    loading,
  };
};
