const router = require("express").Router();
const Course = require("../models/Course");
const User = require("../models/User");

//Publish  a course
router.post('/publish',async(req,res)=>{
  const course = new Course(req.body);
  try{
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch(err){
    res.status(400).json({message:err.message});
  }
});

//Get all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific course by ID
  router.get("/:id", async (req, res) => {
    try {
        const courseId = req.params.id.trim();  // Trim the id parameter
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json("Course not found");
        }
        res.status(200).json(course);
    } catch (err) {
        res.status(500).json(err);
    }
});
//Update a course

router.put("/:id", async (req, res) => {
  try {
      const courseId = req.params.id.trim();  // Trim the id parameter
      const course = await Course.findById(courseId);
      if (!course) {
          return res.status(404).json("Course not found");
      }
      if (course.userId === req.body.userId) {
          await course.updateOne({ $set: req.body });
          res.status(200).json("The course has been updated");
      } else {
          res.status(403).json("You can update only your courses");
      }
  } catch (err) {
      res.status(500).json(err);
  }
});

//Apply for a course
router.post('/:id/apply', async (req, res) => {
  try {
      const courseId = req.params.id;
      const userId = req.body.userId;  // Assuming user ID is sent in the request body

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
          return res.status(404).json({ message: "Course not found" });
      }

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // Check if the user has already applied for the course
      if (course.applicants.includes(userId)) {
          return res.status(400).json({ message: "User has already applied for this course" });
      }

      // Add the user to the list of applicants
      course.applicants.push(userId);
      await course.save();

      res.status(200).json({ message: "Application successful" });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
      const courseId = req.params.id;
      const userId = req.body.userId;  // Assuming user ID is sent in the request body

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
          return res.status(404).json({ message: "Course not found" });
      }

      // Check if the user is the owner of the course
      if (course.userId.toString() !== userId) {
          return res.status(403).json({ message: "You can only delete your own courses" });
      }

      // Delete the course
      await course.deleteOne();
      res.status(200).json({ message: "Course has been deleted" });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

module.exports = router;


