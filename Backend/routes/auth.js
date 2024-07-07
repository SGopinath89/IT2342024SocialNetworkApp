const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const autho = require("../Security/autho")
const auth=require("../Security/auth")
const secretekey='project@vau.lk'

router.post("/register", async (req, res) => {
  try {
    // Check if passwords match
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      birthday: req.body.birthday,
      gender: req.body.gender
    });

    // Save the user to the database
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


    //const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    /*router.post("/login", async (req, res) => {
      try {
          const user = await User.findOne({ email: req.body.email });
          if (!user) {
              return res.status(404).json({ message: "User not found" });
          }
          const validPassword = await bcrypt.compare(req.body.password, user.password);
          if (!validPassword) {
              return res.status(400).json({ message: "Wrong password" });
          }
          res.status(200).json({ message: "Login successful", user });
          //const token = jwt.sign({username:user.username},secretkey)
          //const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
         
      } catch (err) {
          console.error("Error during login:", err);  // Log the error
          res.status(500).json({ error: err.message });  // Send back an error response
      }
  });*/
  /*router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message: 'User not found' });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(400).send({ message: 'Invalid password' });

    const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '10h' });
    res.send({ token, user: { id: user._id, username: user.username, email: user.email } });
});*/

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).send({ message: 'User not found' });

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return res.status(400).send({ message: 'Invalid password' });

      const token = jwt.sign({ userId: user._id }, secretekey, { expiresIn: '10h' });
      console.log('Generated Token:', token); // Log the token

      res.send({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
      console.error("Error during login:", err);
      res.status(500).json({ error: err.message });
  }
});

module.exports = router;
