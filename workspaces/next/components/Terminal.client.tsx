"use client";

import { useSocket } from "@/utils/hooks";
import { useEffect, useRef } from "react";
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

let fitAddon: FitAddonType | undefined;

type MyTerminalProps = {
  activeTab: number;
};

const initTerminal = async (xtermElement: HTMLDivElement, socket: Socket) => {
  const terminal = new Terminal() as TerminalType;

  fitAddon = new FitAddon() as FitAddonType;

  const searchAddon = new SearchAddon();
  const webLinksAddon = new WebLinksAddon();

  terminal.loadAddon(searchAddon);
  terminal.loadAddon(fitAddon);
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

  fitAddon.fit();
};

export const MyTerminal = ({ activeTab }: MyTerminalProps) => {
  // Socket is not part of the mainState because I was getting some immer type errors.
  const socket = useSocket();
  const xtermRef = useRef<HTMLDivElement>(null);
  const hasInitTerminal = useRef(false);
  const isVisible = activeTab === 1;

  useEffect(() => {
    if (!xtermRef.current || hasInitTerminal.current || !socket) {
      return;
    }

    initTerminal(xtermRef.current, socket);
    hasInitTerminal.current = true;
  }, [xtermRef, socket]);

  // If the tab is not visible, and we call fit, the terminal won't show.
  if (isVisible) {
    fitAddon?.fit();
  }

  return (
    <div className={`${isVisible ? "" : "hidden"} h-[calc(100vh_-_42px)]`}>
      <div id="terminal" ref={xtermRef} className="col-span-full"></div>
      {/* TODO: Add a terminal prompt editor here. */}
    </div>
  );
};
