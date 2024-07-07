const express = require('express');
const router = express.Router();
const Share = require('../models/share');
const { verifyToken } = require("../Security/autho");
const mongoose = require("mongoose");
const User = require("../models/User");
const JobVacancy = require('../models/JobVacancy');
const Event = require('../models/Event');
const Post = require('../models/Post');
const Bookmark=require("../models/bookmark")
//const GroupPost = require('../models/GroupPost');
//const Video = require('../models/Video');
//const Course = require('../models/Course');

router.get('/shared', verifyToken, async (req, res) => {
    try {
        const sharedItems = await Share.find().populate('userId').exec();
        console.log('Shared Items:', sharedItems);

        // Fetch details for each shared item
        const sharedDetails = await Promise.all(sharedItems.map(async (sharedItem) => {
            try {
                console.log('Processing shared item:', sharedItem);

                if (sharedItem.itemModel === 'JobVacancy') {
                    const jobDetails = await JobVacancy.findById(sharedItem.itemId);
                    console.log('JobVacancy details:', jobDetails);
                    return {
                        ...sharedItem.toObject(),
                        jobDetails
                    };
                } else if (sharedItem.itemModel === 'Event') {
                    console.log('Looking for Event with ID:', sharedItem.itemId);
                    const eventDetails = await Event.findById(sharedItem.itemId);
                    console.log('Event details:', eventDetails);
                    return {
                        ...sharedItem.toObject(),
                        eventDetails
                    };
                } else if (sharedItem.itemModel === 'Post') {
                    const postDetails = await Post.findById(sharedItem.itemId);
                    console.log('Post details:', postDetails);
                    return {
                        ...sharedItem.toObject(),
                        postDetails
                    };
                } else if (sharedItem.itemModel === 'GroupPost') {
                    const groupPostDetails = await GroupPost.findById(sharedItem.itemId);
                    console.log('GroupPost details:', groupPostDetails);
                    return {
                        ...sharedItem.toObject(),
                        groupPostDetails
                    };
                } else if (sharedItem.itemModel === 'Course') {
                    const courseDetails = await Course.findById(sharedItem.itemId);
                    console.log('Course details:', courseDetails);
                    return {
                        ...sharedItem.toObject(),
                        courseDetails
                    };
                } else if (sharedItem.itemModel === 'Video') {
                    const videoDetails = await Video.findById(sharedItem.itemId);
                    console.log('Video details:', videoDetails);
                    return {
                        ...sharedItem.toObject(),
                        videoDetails
                    };
                }
                
                return sharedItem;
            } catch (error) {
                console.error(`Error fetching details for itemId ${sharedItem.itemId}:`, error);
                return sharedItem; 
            }
        }));

        console.log('Shared Details:', sharedDetails);
        res.json(sharedDetails);
    } catch (err) {
        console.error('Error fetching shared items:', err);
        res.status(500).json({ error_message: 'Error fetching shared items' });
    }
});


// Delete a shared item
router.delete('/shared/:id', verifyToken, async (req, res) => {
    try {
        const shareId = req.params.id;
        const tokenUserId = req.user.id; 
     
        const share = await Share.findOne({
            _id: shareId,
            userId: tokenUserId 
        });

        if (!share) {
            return res.status(404).json({ error: 'Shared item not found or you are not authorized to delete it' });
        }

        // Perform deletion
        await Share.deleteOne({ _id: shareId });

        res.status(200).json({ message: 'The shared item has been deleted' });
    } catch (err) {
        console.error('Error deleting shared item:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});




/*router.delete('/shared/:id', verifyToken, async (req, res) => {
    const id = req.params.id;

    try {
        console.log('Deleting share with ID:', id);

        const share = await Share.findById(id);
        if (!share) {
            return res.status(404).json({ error: 'Share not found' });
        }

        await Share.deleteOne({ _id: id });
        res.status(200).json({ message: 'Share deleted successfully' });
    } catch (error) {
        console.error('Error deleting share:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});*/

router.post('/bookmark', verifyToken, async (req, res) => {
    const { itemId } = req.body;
    const userId = req.user.id;  // Get userId from req.user

    console.log('Received userId:', userId);
    console.log('Received eventId:', itemId);

    if (!userId || !itemId) {
        return res.status(400).json({ error: 'User ID and event ID are required' });
    }

    try {
        const result = await Bookmark.create({ userId, itemId: itemId, itemModel: 'Share' });
        console.log('Bookmark created:', result); 
        res.status(200).json(result);
    } catch (error) {
        console.error('Error creating bookmark:', error.message);
        res.status(500).json({ error: error.message });
    }
});





module.exports = router;
