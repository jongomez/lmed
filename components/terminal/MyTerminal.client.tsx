"use client";

import { LayoutState } from "@/types/MainTypes";
import { MutableRefObject, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import type { Terminal as TerminalType } from "xterm";
import { FitAddon as FitAddonType } from "xterm-addon-fit";

let Terminal: any;
let FitAddon: any;
let WebLinksAddon: any;
let SearchAddon: any;

if (typeof window !== "undefined") {
  Terminal = require("xterm").Terminal;
  FitAddon = require("xterm-addon-fit").FitAddon;
  WebLinksAddon = require("xterm-addon-web-links").WebLinksAddon;
  SearchAddon = require("xterm-addon-search").SearchAddon;
}

type MyTerminalProps = {
  isTerminalActive: boolean;
  className: string;
  layoutState: LayoutState;
  socket: Socket | null;
};

const initTerminal = async (
  xtermElement: HTMLDivElement,
  socket: Socket,
  fitAddonRef: MutableRefObject<FitAddonType | null>
) => {
  const terminal = new Terminal() as TerminalType;

  fitAddonRef.current = new FitAddon() as FitAddonType;

  const searchAddon = new SearchAddon();
  const webLinksAddon = new WebLinksAddon();

  terminal.loadAddon(searchAddon);
  terminal.loadAddon(fitAddonRef.current);
  terminal.loadAddon(webLinksAddon);

  terminal.open(xtermElement);

  // Handle incoming data from the server
  socket.on("output", (data: string) => {
    terminal.write(data);
  });

  // Handle outgoing data to the server
  terminal.onData((data: string) => {
    socket.emit("input", data);
  });
};

export const MyTerminal = ({
  isTerminalActive,
  className,
  layoutState,
  socket,
}: MyTerminalProps) => {
  const fitAddonRef = useRef<FitAddonType>(null);
  const xtermRef = useRef<HTMLDivElement>(null);
  const hasInitTerminal = useRef(false);

  useEffect(() => {
    if (!xtermRef.current || hasInitTerminal.current || !socket) {
      return;
    }

    initTerminal(xtermRef.current, socket, fitAddonRef);
    hasInitTerminal.current = true;
  }, [xtermRef, socket, isTerminalActive]);

  // Everytime there's a layout change, we need to call .fit(). Hence the layoutState obj in the deps array.
  useEffect(() => {
    if (isTerminalActive && fitAddonRef.current) {
      fitAddonRef.current.fit();
    }
  }, [isTerminalActive, fitAddonRef, layoutState]);

  useEffect(() => {
    const xtermResizeListener = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    window.addEventListener("resize", xtermResizeListener);

    return () => {
      window.removeEventListener("resize", xtermResizeListener);
    };
  }, [fitAddonRef]);

  return (
    <div
      // HACK: use position absolute with top: -999999px to hide the terminal. Using display: none made the
      // fit addon not work: the terminal internal renderer is not able to calculate some necessary dimension stuff.
      className={`
        ${isTerminalActive ? "" : "absolute top-[-999999px]"} 
        ${className}
        overflow-auto
        bg-black
      `}
    >
      <div
        id="terminal"
        ref={xtermRef}
        className="h-[calc(100vh_-_42px)]"
      ></div>
    </div>
  );
};
