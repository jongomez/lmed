import React from "react";

type RadioItemProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

export const RadioItem: React.FC<RadioItemProps> = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <label className="flex items-center space-x-2 mx-3">
      <input
        type="radio"
        className="form-radio h-5 w-5 main-text-colors"
        value={label}
        checked={checked}
        onChange={onChange}
      />
      <span className="main-text-colors text-sm">{label}</span>
    </label>
  );
};
