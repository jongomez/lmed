"use client";

import { useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";
import { WEBSOCKET_SERVER_PORT } from "../../../shared/constants";
import { MainState } from "./Main.client";

let initTerminalDone = false;

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
  socket: Socket;
};

const initTerminal = async (xtermElement: HTMLDivElement, socket: Socket) => {
  const terminal = new Terminal();

  const fitAddon = new FitAddon();
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

export const MyTerminal = ({ socket }: MyTerminalProps) => {
  const xtermRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!xtermRef.current || initTerminalDone) {
      return;
    }

    initTerminal(xtermRef.current, socket);
    initTerminalDone = true;
  }, [xtermRef, socket]);

  return (
    <div
      id="terminal"
      ref={xtermRef}
      style={{
        width: "500px",
        height: "500px",
      }}
    ></div>
  );
};
