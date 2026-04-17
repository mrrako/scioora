const Message = require('../models/messageModel');

const socketHandler = (io) => {
  let connectedUsers = {}; // userId: socketId

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join personal room based on userId
    socket.on('setup', (userData) => {
      socket.join(userData._id);
      connectedUsers[userData._id] = socket.id;
      socket.emit('connected');
    });

    // Send Message
    socket.on('new_message', async (newMessageReceived) => {
      const { sender, receiver, text } = newMessageReceived;

      if (!sender || !receiver || !text) {
        return console.log('Invalid message data');
      }

      try {
        // Store in MongoDB
        const message = await Message.create({
          sender,
          receiver,
          text,
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name username avatar')
          .populate('receiver', 'name username avatar');

        // Emit to receiver's room
        socket.to(receiver).emit('message_received', populatedMessage);
        
        // Emit back to sender (optional, but good for confirmation)
        socket.emit('message_sent', populatedMessage);

      } catch (error) {
        console.log('Socket error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
      // Remove from connected users
      for (let userId in connectedUsers) {
        if (connectedUsers[userId] === socket.id) {
          delete connectedUsers[userId];
          break;
        }
      }
    });
  });
};

module.exports = socketHandler;
