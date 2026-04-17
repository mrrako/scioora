const asyncHandler = require('express-async-handler');
const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const Notification = require('../models/notificationModel');
const sendResponse = require('../utils/responseHandler');

// @desc    Add a comment
// @route   POST /api/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { postId, text, parentId } = req.body;

  if (!text || !postId) {
    res.status(400);
    throw new Error('Please add text and postId');
  }

  const comment = await Comment.create({
    user: req.user._id,
    post: postId,
    text,
    parent: parentId || null,
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    'user',
    'name username avatar'
  );

  const post = await Post.findById(postId);
  if (post.user.toString() !== req.user._id.toString()) {
    await Notification.create({
      user: post.user,
      sender: req.user._id,
      type: 'comment',
      message: `${req.user.name} commented on your post`,
      relatedId: post._id,
    });
  }

  if (parentId) {
    const parentComment = await Comment.findById(parentId);
    if (
      parentComment &&
      parentComment.user.toString() !== req.user._id.toString() &&
      parentComment.user.toString() !== post.user.toString()
    ) {
      await Notification.create({
        user: parentComment.user,
        sender: req.user._id,
        type: 'comment',
        message: `${req.user.name} replied to your comment`,
        relatedId: post._id,
      });
    }
  }

  sendResponse(res, 201, true, 'Comment added successfully', populatedComment);
});

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
// @access  Private
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate('user', 'name username avatar')
    .sort({ createdAt: -1 });

  const nestComments = (commentList) => {
    const commentMap = {};
    commentList.forEach((comment) => {
      commentMap[comment._id] = { ...comment._doc, replies: [] };
    });

    const nestedComments = [];
    commentList.forEach((comment) => {
      if (comment.parent) {
        if (commentMap[comment.parent]) {
          commentMap[comment.parent].replies.push(commentMap[comment._id]);
        }
      } else {
        nestedComments.push(commentMap[comment._id]);
      }
    });

    return nestedComments;
  };

  sendResponse(res, 200, true, 'Comments retrieved', nestComments(comments));
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const deleteChildren = async (parentId) => {
    const children = await Comment.find({ parent: parentId });
    for (let child of children) {
      await deleteChildren(child._id);
      await child.deleteOne();
    }
  };

  await deleteChildren(comment._id);
  await comment.deleteOne();

  sendResponse(res, 200, true, 'Comment and its replies removed');
});

module.exports = {
  addComment,
  getComments,
  deleteComment,
};
