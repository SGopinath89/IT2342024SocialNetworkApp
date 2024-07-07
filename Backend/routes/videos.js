
// routes/videos.js
const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const Video = require('../models/Video');
const share = require('../models/share')
const verify = require('../Security/auth');
const fs = require('fs');
const path = require('path')
const Bookmark = require('../models/bookmark')
const Share = require('../models/share')

// Upload a video
router.post('/upload', verify, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    try {
      const { title, description } = req.body;
      const { filename, path, size } = req.file;

      const newVideo = new Video({
        title,
        description,
        filename,
        path,
        size,
        user: req.user.userId, // Set the user ID from the authenticated user
      });

      const savedVideo = await newVideo.save();
      res.status(201).json(savedVideo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadDate: -1 }).populate('user', 'username');
    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
      const video = await Video.findById(req.params.id);
      if (!video) {
          return res.status(404).json({ message: 'Video not found' });
      }
      video.likes = (video.likes || 0) + 1;
      await video.save();
      res.json({ message: 'Video liked', likes: video.likes });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

router.post('/:videoId/comments', verify, async (req, res) => {
  const { videoId } = req.params;
  const { text } = req.body;

  try {
      const video = await Video.findById(videoId);

      if (!video) {
          return res.status(404).json({ message: 'Video not found' });
      }

      const newComment = {
          text,
          user: req.user._id // Ensure the user ID from the verified token is stored as user
      };

      video.comments.push(newComment);
      await video.save();

      res.status(201).json(newComment); // Respond with the new comment
  } catch (error) {
      console.error('Error posting comment:', error);
      res.status(500).json({ message: 'Failed to post comment' });
  }
});


 // Assuming you have a Share model

// POST /api/videos/:videoId/share


// Delete a video

router.delete("/:id", verify, async (req, res) => {
  try {
      const video = await Video.findById(req.params.id);
      if (!video) {
          return res.status(404).json("Video not found");
      }

      // Check if the authenticated user is the owner of the video
      if (video.user.toString() !== req.user.userId) {
          return res.status(403).json("You are not authorized to delete this video");
      }

      await video.deleteOne();
      res.status(200).json("The video has been deleted");
  } catch (err) {
      console.error(err);  // Log the error for debugging
      res.status(500).json("Internal server error");
  }
});


// Update a video
router.put('/:id', upload, async (req, res) => {
  const videoId = req.params.id;
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

      const updatedVideo = await Video.findByIdAndUpdate(videoId, updateFields, { new: true });

      if (!updatedVideo) {
          return res.status(404).json({ message: 'Video not found' });
      }

      res.status(200).json(updatedVideo);
  } catch (error) {
      console.error('Error updating video:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// routes/videos.js

// Search for videos by title
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    const searchQuery = new RegExp(query, 'i'); // 'i' makes it case-insensitive
    const videos = await Video.find({ title: { $regex: searchQuery } }).populate('user', 'username');
    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:videoId/add', verify, async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.userId; // Ensure userId is properly set by authentication middleware

  try {
    // Check if the videoId exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if the video is already bookmarked by the user
    const existingBookmark = await Bookmark.findOne({ userId, itemId: videoId, itemModel: 'Video' });
    if (existingBookmark) {
      return res.status(400).json({ message: 'Video already bookmarked' });
    }

    // Create a new bookmark record
    const newBookmark = new Bookmark({
      userId,
      itemId: videoId,
      itemModel: 'Video', // Assuming 'Video' is the correct model type
      createdAt: new Date()
    });

    // Save the bookmark record to the database
    await newBookmark.save();

    res.status(201).json(newBookmark); // Respond with the created bookmark record
  } catch (error) {
    console.error('Error adding video to bookmarks:', error);
    res.status(500).json({ message: 'Failed to add video to bookmarks', error: error.message });
  }
});

router.post('/:videoId/share', verify, async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.userId; // Ensure userId is properly set by authentication middleware

  try {
    // Check if the videoId exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if the video is already bookmarked by the user
    const existingShare = await Share.findOne({ userId, itemId: videoId, itemModel: 'Video' });
    if (existingShare) {
      return res.status(400).json({ message: 'Video already Shared' });
    }

    // Create a new bookmark record
    const newShare = new Share({
      userId,
      itemId: videoId,
      itemModel: 'Video', // Assuming 'Video' is the correct model type
      createdAt: new Date()
    });

    // Save the bookmark record to the database
    await newShare.save();

    res.status(201).json(newShare); // Respond with the created bookmark record
  } catch (error) {
    console.error('Error adding video to Shared:', error);
    res.status(500).json({ message: 'Failed to share videos', error: error.message });
  }
});
module.exports = router;



