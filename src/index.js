// chowjustin/laporin-be/src/index.js (Backend)

require("dotenv").config();
const http = require("http");
const { WebSocketServer } = require("ws");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      const { type, payload } = data;

      if (type === "register") {
        const { reportId, role } = payload; // <-- Now explicitly expecting 'role'

        // Guard against undefined role
        if (!role) {
          console.error(
            "Registration failed: Role is undefined for report",
            reportId
          );
          return;
        }

        clients.set(ws, { reportId, role });
        console.log(`Client registered for report ${reportId} as ${role}`);

        const clientsInRoom = [];
        clients.forEach((clientInfo, client) => {
          if (clientInfo.reportId === reportId) {
            clientsInRoom.push(client);
          }
        });

        if (clientsInRoom.length === 2) {
          console.log(
            `Both parties present for report ${reportId}. Broadcasting online status and requesting keys.`
          );
          clientsInRoom.forEach((client) => {
            client.send(
              JSON.stringify({
                type: "presence",
                payload: { status: "online" },
              })
            );
            client.send(JSON.stringify({ type: "requestPublicKey" }));
          });
        }
      } else if (
        ["message", "typing", "presence", "publicKey"].includes(type)
      ) {
        const senderInfo = clients.get(ws);
        if (senderInfo) {
          const { reportId } = senderInfo;
          clients.forEach((clientInfo, client) => {
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

    if (disconnectedClientInfo) {
      const { reportId } = disconnectedClientInfo;
      clients.delete(ws);

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
