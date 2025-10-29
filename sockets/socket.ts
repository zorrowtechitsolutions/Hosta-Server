// src/sockets/socket.ts
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
dotenv.config({ path: "./Config/.env" });

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
    //       origin: [
    //   process.env.UserSide_URL as string,
    //   process.env.AmbulanceSide_URL as string,
    //   process.env.HospitalSide_URL as string,
    //   process.env.AdminSide_URL as string,
    //   "http://127.0.0.1:5500",
    //   "https://hosta-hospitals.vercel.app",
    //   "http://localhost:5173",
    // ],
      origin: {"*"},
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
