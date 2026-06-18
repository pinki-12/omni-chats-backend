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
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174","https://omni-chats-frontend-z1ir.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());

app.use(cookieParser());

//  routes:
app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);
app.use("/api/ai", aiRoutes);

export default app;
