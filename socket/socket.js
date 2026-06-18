import { Chats } from "../api/models/chats.schema.js";
import { Messages } from "../api/models/messages.schema.js";

//  In-memory presence map: userId -> Set of socket.ids
//  (a user can have multiple tabs/devices open, so we track all their sockets)
const onlineUsers = new Map();

const addOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socketId);
};

const removeOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) return;
  onlineUsers.get(userId).delete(socketId);
  if (onlineUsers.get(userId).size === 0) {
    onlineUsers.delete(userId);
  }
};

const getOnlineUserIds = () => Array.from(onlineUsers.keys());

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("user connected", socket.id);

    //  identify this socket with the logged-in user & broadcast presence:
    socket.on("user_online", (userId) => {
      if (!userId) return;
      socket.data.userId = userId;
      addOnlineUser(userId, socket.id);

      //  let everyone know the updated online list:
      io.emit("online_users", getOnlineUserIds());
    });

    //  send the current online list to whoever asks (e.g. on page load):
    socket.on("get_online_users", () => {
      socket.emit("online_users", getOnlineUserIds());
    });

    //  join chat room :
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`joined chat ${chatId}`);
    });

    //  create message

    socket.on("send_message", async (data) => {
      try {
        const { sender, content, chatId } = data;

        let newMessages = await Messages.create({
          sender,
          content,
          chats: chatId,
        });
        newMessages = await newMessages.populate("sender", "userName email");
        newMessages = await newMessages.populate("chats");
        await Chats.findByIdAndUpdate(chatId, {
          latestMessage: newMessages._id,
        });

        io.to(chatId).emit("receive_message", newMessages);
      } catch (err) {
        console.log(err.message);
      }
    });

    //  typing indicators (bonus: lets users see "... is typing"):
    socket.on("typing", (chatId) => {
      socket.to(chatId).emit("typing", { chatId });
    });

    socket.on("stop_typing", (chatId) => {
      socket.to(chatId).emit("stop_typing", { chatId });
    });

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
      const userId = socket.data.userId;
      if (userId) {
        removeOnlineUser(userId, socket.id);
        io.emit("online_users", getOnlineUserIds());
      }
    });
  });
};
