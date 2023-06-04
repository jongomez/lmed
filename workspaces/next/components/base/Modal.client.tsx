import { PointerEvent, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  const handleOverlayPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-auto bg-black bg-opacity-50"
      onPointerDown={handleOverlayPointerDown}
    >
      <div className="relative bg-white z-50 p-6 rounded-lg shadow-lg">
        {children}
        <button
          onPointerDown={onClose}
          className="absolute top-2 right-2 text-lg font-bold"
        >
          X
        </button>
      </div>
    </div>
  );
};
