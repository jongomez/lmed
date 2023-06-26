import { ReactNode } from "react";

type AProps = {
  children: ReactNode;
  className?: string;
} & JSX.IntrinsicElements["a"];

export const A = ({ children, className, ...props }: AProps) => {
  return (
    <a
      className={`main-text-colors cursor-pointer hover:underline ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </a>
  );
};
