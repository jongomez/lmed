"use client";

import { OnDrag, useDrag } from "@/utils/hooks";
import { useRef } from "react";

export type ResizeCursor = "cursor-row-resize" | "cursor-col-resize";

type ResizeHandleProps = {
  className: string;
  cursor: ResizeCursor;
  initialSize: number;
  onDrag: OnDrag;
};

export const ResizeHandle = ({
  className,
  cursor,
  initialSize,
  onDrag,
}: ResizeHandleProps) => {
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const isDragging = useDrag(resizeHandleRef, cursor, onDrag, initialSize);

  return (
    <>
      {/* 
        The first div here is an invisible pane. It's active when the handle is being dragged.
        The goals of this pane are:
        1. Always keep the cursor the same, even when it's over the a button, text, etc.
        2. Prevent text selections while dragging the handle.
      */}
      <div
        className={`${
          isDragging ? "" : "hidden"
        } z-40 fixed top-0 left-0 w-screen h-screen`}
      ></div>

      {/* The following div is the handle itself. */}
      <div
        ref={resizeHandleRef}
        className={`${className} ${cursor} ${
          isDragging
            ? "z-50 bg-blue-600 dark:bg-blue-300"
            : "bg-gray-200 dark:bg-gray-700"
        } `}
      ></div>
    </>
  );
};
