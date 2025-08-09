const { Server } = require("socket.io");
const { chatNamespace } = require("./namespaces/chat");

function initSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
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
