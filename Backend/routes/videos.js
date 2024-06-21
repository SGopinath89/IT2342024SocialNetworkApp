const express = require('express');
const multer = require('multer');
const Video = require('../models/Video');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Video upload endpoint
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const video = new Video({
      title: req.body.title,
      description: req.body.description,
      videoUrl: `/uploads/videos/${req.file.filename}`,
      uploadedBy: req.body.uploadedBy, // Replace with actual user ID in a real app
    });

    await video.save();
    res.status(201).json('Video uploaded successfully');
  } catch (error) {
    console.error(error);
    res.status(500).json('Internal server error');
  }
});

module.exports = router;

