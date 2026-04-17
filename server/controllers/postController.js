const asyncHandler = require('express-async-handler');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const sendResponse = require('../utils/responseHandler');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { content, image } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Please add content');
  }

  const post = await Post.create({
    user: req.user._id,
    content,
    image,
  });

  sendResponse(res, 201, true, 'Post created successfully', post);
});

// @desc    Get feed posts
// @route   GET /api/posts/feed
// @access  Private
const getFeedPosts = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  const following = currentUser.following;

  const posts = await Post.find({
    user: { $in: [...following, req.user._id] },
  })
    .populate('user', 'name username avatar')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, 'Feed posts retrieved', posts);
});

// @desc    Get user posts
// @route   GET /api/posts/user/:userId
// @access  Private
const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ user: req.params.userId })
    .populate('user', 'name username avatar')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, 'User posts retrieved', posts);
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    { content: req.body.content, image: req.body.image },
    { new: true }
  );

  sendResponse(res, 200, true, 'Post updated successfully', updatedPost);
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await post.deleteOne();

  sendResponse(res, 200, true, 'Post removed successfully');
});

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.likes.includes(req.user._id)) {
    res.status(400);
    throw new Error('Post already liked');
  }

  post.likes.push(req.user._id);
  await post.save();

  if (post.user.toString() !== req.user._id.toString()) {
    await Notification.create({
      user: post.user,
      sender: req.user._id,
      type: 'like',
      message: `${req.user.name} liked your post`,
      relatedId: post._id,
    });
  }

  sendResponse(res, 200, true, 'Post liked', { likes: post.likes.length, isLiked: true });
});

// @desc    Unlike a post
// @route   POST /api/posts/:id/unlike
// @access  Private
const unlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  post.likes = post.likes.filter(
    (id) => id.toString() !== req.user._id.toString()
  );
  await post.save();

  sendResponse(res, 200, true, 'Post unliked', { likes: post.likes.length, isLiked: false });
});

module.exports = {
  createPost,
  getFeedPosts,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getUserPosts,
};
