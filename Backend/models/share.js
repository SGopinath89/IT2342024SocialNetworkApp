const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemModel: { type: String, required: true, enum: ['Post','Event', 'JobVacancy', 'GroupPost', 'Course','Video','Profile'] },
  sharedAt: { type: Date, default: Date.now },
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      comment: { type: String, required: true },
      commentedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Share', ShareSchema);
