const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  getAllUsers,
  followUser,
  unfollowUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllUsers);
router.put('/profile', protect, updateProfile);
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);
router.get('/:username', protect, getUserProfile);

module.exports = router;
