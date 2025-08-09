const { Server } = require("socket.io");
const { chatNamespace } = require("./namespaces/chat");

const allowedOrigins = process.env.CORS_ORIGIN?.split(",") ?? [
  "http://localhost:3000",
];

function initSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
    },
    pingInterval: 20000,
    pingTimeout: 5000,
  });

  const chatNS = io.of("/chat");
  chatNS.on("connection", chatNamespace(chatNS));

  return io;
}

module.exports = {
  initSockets,
};
