import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";



//  import routes
import authRouter from "./api/routes/auth.routes.js";
import chatRouter from "./api/routes/chat.routes.js";
import messageRouter from "./api/routes/message.routes.js";
import aiRoutes from "./api/routes/ai.route.js";

const app = express();

//  config:


//  middlewares:

// Exact origins we know about, plus a pattern that matches any Vercel
// preview/production URL for this project (e.g. omni-chats-frontend.vercel.app,
// omni-chats-frontend-<hash>.vercel.app, omni-chats-frontend-git-<branch>-<user>.vercel.app)
// so deployments don't silently break CORS again when the URL changes.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://omni-chats-frontend.vercel.app",
  "https://omni-chats-frontend-z1ir.vercel.app",
];
const allowedOriginPattern = /^https:\/\/omni-chats-frontend(-[a-z0-9-]+)?\.vercel\.app$/;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (no Origin header, e.g. curl/server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOriginPattern.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(cookieParser());

//  routes:
app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);
app.use("/api/ai", aiRoutes);

export default app;
