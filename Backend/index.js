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
const videoRoute=require("./routes/videos");
const groupRoute=require("./routes/groups");
const path = require('path');
const cors = require('cors');



dotenv.config();

mongoose.connect('mongodb+srv://socialconnect0506:HkxAns4y3ATG3h33@cluster0.siqbwyk.mongodb.net/SocialApp',{
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Failed to connect to MongoDB", err));
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define routes to serve your HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
//middleware
app.use(express.json());
app.use(helmet());
const corsOptions = {
    origin: 'http://localhost:8800', // Replace with your frontend's URL
    optionsSuccessStatus: 200,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
};

app.use(cors(corsOptions));

app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use("/api/users" , userRoute);
app.use("/api/auth" , authRoute);
app.use("/api/posts" , postRoute);
app.use("/api/courses" , courseRoute);
app.use("/api/videos", videoRoute);
app.use("/api/groups", groupRoute);

app.use('/uploads', express.static('uploads'));
app.listen(8800,()=>{
    console.log("Backend server is running");
})
