const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const sendResponse = require('../utils/responseHandler');

// @desc    Get messages between two users
// @route   GET /api/chat/:userId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  const messages = await Message.find({
    $or: [
      { sender: currentUserId, receiver: userId },
      { sender: userId, receiver: currentUserId },
    ],
  })
    .populate('sender', 'name username avatar')
    .populate('receiver', 'name username avatar')
    .sort({ createdAt: 1 });

  sendResponse(res, 200, true, 'Chat history retrieved', messages);
});

module.exports = {
  getMessages,
};
