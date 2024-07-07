const express = require('express');
const router = express.Router();
const Bookmark = require('../models/bookmark');
const { verifyToken } = require("../Security/autho");
const JobVacancy = require('../models/JobVacancy');
const Event=require("../models/Event")
const Post=require("../models/Post")
const mongoose=require("mongoose")

// GET all bookmarks related to JobVacancy
router.get('/load', verifyToken, async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ itemModel: 'JobVacancy' })
            .populate({
                path: 'itemId',
                model: 'JobVacancy',
                select: 'title description company location applyLink'
            });
        res.json(bookmarks);
        console.log('Fetched bookmarks:', bookmarks);
    } catch (err) {
        console.error("Error fetching job bookmarks", err);
        res.status(500).send("Error fetching job bookmarks");
    }
});





router.get('/all', verifyToken, async (req, res) => {
  try {
      const bookmarks = await Bookmark.find({ userId: req.user.id }).lean().exec();
      
      const detailedBookmarks = await Promise.all(bookmarks.map(async bookmark => {
          let itemDetails;
          if (bookmark.itemModel === 'JobVacancy') {
              itemDetails = await JobVacancy.findById(bookmark.itemId).lean().exec();
          } else if (bookmark.itemModel === 'Event') {
              itemDetails = await Event.findById(bookmark.itemId).lean().exec();
          }
          else if (bookmark.itemModel === 'Post') {
            itemDetails = await Post.findById(bookmark.itemId).lean().exec();
          }
          else if (bookmark.itemModel === 'Video') {
            itemDetails = await Post.findById(bookmark.itemId).lean().exec();
          }
          else if (bookmark.itemModel === 'Course') {
            itemDetails = await Post.findById(bookmark.itemId).lean().exec();
          }
          else if (bookmark.itemModel === 'GroupPost') {
            itemDetails = await Post.findById(bookmark.itemId).lean().exec();
          }
          
          return { ...bookmark, itemDetails };
      }));
      
      res.json(detailedBookmarks);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching bookmarks' });
  }
});

router.delete('/remove/:id',verifyToken, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ObjectId' });
  }

  try {
    const bookmark = await Bookmark.findByIdAndDelete(id);

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.status(200).json({ message: 'Bookmark removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



router.get('/search/:query', verifyToken, async (req, res) => {
  try {
      const query = req.params.query;
      console.log(`Search query: ${query}`);

      const bookmarks = await Bookmark.find({ userId: req.user.id }).lean().exec();
      console.log('Fetched bookmarks:', bookmarks);

      const detailedBookmarks = await Promise.all(bookmarks.map(async bookmark => {
          let itemDetails = null;
          if (bookmark.itemModel === 'JobVacancy') {
              itemDetails = await JobVacancy.findOne({
                  _id: bookmark.itemId,
                  $or: [
                      { title: new RegExp(query, 'i') },
                      { description: new RegExp(query, 'i') },
                      { company: new RegExp(query, 'i') },
                      { location: new RegExp(query, 'i') }
                  ]
              }).lean().exec();
          } else if (bookmark.itemModel === 'Event') {
              itemDetails = await Event.findOne({
                  _id: bookmark.itemId,
                  $or: [
                      { eventname: new RegExp(query, 'i') },
                      { desc: new RegExp(query, 'i') }
                  ]
              }).lean().exec();
          }
          console.log(`Item details for bookmark ${bookmark._id}:`, itemDetails);
          return { ...bookmark, itemDetails };
      }));

      const filteredBookmarks = detailedBookmarks.filter(bookmark => bookmark.itemDetails);
      console.log('Filtered bookmarks:', filteredBookmarks);

      res.json(filteredBookmarks);
  } catch (error) {
      console.error('Error fetching bookmarks:', error);
      res.status(500).json({ message: 'Error fetching bookmarks' });
  }
});

module.exports = router;
