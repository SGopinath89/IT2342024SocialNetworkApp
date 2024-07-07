const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { verifyToken } = require('../Security/autho');
const Share=require("../models/share")
const Bookmark=require("../models/bookmark")

const multer=require("multer")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create a new event
router.post('/create', verifyToken, upload.single('img'), async (req, res) => {
    const { eventname, desc } = req.body;
    const img = req.file ? req.file.path : '';

    console.log("Request Body:", req.body);
    console.log("User ID from Middleware:", req.user.id);

    const event = new Event({
        userId: req.user.id, 
        eventname,
        desc,
        img
    });

    try {
        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// GET all events
router.get('/all', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST to join an event
router.post('/:eventId/join', verifyToken, async (req, res) => {
    const { name, idNumber, contactNumber } = req.body;
    const { eventId } = req.params;

    try {
        // Assuming eventId is a valid ObjectId in MongoDB
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Update the event with participant information
        event.participants.push({ name, idNumber, contactNumber });
        await event.save();

        res.status(200).json({ message: 'Joined event successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Update event
router.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        
        if (event.userId !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to update this event' });
        }
        
        
        Object.assign(event, req.body);
        const updatedEvent = await event.save();
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error updating event', error });
    }
});


router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        
        console.log(`Delete request received for event ID: ${req.params.id} by user ID: ${req.user.id}`);

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

       
        if (event.userId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this event' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error.message);
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
});


//to share 
router.post('/:eventId/share', verifyToken, async (req, res) => {
    try {
      const { eventId } = req.params;
      const share = new Share({
        userId: req.user.id,
        itemId: eventId,
        itemModel: 'Event'
      });
      await share.save();
      res.status(201).json({ message: 'Event shared successfully' });
    } catch (error) {
      console.error('Error sharing event:', error.message);
      res.status(500).json({ message: 'Error sharing event', error: error.message });
    }
  });



router.post('/bookmark', verifyToken, async (req, res) => {
    const { eventId } = req.body;
    const userId = req.user.id;  
    console.log('Received userId:', userId);
    console.log('Received eventId:', eventId);

    if (!userId || !eventId) {
        return res.status(400).json({ error: 'User ID and event ID are required' });
    }

    try {
        const result = await Bookmark.create({ userId, itemId: eventId, itemModel: 'Event' });
        console.log('Bookmark created:', result); 
        res.status(200).json(result);
    } catch (error) {
        console.error('Error creating bookmark:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.get('/all/search/:query', verifyToken, async (req, res) => {
    try {
        const searchQuery = req.params.query;
        const events = await Event.find({
            $or: [
                { eventname: { $regex: searchQuery, $options: 'i' } },
                { desc: { $regex: searchQuery, $options: 'i' } }
              
              
            ]
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Failed to search events', error });
    }
});





module.exports = router;
