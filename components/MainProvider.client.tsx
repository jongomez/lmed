"use client";

import { ReactNode, createContext, useEffect, useState } from "react";

export type SiteTheme = "light" | "dark";

export type MainContextType = {
  siteTheme: SiteTheme;
  toggleSiteTheme: () => void;
};

export const MainContext = createContext<MainContextType | undefined>(
  undefined
);

type MainProviderProps = {
  children: ReactNode;
};

export const MainProvider = ({ children }: MainProviderProps) => {
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
    <MainContext.Provider value={{ siteTheme, toggleSiteTheme }}>
      {children}
    </MainContext.Provider>
  );
};
