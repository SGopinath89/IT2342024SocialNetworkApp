const express = require('express');
const router = express.Router();
const JobVacancy = require('../models/JobVacancy');
const Bookmark = require('../models/bookmark');
const { verifyToken } = require("../Security/autho");
const mongoose = require("mongoose");
const Service=require("../Services/GenericService")
const Share=require("../models/share")

router.post('/upload', verifyToken, async (req, res) => {
    const { title, description, company, location, applyLink } = req.body;

    console.log("Request Body:", req.body);
    console.log("User ID from Token:", req.user.id);

    const newJob = new JobVacancy({
        title,
        description,
        company,
        location,
        applyLink,
        uploadedBy: req.user.id
    });

    try {
        await newJob.save();
        console.log("Record inserted successfully");
        res.status(201).json({ message: "Job created successfully" });
    } catch (err) {
        console.error("Error inserting record", err);
        res.status(500).json({ message: "Error inserting record" });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ID');
    }

    try {
        const job = await JobVacancy.findById(id);
        if (!job) {
            return res.status(404).json('Job not found');
        }

        // Log details for debugging
        console.log("Job uploadedBy ID:", job.uploadedBy.toString());
        console.log("Authenticated User ID:", req.user.userId || req.user.id);

        // Check if the authenticated user is the creator of the job
        if (job.uploadedBy.toString() !== (req.user.userId || req.user.id)) {
            return res.status(403).json('You are not authorized to delete this job');
        }

        await JobVacancy.deleteOne({ _id: id });
        res.status(200).json('The job has been deleted');
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal server error');
    }
});

router.get('/jobs', async (req, res) => {
    try {
        const jobs = await JobVacancy.find();
        res.json(jobs);
    } catch (err) {
        console.error("Error fetching jobs", err);
        res.status(500).send("Error fetching jobs");
    }
});



router.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const { title, description, company, location, applyLink } = req.body;
        const updatedJob = await JobVacancy.findByIdAndUpdate(req.params.id, {
            title,
            description,
            company,
            location,
            applyLink
        }, { new: true });

        res.json(updatedJob);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update job' });
    }
});

router.get('/byId/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    console.log(`Received ID: ${id}`); 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ID');
    }

    try {
        const job = await JobVacancy.findById(id);
        if (!job) {
            console.log(`Job not found for ID: ${id}`);  // Log if job not found
            return res.status(404).json('Job not found');
        }
        res.status(200).json(job);
    } catch (err) {
        console.error(`Error fetching job: ${err.message}`);  // Log any error
        res.status(500).json('Internal server error');
    }
});


//save to bookmark 
router.post('/bookmark', verifyToken, async (req, res) => {
    const { jobId } = req.body;
    const userId = req.user.id; 
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ error: 'Invalid Job ID' });
    }

    try {
        
        const existingBookmark = await Bookmark.findOne({ userId, itemId: jobId, itemModel: 'JobVacancy' });

        if (existingBookmark) {
            return res.status(400).json({ error: 'Job already bookmarked' });
        }

        
        const newBookmark = new Bookmark({
            userId,
            itemId: jobId,
            itemModel: 'JobVacancy'
        });

        await newBookmark.save();
        res.status(201).json({ message: 'Job bookmarked successfully' });
    } catch (error) {
        console.error('Error saving bookmark:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//to share 
// Share job
router.post('/share', verifyToken, async (req, res) => {
    const { jobId } = req.body;
    const userIdToShareWith = req.user.id; // Assuming userId is available in req.user

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ error: 'Invalid Job ID' });
    }

    try {
        const newShare = new Share({
            userId: userIdToShareWith,
            itemId: jobId,
            itemModel: 'JobVacancy'
        });

        await newShare.save();
        res.status(201).json({ message: 'Job shared successfully' });
    } catch (error) {
        console.error('Error sharing job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Fetch jobs with search query
router.get('/search/:query', async (req, res) => {
    try {
        const searchQuery = req.params.query;
        const jobs = await JobVacancy.find({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { company: { $regex: searchQuery, $options: 'i' } },
                { location: { $regex: searchQuery, $options: 'i' } }
            ]
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error searching for jobs', error });
    }
});



module.exports = router;
