const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemModel: { type: String, required: true, enum: ['Post', 'JobVacancy', 'GroupPost', 'Course','Video'] },
  sharedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Share', ShareSchema);
