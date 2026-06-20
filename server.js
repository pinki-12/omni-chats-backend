import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { db } from "./config/db.js";
import { setupSocket } from "./socket/socket.js";



// variables:
const port = process.env.PORT || 3000;
//  create server:
const server = http.createServer(app);

// Same allow-list logic as app.js — keep both in sync.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://omni-chats-frontend.vercel.app",
  "https://omni-chats-frontend-z1ir.vercel.app",
];
const allowedOriginPattern = /^https:\/\/omni-chats-frontend(-[a-z0-9-]+)?\.vercel\.app$/;

//  socket server:
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOriginPattern.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  },
});

//  setupSocket:
setupSocket(io);

//  db:
db();
server.listen(port, () => {
  console.log(`localhost running at ${port}`);
  
});
