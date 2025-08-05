// src/index.js (Backend)

require("dotenv").config();
const http = require("http");
const { WebSocketServer } = require("ws");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Use a Map to store client connections and their associated reportId and role
const clients = new Map();

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      const { type, payload } = data;

      // When a client first connects, it registers itself with its reportId and role
      if (type === "register") {
        const { reportId, role } = payload;
        clients.set(ws, { reportId, role });
        console.log(`Client registered for report ${reportId} as ${role}`);

        // --- FIX: Check for other participants and sync presence/keys ---
        const clientsInRoom = [];
        clients.forEach((clientInfo, client) => {
          if (clientInfo.reportId === reportId) {
            clientsInRoom.push(client);
          }
        });

        // If there are now two clients in the room, they are both online to each other.
        if (clientsInRoom.length === 2) {
          console.log(
            `Both parties present for report ${reportId}. Broadcasting online status and requesting keys.`
          );
          clientsInRoom.forEach((client) => {
            // Tell each client the other is online
            client.send(
              JSON.stringify({
                type: "presence",
                payload: { status: "online" },
              })
            );
            // Ask each client to broadcast their public key to ensure exchange happens
            client.send(JSON.stringify({ type: "requestPublicKey" }));
          });
        }
        // --- END FIX ---
      }
      // For other message types, broadcast to the other client in the same "room"
      else if (["message", "typing", "presence", "publicKey"].includes(type)) {
        const senderInfo = clients.get(ws);
        if (senderInfo) {
          const { reportId } = senderInfo;
          // Iterate over all connected clients
          clients.forEach((clientInfo, client) => {
            // Send message if the client is in the same report room but is not the sender
            if (client !== ws && clientInfo.reportId === reportId) {
              client.send(JSON.stringify({ type, payload }));
            }
          });
        }
      }
    } catch (error) {
      console.error("Failed to process message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    const disconnectedClientInfo = clients.get(ws);

    // If the disconnected client was registered, notify the other party
    if (disconnectedClientInfo) {
      const { reportId } = disconnectedClientInfo;
      // Remove the client from our map
      clients.delete(ws);

      // Broadcast the 'offline' status to the other client in the room
      clients.forEach((clientInfo, client) => {
        if (clientInfo.reportId === reportId) {
          client.send(
            JSON.stringify({ type: "presence", payload: { status: "offline" } })
          );
        }
      });
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}, WebSocket server is ready.`);
});
