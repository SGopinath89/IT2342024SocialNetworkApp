const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser")
const userRoute = require("./routes/users")
const authRoute = require("./routes/auth")
const postRoute = require("./routes/posts")
const courseRoute = require("./routes/courses")
const eventRoute = require("./routes/events")
const videosRoute = require("./routes/videos")
const Profilepostsroute = require("./routes/profileposts")
const shareRoute = require("./routes/shares")
const bookmarkRoute = require("./routes/bookmarks")
const logoutRoute = require("./routes/logout")
const jobRoute=require("./routes/jobs")
const path = require('path');
const cors = require('cors');



dotenv.config();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.json());
app.use(helmet());

app.use('/uploads', express.static('uploads'));

app.use(cors({
  origin: 'http://localhost:8804', // or the URL of your frontend if different
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(morgan("common"));

app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use("/api/users" , userRoute);
app.use("/api/auth" , authRoute);
app.use("/api/posts" , postRoute);
//app.use("/api/courses" , courseRoute);
app.use("/api/events" , eventRoute);
app.use('/api/videos', videosRoute);
app.use('/api/shares', shareRoute);
app.use('/api/bookmarks', bookmarkRoute);
app.use('/api/profile', Profilepostsroute);
app.use('/api',logoutRoute)
app.use("/api/jobs",jobRoute);
app.use('/uploads', express.static('uploads'));

mongoose.connect('mongodb+srv://socialconnect0506:HkxAns4y3ATG3h33@cluster0.siqbwyk.mongodb.net/SocialApp');
var db = mongoose.connection;
db.on('error', () => console.log("Error in connecting to DB"));
db.once('open', () => console.log("Connected to DB"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(8804,()=>{
    console.log("Backend server is running");
})
