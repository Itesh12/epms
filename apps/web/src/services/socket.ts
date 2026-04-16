"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken: string | null = null;

export const getSocket = (token: string | null) => {
  // Don't create socket if token is empty or null
  if (!token || token.trim() === "") {
    console.warn("📡 Socket: No valid token provided, skipping connection", {
      token,
      hasToken: !!token,
      tokenLength: token?.length ?? 0,
    });
    return socket as Socket;
  }

  // If token changed, disconnect and create new socket
  if (currentToken && currentToken !== token) {
    console.log("📡 Socket: Token changed, reconnecting...");
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  currentToken = token;

  // Create new socket if it doesn't exist
  if (!socket) {
    console.log(
      "📡 Socket: Creating new connection with token:",
      token.substring(0, 20) + "...",
    );
    socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || "http://127.0.0.1:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    socket.on("connect", () => {
      console.log("📡 Real-time connection established");
    });

    socket.on("connect_error", (err: Error | string) => {
      const message = typeof err === "string" ? err : err.message;
      console.error("📡 Socket connection error:", message);
      // Log full error for debugging
      console.error("📡 Socket error details:", err);
    });

    socket.on("disconnect", (reason) => {
      console.log("📡 Socket disconnected:", reason);
    });

    socket.on("error", (error) => {
      console.error("📡 Socket error:", error);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentToken = null;
};
