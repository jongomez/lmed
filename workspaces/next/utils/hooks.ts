import { ResizeCursor } from "@/components/ResizeHandle.client";
import {
  SettingsContext,
  SettingsContextType,
} from "@/components/SettingsProvider.client";
import {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";
import { WEBSOCKET_SERVER_PORT } from "../../../shared/constants";

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return context;
};

export const useSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to the websocket server.
    const ioSocket = io(`http://localhost:${WEBSOCKET_SERVER_PORT}`);
    setSocket(ioSocket);

    return () => {
      ioSocket.disconnect();
    };
  }, []);

  return socket;
};

export type Delta = {
  x: number;
  y: number;
};

export type OnDrag = (
  delta: Delta,
  initialSize: number,
  event: PointerEvent
) => void;

// Modified version of: https://gist.github.com/airtonix/7ede03c0310a03e62981bc3786577ffc
export const useDrag = (
  ref: RefObject<HTMLElement>,
  cursor: ResizeCursor,
  onDrag: OnDrag,
  initialSize: number
): boolean => {
  const isDraggingRef = useRef(false);
  const initialYRef = useRef<number>(0);
  const initialXRef = useRef<number>(0);
  const initialSizeRef = useRef<number>(initialSize);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const refElement = ref.current;

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      // console.log(
      //   "handlePointerMove - isDraggingRef.current: ",
      //   isDraggingRef.current
      // );

      if (isDraggingRef.current) {
        const deltaX = event.clientX - initialXRef.current;
        const deltaY = event.clientY - initialYRef.current;

        onDrag({ x: deltaX, y: deltaY }, initialSizeRef.current, event);
      } else {
        document.body.classList.remove(cursor);
      }
    },
    [onDrag, cursor]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      // console.log(
      //   "handlePointerUp - isDraggingRef.current: ",
      //   isDraggingRef.current
      // );

      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDraggingState(false);
        document.body.classList.remove(cursor);
      }
    },
    [cursor]
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      // console.log(
      //   "handlePointerDown - isDraggingRef.current",
      //   isDraggingRef.current
      // );

      // Prevent default helps in the following scenario:
      // 1. The user has some text selected, and tries to drag the resize handle. The default
      //    browser behavior is to drag the text, not the handler. preventDefault() prevents this.
      event.preventDefault();

      isDraggingRef.current = true;
      setIsDraggingState(true);

      initialXRef.current = event.clientX;
      initialYRef.current = event.clientY;
      initialSizeRef.current = initialSize;

      document.body.classList.add(cursor);
    },
    [initialSizeRef, initialSize, cursor]
  );

  useEffect(() => {
    if (!refElement) return;

    // console.log("useDrag: adding event listeners");

    // TODO (maybe): handle touch events as well? These pointer events are not working great on mobile.
    // Just as a sanity check - always remove existing (if any) event listeners before adding new ones.
    refElement.removeEventListener("pointerdown", handlePointerDown);
    refElement.addEventListener("pointerdown", handlePointerDown);

    document.removeEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointerup", handlePointerUp);

    document.removeEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointermove", handlePointerMove);

    return () => {
      refElement.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointermove", handlePointerMove);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp, refElement]);

  return isDraggingState;
};
