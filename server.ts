import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { getRoomValuesById } from "./utills";
import { db } from "./db";
import {
  IRoomsPostRequestBody,
  Message,
  Messages,
  Room,
  Users,
  FormData,
} from "./types";

dotenv.config();

const PORT = process.env.PORT || 8888;
const app = express();
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,POST",
  })
);
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

  socket.on("disconnect", (reason) => {
    console.log("disconnect", socket.id, "reason - ", reason);

    db.forEach((value, roomId) => {
      if ((value.get("users") as Users).delete(socket.id)) {
        const users = Array.from((value.get("users") as Users).values());
        socket.broadcast.to(roomId).emit("ROOM:SET_USERS", users);
      }
    });
  });

  socket.on("ROOM:JOIN", ({ roomId, userName }: FormData) => {
    socket.join(roomId);

    const roomRef = db.get(roomId) as Room;
    const usersRef = roomRef.get("users") as Users;
    usersRef.set(socket.id, userName);

    const users = Array.from(usersRef.values());
    socket.broadcast.to(roomId).emit("ROOM:SET_USERS", users);
  });

  socket.on("ROOM:NEW_MESSAGE", ({ roomId, userName, text }) => {
    const roomRef = db.get(roomId) as Room;
    const messagesRef = roomRef.get("messages") as Messages;
    const newMessage: Message = {
      userName,
      text,
    };

    messagesRef.push(newMessage);
    socket.broadcast.to(roomId).emit("ROOM:NEW_MESSAGE", newMessage);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on ${PORT} port`);
});
