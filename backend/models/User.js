const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('User', UserSchema);
