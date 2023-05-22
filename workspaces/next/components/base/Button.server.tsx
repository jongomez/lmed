import { ReactNode } from "react";

export type ButtonProps = {
  children: ReactNode;
  className?: string;
} & JSX.IntrinsicElements["div"];

// An alternative would be to use HTMLAttributes<HTMLDivElement> insead of JSX.IntrinsicElements["div"].
// https://stackoverflow.com/questions/51835611/specify-specific-props-and-accept-general-html-props-in-typescript-react-app

export const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    // add min-w here please. thank u

    <div
      className={`inline-block text-center px-4 py-2 rounded-md
       text-white bg-blue-600 hover:bg-blue-700 focus:outline-none
        focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50
         cursor-pointer min-w-[150px] m-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
