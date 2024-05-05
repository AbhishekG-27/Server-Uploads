// index.js
import { WebSocketServer } from "ws";
import express from "express";

const app = express();

app.get("/*", (req, res) => {
  res.send("Hello from server.");
});

const server = app.listen(8000, () => {
  console.log("Server running on 8000.");
});

const wss = new WebSocketServer({ server });

const clients = [];
let room = [];

wss.on("connection", (ws) => {
  // console.log(clients);
  const clientId = Math.random().toString(36).substring(2, 9);
  clients.push({ ws, clientId });

  clients.forEach((client) => {
    if (client.ws === ws) {
      client.ws.send(
        JSON.stringify({
          message: client.clientId,
          type: "id",
        }),
        { binary: false }
      );
    }
  });

  ws.on("message", async (message) => {
    const data = await JSON.parse(message);
    // console.log(data);

    if (data.type === "create room") {
      const roomId = Math.random().toString(36).substring(2, 9);
      clients.forEach((client) => {
        if (client.ws === ws) {
          room.push({ roomId: roomId, members: [client.clientId] });
          ws.send(JSON.stringify({ type: "room-created", roomId: roomId }), {
            binary: false,
          });
          // console.log(room);
        }
      });
    } else if (data.type === "join-room") {
      // console.log(data);
      // join room logic
      const roomId = data.roomId;
      let clientId;
      clients.forEach((client) => {
        if (client.ws === ws) {
          clientId = client.clientId;
        }
      });
      room.forEach((r) => {
        if (r.roomId === roomId) {
          if (r.members.includes(clientId)) {
            ws.send(
              JSON.stringify({
                type: "join-room",
                message: "Room already joined.",
              }),
              {
                binary: false,
              }
            );
            return;
          }
          r.members.push(clientId);
          ws.send(
            JSON.stringify({
              lines: data.lines,
              rectngles: data.rectangles,
              circles: data.circles,
              arrows: data.arrows,
              texts: data.texts,
            })
          );
        }
      });
      // console.log(room);
    }
    // send message to all members of the room
    clients.forEach((client) => {
      room.forEach((room) => {
        if (client.ws === ws && room.members.includes(client.clientId)) {
          room.members.forEach((member) => {
            clients.forEach((client) => {
              if (client.clientId === member && client.ws !== ws) {
                client.ws.send(JSON.stringify(data));
              }
            });
          });
        }
      });
    });
  });

  ws.on("close", () => {
    // console.log("Connection closed.");
    room = [];
  });
  // ws.send("You are connected. Your id : " + );
});
