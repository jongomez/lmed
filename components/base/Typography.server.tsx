import { ReactNode } from "react";

type PProps = {
  children: ReactNode;
  className?: string;
};

export const P = ({ children, className }: PProps) => {
  // const settings = useSettings();

  return (
    <p className={`mt-2 main-text-colors ${className || ""}`}>{children}</p>
  );
};

export type UlProps = {
  children: ReactNode;
  className?: string;
};

export const Ul = ({ children, className }: UlProps) => {
  return <ul className={`${className || ""}`}>{children}</ul>;
};

export type LiProps = {
  children: ReactNode;
  className?: string;
} & JSX.IntrinsicElements["li"];

export const Li = ({ children, className, ...props }: LiProps) => {
  return (
    <li className={`main-text-colors ${className || ""}`} {...props}>
      {children}
    </li>
  );
};

type H3rops = {
  children: ReactNode;
  className?: string;
};

export const H3 = ({ children, className }: H3rops) => {
  // const settings = useSettings();

  return (
    <h3 className={`${className || ""} text-slate-900 dark:text-white mt-5`}>
      {children}
    </h3>
  );
};
