const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeedPosts,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getUserPosts,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.get('/feed', protect, getFeedPosts);
router.get('/user/:userId', protect, getUserPosts);
router.post('/', protect, createPost);
router.post('/:id/like', protect, likePost);
router.post('/:id/unlike', protect, unlikePost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
