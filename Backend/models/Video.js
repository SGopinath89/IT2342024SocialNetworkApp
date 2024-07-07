
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  filename: String,
  path: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes:{type:Number,default:0},
  comments:{type:Array,default:[]}
});

module.exports = mongoose.model('Video', videoSchema);
