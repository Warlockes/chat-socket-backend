import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { getRoomValuesById } from "./utills";
import { db } from "./db";
import { IRoomsPostRequestBody, Messages, Users } from "./types";

dotenv.config();

const PORT = process.env.PORT || 8888;
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (_, res: express.Response) => {
  res.sendStatus(200);
});

app.get("/rooms/:id", (req: express.Request, res: express.Response) => {
  const { id: roomId } = req.params;

  if (db.has(roomId)) {
    const result = {
      users: getRoomValuesById(roomId, "users") as string[],
      messages: getRoomValuesById(roomId, "messages") as Messages,
    };

    return res.json(result);
  }

  res.json({ users: [], messages: [] });
});

app.post(
  "/rooms",
  (
    req: express.Request<{}, {}, IRoomsPostRequestBody>,
    res: express.Response
  ) => {
    const { roomId } = req.body;

    if (!db.has(roomId)) {
      db.set(
        roomId,
        new Map<"messages" | "users", Messages | Users>([
          ["messages", []],
          ["users", new Map()],
        ])
      );

      return res.sendStatus(201);
    }

    res.sendStatus(200);
  }
);

io.on("connection", (socket) => {
  console.log("User connected " + socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected " + socket.id);
  });

  setInterval(() => socket.emit("time", new Date().toTimeString()), 1000);
});

server.listen(PORT, () => {
  console.log(`Listening on ${PORT} port`);
});
