"use client";
import React, { createContext, useEffect, useState } from "react";

export type SiteTheme = "light" | "dark";

type SettingsContextType = {
  siteTheme: SiteTheme;
  toggleSiteTheme: () => void;
};

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

type SettingsProviderProps = {
  children: React.ReactNode;
};

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [siteTheme, setSiteTheme] = useState<SiteTheme>("light");

  const toggleSiteTheme = () => {
    setSiteTheme((prevTheme) => {
      const newSiteTheme = prevTheme === "light" ? "dark" : "light";
      return newSiteTheme;
    });
  };

  // Handle initial theme. useEffect because this can't be server side redenred - it's a user thing.
  useEffect(() => {
    const localStorageTheme = window.localStorage.getItem(
      "siteTheme"
    ) as SiteTheme;

    if (localStorageTheme) {
      setSiteTheme(localStorageTheme);
    } else if (
      window?.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setSiteTheme("dark");
    } else if (
      window?.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      setSiteTheme("light");
    } else {
      setSiteTheme("dark");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("siteTheme", siteTheme);

    // Not using the toggle method on purpose just to be safe.
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add(siteTheme);
  }, [siteTheme]);

  return (
    <SettingsContext.Provider value={{ siteTheme, toggleSiteTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};
