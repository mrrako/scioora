const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const sendResponse = require('../utils/responseHandler');

// @desc    Get user profile
// @route   GET /api/users/:username
// @access  Protected
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username })
    .select('-password')
    .populate('followers', 'name username avatar')
    .populate('following', 'name username avatar');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  sendResponse(res, 200, true, 'User profile retrieved', user);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Protected
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
  user.avatar = req.body.avatar || user.avatar;
  user.banner = req.body.banner || user.banner;
  user.location = req.body.location || user.location;
  user.website = req.body.website || user.website;

  const updatedUser = await user.save();

  sendResponse(res, 200, true, 'Profile updated successfully', {
    _id: updatedUser._id,
    name: updatedUser.name,
    username: updatedUser.username,
    email: updatedUser.email,
    avatar: updatedUser.avatar,
    banner: updatedUser.banner,
    bio: updatedUser.bio,
    location: updatedUser.location,
    website: updatedUser.website,
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Protected
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('name username avatar bio');
  sendResponse(res, 200, true, 'Users retrieved', users);
});

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Protected
const followUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  const targetUser = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user._id);

  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  if (currentUser.following.includes(req.params.id)) {
    res.status(400);
    throw new Error('You already follow this user');
  }

  targetUser.followers.push(req.user._id);
  await targetUser.save();

  currentUser.following.push(req.params.id);
  await currentUser.save();

  await Notification.create({
    user: targetUser._id,
    sender: req.user._id,
    type: 'follow',
    message: `${req.user.name} started following you`,
    relatedId: req.user._id,
  });

  sendResponse(res, 200, true, 'User followed successfully');
});

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Protected
const unfollowUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user._id);

  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  targetUser.followers = targetUser.followers.filter(
    (id) => id.toString() !== req.user._id.toString()
  );
  await targetUser.save();

  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== req.params.id
  );
  await currentUser.save();

  sendResponse(res, 200, true, 'User unfollowed successfully');
});

module.exports = {
  getUserProfile,
  updateProfile,
  getAllUsers,
  followUser,
  unfollowUser,
};
