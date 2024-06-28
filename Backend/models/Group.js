const mongoose = require('mongoose');

const groupPostSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  groupPictures: [{
    type: String,
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const GroupPost = mongoose.model('GroupPost', groupPostSchema);

module.exports = GroupPost;
