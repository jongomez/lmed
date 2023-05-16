import { createServer } from "http";
import express from "express";
import { Server, Socket } from "socket.io";
import { spawn, IPty } from "node-pty";
import { WEBSOCKET_SERVER_PORT } from "../../shared/constants";
import cors from "cors";

function filterEnv(env: NodeJS.ProcessEnv): { [key: string]: string } {
  const filteredEnv: { [key: string]: string } = {};
  for (const key in env) {
    const value = env[key];
    if (typeof value === "string") {
      filteredEnv[key] = value;
    }
  }
  return filteredEnv;
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  // Enable CORS for the socket.io server as well
  cors: {
    origin: "http://localhost:3000", // or your frontend url
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors()); // Enables CORS for all routes

io.on("connection", (socket: Socket) => {
  const ptyProcess: IPty = spawn(
    process.platform === "win32" ? "cmd.exe" : "bash",
    [],
    {
      name: "xterm-color",
      cols: 80,
      rows: 30,
      cwd: process.env.HOME,
      env: filterEnv(process.env),
    }
  );

  // Forward data from the pty process to the WebSocket
  ptyProcess.onData((data: string) => {
    socket.emit("output", data);
  });

  // Send data from the WebSocket to the pty process
  socket.on("input", (data: string) => {
    ptyProcess.write(data);
  });

  socket.on("disconnect", () => {
    ptyProcess.kill();
  });
});

httpServer.listen(WEBSOCKET_SERVER_PORT, () => {
  console.log(`WebSocket server listening on port ${WEBSOCKET_SERVER_PORT}`);
});
