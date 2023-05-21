import { SettingsContext } from "@/components/SettingsProvider.client";
import { useContext } from "react";

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return context;
};
