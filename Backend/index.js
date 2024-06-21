const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users")
const authRoute = require("./routes/auth")
const postRoute = require("./routes/posts")
const courseRoute = require("./routes/courses")
const videoRoute=require("./routes/videos");

dotenv.config();

mongoose.connect('mongodb+srv://socialconnect0506:HkxAns4y3ATG3h33@cluster0.siqbwyk.mongodb.net/SocialApp');

//middleware
app.use(express.json());
app.use(helmet());


app.use(morgan("common"));
app.use("/api/users" , userRoute);
app.use("/api/auth" , authRoute);
app.use("/api/posts" , postRoute);
app.use("/api/courses" , courseRoute);
app.use("/api/videos", videoRoute);

app.listen(8800,()=>{
    console.log("Backend server is running");
})
