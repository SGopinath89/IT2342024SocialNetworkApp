const router = require("express").Router();
const Event = require("../models/Event");

//Publish an event
router.post('/publish', async (req, res) => {
    const event = new Event(req.body);
  
    try {
        const newEvent = await event.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
  });

  //get all events

  router.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
