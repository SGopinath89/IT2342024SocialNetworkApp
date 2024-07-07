
const mongoose = require("mongoose")

const PostSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true,
        ref:"User"
    },
desc:{
    type:String,
    max:500,
},
img:{
    type:String
},
likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
}],
comments: [{
    text: String,
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}],
},
{timestamps:true}
);

module.exports=mongoose.model("Post", PostSchema);
