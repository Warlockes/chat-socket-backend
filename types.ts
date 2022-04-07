export interface IRoomsPostRequestBody {
  userName: string;
  roomId: string;
}

export type Message = { userName: string; text: string };
export type Messages = Message[];
export type Users = Map<string, string>;
export type Room = Map<"users" | "messages", Users | Messages>;
export type DataBase = Map<string, Room>;

export interface FormData {
  userName: string;
  roomId: string;
}
