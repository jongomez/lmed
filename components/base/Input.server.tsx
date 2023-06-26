type InputProps = {
  className?: string;
} & JSX.IntrinsicElements["input"];

export const Input = ({ className, ...props }: InputProps) => {
  return (
    <input
      className={`${className} main-text-colors
            rounded-lg p-2 bg-secondary-colors focus-ring
          `}
      {...props}
    />
  );
};
