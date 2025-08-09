const prisma = require("../../utils/prisma");

function chatNamespace(chatNs) {
  return (socket) => {
    console.log(`User connected to /chat: ${socket.id}`);

    socket.on("join_room", async ({ report_id, role }) => {
      if (!report_id || !role) {
        return socket.emit("error", {
          message: "report_id and role are required",
        });
      }

      if (!["OFFICER", "CLIENT"].includes(role)) {
        return socket.emit("error", { message: "Invalid role" });
      }

      socket.role = role;
      socket.join(report_id);

      const messages = await prisma.message.findMany({
        where: { report_id: report_id },
        orderBy: { created_at: "asc" },
      });
      socket.emit("load_history", messages);

      socket.to(report_id).emit("presence_update", {
        role: role,
        status: "online",
      });
    });

    socket.on("chat_message", async ({ report_id, sender, content }) => {
      try {
        const reportExists = await prisma.report.findUnique({
          where: { id: report_id },
        });

        if (!reportExists) {
          return socket.emit("error", { message: "Report not found" });
        }

        const newMessage = await prisma.message.create({
          data: {
            report_id: report_id,
            sender: sender,
            content: content,
          },
        });

        chatNs.to(report_id).emit("chat_message", newMessage);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("forward_event", ({ report_id, type, payload }) => {
      socket.to(report_id).emit(type, { payload, role: socket.role });
    });

    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.to(room).emit("presence_update", {
            role: socket.role,
            status: "offline",
          });
        }
      }
    });
  };
}

module.exports = {
  chatNamespace,
};
