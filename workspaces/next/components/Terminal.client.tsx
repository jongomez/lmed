"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { WEBSOCKET_SERVER_PORT } from "../../../shared/constants";

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

export const MyTerminal = () => {
  const xtermRef = useRef<HTMLDivElement>(null);

  const socketInitializer = async () => {
    if (!xtermRef.current) {
      return;
    }

    // await fetch("/api/terminal");
    const socket = io(`http://localhost:${WEBSOCKET_SERVER_PORT}`);

    const terminal = new Terminal();

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(searchAddon);
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(xtermRef.current);

    // Handle incoming data from the server
    socket.on("output", (data: string) => {
      terminal.write(data);
    });

    // Handle outgoing data to the server
    terminal.onData((data: string) => {
      socket.emit("input", data);
    });

    fitAddon.fit();

    return socket;
  };

  useEffect(() => {
    const socket = socketInitializer();

    // TODO: Figure this out please:
    // return () => {
    //   socket.disconnect();
    // };
  }, []);

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
