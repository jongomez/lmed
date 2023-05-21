"use client";

import { ReactNode } from "react";

type PProps = {
  children: ReactNode;
};

export const P = ({ children }: PProps) => {
  // const settings = useSettings();

  return <p className="text-slate-500 dark:text-slate-400 mt-2">{children}</p>;
};

type H2rops = {
  children: ReactNode;
};

export const H3 = ({ children }: H2rops) => {
  // const settings = useSettings();

  return <h3 className="text-slate-900 dark:text-white mt-5">{children}</h3>;
};
