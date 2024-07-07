const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    //refPath: 'itemModel',
  },
  itemModel: {
    type: String,
    required: true,
    enum: ['Post', 'JobVacancy', 'GroupPost','Video','Course','Event','Share','Profile'],  // Add any other models you have
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Bookmark', BookmarkSchema);

