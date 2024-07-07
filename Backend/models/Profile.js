
onst mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
title: String,
  description: String,
  filename: String,
  path: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes:{type:Number,default:0},
  comments:{type:Array,default:[]},
  profilePicture: { type: String, default: 'uploads/profile.png' }, 
});

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
