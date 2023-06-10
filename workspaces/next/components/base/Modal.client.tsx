import { X } from "lucide-react";
import { PointerEvent, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  overlayClassNames?: string;
  className: string;
  closeActionCallback: () => void;
  children: ReactNode;
}

export const Modal = ({
  isOpen,
  closeActionCallback,
  overlayClassNames = "bg-black bg-opacity-50",
  className,
  children,
}: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  const handleOverlayPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeActionCallback();
    }
  };

  return (
    <div
      className={`
        ${overlayClassNames}
        fixed inset-0 z-40 flex items-center 
        justify-center overflow-auto
      `}
      onPointerDown={handleOverlayPointerDown}
    >
      <div
        className={`
          ${className}
          relative bg-white z-50 p-6 rounded-lg shadow-lg
          bg-main-colors
          main-text-colors
        `}
      >
        {children}
        <button
          onPointerDown={closeActionCallback}
          className="absolute top-2 right-2 text-lg font-bold"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};
