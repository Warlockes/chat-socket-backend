import { db } from "./db";
import { Messages, Room, Users } from "./types";

export const getRoomValuesById = (
  roomId: string,
  field: "users" | "messages"
): string[] | Messages => {
  const roomRef = db.get(roomId) as Room;

  switch (field) {
    case "users":
      return Array.from((roomRef.get("users") as Users).values());
    case "messages":
      return roomRef.get("messages") as Messages;
  }
};
