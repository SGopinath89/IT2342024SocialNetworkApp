const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const Profile = require('../models/Profile');
const verify = require('../Security/auth');
const fs = require('fs');
const path = require('path')
const Bookmark = require('../models/bookmark')
const Share = require('../models/share')
const User = require('../models/User');

router.post('/upload', verify, (req, res) => {
  upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err });
      }
      try {
        const { title, description } = req.body;
        const { filename, path, size } = req.file;
  
        const newpost = new Profile({
          title,
          description,
          filename,
          path,
          size,
          user: req.user.userId, // Set the user ID from the authenticated user
        });
  
        const savedPost = await newpost.save();
        res.status(201).json(savedPost);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  });

  router.get('/', verify, async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming req.user.userId contains the authenticated user's ID
        const profilePosts = await Profile.find({ user: userId }).sort({ uploadDate: -1 }).populate('user', 'username');
        res.status(200).json(profilePosts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    const searchQuery = new RegExp(query, 'i'); // 'i' makes it case-insensitive
    const profile = await Profile.find({ title: { $regex: searchQuery } }).populate('user', 'username');
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/shared-videos', verify, async (req, res) => {
  try {
    const userId = req.user._id;
    const sharedItems = await Share.find({ userId, itemModel: 'Video' }).select('itemId sharedAt').populate('itemId', 'title description filename uploadDate');

    const sharedVideos = sharedItems.map(item => ({
      _id: item.itemId._id,
      title: item.itemId.title,
      description: item.itemId.description,
      filename: item.itemId.filename,
      uploadDate: item.itemId.uploadDate,
      sharedAt: item.sharedAt
    }));

    res.json(sharedVideos);
  } catch (error) {
    console.error('Failed to fetch shared videos:', error);
    res.status(500).json({ message: 'Failed to fetch shared videos', error });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
      const post = await Profile.findById(req.params.id);
      if (!post) {
          return res.status(404).json({ message: 'Post not found' });
      }
      post.likes = (post.likes || 0) + 1;
      await post.save();
      res.json({ message: 'post liked', likes: post.likes });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

router.post('/:postId/add', verify, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId; // Ensure userId is properly set by authentication middleware

  try {
    // Check if the videoId exists
    const post = await Profile.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the video is already bookmarked by the user
    const existingBookmark = await Bookmark.findOne({ userId, itemId: postId, itemModel: 'Profile' });
    if (existingBookmark) {
      return res.status(400).json({ message: 'Post already bookmarked' });
    }

    // Create a new bookmark record
    const newBookmark = new Bookmark({
      userId,
      itemId: postId,
      itemModel: 'Profile', // Assuming 'Video' is the correct model type
      createdAt: new Date()
    });

    // Save the bookmark record to the database
    await newBookmark.save();

    res.status(201).json(newBookmark); // Respond with the created bookmark record
  } catch (error) {
    console.error('Error adding post to bookmarks:', error);
    res.status(500).json({ message: 'Failed to add post to bookmarks', error: error.message });
  }
});

router.post('/:postId/share', verify, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId; // Ensure userId is properly set by authentication middleware

  try {
    // Check if the videoId exists
    const post = await Profile.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the video is already bookmarked by the user
    const existingShare = await Share.findOne({ userId, itemId: postId, itemModel: 'Profile' });
    if (existingShare) {
      return res.status(400).json({ message: 'post already Shared' });
    }

    // Create a new bookmark record
    const newShare = new Share({
      userId,
      itemId: postId,
      itemModel: 'Profile', // Assuming 'Video' is the correct model type
      createdAt: new Date()
    });

    // Save the bookmark record to the database
    await newShare.save();

    res.status(201).json(newShare); // Respond with the created bookmark record
  } catch (error) {
    console.error('Error adding post to Shared:', error);
    res.status(500).json({ message: 'Failed to share posts', error: error.message });
  }
});


router.delete("/:id", verify, async (req, res) => {
  try {
      const post = await Profile.findById(req.params.id);
      if (!post) {
          return res.status(404).json("Post not found");
      }

      // Check if the authenticated user is the owner of the video
      if (post.user.toString() !== req.user.userId) {
          return res.status(403).json("You are not authorized to delete this video");
      }

      await post.deleteOne();
      res.status(200).json("The post has been deleted");
  } catch (err) {
      console.error(err);  // Log the error for debugging
      res.status(500).json("Internal server error");
  }
});

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    const searchQuery = new RegExp(query, 'i'); // 'i' makes it case-insensitive
    const posts = await Profile.find({ title: { $regex: searchQuery } }).populate('user', 'username');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:postId/comments', verify, async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  try {
      const post = await Profile.findById(postId);

      if (!post) {
          return res.status(404).json({ message: 'post not found' });
      }

      const newComment = {
          text,
          user: req.user._id // Ensure the user ID from the verified token is stored as user
      };

      post.comments.push(newComment);
      await post.save();

      res.status(201).json(newComment); // Respond with the new comment
  } catch (error) {
      console.error('Error posting comment:', error);
      res.status(500).json({ message: 'Failed to post comment' });
  }
});


/*
router.post('/imageupload', verify, async (req, res) => {
  try {
    const { userId, file } = req.body;

    // Check if userId and file are present in the request body
    if (!userId || !file) {
      return res.status(400).json({ message: 'userId and file are required in the request body' });
    }

    // Update profile picture path in the User model
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = file; // Assuming file path is provided directly in req.body

    // Save updated user
    await user.save();

    res.json({ message: 'Profile picture uploaded successfully', file });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ message: 'Failed to upload profile picture', error: err.message });
  }
});
*/
router.post('/imageupload', verify, upload, async (req, res) => {
  try {
    // Check if file is present in the request
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Update profile picture path in the User model
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = req.file.path; // Assuming Multer has saved the file and added path to req.file

    // Save updated user profile
    await user.save();

    res.json({ message: 'Profile picture uploaded successfully', file: req.file });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ message: 'Failed to upload profile picture', error: err.message });
  }
});

router.put('/:id', upload, async (req, res) => {
  const postId = req.params.id;
  const { title, description } = req.body;

  try {

    
      let updateFields = {
          title,
          description
      };

      // Check if there's a new video file uploaded
      if (req.file) {
          updateFields.filename = req.file.filename;
          updateFields.path = req.file.path;
          updateFields.size = req.file.size;
      }

      const updatedpost = await Profile.findByIdAndUpdate(postId, updateFields, { new: true });

      if (!updatedpost) {
          return res.status(404).json({ message: 'Post not found' });
      }

      res.status(200).json(updatedpost);
  } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
