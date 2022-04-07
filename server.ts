import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (_, res) => {
  res.send("<h1>Hello world!</h1>");
});

io.on("connection", (socket) => {
  console.log("User connected " + socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected " + socket.id);
  });

  setInterval(() => socket.emit("time", new Date().toTimeString()), 1000);
});

server.listen(3000, () => {
  console.log("Listening on 3000 port");
});
