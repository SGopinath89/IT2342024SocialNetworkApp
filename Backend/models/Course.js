const mongoose = require("mongoose");
const CourseSchema = new mongoose.Schema({
    userId:{
      type:String,
      required:true,
    },
  coursename:{
    type:String,
    required:true,
  },
  desc:{
    type:String,
    max:500,
  },
  img:{
    type:String,
  },
  applicants:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  }]
},
{timestamps:true},
);
module.exports = mongoose.model("Course",CourseSchema);

